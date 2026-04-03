// models/HDCounter.js
// ═══════════════════════════════════════════
// عداد atomic لضمان عدم تكرار index في HD Wallet
// كل طلب USDT يأخذ index فريد لا يتكرر أبداً
// ═══════════════════════════════════════════
const mongoose = require('mongoose')

const hdCounterSchema = new mongoose.Schema({
  _id:   { type: String, default: 'hd_index' },
  value: { type: Number, default: 0 }
})

// دالة atomic — تُرجع index جديد وتزيده في نفس الوقت
// findOneAndUpdate مع $inc ضامن عدم التكرار حتى مع طلبات متزامنة
hdCounterSchema.statics.nextIndex = async function () {
  const doc = await this.findOneAndUpdate(
    { _id: 'hd_index' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  )
  return doc.value
}

module.exports = mongoose.models.HDCounter ||
  mongoose.model('HDCounter', hdCounterSchema)
