import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileyVersion
} from '@whiskeysockets/baileys'
import { logger } from '../utils/logger.js'
import { ReconnectionManager } from '../utils/reconnection-manager.js'
import { config } from '../config/environment.js'

let sock = null
let isConnected = false
let reconnectionManager = null

function initReconnectionManager() {
  if (!reconnectionManager) {
    reconnectionManager = new ReconnectionManager(
      config.whatsapp.maxReconnectAttempts,
      config.whatsapp.reconnectDelay
    )
  }
}

export async function initWhatsApp() {
  try {
    logger.info({ service: 'whatsapp', event: 'initialization_start' }, 'Iniciando WhatsApp...')
    
    initReconnectionManager()
    
    const { version } = await fetchLatestBaileyVersion()
    logger.info({ service: 'whatsapp', baileys_version: version }, 'Versão do Baileys obtida')

    const { state, saveCreds } = await useMultiFileAuthState(config.whatsapp.authPath)
    logger.info({ service: 'whatsapp', auth_path: config.whatsapp.authPath }, 'Estado de autenticação carregado')

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: { level: 'silent' }
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        logger.warn({ service: 'whatsapp', event: 'qr_ignored' }, 'QR Code ignorado - use pairing code')
      }

      if (connection === 'open') {
        isConnected = true
        reconnectionManager.reset()
        logger.info({ service: 'whatsapp', event: 'connection_opened' }, 'WhatsApp conectado com sucesso!')
      }

      if (connection === 'close') {
        isConnected = false
        const statusCode = lastDisconnect?.error?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut

        logger.warn({
          service: 'whatsapp',
          event: 'connection_closed',
          statusCode,
          shouldReconnect
        }, 'Conexão fechada')

        if (shouldReconnect) {
          if (!reconnectionManager.hasReachedLimit()) {
            await reconnectionManager.attempt(() => initWhatsApp())
          } else {
            logger.error({ 
              service: 'whatsapp', 
              event: 'reconnection_limit_reached' 
            }, 'Máximo de tentativas de reconexão atingido')
          }
        } else {
          logger.info({ service: 'whatsapp', event: 'logged_out' }, 'Usuário deslogado')
        }
      }

      if (connection === 'connecting') {
        logger.info({ service: 'whatsapp', event: 'connecting' }, 'Conectando ao WhatsApp...')
      }
    })

    logger.info({ service: 'whatsapp', event: 'initialization_complete' }, 'WhatsApp inicializado')
  } catch (err) {
    logger.error({ 
      service: 'whatsapp', 
      event: 'initialization_error', 
      error: err.message,
      stack: err.stack
    }, 'Erro ao inicializar WhatsApp')
    throw err
  }
}

export async function getPairingCode(phoneNumber) {
  try {
    if (!sock) {
      throw new Error('Socket do WhatsApp não inicializado')
    }

    logger.info({ 
      service: 'whatsapp', 
      event: 'pairing_code_requested',
      phone: phoneNumber.replace(/\d(?=\d{4})/g, '*')
    }, 'Solicitando código de pareamento')

    const cleanPhone = phoneNumber.replace(/\D/g, '')
    const code = await sock.requestPairingCode(cleanPhone)
    
    logger.info({ 
      service: 'whatsapp', 
      event: 'pairing_code_generated'
    }, 'Código de pareamento gerado com sucesso')

    return code
  } catch (err) {
    logger.error({
      service: 'whatsapp',
      event: 'pairing_code_error',
      error: err.message,
      stack: err.stack
    }, 'Erro ao gerar código de pareamento')
    throw err
  }
}

export function getStatus() {
  return {
    connected: isConnected,
    timestamp: new Date().toISOString(),
    reconnectAttempts: reconnectionManager?.attempts || 0
  }
}

export async function sendMessage(number, message) {
  try {
    if (!sock || !isConnected) {
      throw new Error('WhatsApp não está conectado')
    }

    const jid = number.includes('@s.whatsapp.net')
      ? number
      : `${number}@s.whatsapp.net`

    await sock.sendMessage(jid, { text: message })
    
    logger.info({
      service: 'whatsapp',
      event: 'message_sent',
      to: number.replace(/\d(?=\d{4})/g, '*')
    }, 'Mensagem enviada')
  } catch (err) {
    logger.error({
      service: 'whatsapp',
      event: 'message_send_error',
      error: err.message
    }, 'Erro ao enviar mensagem')
    throw err
  }
}

export function getSocket() {
  return sock
}
