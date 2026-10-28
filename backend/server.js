const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const http = require('http')
const jwt = require('jsonwebtoken')
const { Server } = require('socket.io')

// Firebase Admin initialization via safe module
require('./modules/firebase')

const userRouters = require('./routes/users')
const vehicleRouters = require('./routes/vehicles')
const tripRouters = require('./routes/trips')
const notificationRouters = require('./routes/notifications')
const termRouters = require('./routes/terms')
const roleRouters = require('./routes/roles')
const announcementRouters = require('./routes/announcements')
const billingRouters = require('./routes/billings')
const companyRouters = require('./routes/company')

// Express app
const app = express()
const server = http.createServer(app)

// Trust proxy header for accurate IP tracking behind Nginx
app.set('trust proxy', 1)

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Request logging in development/production (skip in test)
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
}

// CORS configuration - Disallow wildcard with credentials
const defaultAllowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:7072',
    'http://localhost:8080',
    'http://localhost:8081',
    'capacitor://localhost',
    'ionic://localhost',
    'https://localhost',
    'https://fleetora.com.dz',
    'https://www.fleetora.com.dz',
    'https://fleetora-web.onrender.com',
    'https://fleetora-admin.onrender.com',
    'https://fleetora-partner.onrender.com',
    'https://fleetora-client.onrender.com'
]

const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : defaultAllowedOrigins

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true)
        } else {
            callback(new Error('Blocked by CORS'))
        }
    },
    credentials: true
}))

// Rate limiting: general limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
})

// Tighter rate limiter for sensitive authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // 30 attempts per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again later.' }
})

// Apply rate limiting
app.use('/users/login', authLimiter)
app.use('/users/signup', authLimiter)
app.use('/api/users/login', authLimiter)
app.use('/api/users/signup', authLimiter)
app.use('/api/', generalLimiter)

// Request body parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(express.static(path.join(__dirname, 'public')))

// Socket.io initialization with CORS & Handshake Auth
const io = new Server(server, {
    path: "/socket.io/",
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                callback(null, true)
            } else {
                callback(new Error('Blocked by CORS'))
            }
        },
        credentials: true,
        methods: ["GET", "POST"]
    }
})

// Socket.io Handshake Authentication Middleware
io.use((socket, next) => {
    const rawToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization
    if (!rawToken) {
        // Allow unauthenticated socket connection if public, but flag socket.user as null
        socket.user = null
        return next()
    }
    const token = rawToken.replace(/^Bearer\s+/i, '')
    try {
        const decoded = jwt.verify(token, process.env.SECRET || 'fleetora_default_secret_jwt_key_2026')
        socket.user = decoded
        return next()
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
            console.warn('[Socket.io Auth] Invalid handshake token:', err.message)
        }
        socket.user = null
        return next()
    }
})

// Socket.io handlers
io.on("connection", socket => {
    if (process.env.NODE_ENV !== 'test') {
        console.log('[Socket.io] Client connected:', socket.id, socket.user ? `(User: ${socket.user._id})` : '(Guest)')
    }

    socket.on('joinRoom', (room) => {
        // Enforce basic string sanitization on room name
        if (room && typeof room === 'string' && room.trim().length <= 128) {
            socket.join(room.trim())
        }
    })

    // Secure response events: never broadcast sensitive trip coordinates to all users
    socket.on('transporterResponse', (message, room, data) => {
        if (room && typeof room === 'string') {
            socket.to(room.trim()).emit('receiveTransporterResponse', message, data)
        }
    })

    socket.on('clientResponse', (message, room) => {
        if (room && typeof room === 'string') {
            socket.to(room.trim()).emit('receiveClientResponse', message)
        }
    })

    socket.on('disconnect', () => {
        // Clean disconnect
    })
})

// Attach io to req
app.use((req, res, next) => {
    req.io = io
    next()
})

// Health check endpoint
const healthHandler = (req, res) => {
    res.status(200).json({
        service: 'Fleetora API',
        status: 'UP',
        node: process.version,
        dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    })
}
app.get('/health', healthHandler)
app.get('/api/health', healthHandler)

// Routes
const mountRoutes = (prefix = '') => {
    app.use(`${prefix}/users`, userRouters)
    app.use(`${prefix}/vehicles`, vehicleRouters)
    app.use(`${prefix}/trips`, tripRouters)
    app.use(`${prefix}/notifications`, notificationRouters)
    app.use(`${prefix}/terms`, termRouters)
    app.use(`${prefix}/announcements`, announcementRouters)
    app.use(`${prefix}/billings`, billingRouters)
    app.use(`${prefix}/company`, companyRouters)
    app.use(`${prefix}/roles`, roleRouters)
}

mountRoutes('')
mountRoutes('/api')

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.url}` })
})

// Central Error Handler
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error('[API Error]:', err.stack || err.message)
    }
    const statusCode = err.status || err.statusCode || 500
    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal Server Error'
            : (err.message || 'Internal Server Error')
    })
})

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fleetora'

if (require.main === module) {
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.SECRET || process.env.SECRET.length < 32 || process.env.SECRET.includes('default_secret')) {
            console.error('[FATAL] Production startup aborted: SECRET environment variable must be set to a cryptographically secure key of at least 32 characters.')
            process.exit(1)
        }
    }
    mongoose.set('strictQuery', true)
    mongoose.connect(MONGO_URI)
        .then(() => {
            const sanitizedUri = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')
            console.log('[Fleetora DB] Connected to database:', sanitizedUri)
            server.listen(PORT, '0.0.0.0', () => {
                console.log(`[Fleetora API] Listening on port ${PORT}`)
            })
        })
        .catch((err) => {
            console.error('[Fleetora DB] Database connection error:', err.message)
        })
}

module.exports = { app, server }
