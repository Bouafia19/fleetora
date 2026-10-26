const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    loginUser, 
    signupUser,
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser,
    verifyCode,
    verifyPhone,
    verifyUser,
    update_existing_user,
    loginUserWeb,
    signupUserWeb,
    uploadPartnerImages,
    loadPartnerPhotos } = require('../controllers/usersController')

// Public routes
// login via web route (enforces password)
router.post('/loginWeb', loginUserWeb)

// signup via Web route (enforces client role)
router.post('/signupUserWeb', signupUserWeb)

// login route
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

// verify code route
router.post('/verifyCode', verifyCode)

// verify phone route
router.post('/verifyPhone', verifyPhone)

// verify user
router.post('/verifyUser', verifyUser)

// require auth for all subsequent routes
router.use(requireAuth)

// update existing user (protected & ownership-validated)
router.patch('/update_existing_user/:id', update_existing_user)

// GET all users (admin only)
router.get('/', requireRole('administrator'), getUsers)

// GET a single user (owner or admin)
router.get('/:id', getUser)
  
// POST a new user (admin only)
router.post('/', requireRole('administrator'), createUser)

// DELETE a user (admin only)
router.delete('/:id', requireRole('administrator'), deleteUser)

// UPDATE a user
router.patch('/:id', updateUser)

// upload partner images (owner or admin)
router.patch('/uploadPartnerImages/:id', uploadPartnerImages)

// GET load Partner Photos (owner or admin)
router.get('/loadPartnerPhotos/:id', loadPartnerPhotos)

module.exports = router