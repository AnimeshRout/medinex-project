const express = require("express");
const cors = require("cors");

// Routes
const adminRouter  = require("./routes/adminRoute");
const doctorRouter = require("./routes/doctorRoute");
const userRouter   = require("./routes/userRoute");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",  // frontend
      "http://localhost:5174",  // admin
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "API Is Running 🚀" });
});

// API endpoints
app.use('/api/admin',  adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user',   userRouter)

// ✅ Multer error handler — must be AFTER routes
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.json({
      success: false,
      message: "File too large ! Maximum size is 50MB. ❌"
    })
  }
  if (err.message === "Only image files are allowed 📸") {
    return res.json({
      success: false,
      message: "Only image files are allowed 📸"
    })
  }
  next(err)
})

module.exports = app;