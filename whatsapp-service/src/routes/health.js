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
