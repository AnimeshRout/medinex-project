// ==============================
// 📦 Import Mongoose
// ==============================

const mongoose = require('mongoose')

// ==============================
// 📄 Appointment Schema
// ==============================

const appointmentSchema = new mongoose.Schema({
    userId:      { type: String,  required: true },
    docId:       { type: String,  required: true },
    slotDate:    { type: String,  required: true },
    slotTime:    { type: Object,  required: true },
    userData:    { type: Object,  required: true },
    docData:     { type: Object,  required: true },
    amount:      { type: Number,  required: true },
    date:        { type: Date,    default: Date.now },
    cancelled:   { type: Boolean, default: false },
    cancelledBy: { type: String,  default: null  },
    payment:     { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },

    // Stores Stripe Payment Intent ID for refunds
    stripePaymentIntentId: { type: String, default: null },

    // Tracks if a Stripe refund was issued
    refunded: { type: Boolean, default: false },

    prescription: {
        medicines: [
            {
                name:      { type: String, default: "" },
                dosage:    { type: String, default: "" },
                frequency: { type: String, default: "" },
                duration:  { type: String, default: "" },
            }
        ],
        instructions: { type: String, default: "" },
        followUpDate: { type: String, default: "" },
        createdAt:    { type: Date,   default: null },
        createdBy:    { type: String, default: "" },
    },
})

// ==============================
// 📦 Create Appointment Model
// ==============================

const appointmentModel = mongoose.model('appointment', appointmentSchema)

// ==============================
// 📤 Export Model
// ==============================

module.exports = appointmentModel