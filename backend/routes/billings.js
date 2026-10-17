const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getBillings,
    getBilling,
    createBilling,
    deleteBilling,
    updateBilling,
    getBillingsByTransporterId } = require('../controllers/billingsController')


// GET all billings
router.get('/', getBillings)

// require auth for all routes
router.use(requireAuth)

// GET a single billing
router.get('/:id', getBilling)
  
// POST a new billing
router.post('/', createBilling)

// DELETE a billing
router.delete('/:id', deleteBilling)

// UPDATE a billing
router.patch('/:id', updateBilling)

// GET billings by transporterId
router.get('/getBillingsByTransporterId/:id', getBillingsByTransporterId)

module.exports = router