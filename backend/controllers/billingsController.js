const Billing = require('../models/Billing')
const mongoose = require('mongoose')

// GET all billings (admin only)
const getBillings = async (req, res) => {
    if (req.user && req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access denied: Administrator privileges required' })
    }
    const billings = await Billing.find().sort({ createdAt: -1 }).populate("tripsIds").populate("transporterId")
    res.status(200).json(billings)
}

// GET a single billing (owner transporter or admin)
const getBilling = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such billing'})
    }
    const billing = await Billing.findById(id).populate("tripsIds").populate("transporterId")
    if(!billing){
        return res.status(404).json({error: 'no such billing'})
    }

    const transporterIdStr = billing.transporterId?._id?.toString() || billing.transporterId?.toString()
    if (req.user && req.user.role !== 'administrator' && transporterIdStr !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied: You can only view your own billing records' })
    }

    res.status(200).json(billing)
}

// POST a new billing (transporter or admin)
const createBilling = async (req, res) => {
    try {
        const billingData = { ...req.body }
        
        // If caller is a transporter, lock transporterId to their own identity
        if (req.user && req.user.role === 'transporter') {
            billingData.transporterId = req.user._id
            billingData.status = 'pending'
        }

        const billing = await Billing.create(billingData)
        res.status(200).json(billing)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a billing (admin only)
const deleteBilling = async (req, res) => {
    if (req.user && req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access denied: Administrator privileges required' })
    }
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

// UPDATE a billing (owner transporter can upload receipt; admin can update all)
const updateBilling = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such billing'})
    }

    const existing = await Billing.findById(id)
    if (!existing) {
        return res.status(404).json({ error: 'no such billing' })
    }

    const transporterIdStr = existing.transporterId?._id?.toString() || existing.transporterId?.toString()
    if (req.user && req.user.role !== 'administrator' && transporterIdStr !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied: You can only update your own billing records' })
    }

    // Field whitelisting based on role
    let updates = {}
    if (req.user && req.user.role === 'administrator') {
        updates = { ...req.body }
    } else {
        // Transporter can only upload receipt image or payment method
        if (req.body.photo !== undefined) updates.photo = req.body.photo
        if (req.body.billingMethod !== undefined) updates.billingMethod = req.body.billingMethod
        if (req.body.description !== undefined) updates.description = req.body.description
    }

    const billing = await Billing.findOneAndUpdate({_id: id}, updates, { new: true })
    res.status(200).json(billing)
}

// GET a billing by TransporterId (owner transporter or admin)
const getBillingsByTransporterId = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such transporter'})
    }

    if (req.user && req.user.role !== 'administrator' && req.user._id.toString() !== id) {
        return res.status(403).json({ error: 'Access denied: You can only view your own billing statements' })
    }

    const trips = await Billing.find({ transporterId: id }).sort({ createdAt: -1 })
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