const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AnnouncementSchema = new mongoose.Schema({
    topic: {
        type: String,
    },
    title: {
        type: String,
    },
    body: {
        type: String,
    },
    data: {
        start: {
            type: String,
        },
        to: {
            type: String,
        },
        price: {
            type: Number,
        },
        distance: {
            type: Number,
        },
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        socketId: {
            type: String,
        },
        transporterId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Announcement', AnnouncementSchema)