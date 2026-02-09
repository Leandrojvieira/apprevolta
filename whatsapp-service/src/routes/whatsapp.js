import express from 'express'
import { getStatus, sendMessage, getPairingCode } from '../services/whatsapp.js'
import { validatePhone } from '../utils/phone-validator.js'
import { AppError } from '../middleware/error-handler.js'
import { logger } from '../utils/logger.js'
import rateLimit from 'express-rate-limit'
import { config } from '../config/environment.js'

const router = express.Router()

const pairLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Limite de mensagens excedido. Aguarde 1 minuto.' }
})

router.get('/status', (req, res) => {
  const status = getStatus()
  res.json(status)
})

router.post('/pair', pairLimiter, async (req, res, next) => {
  try {
    const { phone } = req.body
    
    if (!phone) {
      throw new AppError('Telefone é obrigatório', 400)
    }

    const cleanPhone = validatePhone(phone)
    
    logger.info({
      service: 'whatsapp',
      action: 'pair_request',
      ip: req.ip
    }, 'Requisição de pairing recebida')

    const code = await getPairingCode(cleanPhone)
    
    res.json({ 
      code,
      message: 'Código gerado. Digite no WhatsApp em até 1 minuto.',
      expiresIn: 60
    })
  } catch (err) {
    next(err)
  }
})

router.post('/send', messageLimiter, async (req, res, next) => {
  try {
    const { number, message } = req.body
    
    if (!number || !message) {
      throw new AppError('number e message são obrigatórios', 400)
    }

    if (message.length > 4096) {
      throw new AppError('Mensagem muito longa (máximo 4096 caracteres)', 400)
    }

    const cleanNumber = validatePhone(number)
    
    await sendMessage(cleanNumber, message)
    
    res.json({ 
      success: true,
      message: 'Mensagem enviada com sucesso'
    })
  } catch (err) {
    next(err)
  }
})

export default router
