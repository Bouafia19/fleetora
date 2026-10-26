const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getTrips,
    getTrip,
    createTrip,
    deleteTrip,
    confirmeTrip,
    getOneTrip,
    updateTrip,
    getTripsByVehicleId,
    updateAnnulationOfTrip,
    getTripsByTransporterId } = require('../controllers/tripsController')

// require auth for all routes
router.use(requireAuth)

// Specific parameter-free and subpath GET routes first to avoid route collisions
router.get('/', getTrips)
router.get('/getOneTrip/:id', getOneTrip)
router.get('/user/:id', getTrip)
router.get('/getTripsByVehicleId/:vehicleId', getTripsByVehicleId)
router.get('/getTripsByTransporterId/:id', getTripsByTransporterId)

// Single trip GET
router.get('/:id', getOneTrip)

// POST routes
router.post('/', createTrip)
router.post('/confirmeTrip', confirmeTrip)

// UPDATE routes (support legacy PATCH /:id for user trip history)
router.patch('/updateTrip/:id', updateTrip)
router.patch('/updateAnnulationOfTrip/:id', updateAnnulationOfTrip)
router.patch('/:id', getTrip)

// DELETE a trip (Admin only)
router.delete('/:id', requireRole('administrator'), deleteTrip)

module.exports = router
