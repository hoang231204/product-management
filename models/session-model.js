const mongoose = require('mongoose')
const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true }
})
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
const Session = mongoose.model('Session', sessionSchema,'sessions')
module.exports = Session