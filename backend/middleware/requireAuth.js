const jwt = require('jsonwebtoken')
const User = require('../models/User')

const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers
    
    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' })
    }

    const parts = authorization.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Invalid authorization format. Expected Bearer <token>' })
    }

    const token = parts[1]

    try {
        const secret = process.env.SECRET || 'fleetora_secret_jwt_fallback'
        const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] })
        
        const user = await User.findOne({ _id: decoded._id }).select('_id role status authorizationIds firstName lastName email phone')
        
        if (!user) {
            return res.status(401).json({ error: 'User does not exist or has been deleted' })
        }

        if (user.status === false) {
            return res.status(403).json({ error: 'Account has been deactivated' })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Request is not authorized: ' + (error.message || 'invalid token') })
    }
}

module.exports = requireAuth