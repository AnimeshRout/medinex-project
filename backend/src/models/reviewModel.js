// ==============================
// 📦 Import Mongoose
// ==============================

const mongoose = require("mongoose");

// ==============================
// ⭐ Review Schema
// ==============================

const reviewSchema = new mongoose.Schema({
    appointmentId: { type: String, required: true, unique: true }, // one review per appointment
    docId:         { type: String, required: true },
    userId:        { type: String, required: true },
    userName:      { type: String, required: true },
    userImage:     { type: String, default: "" },
    rating:        { type: Number, required: true, min: 1, max: 5 },
    comment:       { type: String, default: "" },
    date:          { type: Date, default: Date.now },
});

// ==============================
// 📦 Create & Export Review Model
// ==============================

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);
module.exports = reviewModel;