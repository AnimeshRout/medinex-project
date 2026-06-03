// ==============================
// 📦 Import Multer
// ==============================

const multer = require("multer");

// ==============================
// ⚙️ Storage Configuration
// ==============================

const storage = multer.memoryStorage();

// ==============================
// 🚀 Initialize Multer
// ==============================

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024  // ✅ 25MB max
  },
  fileFilter: (req, file, cb) => {
    // ✅ Only allow images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed 📸"), false)
    }
  }
});

// ==============================
// 📤 Export Upload Middleware
// ==============================

module.exports = upload;