const Billing = require('../models/Billing')
const mongoose = require('mongoose')

// GET all billings
const getBillings = async (req, res) => {
    const billings = await Billing.find().sort({ order: 1}).populate("tripsIds").populate("transporterId")
    res.status(200).json(billings)
}

// GET a single billing
const getBilling = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such billing'})
    }
    const billing = await Billing.findById(id)
    if(!billing){
        return res.status(404).json({error: 'no such billing'})
    }

    res.status(200).json(billing)
}

// POST a new billing
const createBilling = async (req, res) => {
    const { 
        title,
        topic,
        body
    } = req.body
    try {
        // add doc to db
        const billing = await Billing.create(
            req.body
        )
        res.status(200).json(billing)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
// DELETE a billing
const deleteBilling = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such billing'})
    }
    const billing = await Billing.findOneAndDelete({_id: id})

    if(!billing){
        return res.status(404).json({error: 'no such billing'})
    }

    res.status(200).json(billing)
}

// UPDATE a billing
const updateBilling = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such billing'})
    }
    const billing = await Billing.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!billing){
        return res.status(404).json({error: 'no such billing'})
    }

    res.status(200).json(billing)
}

// GET a billing by TransporterId
const getBillingsByTransporterId = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such transporter'})
    }

    const trips = await Billing.find({ transporterId: id }).sort({ order: 1})
        .populate("tripsIds")
        .populate({
            path: 'tripsIds',
            populate: {
                path: 'clientId',
                model: 'User',
                select: '_id firstName lastName phone'
            }
        })
        .populate({
            path: 'transporterId',
            model: 'User',
            select: '_id firstName lastName phone'
        })
    res.status(200).json(trips)
}

module.exports = {
    getBillings,
    getBilling,
    createBilling,
    deleteBilling,
    updateBilling,
    getBillingsByTransporterId
}