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
