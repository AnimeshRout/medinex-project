// ==============================
// 📦 Import Dependencies
// ==============================

const mongoose = require("mongoose");

// ==============================
// 👑 Admin Schema
// ==============================

const adminSchema = new mongoose.Schema({

    name: {
        type: String,
        default: "Admin"
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        default: null  
    },

    image: {
        type: String,
        default: ""
    }

}, { timestamps: true });

// ==============================
// 📤 Export Model
// ==============================

const adminModel = mongoose.model("Admin", adminSchema);

module.exports = adminModel;