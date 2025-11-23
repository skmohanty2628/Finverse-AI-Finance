import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already in use' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })

    // ✅ Include name and email in JWT payload
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (e) {
    console.error('Register Error:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' })

    // ✅ Include name and email in JWT payload
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (e) {
    console.error('Login Error:', e)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET LOGGED-IN USER
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select('name email')
  res.json({ user })
})

export default router
