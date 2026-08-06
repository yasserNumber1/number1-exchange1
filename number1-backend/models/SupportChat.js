const mongoose = require('mongoose')

const supportMessageSchema = new mongoose.Schema({
  sender:    { type: String, enum: ['customer', 'admin'], required: true },
  text:      { type: String, required: true },
  source:    { type: String, default: 'web' },
  createdAt: { type: Date, default: Date.now },
}, { _id: true })

const supportChatSchema = new mongoose.Schema({
  sessionId:          { type: String, required: true, unique: true, index: true },
  lang:               { type: String, default: 'en' },
  page:               { type: String, default: '' },
  ip:                 { type: String, default: '' },
  status:             { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  telegramMessageIds: [{ type: Number, index: true }],
  messages:           [supportMessageSchema],
  lastCustomerAt:     { type: Date, default: null },
  lastAdminAt:        { type: Date, default: null },
}, { timestamps: true })

module.exports = mongoose.model('SupportChat', supportChatSchema)
