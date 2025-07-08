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

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
        })

    } catch (error) {
        console.error('Failed to start server:', error.message)
        console.error('Make sure MongoDB is running')
        process.exit(1)
    }
}

startServer()