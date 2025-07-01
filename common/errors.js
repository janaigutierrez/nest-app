class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message)
        this.statusCode = statusCode
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

class AuthError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401)
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Not authorized') {
        super(message, 403)
    }
}

class ExistenceError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404)
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400)
    }
}

class DuplicateError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409)
    }
}

class ServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500)
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429)
    }
}

class ContentError extends AppError {
    constructor(message = 'Invalid content') {
        super(message, 400)
    }
}

const errors = {
    AppError,
    AuthError,
    AuthorizationError,
    ExistenceError,
    ValidationError,
    DuplicateError,
    ServerError,
    RateLimitError,
    ContentError
}

export default errors