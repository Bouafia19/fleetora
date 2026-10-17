const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getVehicles,
    getVehicle,
    createVehicle,
    deleteVehicle,
    updateVehicle } = require('../controllers/vehiclesController')

// require auth for all routes
router.use(requireAuth)

// GET all vehicles
router.get('/', getVehicles)

// GET a single vehicle
router.get('/:id', getVehicle)
  
// POST a new vehicle
router.post('/', createVehicle)

// DELETE a vehicle
router.delete('/:id', deleteVehicle)

// UPDATE a vehicle
router.patch('/:id', updateVehicle)


module.exports = router