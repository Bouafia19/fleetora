const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getBillings,
    getBilling,
    createBilling,
    deleteBilling,
    updateBilling,
    getBillingsByTransporterId } = require('../controllers/billingsController')

// Require auth for ALL billing routes
router.use(requireAuth)

// GET all billings (admin only)
router.get('/', requireRole('administrator'), getBillings)

// GET a single billing (owner transporter or admin)
router.get('/:id', getBilling)
  
// POST a new billing (transporter or admin)
router.post('/', createBilling)

// DELETE a billing (admin only)
router.delete('/:id', requireRole('administrator'), deleteBilling)

// UPDATE a billing (owner or admin)
router.patch('/:id', updateBilling)

// GET billings by transporterId (owner transporter or admin)
router.get('/getBillingsByTransporterId/:id', getBillingsByTransporterId)

module.exports = router