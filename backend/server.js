require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const http = require('http')
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

// Express 5 app
const app = express()
const server = http.createServer(app)

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Request logging in development/production (skip in test)
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again later.' }
})
app.use('/api/', limiter)

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['*']

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Blocked by CORS'))
        }
    },
    credentials: true
}))

// Request body parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(express.static('./public'))

// Socket.io initialization
const io = new Server(server, {
    path: "/socket.io/",
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

// Socket.io handlers
io.on("connection", socket => {
    if (process.env.NODE_ENV !== 'test') {
        console.log('[Socket.io] Client connected:', socket.id)
    }

    socket.on('joinRoom', (room) => {
        if (room) {
            socket.join(room)
        }
    })

    socket.on('transporterResponse', (message, room, data) => {
        if (room) {
            socket.to(room).emit('receiveTransporterResponse', message, data)
        } else {
            socket.broadcast.emit('receiveTransporterResponse', message, data)
        }
    })

    socket.on('clientResponse', (message, room) => {
        if (room) {
            socket.to(room).emit('receiveClientResponse', message)
        } else {
            socket.broadcast.emit('receiveClientResponse', message)
        }
    })

    socket.on('disconnect', () => {
        // Disconnected
    })
})

// Attach io to req
app.use((req, res, next) => {
    req.io = io
    next()
})

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        service: 'Fleetora API',
        status: 'UP',
        node: process.version,
        dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    })
})

// Routes (supports both /api/* and /* for reverse proxy compatibility)
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

// Express 5 Central Error Handler
app.use((err, req, res, next) => {
    console.error('[API Error]:', err.stack || err.message)
    const statusCode = err.status || err.statusCode || 500
    res.status(statusCode).json({
        error: err.message || 'Internal Server Error'
    })
})

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fleetora'

if (require.main === module) {
    mongoose.set('strictQuery', true)
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('[Fleetora DB] Connected to database:', MONGO_URI)
            server.listen(PORT, () => {
                console.log(`[Fleetora API] Listening on port ${PORT}`)
            })
        })
        .catch((err) => {
            console.error('[Fleetora DB] Database connection error:', err.message)
        })
}

module.exports = { app, server }