import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/database.js"
import userRoutes from "./routes/user/users.js"
import questRoutes from "./routes/quest/quests.js"
import errorHandler from "./middleware/errorHandler.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173']

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.use('/api/users', userRoutes)
app.use('/api/quests', questRoutes)

app.use(errorHandler)

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

const startServer = async () => {
    try {
        await connectDB()

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)

            if (process.env.RENDER_EXTERNAL_URL) {
                const url = process.env.RENDER_EXTERNAL_URL + '/health'
                setInterval(() => {
                    fetch(url).catch(() => {})
                }, 14 * 60 * 1000)
                console.log(`Self-ping enabled: ${url} every 14min`)
            }
        })

    } catch (error) {
        console.error('Failed to start server:', error.message)
        console.error('Make sure MongoDB is running')
        process.exit(1)
    }
}

startServer()