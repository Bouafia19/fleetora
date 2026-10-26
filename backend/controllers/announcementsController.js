const Announcement = require('../models/Announcement')
const mongoose = require('mongoose')

// GET all announcements
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ topic: { $ne: "pushNotification" } }).sort({ order: 1 }).select('title body')
        res.status(200).json(announcements)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET a single announcement
const getAnnouncement = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'no such announcement' })
    }

    try {
        const announcement = await Announcement.findById(id)
        if (!announcement) {
            return res.status(404).json({ error: 'no such announcement' })
        }
        res.status(200).json(announcement)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// POST a new announcement
const createAnnouncement = async (req, res) => {
    const { 
        title,
        topic,
        body,
        data
    } = req.body

    try {
        const announcement = await Announcement.create({ 
            title,
            topic,
            body,
            data
        })
        res.status(200).json(announcement)
    
        if (announcement.data) {
            setTimeout(async () => {
                try {
                    await Announcement.findOneAndDelete({ _id: announcement._id })
                } catch (err) {
                    // Safely ignore timer deletion errors
                }
            }, 120000)
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a announcement
const deleteAnnouncement = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'no such announcement' })
    }

    try {
        const announcement = await Announcement.findOneAndDelete({ _id: id })
        if (!announcement) {
            return res.status(404).json({ error: 'no such announcement' })
        }
        res.status(200).json(announcement)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// UPDATE a announcement
const updateAnnouncement = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'no such announcement' })
    }

    try {
        const announcement = await Announcement.findOneAndUpdate({ _id: id }, {
            ...req.body
        }, { new: true })

        if (!announcement) {
            return res.status(404).json({ error: 'no such announcement' })
        }

        res.status(200).json(announcement)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET a single announcement by role
const getAnnouncementsByRole = async (req, res) => {
    const { role } = req.params
    try {
        const announcements = await Announcement.find({ topic: role }).select('title body')
        res.status(200).json(announcements)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET announcement By TransporterId
const getAnnouncementsByTransporterId = async (req, res) => {
    const { transporterId } = req.params
    
    try {
        const announcements = await Announcement.find({ 'data.transporterId': transporterId }).populate({
            path: 'data.clientId',
            model: 'User',
            select: '_id firstName lastName phone'
        })

        res.status(200).json(announcements)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    getAnnouncements,
    getAnnouncement,
    createAnnouncement,
    deleteAnnouncement,
    updateAnnouncement,
    getAnnouncementsByRole,
    getAnnouncementsByTransporterId
}
