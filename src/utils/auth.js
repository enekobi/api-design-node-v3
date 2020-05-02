import config from '../config'
import { User } from '../resources/user/user.model'
import jwt from 'jsonwebtoken'
import { restart } from 'nodemon'

export const newToken = user => {
  return jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

export const signup = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).send({ message: 'error' })
  }

  try {
    const user = await User.create({ email, password })
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch {
    return res.status(500).end()
  }
}

export const signin = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).send({ message: 'error' })
  }

  const user = await User.findOne({ email }).exec()

  if (!user) {
    return res.status(401).send({ message: 'error' })
  }

  try {
    const match = await user.checkPassword(password)
    if (!match) {
      return res.status(401).send({ message: 'error' })
    }
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch {
    return res.status(400).send({ message: 'error' })
  }
}

export const protect = async (req, res, next) => {
  let token = ''
  try {
    token = req.headers.authorization.split('Bearer ')[1]
  } catch {
    return res.status(401).end()
  }
  if (!token) {
    return res.status(401).end()
  }

  try {
    const payload = await verifyToken(token)
    const user = await User.findById(payload.id)
      .select('-password')
      .exec()
    if (!user) {
      return res.status(401).end()
    }

    req.user = user
  } catch {
    return res.status(401).end()
  }

  next()
}
