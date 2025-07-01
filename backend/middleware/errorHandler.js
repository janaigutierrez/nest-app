import { errors } from "common"

const errorHandler = (err, req, res, next) => {
    console.error('Error caught by middleware:', err)

    if (err instanceof errors.AppError) {
        return res.status(err.statusCode).json({
            name: err.constructor.name,
            message: err.message
        })
    }

    if (err.code === 11000) {
        return res.status(409).json({
            name: 'DuplicateError',
            message: 'Resource already exists'
        })
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            name: 'ValidationError',
            message: err.message
        })
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            name: 'AuthError',
            message: 'Authentication failed'
        })
    }

    res.status(500).json({
        name: 'ServerError',
        message: 'Internal server error'
    })
}

export default errorHandler