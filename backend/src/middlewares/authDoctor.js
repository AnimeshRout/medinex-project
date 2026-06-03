// ==============================
// 📦 Import JWT Library
// ==============================

const jwt = require("jsonwebtoken"); // 🔐 JWT for authentication


// ==============================
// 🩺 Doctor Authentication Middleware
// ==============================

const authDoctor = async (req, res, next) => {
    try {

        // 📥 Get Authorization header
        const authHeader = req.headers.authorization;

        // ❌ If header not provided
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.json({ success: false, message: "🚫 Not Authorized. Login Again." });
        }

        // 🔑 Extract token from "Bearer TOKEN"
        const token = authHeader.split(" ")[1];

        // 🔓 Verify token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // 🆔 Attach doctor ID to request body
        req.docId = token_decode.id;

        // ✅ Move to next middleware / controller
        next();

    } catch (error) {
        console.log(error); // 🐞 Log error
        res.json({ success: false, message: error.message });
    }
};


// ==============================
// 📤 Export Middleware
// ==============================

module.exports = authDoctor; // 🚀 Export for use in routes