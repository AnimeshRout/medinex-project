// ==============================
// 📦 Import Dependencies
// ==============================

const jwt = require("jsonwebtoken"); // 🔐 Library for JWT authentication
const adminModel = require("../models/adminModel"); // 👑 Admin Model


// ==============================
// 🛡️ Admin Authentication Middleware
// ==============================

const authAdmin = async (req, res, next) => {
    try {

        // 📥 Get Authorization header
        const authHeader = req.headers.authorization;

        // ❌ If header not found
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.json({ success: false, message: "🚫 Not Authorized. Login Again." });
        }

        // 🔑 Extract token from "Bearer TOKEN"
        const token = authHeader.split(" ")[1];

        // 🔓 Verify token using JWT secret and save it 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🆔 USE decoded.id to find admin in DB
        const admin = await adminModel.findById(decoded.id);

        if (!admin) {
            return res.json({ success: false, message: "🚫 Admin not found." });
        }

        // 🆔 Attach admin ID to request
        req.adminId = admin._id;

        // ✅ Continue to next middleware
        next();

    } catch (error) {
        console.log(error); // 🐞 Log error
        res.json({ success: false, message: error.message });
    }
};


// ==============================
// 📤 Export Middleware
// ==============================

module.exports = authAdmin; // 🚀 Export for use in routes