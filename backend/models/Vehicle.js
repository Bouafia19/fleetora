const mongoose = require('mongoose')

const VehicleSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  photo: {
    type: String,
  },
  priceKm: {
    type: Number,
  },
  minimum: {
    type: Number,
  },
  order: {
    type: Number,
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Vehicle', VehicleSchema)