const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getRoles,
    getRole,
    createRole,
    deleteRole,
    updateRole } = require('../controllers/rolesController')

// Require auth and administrator role for ALL role routes
router.use(requireAuth)
router.use(requireRole('administrator'))

// GET all roles (admin only)
router.get('/', getRoles)

// GET a single role
router.get('/:id', getRole)
  
// POST a new role
router.post('/', createRole)

// DELETE a role
router.delete('/:id', deleteRole)

// UPDATE a role
router.patch('/:id', updateRole)

module.exports = router