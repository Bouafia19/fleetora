const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TripSchema = new mongoose.Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  transporterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  price: {
    type: Number,
  },
  distance: {
    type: Number,
  },
  from: {
    type: String,
  },
  to: {
    type: String,
  },
  finished: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  start: {
    type: Date
  },
  marchandise: {
    weight: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    width: {
      type: Number,
      default: 0
    },
    depth: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      default: ''
    },
    photo: {
      type: String,
    }
  },
  cancellation: {
    reason: {
      type: String,
      default: ''
    },
    by: {
      type: String,
      enum: ['client', 'transporter', 'administrator', 'default'],
      default: 'default'
    }
  },
  status: {
    type: String,
    enum: ['accepted', 'canceled', 'finished', 'started', 'planned']
  },
  paid: {
    type: Boolean,
    default: false
  },
},
{
  timestamps: true
})

// Database indexes for high-frequency trip queries
TripSchema.index({ clientId: 1, createdAt: -1 })
TripSchema.index({ transporterId: 1, finished: 1, paid: 1 })
TripSchema.index({ vehicleId: 1, start: 1, finished: 1 })
TripSchema.index({ status: 1 })
TripSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Trip', TripSchema)
