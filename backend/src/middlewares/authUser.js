// ==============================
// 📦 Import JWT Library
// ==============================

const jwt = require("jsonwebtoken"); // 🔐 Library for JSON Web Token authentication


// ==============================
// 👤 User Authentication Middleware
// ==============================

const authUser = async (req, res, next) => {
    try {

        // 📥 Get Authorization header
        const authHeader = req.headers.authorization;

        // ❌ If header is missing or invalid
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.json({ success: false, message: "🚫 Not Authorized. Login Again." });
        }

        // 🔑 Extract token from "Bearer TOKEN"
        const token = authHeader.split(" ")[1];

        // 🔓 Verify JWT token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // 🆔 Attach user ID to request body
        req.userId = token_decode.id;

        // ✅ Continue to next middleware or controller
        next();

    } catch (error) {
        console.log(error); // 🐞 Log error
        res.json({ success: false, message: error.message });
    }
};


// ==============================
// 📤 Export Middleware
// ==============================

module.exports = authUser; // 🚀 Export for use in routes