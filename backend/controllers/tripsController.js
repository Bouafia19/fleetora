const Trip = require('../models/Trip')
const User = require('../models/User')
const mongoose = require('mongoose')

// GET all trips (Admin sees all; Client sees own; Transporter sees own)
const getTrips = async (req, res) => {
    try {
        let filter = {}
        if (req.user.role === 'client') {
            filter = { clientId: req.user._id }
        } else if (req.user.role === 'transporter') {
            filter = { transporterId: req.user._id }
        } else if (req.user.role !== 'administrator') {
            return res.status(403).json({ error: 'Unauthorized access' })
        }

        const trips = await Trip.find(filter).sort({ createdAt: -1 })
            .populate({
                path: 'clientId',
                model: 'User',
                select: '_id firstName lastName phone'
            })
            .populate({
                path: 'transporterId',
                model: 'User',
                select: '_id firstName lastName phone'
            })
            .populate({
                path: 'vehicleId',
                model: 'Vehicle',
                select: '_id name'
            })
        res.status(200).json(trips)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET user trips history (used by PATCH /:id and GET /user/:id)
const getTrip = async (req, res) => {
    const { id } = req.params
    const typeAccount = req.body?.typeAccount || (req.user.role === 'transporter' ? 'transporter' : 'client')

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'no such trip or user' })
    }

    // Ownership check: must be the user requesting their own trips or an administrator
    if (req.user.role !== 'administrator' && req.user._id.toString() !== id.toString()) {
        return res.status(403).json({ error: 'Unauthorized access to user trips' })
    }

    try {
        let query = {}
        if (typeAccount === 'client') {
            query = { clientId: id }
        } else if (typeAccount === 'transporter') {
            query = { transporterId: id }
        } else {
            query = { $or: [{ clientId: id }, { transporterId: id }] }
        }

        const trips = await Trip.find(query).sort({ createdAt: -1 })
            .populate({
                path: 'clientId',
                model: 'User',
                select: '_id firstName lastName phone'
            })
            .populate({
                path: 'transporterId',
                model: 'User',
                select: '_id firstName lastName phone'
            })
            .populate({
                path: 'vehicleId',
                model: 'Vehicle',
                select: '_id name'
            })
        res.status(200).json(trips)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// POST a new trip search / find available transporters
const createTrip = async (req, res) => {
    try {
        const { vehicleId } = req.body
        const transporters = await User.find({ vehicleId: vehicleId, role: 'transporter', status: true }).select('fcmToken lastLatLng legal')
        res.status(200).json(transporters)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a trip (Administrator only)
const deleteTrip = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'no such trip' })
    }
    if (req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Administrator access required' })
    }

    try {
        const trip = await Trip.findOneAndDelete({ _id: id })
        if (!trip) {
            return res.status(404).json({ error: 'no such trip' })
        }
        res.status(200).json(trip)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// UPDATE a trip
const updateTrip = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'no such trip' })
    }

    try {
        const existingTrip = await Trip.findById(id)
        if (!existingTrip) {
            return res.status(404).json({ error: 'no such trip' })
        }

        const isOwnerOrAssigned = req.user.role === 'administrator' ||
            (existingTrip.clientId && existingTrip.clientId.toString() === req.user._id.toString()) ||
            (existingTrip.transporterId && existingTrip.transporterId.toString() === req.user._id.toString())

        if (!isOwnerOrAssigned) {
            return res.status(403).json({ error: 'Unauthorized to update this trip' })
        }

        let updates = { ...req.body }
        if (req.user.role !== 'administrator') {
            // Whitelist safe update fields for client/transporter
            const allowedFields = [
                'status', 'finished', 'cancellation', 'rating', 'comment',
                'transporterArrivalDate', 'start', 'end', 'showFinish',
                'paymentMethod', 'notes'
            ]
            updates = {}
            for (const key of allowedFields) {
                if (req.body[key] !== undefined) {
                    updates[key] = req.body[key]
                }
            }
        }

        const trip = await Trip.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        )
        .populate({
            path: 'clientId',
            model: 'User',
            select: '_id firstName lastName phone'
        })
        .populate({
            path: 'transporterId',
            model: 'User',
            select: '_id firstName lastName phone'
        })

        res.status(200).json(trip)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const confirmeTrip = async (req, res) => {
    try {
        const tripData = { ...req.body }
        // Client can only book for themselves
        if (req.user.role === 'client') {
            tripData.clientId = req.user._id
        }

        const trip = await Trip.create(tripData)
        const result = await Trip.findById(trip._id)
            .populate({
                path: 'clientId',
                model: 'User',
                select: '_id firstName lastName phone'
            })
            .populate({
                path: 'transporterId',
                model: 'User',
                select: '_id firstName lastName phone'
            })
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getOneTrip = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'no such trip' })
    }

    try {
        const result = await Trip.findById(id)
            .populate({
                path: 'clientId',
                model: 'User',
                select: '_id firstName lastName phone'
            })
            .populate({
                path: 'transporterId',
                model: 'User',
                select: '_id firstName lastName phone'
            })

        if (!result) {
            return res.status(404).json({ error: 'no such trip' })
        }

        const isAuthorized = req.user.role === 'administrator' ||
            (result.clientId && result.clientId._id.toString() === req.user._id.toString()) ||
            (result.transporterId && result.transporterId._id.toString() === req.user._id.toString())

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Unauthorized to view this trip' })
        }

        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getTripsByVehicleId = async (req, res) => {
    const { vehicleId } = req.params
    let date_now = new Date()

    try {
        const trips = await Trip.find({ vehicleId: vehicleId, start: { $gt: date_now }, finished: false })
            .populate({
                path: 'clientId',
                model: 'User',
                select: '_id firstName lastName phone'
            })
            .populate({
                path: 'transporterId',
                model: 'User',
                select: '_id firstName lastName phone'
            })
            .populate({
                path: 'vehicleId',
                model: 'Vehicle',
                select: '_id name'
            })
        res.status(200).json(trips)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateAnnulationOfTrip = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'no such trip' })
    }

    try {
        const existingTrip = await Trip.findById(id)
        if (!existingTrip) {
            return res.status(404).json({ error: 'no such trip' })
        }

        const isAuthorized = req.user.role === 'administrator' ||
            (existingTrip.clientId && existingTrip.clientId.toString() === req.user._id.toString()) ||
            (existingTrip.transporterId && existingTrip.transporterId.toString() === req.user._id.toString())

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Unauthorized to cancel this trip' })
        }

        const allowedFields = ['cancellation', 'status', 'finished']
        const updates = {}
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key]
            }
        }
        if (!updates.status) updates.status = 'canceled'

        const trip = await Trip.findOneAndUpdate({ _id: id }, updates, { new: true })
        res.status(200).json(trip)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getTripsByTransporterId = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'no such transporter' })
    }

    if (req.user.role !== 'administrator' && req.user._id.toString() !== id.toString()) {
        return res.status(403).json({ error: 'Unauthorized to view transporter trips' })
    }

    try {
        const trips = await Trip.find({ transporterId: id, finished: true, paid: false })
            .populate({
                path: 'clientId',
                model: 'User',
                select: '_id firstName lastName phone'
            })
            .populate({
                path: 'transporterId',
                model: 'User',
                select: '_id firstName lastName phone'
            })

        res.status(200).json(trips)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    getTrips,
    getTrip,
    createTrip,
    deleteTrip,
    confirmeTrip,
    getOneTrip,
    updateTrip,
    getTripsByVehicleId,
    updateAnnulationOfTrip,
    getTripsByTransporterId
}
