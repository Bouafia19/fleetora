const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

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

// GET all trips
router.get('/', getTrips)

// GET a single trip
router.get('/:id', getOneTrip)

// PATCH a single trip query
router.patch('/:id', getTrip)
  
// POST a new trip
router.post('/', createTrip)

// DELETE a trip
router.delete('/:id', deleteTrip)

// POST a new trip
router.post('/confirmeTrip', confirmeTrip)

// GET a single trip
router.get('/getOneTrip/:id', getOneTrip)

// UPDATE a trip
router.patch('/updateTrip/:id', updateTrip)

// GET a trips by vehicleId
router.get('/getTripsByVehicleId/:vehicleId', getTripsByVehicleId)

// Update Annulation Of Trip
router.patch('/updateAnnulationOfTrip/:id', updateAnnulationOfTrip)

// GET a trips by vehicleId
router.get('/getTripsByTransporterId/:id', getTripsByTransporterId)


module.exports = router