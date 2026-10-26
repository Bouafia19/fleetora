const User = require('../models/User')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { messaging } = require('../modules/firebase')
const { defineRulesFor } = require('../modules/abilities')

let client = null
if (process.env.ACCOUNT_SID && process.env.AUTH_TOKEN && process.env.ACCOUNT_SID.startsWith('AC')) {
    try {
        client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
    } catch (e) {
        console.warn('Twilio client not initialized:', e.message)
    }
}

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET || 'fleetora_secret_jwt_fallback', { expiresIn: '7d' })
}

// login user via web - strictly requires and validates password
const loginUserWeb = async (req, res) => {
    try {
        const { phone, password, role } = req.body
        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' })
        }
        const item = await User.loginPhone(phone, password, role || 'client')
        // create token
        const token = createToken(item._id)
        let user = {
            _id: item._id,
            email: item.email,
            firstName: item.firstName,
            lastName: item.lastName,
            language: item.language,
            phone: item.phone,
            role: item.role,
        }
        res.status(200).json({ user, token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// signup user via web - restricted to client role with mandatory password
const signupUserWeb = async (req, res) => {
    const { phone, password, email, firstName, lastName } = req.body
    try {
        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' })
        }
        // Strict role restriction: web signup is only permitted for clients
        const role = 'client'
        const item = await User.signup(
            email || `${phone.replace(/[^0-9]/g, '')}@fleetora.local`,
            firstName || 'Client',
            lastName || 'User',
            phone,
            password,
            role,
            '', // fcmToken
            '', // codePartenaire
            '', // code
            true, // activated
            true, // complete
            true, // status
            'created', // fileStatus
            true // legal
        )
        // create token
        const token = createToken(item._id)

        let user = {
            _id: item._id,
            email: item.email,
            firstName: item.firstName,
            lastName: item.lastName,
            language: item.language,
            phone: item.phone,
            role: item.role,
        }
        
        res.status(200).json({ user, token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET a single user by phone number
const verifyUser = async (req, res) => {
    const { phonenumber, role } = req.body

    let phoneWith0
    if(phonenumber.length === 14){
        phoneWith0 = phonenumber.slice(0, 4) + phonenumber.slice(5)
    }else if (phonenumber.length === 13){
        phoneWith0 = phonenumber.slice(0, 4) + '0' + phonenumber.slice(4)
    }
   
    const user = await User.findOne({ phone: phonenumber, role: role })
    const user0 = await User.findOne({ phone: phoneWith0, role: role })

    if(!user && !user0){
        return res.status(404).json({error: 'no such user'})
    }else if(user){
        res.status(200).json(user)
    }else if(user0){
        res.status(200).json(user0)
    }
}



// login user
const loginUser = async (req, res) => {
    const { role } = req.body
    try {
        if(role != 'administrator'){
            const { phone, password } = req.body
            const item = await User.loginPhone(phone, password, role)
            // create token
            const token = createToken(item._id)
            
            if(item.role === 'client'){
                let user = {
                    _id: item._id,
                    email: item.email,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    language: item.language,
                    phone: item.phone,
                    role: item.role,
                }
                
                res.status(200).json({ user, token})
            }else if(item.role === 'transporter'){
                let user = {
                    _id: item._id,
                    email: item.email,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    language: item.language,
                    phone: item.phone,
                    role: item.role,
                    complete: item.complete,
                    status: item.status,
                    fileStatus: item.fileStatus,
                    vehicleId: item.vehicleId,
                    legal: item.legal
                }
               
                res.status(200).json({ user, token})
            }
            
        }else{
            const { email, password } = req.body
            const user = await User.loginEmail(email, password, role)
            // create token
            const token = createToken(user._id)
            const rules = defineRulesFor(user)
            res.status(200).json({ rules, user, token})
        }

    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// signup user
const signupUser = async (req, res) => {
    const { 
        email, 
        firstName, 
        lastName, 
        phone, 
        password, 
        role, 
        fcmToken, 
        codePartenaire, 
        code, 
        activated,
        complete,
        status,
        fileStatus,
        legal
    } = req.body

    // Prevent privilege escalation: administrator accounts cannot be self-registered
    if (role === 'administrator') {
        return res.status(403).json({ error: 'Administrator accounts cannot be created via public signup' })
    }

    try {
        const item = await User.signup(
            email, 
            firstName, 
            lastName, 
            phone, 
            password, 
            role, 
            fcmToken, 
            codePartenaire, 
            code, 
            activated,
            complete,
            status,
            fileStatus,
            legal
        )
        // create token
        const token = createToken(item._id)

        if(item.fcmToken){
            if(item.role != 'administrator'){
                messaging.subscribeToTopic(item.fcmToken, item.role)
                .then((response) => {
                    console.log('Successfully subscribed to topic:', response);
                })
                .catch((error) => {
                    console.log('Error subscribing to topic:', error);
                })
            }
        }
        

        if(item.role === 'client'){
            let user = {
                _id: item._id,
                email: item.email,
                firstName: item.firstName,
                lastName: item.lastName,
                language: item.language,
                phone: item.phone,
                role: item.role,
            }
            res.status(200).json({ user, token})
        }else if(item.role === 'transporter'){
            let user = {
                _id: item._id,
                email: item.email,
                firstName: item.firstName,
                lastName: item.lastName,
                language: item.language,
                phone: item.phone,
                role: item.role,
                complete: item.complete,
                status: item.status,
                fileStatus: item.fileStatus,
                legal: item.legal
            }
            res.status(200).json({ user, token})
        }
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// verify phone
const verifyPhone = async (req, res) => {
    const { phonenumber, channel, role } = req.body
    
    // validation
    if(!phonenumber || !channel){
        return res.status(400).json({error: 'All field must be filled'})
    }
    let phoneWith0
    if(phonenumber.length === 14){
        phoneWith0 = phonenumber.slice(0, 4) + phonenumber.slice(5)
    }else if (phonenumber.length === 13){
        phoneWith0 = phonenumber.slice(0, 4) + '0' + phonenumber.slice(4)
    }

    const exists = await User.findOne({  phone: phonenumber,  role: role })
    const exists0 = await User.findOne({  phone: phoneWith0,  role: role })
    if(exists || exists0){
        return res.status(400).json({error: 'paiu'})
    }
    else if (phonenumber) {
        if (client && process.env.SERVICE_ID) {
            try {
                const verification = await client.verify.v2.services(process.env.SERVICE_ID)
                    .verifications
                    .create({ to: phonenumber, channel: channel || 'sms' })
                return res.status(200).send({
                    message: "Verification is sent!!",
                    phonenumber: phonenumber,
                    verification
                })
            } catch (err) {
                console.warn("Twilio send SMS error:", err.message)
            }
        }
        res.status(200).send({
            message: "Verification is sent!!",
            phonenumber: phonenumber,
        })
    } 
    else {
        res.status(400).send({
            message: "Wrong phone number :(",
            phonenumber: phonenumber
        })
     }

}

// verify code
const verifyCode = async (req, res) => {
    const { phonenumber, code } = req.body
    if (phonenumber && code && code.length === 6) {
        if (client && process.env.SERVICE_ID) {
            try {
                const data = await client.verify.v2.services(process.env.SERVICE_ID)
                    .verificationChecks
                    .create({ to: phonenumber, code: code })
                if (data.status === "approved") {
                    return res.status(200).send({
                        message: "User is Verified!!",
                        data
                    })
                } else {
                    return res.status(400).send({
                        message: "Verification rejected",
                        data
                    })
                }
            } catch (err) {
                console.warn("Twilio verify code error:", err.message)
            }
        }
        // Dev/simulated verification approval
        return res.status(200).send({
            message: "User is Verified!!",
            data: { status: "approved", to: phonenumber }
        })
    } else {
        return res.status(400).send({
            message: "Wrong phone number or code :(",
            phonenumber: phonenumber
        })
    }
}

// GET all users (admin only, projects out heavy Base64 image fields for performance)
const getUsers = async (req, res) => {
    if (req.user && req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access denied: Administrator privileges required' })
    }
    const users = await User.find()
        .select('-grayCard -commercialRegister -transportCard -trafficPermit -id')
        .sort({ createdAt: -1 })
        .populate("vehicleId")
        .populate("authorizationIds")
    res.status(200).json(users)
}

// GET a single user (owner or admin only)
const getUser = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    if (req.user && req.user._id.toString() !== id && req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access denied: You can only view your own user profile' })
    }

    const item = await User.findById(id)
    
    if(!item){
        return res.status(404).json({error: 'no such user'})
    }

    if(item.role === 'client'){
        let user = {
            _id: item._id,
            email: item.email,
            firstName: item.firstName,
            lastName: item.lastName,
            language: item.language,
            phone: item.phone,
            role: item.role,
        }
        res.status(200).json(user)
    }else if(item.role === 'transporter'){
        let user = {
            _id: item._id,
            email: item.email,
            firstName: item.firstName,
            lastName: item.lastName,
            language: item.language,
            phone: item.phone,
            role: item.role,
            complete: item.complete,
            status: item.status,
            fileStatus: item.fileStatus,
            vehicleId: item.vehicleId,
            legal: item.legal
        }
        res.status(200).json(user)
    } else {
        res.status(200).json(item)
    }
}

// POST a new user (admin only)
const createUser = async (req, res) => {
    if (req.user && req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access denied: Administrator privileges required' })
    }
    const { 
        password,
    } = req.body
    
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const user = await User.create({ 
            ...req.body,
            password: hash
        })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a user (admin only)
const deleteUser = async (req, res) => {
    if (req.user && req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access denied: Administrator privileges required' })
    }
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
    const user = await User.findOneAndDelete({_id: id})

    if(!user){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json(user)
}

// UPDATE a user (owner or admin only, with strict field allowlist)
const updateUser = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    if (req.user && req.user._id.toString() !== id && req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access denied: You can only update your own user profile' })
    }

    const allowedFields = ['firstName', 'lastName', 'language', 'phone']
    if (req.user && req.user.role === 'administrator') {
        allowedFields.push('activated', 'complete', 'status', 'fileStatus', 'legal', 'vehicleId', 'codePartenaire')
    }

    const updates = {}
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field]
        }
    }
    
    const user = await User.findOneAndUpdate({_id: id}, updates,
    {
        new: true
    }).select('email firstName lastName language phone role complete status fileStatus legal vehicleId')
    
    if(!user){
        return res.status(404).json({error: 'no such user'})
    }
    
    res.status(200).json(user)
}

// update existing user (owner or admin, strict field validation, mass-assignment blocked)
const update_existing_user = async (req, res) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    if (req.user._id.toString() !== id && req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access denied: You can only update your own account' })
    }

    const allowedFields = ['firstName', 'lastName', 'language', 'phone']
    if (req.user.role === 'administrator') {
        allowedFields.push('activated', 'complete', 'status', 'fileStatus', 'legal', 'vehicleId', 'codePartenaire', 'authorizationIds')
    }

    const updates = {}
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field]
        }
    }

    // Only administrators can modify passwords directly through this endpoint
    if (req.body.password && req.user.role === 'administrator') {
        const salt = await bcrypt.genSalt(10)
        updates.password = await bcrypt.hash(req.body.password, salt)
    }
    
    const user = await User.findOneAndUpdate({_id: id}, updates, { new: true })
        .select('email firstName lastName language phone role complete status fileStatus legal')

    if(!user){
        return res.status(404).json({error: 'no such user'})
    }
    
    res.status(200).json(user)
}

// upload partner images (owner or admin only, with document field validation)
const uploadPartnerImages = async (req, res) => {
    const { id } = req.params
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    if (req.user._id.toString() !== id && req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access denied: You can only upload documents for your own account' })
    }

    const allowedDocFields = ['grayCard', 'commercialRegister', 'transportCard', 'trafficPermit', 'id', 'avatar']
    const updates = {}
    for (const field of allowedDocFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field]
        }
    }
   
    const user = await User.findOneAndUpdate({_id: id}, updates, { new: true }).select('_id fileStatus')
    
    if(!user){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json(user)
}

// GET partner photos (owner or admin only - IDOR prevention)
const loadPartnerPhotos = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    if (req.user._id.toString() !== id && req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access denied: You can only access your own documents' })
    }

    const images = await User.findById(id).select('grayCard commercialRegister transportCard trafficPermit id')
    
    if(!images){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json(images)
}

module.exports = {
    loginUser,
    signupUser,
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser,
    verifyCode,
    verifyPhone,
    verifyUser,
    update_existing_user,
    loginUserWeb,
    signupUserWeb,
    uploadPartnerImages,
    loadPartnerPhotos
}