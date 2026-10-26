const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getCompany,
    createCompany,
    updateCompany,
    getAppImage } = require('../controllers/companyController')

// GET public app logo
router.get('/getAppImage', getAppImage)

// require auth for all other routes
router.use(requireAuth)

// GET company profile (any authenticated user)
router.get('/', getCompany)
  
// POST a new company (admin only)
router.post('/', requireRole('administrator'), createCompany)

// UPDATE a company (admin only)
router.patch('/:id', requireRole('administrator'), updateCompany)

module.exports = router