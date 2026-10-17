const Trip = require('../models/Trip')
const User = require('../models/User')
const mongoose = require('mongoose')
const { response } = require('express')

// GET all trips
const getTrips = async (req, res) => {
    const trips = await Trip.find().sort({ createdAt: -1})
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
}

// GET a single trip
const getTrip = async (req, res) => {

    const {id} = req.params
    const { typeAccount } = req.body
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such trip'})
    }

    try {
        if(typeAccount === 'client'){
            const trip = await Trip.find({ clientId: id })
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
        }else if (typeAccount === 'transporter'){
            const trip = await Trip.find({ transporterId: id })
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
        }
    } catch (error) {
        res.status(400).json({error: error.message})
    }
    
    // if(!trip){
    //     return res.status(404).json({error: 'no such trip'})
    // }
}

// POST a new trip
const createTrip = async (req, res) => {
    const { 
        vehicleId,
    } = req.body
    // get users where role is transpoter and vehicleId match vehicleId
    const transporters = await User.find({ vehicleId: vehicleId, role: 'transporter', status: true }).select('fcmToken lastLatLng legal')
    
    res.status(200).json(transporters)
}
// DELETE a trip
const deleteTrip = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such trip'})
    }
    const trip = await Trip.findOneAndDelete({_id: id})

    if(!trip){
        return res.status(404).json({error: 'no such trip'})
    }

    res.status(200).json(trip)
}

// UPDATE a trip
const updateTrip = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such trip'})
    }
    
    const trip = await Trip.findOneAndUpdate({_id: id}, {
        ...req.body
    },
    {
        new: true
    })
    .populate({
        path: 'clientId',
        model: 'User',
        select: '_id firstName lastName phone'
    })

    if(!trip){
        return res.status(404).json({error: 'no such trip'})
    }

    res.status(200).json(trip)
}

const confirmeTrip = async (req, res) => {

    try {
        // add doc to db
        const trip = await Trip.create(req.body)
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
    const {id} = req.params
    try {
        // add doc to db
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
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getTripsByVehicleId = async (req, res) => {
    const {vehicleId} = req.params

    let date_now = new Date()
    
    try {
        // add doc to db
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
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such trip'})
    }
    const trip = await Trip.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!trip){
        return res.status(404).json({error: 'no such trip'})
    }

    res.status(200).json(trip)
}

const getTripsByTransporterId = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such transporter'})
    }

    const trips = await Trip.find({ transporterId: id, finished: true, paid: false})
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
}

// FCM

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