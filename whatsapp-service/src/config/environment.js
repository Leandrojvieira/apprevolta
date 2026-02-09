export const config = {
  env: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.PORT || '3001', 10),
  
  whatsapp: {
    authPath: process.env.AUTH_PATH || '/app/data/auth_info',
    maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '5', 10),
    reconnectDelay: parseInt(process.env.RECONNECT_DELAY || '5000', 10)
  },
  
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'https://revolta.top,https://revolta-ftvy.vercel.app').split(',').filter(Boolean)
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '3', 10)
  }
}

if (config.env === 'development') {
  config.cors.allowedOrigins.push('http://localhost:3000')
}
