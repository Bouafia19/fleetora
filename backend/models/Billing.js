const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BillingSchema = new mongoose.Schema({
    transporterId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    photo: {
        type: String,
    },
    billingMethod: {
        type: String,
    },
    amount: {
        type: Number
    },
    date: {
        type: Date
    },
    description: {
        type: String,
    },
    tripsIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Trip',
    }],
    status: {
        type: String,
        enum: ['pending', 'confirmed']
    },
    brutAmount: {
        type: Number
    }
},
{
    timestamps: true
})

// Database indexes for high-frequency billing queries
BillingSchema.index({ transporterId: 1, createdAt: -1 })
BillingSchema.index({ status: 1 })
BillingSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Billing', BillingSchema)
