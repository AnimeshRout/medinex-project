const express  = require("express")
const userRouter = express.Router()

const {
    registerUser,
    loginUser,
    googleAuth,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentStripe,
    verifyStripe,
    getPrescription,
    submitReview,
    getDoctorReviews,
    getAppointmentReview,
    deleteAccount,
} = require("../controllers/userController")

const authUser = require("../middlewares/authUser")
const upload   = require("../middlewares/multer")

if (typeof authUser !== "function") {
    throw new Error(
        "❌ authUser middleware is not a function. " +
        "Check the import path in userRouter.js — filename must match exactly."
    )
}

// ── Auth ──────────────────────────────────────────────────────────────────────
userRouter.post("/register",    registerUser)
userRouter.post("/login",       loginUser)
userRouter.post("/google-auth", googleAuth)

// ── Profile ───────────────────────────────────────────────────────────────────
userRouter.get ("/get-profile",    authUser, getProfile)
userRouter.post("/update-profile", authUser, upload.single("image"), updateProfile)

// ── Appointments ──────────────────────────────────────────────────────────────
userRouter.post("/book-appointment",   authUser, bookAppointment)
userRouter.get ("/appointments",       authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)

// ── Payments ──────────────────────────────────────────────────────────────────
userRouter.post("/payment-stripe", authUser, paymentStripe)
userRouter.post("/verifyStripe",   authUser, verifyStripe)

// ── Prescription ──────────────────────────────────────────────────────────────
userRouter.get("/prescription/:appointmentId", authUser, getPrescription)

// ── Reviews ─────────────────────────────────────────────────────────────
userRouter.post("/submit-review",                        authUser, submitReview)
userRouter.get ("/doctor-reviews/:docId",                getDoctorReviews)          
userRouter.get ("/appointment-review/:appointmentId",    authUser, getAppointmentReview)

// ── Account ───────────────────────────────────────────────────────────────────
userRouter.delete("/delete-account", authUser, deleteAccount)

module.exports = userRouter