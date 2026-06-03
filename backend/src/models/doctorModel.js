// ==============================
// 📦 Import Mongoose
// ==============================

const mongoose = require("mongoose");

// ==============================
// 🩺 Doctor Schema
// ==============================

const doctorSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true },
    password:    { type: String, default: null },
    image:       { type: String, required: true },
    speciality:  { type: String, required: true },
    degree:      { type: String, required: true },
    experience:  { type: String, required: true },
    about:       { type: String, default: "" },
    available:   { type: Boolean, default: true },
    fees:        { type: Number, required: true },
    gender:      { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    address:     { type: Object, required: true },
    date:        { type: Date, default: Date.now },
    slots_booked:{ type: Object, default: {} },

    // Rating fields — auto-updated when reviews are submitted
    averageRating: { type: Number, default: 0 },
    totalReviews:  { type: Number, default: 0 },
}, { minimize: false })

// ==============================
// 📦 Create Doctor Model
// ==============================

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema)

// ==============================
// 📤 Export Doctor Model
// ==============================

module.exports = doctorModel