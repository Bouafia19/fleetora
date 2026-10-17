const { messaging } = require('../modules/firebase')

// POST send to topics
const sendToTopics = async (req, res) => {
    const { topic, title, body } = req.body

    try {
        let message = {
            notification: {
                title: title,
                body: body
            },
            data: {
                source: 'admin'
            },
            android: {
                priority: "high"
            },
            topic: topic
        }

        const response = await messaging.send(message)
        console.log('Successfully sent message:', response)
        res.status(200).json({ success: true, response })
    } catch (error) {
        console.error('Error sending message:', error)
        res.status(500).json({ error: error.message })
    }
}

// POST send to multiple tokens
const sendToTokens = async (req, res) => {
    const { registrationTokens, title, body } = req.body

    try {
        let message = {
            notification: {
                title: title,
                body: body
            },
            data: {},
            tokens: registrationTokens,
        }

        const response = await messaging.sendMulticast(message)
        console.log('Successfully sent multicast message:', response)
        res.status(200).json({ success: true, response })
    } catch (error) {
        console.error('Error sending message:', error)
        res.status(500).json({ error: error.message })
    }
}

// POST send to single token
const sendToToken = async (req, res) => {
    const { registrationToken, title, body, data } = req.body
    
    try {
        let message = {
            notification: {
                title: title,
                body: body,
            },
            data: {
                start: data?.from || '',
                to: data?.to || '',
                price: String(data?.price || ''),
                distance: String(data?.distance || ''),
                clientId: String(data?.client?.id || ''),
                clientFirstName: data?.client?.firstName || '',
                clientLastName: data?.client?.lastName || '',
                clientPhone: data?.client?.phone || '',
                clientSocketIo: data?.socketId || '',
                vehicleId: String(data?.vehicleId || ''),
                source: 'client',
                time: new Date().toString()
            },
            token: registrationToken
        }

        const response = await messaging.send(message)
        console.log('Successfully sent message:', response)
        res.status(200).json({ success: true, response })
    } catch (error) {
        console.error('Error sending message:', error)
        res.status(500).json({ error: error.message })
    }
}

// Subscribe
const subscribe = async (req, res) => {
    const { role, fcmToken } = req.body
    try {
        const response = await messaging.subscribeToTopic(fcmToken, role)
        console.log('Successfully subscribed to topic:', response)
        res.status(200).json({ success: true, response })
    } catch (error) {
        console.error('Error subscribing to topic:', error)
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    sendToTopics,
    sendToTokens,
    sendToToken,
    subscribe
}