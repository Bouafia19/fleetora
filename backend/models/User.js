const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
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
    type: Boolean
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
    type: Boolean
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
    type: Boolean
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
  // if(!validator.isStrongPassword(password)){
  //   throw Error('password not strong enough')
  // }
  
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

  let phoneWith0
  if(phone.length === 14){
    phoneWith0 = phone.slice(0, 4) + phone.slice(5)
  }else if (phone.length === 13){
    phoneWith0 = phone.slice(0, 4) + '0' + phone.slice(4)
  }
  console.log('phone', phone)
  console.log('phoneWith0', phoneWith0)
  let user = null
  let user0 = null
  if(role === 'client'){
    user = await this.findOne({ phone: phone, role: 'client', activated: true })
    user0 = await this.findOne({ phone: phoneWith0, role: 'client', activated: true })
    console.log('user', user)
    console.log('user0', user0)
  }else if(role === 'transporter'){
    user = await this.findOne({ phone: phone, role: 'transporter', activated: true })
    user0 = await this.findOne({ phone: phoneWith0, role: 'transporter', activated: true })
  }
  
  if(!user && !user0){
    throw Error('ip')
  }
  if(user){
    const match = await bcrypt.compare(password, user.password)
    console.log('match', match)
    if(!match){
      throw Error('ipass')
    }else{
      console.log('return user', user)
      return user
    }
    
  }else if(user0){
    const match0 = await bcrypt.compare(password, user0.password)
    console.log('match0', match0)
    if(!match0){
      throw Error('ipass')
    }else{
      console.log('return user0', user0)
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

// static loginPhoneWeb method
UserSchema.statics.loginPhoneWeb = async function( phone, role ) {
  if(!phone){
    throw Error('Phone field must be filled')
  }

  let phoneWith0
  if(phone.length === 14){
    phoneWith0 = phone.slice(0, 4) + phone.slice(5)
  }else if (phone.length === 13){
    phoneWith0 = phone.slice(0, 4) + '0' + phone.slice(4)
  }
  let user
  let user0
  user = await this.findOne({ phone, role: role })
  user0 = await this.findOne({ phoneWith0, role: role })

  if(user){
    return user
  }else if(user0){
    return user0
  }
}

// static signup web method
UserSchema.statics.signupWeb = async function( phone, role, email, firstName, lastName, activated ) {

  // validation
  if(!phone){
    throw Error('Phone field must be filled')
  }
 
  const user = await this.create({ phone, role, email, firstName, lastName, activated })

  return user
}

module.exports = mongoose.model('User', UserSchema)