const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getVehicles,
    getVehicle,
    createVehicle,
    deleteVehicle,
    updateVehicle } = require('../controllers/vehiclesController')

// require auth for all routes
router.use(requireAuth)

// GET all vehicles (all authenticated roles)
router.get('/', getVehicles)

// GET a single vehicle (all authenticated roles)
router.get('/:id', getVehicle)
  
// POST a new vehicle (admin only)
router.post('/', requireRole('administrator'), createVehicle)

// DELETE a vehicle (admin only)
router.delete('/:id', requireRole('administrator'), deleteVehicle)

// UPDATE a vehicle (admin only)
router.patch('/:id', requireRole('administrator'), updateVehicle)

module.exports = router