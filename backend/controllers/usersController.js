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

// login user via web
const loginUserWeb = async (req, res) => {
    try {
        const { phone, role } = req.body
        const item = await User.loginPhoneWeb(phone, role)
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
        res.status(200).json({ user, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// signup user via web
const signupUserWeb = async (req, res) => {
    const { phone, role, email, firstName, lastName,  activated } = req.body
    try {
        const item = await User.signupWeb( phone, role, email, firstName, lastName,  activated)
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
        
        res.status(200).json({ user, token})
    } catch (error) {
        res.status(400).json({error: error.message})
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

// GET all users
const getUsers = async (req, res) => {
    const users = await User.find().sort({ createdAt: -1}).populate("vehicleId").populate("authorizationIds")
    res.status(200).json(users)
}

// GET a single user
const getUser = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
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
    }

}

// POST a new user
const createUser = async (req, res) => {
    const { 
        password,
        
    } = req.body
    
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        // add doc to db
        const user = await User.create({ 
            ...req.body,
            password: hash
        })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
// DELETE a user
const deleteUser = async (req, res) => {
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

// UPDATE a user
const updateUser = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
    
    const user = await User.findOneAndUpdate({_id: id},{
        ...req.body
    },
    {
        new: true
    }).select('email firstName lastName language phone role complete status fileStatus legal')
    
    if(!user){
        return res.status(404).json({error: 'no such user'})
    }
    
    res.status(200).json(user)
}

// update existing user
const update_existing_user = async (req, res) => {
    const { id } = req.params
    // let { password } = req.body
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
    
    if(req.body.password){
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)

        req.body.password = hash
    }
    
    const user = await User.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!user){
        return res.status(404).json({error: 'no such user'})
    }
    
    res.status(200).json(user)
}

// upload images
const uploadPartnerImages = async (req, res) => {

    const { id } = req.params
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
   
    const user = await User.findOneAndUpdate({_id: id},{
        ...req.body
    }).select('_id')
    
    if(!user){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json(user)
}

// GET partner photos
const loadPartnerPhotos = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
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