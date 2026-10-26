const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getAnnouncements,
    getAnnouncement,
    createAnnouncement,
    deleteAnnouncement,
    updateAnnouncement,
    getAnnouncementsByRole,
    getAnnouncementsByTransporterId } = require('../controllers/announcementsController')


// GET all announcements (public)
router.get('/', getAnnouncements)

// require auth for all subsequent routes
router.use(requireAuth)

// GET a single announcement
router.get('/:id', getAnnouncement)
  
// POST a new announcement (admin only)
router.post('/', requireRole('administrator'), createAnnouncement)

// DELETE an announcement (admin only)
router.delete('/:id', requireRole('administrator'), deleteAnnouncement)

// UPDATE an announcement (admin only)
router.patch('/:id', requireRole('administrator'), updateAnnouncement)

// GET announcements by user role
router.get('/getAnnouncementsByRole/:role', getAnnouncementsByRole)

// GET announcements by TransporterId (owner or admin)
router.get('/getAnnouncementsByTransporterId/:transporterId', getAnnouncementsByTransporterId)

module.exports = router