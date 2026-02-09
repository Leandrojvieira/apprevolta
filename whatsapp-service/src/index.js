import express from 'express'
import cors from 'cors'
import { initWhatsApp } from './services/whatsapp.js'
import { logger } from './utils/logger.js'
import { config } from './config/environment.js'
import { errorHandler, AppError } from './middleware/error-handler.js'
import { healthCheck, readinessCheck, livenessCheck } from './routes/health.js'
import whatsappRoutes from './routes/whatsapp.js'

const app = express()

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (config.cors.allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      logger.warn({ service: 'http', event: 'cors_blocked', origin }, 'Origem bloqueada por CORS')
      callback(new AppError('Not allowed by CORS', 403))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.use((req, res, next) => {
  logger.info({ service: 'http', method: req.method, url: req.url, ip: req.ip }, 'Request received')
  next()
})

app.get('/health', healthCheck)
app.get('/health/readiness', readinessCheck)
app.get('/health/liveness', livenessCheck)

app.use('/whatsapp', whatsappRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

app.use(errorHandler(logger))

initWhatsApp().catch(err => {
  logger.error({ error: err.message }, 'Erro fatal ao inicializar WhatsApp')
  process.exit(1)
})

let server

async function shutdown() {
  logger.info('Recebido sinal de shutdown, finalizando gracefully...')
  if (server) {
    server.close(() => {
      logger.info('Servidor HTTP fechado')
    })
  }
  setTimeout(() => {
    logger.info('Forçando encerramento')
    process.exit(0)
  }, 10000)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ service: 'process', event: 'unhandled_rejection', reason, promise }, 'Unhandled Rejection')
})

process.on('uncaughtException', (error) => {
  logger.error({ service: 'process', event: 'uncaught_exception', error: error.message, stack: error.stack }, 'Uncaught Exception')
  process.exit(1)
})

const PORT = config.port
server = app.listen(PORT, '0.0.0.0', () => {
  logger.info({ service: 'http', port: PORT, env: config.env, allowedOrigins: config.cors.allowedOrigins }, `🚀 WhatsApp Service rodando na porta ${PORT}`)
})

export { app }
