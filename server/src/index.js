import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import chatbotRoutes from './routes/chatbot.js'

dotenv.config()

const app = express()            // ✅ app created first
app.use(cors())
app.use(express.json())

// ✅ register routes after app exists
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatbotRoutes)

app.get('/', (_req, res) => res.json({ status: 'ok', service: 'finserv-server' }))

const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })
