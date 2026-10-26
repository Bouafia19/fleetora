const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    sendToTopics,
    sendToTokens,
    sendToToken,
    subscribe } = require('../controllers/notificationsController')

// require auth for all routes
router.use(requireAuth)

// topics (admin only broadcast)
router.post('/topics', requireRole('administrator'), sendToTopics)

// Multiple tokens (admin only broadcast)
router.post('/tokens', requireRole('administrator'), sendToTokens)
  
// One token (for direct dispatch notifications)
router.post('/token', sendToToken)

// Subscribe to FCM topic (fixed route collision FLT-ARC-004)
router.post('/subscribe', subscribe)

module.exports = router