const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const { normalizePhone, getPhoneWithZero } = require('../utils/phone')
const Schema = mongoose.Schema 

const UserSchema = new mongoose.Schema({
  email: {
    type: String
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  language: {
    type: String,
    default: 'fr'
  },
  password: {
    type: String
  },
  phone: {
    type: String
  },
  role: {
    type: String, 
    enum: ['administrator', 'client', 'transporter']
  },
  activated: {
    type: Boolean,
    default: false
  },
  grayCard: {
    type: String
  },
  commercialRegister: {
    type: String
  },
  transportCard: {
    type: String
  },
  trafficPermit: {
    type: String
  },
  id: {
    type: String
  },
  complete: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String
  },
  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  fcmToken: {
    type: String
  },
  lastLatLng: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  },
  codePartenaire: {
    type: String
  },
  code: {
    type: String
  },
  status: {
    type: Boolean,
    default: true
  },
  authorizationIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  fileStatus: {
    type: String, 
    enum: ['created', 'pending', 'confirmed']
  },
  legal: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true
})

// Database indexes for high-frequency queries and performance
UserSchema.index({ phone: 1, role: 1 })
UserSchema.index({ email: 1, role: 1 })
UserSchema.index({ role: 1, status: 1 })
UserSchema.index({ vehicleId: 1, role: 1, status: 1 })

// static signup method
UserSchema.statics.signup = async function( 
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
                                  legal  ) {

  // validation
  if(!email || !password){
    throw Error('All field must be filled')
  }
  if(!validator.isEmail(email)){
    throw Error('email is not valid')
  }
  
  const exists = await this.findOne({ email, role })
  
  if(exists){
    throw Error('Email already in use')
  }
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await this.create({ 
                      email, 
                      firstName, 
                      lastName, 
                      phone, 
                      password: hash, 
                      role, 
                      fcmToken, 
                      codePartenaire, 
                      code, 
                      activated,
                      complete,
                      status,
                      fileStatus,
                      legal })

  return user
}

// static loginPhone method
UserSchema.statics.loginPhone = async function( phone, password, role) {
  if(!phone || !password){
    throw Error('All field must be filled')
  }

  const cleanPhone = normalizePhone(phone)
  const phoneWith0 = getPhoneWithZero(cleanPhone)
  let user = null
  let user0 = null
  if(role === 'client'){
    user = await this.findOne({ phone: cleanPhone, role: 'client', activated: true })
    if (!user && phoneWith0 !== cleanPhone) {
      user0 = await this.findOne({ phone: phoneWith0, role: 'client', activated: true })
    }
  }else if(role === 'transporter'){
    user = await this.findOne({ phone: cleanPhone, role: 'transporter', activated: true })
    if (!user && phoneWith0 !== cleanPhone) {
      user0 = await this.findOne({ phone: phoneWith0, role: 'transporter', activated: true })
    }
  }
  
  if(!user && !user0){
    throw Error('ip')
  }
  if(user){
    const match = await bcrypt.compare(password, user.password)
    if(!match){
      throw Error('ipass')
    }else{
      return user
    }
    
  }else if(user0){
    const match0 = await bcrypt.compare(password, user0.password)
    if(!match0){
      throw Error('ipass')
    }else{
      return user0
    }
  }
}

// static loginEmail method
UserSchema.statics.loginEmail = async function( email, password ) {
  if(!email || !password){
    throw Error('All field must be filled')
  }
  const user = await this.findOne({ email, role: 'administrator' }).populate("authorizationIds")
  if(!user){
    throw Error('ie')
  }
  const match = await bcrypt.compare(password, user.password) 
  if(!match){
    throw Error('ipass')
  }
  return user
}

// static loginPhoneWeb method - secured to require password validation
UserSchema.statics.loginPhoneWeb = async function( phone, role, password ) {
  if(!phone){
    throw Error('Phone field must be filled')
  }
  if(!password){
    throw Error('Password field must be filled')
  }

  const cleanPhone = normalizePhone(phone)
  const phoneWith0 = getPhoneWithZero(cleanPhone)
  let user = await this.findOne({ phone: cleanPhone, role: role })
  if (!user && phoneWith0 && phoneWith0 !== cleanPhone) {
    user = await this.findOne({ phone: phoneWith0, role: role })
  }

  if(!user){
    throw Error('User not found')
  }

  const match = await bcrypt.compare(password, user.password)
  if(!match){
    throw Error('Invalid credentials')
  }

  return user
}

// static signup web method
UserSchema.statics.signupWeb = async function( phone, role, email, firstName, lastName, activated, password ) {
  if(!phone){
    throw Error('Phone field must be filled')
  }
  if(!password){
    throw Error('Password field must be filled')
  }

  const cleanPhone = normalizePhone(phone)
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const user = await this.create({
    phone: cleanPhone,
    role: role || 'client',
    email,
    firstName,
    lastName,
    activated: activated !== undefined ? activated : true,
    password: hashedPassword
  })

  return user
}

module.exports = mongoose.model('User', UserSchema)
