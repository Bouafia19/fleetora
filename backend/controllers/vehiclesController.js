const Vehicle = require('../models/Vehicle')
const mongoose = require('mongoose')

// GET all vehicles
const getVehicles = async (req, res) => {
    const vehicles = await Vehicle.find().sort({ order: 1})
    res.status(200).json(vehicles)
}

// GET a single vehicle
const getVehicle = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such vehicle'})
    }
    const vehicle = await Vehicle.findById(id)

    if(!vehicle){
        return res.status(404).json({error: 'no such vehicle'})
    }

    res.status(200).json(vehicle)
}

// POST a new vehicle
const createVehicle = async (req, res) => {
    const { 
        name,
        photo,
        priceKm,
        minimum,
        order
    } = req.body
    try {
        // add doc to db
        const vehicle = await Vehicle.create({ 
            name,
            photo,
            priceKm,
            minimum,
            order
        })
        res.status(200).json(vehicle)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a vehicle
const deleteVehicle = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such vehicle'})
    }
    const vehicle = await Vehicle.findOneAndDelete({_id: id})

    if(!vehicle){
        return res.status(404).json({error: 'no such vehicle'})
    }

    res.status(200).json(vehicle)
}

// UPDATE a vehicle
const updateVehicle = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such vehicle'})
    }
    const vehicle = await Vehicle.findOneAndUpdate({_id: id},{
        ...req.body
    }, { new: true })

    if(!vehicle){
        return res.status(404).json({error: 'no such vehicle'})
    }

    res.status(200).json(vehicle)
}

module.exports = {
    getVehicles,
    getVehicle,
    createVehicle,
    deleteVehicle,
    updateVehicle
}