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
