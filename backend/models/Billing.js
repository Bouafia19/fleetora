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

module.exports = mongoose.model('Billing', BillingSchema)