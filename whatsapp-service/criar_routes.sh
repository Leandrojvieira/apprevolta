#!/bin/bash

# middleware/error-handler.js
cat > src/middleware/error-handler.js << 'EOF'
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export function errorHandler(logger) {
  return (err, req, res, next) => {
    const { statusCode = 500, message, isOperational } = err

    logger.error({
      error: {
        message: err.message,
        stack: err.stack,
        isOperational
      },
      request: {
        method: req.method,
        url: req.url,
        ip: req.ip
      }
    }, 'Request error')

    res.status(statusCode).json({
      status: 'error',
      message: isOperational ? message : 'Erro interno do servidor'
    })
  }
}
EOF

# routes/health.js
cat > src/routes/health.js << 'EOF'
import { getStatus, getSocket } from '../services/whatsapp.js'
import { logger } from '../utils/logger.js'

export async function healthCheck(req, res) {
  try {
    const status = getStatus()
    const sock = getSocket()
    
    const health = {
      status: status.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'whatsapp-service',
      version: process.env.APP_VERSION || '2.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      whatsapp: {
        connected: status.connected,
        reconnectAttempts: status.reconnectAttempts
      }
    }

    if (status.connected && sock) {
      try {
        const myNumber = sock.user?.id
        if (myNumber) {
          health.whatsapp.user = myNumber.split('@')[0]
        }
      } catch (err) {
        health.whatsapp.error = err.message
      }
    }

    const statusCode = status.connected ? 200 : 503
    res.status(statusCode).json(health)
  } catch (err) {
    logger.error({ error: err.message }, 'Erro no health check')
    res.status(503).json({
      status: 'unhealthy',
      error: err.message
    })
  }
}

export function readinessCheck(req, res) {
  const status = getStatus()
  res.sendStatus(status.connected ? 200 : 503)
}

export function livenessCheck(req, res) {
  res.sendStatus(200)
}
EOF

# routes/whatsapp.js
cat > src/routes/whatsapp.js << 'EOF'
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
EOF

echo "✅ Todos os arquivos de rotas e middleware criados"
