#!/bin/bash

# utils/logger.js
cat > src/utils/logger.js << 'EOF'
import pino from 'pino'
import { config } from '../config/environment.js'

export const logger = pino({
  level: config.logging.level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: false,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  },
  formatters: {
    level: (label) => ({ level: label })
  },
  timestamp: pino.stdTimeFunctions.isoTime
})
EOF

# utils/phone-validator.js
cat > src/utils/phone-validator.js << 'EOF'
export function validatePhone(phone) {
  if (!phone) {
    throw new Error('Telefone é obrigatório')
  }
  const clean = phone.toString().replace(/\D/g, '')
  if (clean.length < 10 || clean.length > 15) {
    throw new Error('Telefone deve ter entre 10 e 15 dígitos')
  }
  return clean
}
EOF

# utils/reconnection-manager.js
cat > src/utils/reconnection-manager.js << 'EOF'
import { logger } from './logger.js'

export class ReconnectionManager {
  constructor(maxAttempts = 5, baseDelay = 5000) {
    this.maxAttempts = maxAttempts
    this.baseDelay = baseDelay
    this.attempts = 0
    this.isReconnecting = false
  }

  async attempt(connectFn) {
    if (this.isReconnecting || this.attempts >= this.maxAttempts) {
      return false
    }

    this.isReconnecting = true
    this.attempts++
    const delay = this.baseDelay * Math.pow(2, this.attempts - 1)
    
    logger.info({
      service: 'whatsapp',
      event: 'reconnection_attempt',
      attempt: this.attempts,
      maxAttempts: this.maxAttempts,
      delay
    }, `Tentando reconectar em ${delay}ms`)

    await new Promise(resolve => setTimeout(resolve, delay))

    try {
      await connectFn()
      this.reset()
      logger.info({ service: 'whatsapp', event: 'reconnection_success' }, 'Reconexão bem-sucedida')
      return true
    } catch (err) {
      logger.error({ 
        service: 'whatsapp',
        event: 'reconnection_failed', 
        attempt: this.attempts, 
        error: err.message 
      }, 'Falha na reconexão')
      this.isReconnecting = false
      return false
    }
  }

  reset() {
    this.attempts = 0
    this.isReconnecting = false
  }

  hasReachedLimit() {
    return this.attempts >= this.maxAttempts
  }
}
EOF

echo "✅ Arquivos utils criados"
