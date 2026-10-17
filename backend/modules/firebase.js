const fs = require('fs')
const path = require('path')

let admin = null
let initialized = false

try {
    const firebaseAdmin = require('firebase-admin')
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
        path.join(__dirname, '../tawssil-380715-firebase-adminsdk-kcn82-f4c541e5b0.json')

    if (fs.existsSync(keyPath)) {
        const serviceAccount = require(keyPath)
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount)
        })
        admin = firebaseAdmin
        initialized = true
        console.log('[Firebase] Admin SDK initialized successfully.')
    } else {
        console.warn('[Firebase] Service account JSON not found, running with mock messaging.')
    }
} catch (error) {
    console.warn('[Firebase] Initialization skipped:', error.message)
}

const safeMessaging = {
    send: async (message) => {
        if (initialized && admin) {
            return admin.messaging().send(message)
        }
        console.log('[Mock Firebase] Message simulated:', message.notification?.title || message)
        return 'mock-message-id-' + Date.now()
    },
    sendMulticast: async (message) => {
        if (initialized && admin) {
            return admin.messaging().sendMulticast(message)
        }
        console.log('[Mock Firebase] Multicast simulated to', message.tokens?.length, 'tokens')
        return { successCount: message.tokens?.length || 0, failureCount: 0 }
    },
    subscribeToTopic: async (registrationToken, topic) => {
        if (initialized && admin) {
            return admin.messaging().subscribeToTopic(registrationToken, topic)
        }
        console.log(`[Mock Firebase] Token subscribed to topic "${topic}"`)
        return { successCount: 1, failureCount: 0 }
    }
}

module.exports = {
    admin,
    messaging: safeMessaging,
    isInitialized: () => initialized
}
