const express = require("express");

const {
  doctorList,
  loginDoctor,
  googleLoginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  getDoctorSlots,
  clearAppointments,
  addPrescription,
  getPrescription,
  getDoctorReviews,   
} = require("../controllers/doctorController");

const authDoctor = require("../middlewares/authDoctor");
const upload     = require("../middlewares/multer");

const doctorRouter = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
doctorRouter.get("/list",           doctorList);
doctorRouter.post("/login",         loginDoctor);
doctorRouter.post("/google-login",  googleLoginDoctor);
doctorRouter.get("/slots/:docId",   getDoctorSlots);

// ── Authenticated ─────────────────────────────────────────────────────────────
doctorRouter.get ("/appointments",        authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment",authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment",  authDoctor, appointmentCancel);
doctorRouter.get ("/dashboard",           authDoctor, doctorDashboard);
doctorRouter.get ("/profile",             authDoctor, doctorProfile);
doctorRouter.post("/update-profile",      authDoctor, upload.single("image"), updateDoctorProfile);
doctorRouter.delete("/clear-appointments",authDoctor, clearAppointments);
doctorRouter.post("/add-prescription",    authDoctor, addPrescription);
doctorRouter.get ("/prescription/:appointmentId", authDoctor, getPrescription);

// ── Reviews ─────────────────────────────────────────────────────────────
doctorRouter.get("/reviews", authDoctor, getDoctorReviews);

module.exports = doctorRouter;