// ==============================
// 📦 Import Required Packages
// ==============================

const express = require("express");

// ==============================
// 📂 Import Controllers
// ==============================

const {
    addDoctor,
    allDoctors,
    loginAdmin,
    googleLoginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    adminDashboard,
    changeAvailability,
    getAllPatients,
    toggleBlockPatient,
    getPatientAppointments,
    clearAppointments,      
    clearPatients,          
    deleteDoctor,
    deletePatient,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword
} = require("../controllers/adminController");

// ==============================
// 🔐 Import Middlewares
// ==============================

const upload    = require("../middlewares/multer");
const authAdmin = require("../middlewares/authAdmin");

// ==============================
// 🌐 Create Router
// ==============================

const adminRouter = express.Router();

// ==============================
// 👨‍⚕️ Doctor Routes
// ==============================

adminRouter.post("/add-doctor",          authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login",               loginAdmin);
adminRouter.post("/google-login",        googleLoginAdmin);
adminRouter.post("/all-doctors",         authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.post("/delete-doctor",       authAdmin, deleteDoctor);

// ==============================
// 📅 Appointment Routes
// ==============================

adminRouter.get("/appointments",          authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment",   authAdmin, appointmentCancel);
adminRouter.delete("/clear-appointments", authAdmin, clearAppointments);

// ==============================
// 📊 Dashboard & Profile Routes
// ==============================

adminRouter.get("/dashboard",        authAdmin, adminDashboard);
adminRouter.get("/profile",          authAdmin, getAdminProfile);
adminRouter.post("/update-profile",  authAdmin, upload.single("image"), updateAdminProfile);
adminRouter.post("/change-password", authAdmin, changeAdminPassword);

// ==============================
// 👥 Patient Routes
// ==============================

adminRouter.get("/patients",                     authAdmin, getAllPatients);
adminRouter.post("/toggle-block-patient",        authAdmin, toggleBlockPatient);
adminRouter.get("/patient-appointments/:userId", authAdmin, getPatientAppointments);
adminRouter.delete("/clear-patients",            authAdmin, clearPatients);  
adminRouter.post("/delete-patient",              authAdmin, deletePatient);

// ==============================
// 📤 Export Router
// ==============================

module.exports = adminRouter;