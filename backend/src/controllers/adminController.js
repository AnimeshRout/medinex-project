// ==============================
// 📦 Import Required Packages
// ==============================

const validator      = require("validator");
const bcrypt         = require("bcrypt");
const { v2: cloudinary } = require("cloudinary");
const doctorModel    = require("../models/doctorModel");
const adminModel     = require("../models/adminModel");
const jwt            = require("jsonwebtoken");
const appointmentModel = require("../models/appointmentModel");
const userModel      = require("../models/userModel");
const axios          = require("axios");
const stripe         = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendCancellationEmail } = require("../utils/emailService");


// ==============================
// 🔼 Helper: Upload buffer to Cloudinary
// ==============================

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "image",
                folder,
                transformation: [
                    { quality: "auto" },
                    { fetch_format: "auto" }
                ]
            },
            (error, result) => {
                if (error) reject(error)
                else resolve(result)
            }
        )
        stream.end(buffer)
    })
}


// ==============================
// ➕ API for Adding Doctor
// ==============================

const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address, gender } = req.body
        const imageFile = req.file

        if (!name || !email || !password || !speciality || !degree || !experience || !fees || !address || !imageFile)
            return res.json({ success: false, message: "Missing Details ❌" })

        if (!validator.isEmail(email))
            return res.json({ success: false, message: "Please enter a valid email ‼️" })

        if (password.length < 8)
            return res.json({ success: false, message: "Please enter a strong password ‼️" })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const imageUpload = await uploadToCloudinary(imageFile.buffer, "medinex/doctors")

        const newDoctor = new doctorModel({
            name, email,
            image: imageUpload.secure_url,
            password: hashedPassword,
            gender,
            speciality, degree, experience, about, fees,
            address: JSON.parse(address),
            date: Date.now()
        })
        await newDoctor.save()
        res.json({ success: true, message: "Doctor Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🔑 API For Admin Login
// ==============================

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        const admin = await adminModel.findOne({ email })

        if (!admin) return res.json({ success: false, message: "Admin not found" })

        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) return res.json({ success: false, message: "Invalid Credentials" })

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🔑 API For Admin Google Login
// ==============================

const googleLoginAdmin = async (req, res) => {
    try {
        const { accessToken } = req.body

        const { data: profile } = await axios.get(
            "https://www.googleapis.com/oauth2/v1/userinfo",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        const admin = await adminModel.findOne({ email: profile.email })
        if (!admin) return res.json({ success: false, message: "No admin account found for this Google email ❌" })

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📋 API to get all doctors
// ==============================

const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ✅ API to change doctor availability
// ==============================

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body
        const docData = await doctorModel.findById(docId)

        if (!docData) return res.json({ success: false, message: "Doctor not found" })

        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: "Availability Changed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📅 API to get all appointments
// ==============================

const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ❌ API for appointment cancellation (Admin)
// ✅ Stripe refund + cancellation email
// ==============================

const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData   = await appointmentModel.findById(appointmentId)

        if (!appointmentData)
            return res.json({ success: false, message: "Appointment not found" })

        // ── Free the doctor slot ──────────────────────────────────────────────
        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)
        let slots_booked = doctorData.slots_booked || {}

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
        }
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // ── Stripe refund if paid online ──────────────────────────────────────
        let refunded = false
        if (appointmentData.payment && appointmentData.stripePaymentIntentId && !appointmentData.refunded) {
            try {
                await stripe.refunds.create({
                    payment_intent: appointmentData.stripePaymentIntentId,
                })
                refunded = true
                console.log(`✅ Stripe refund issued (admin cancel) for appointment ${appointmentId}`)
            } catch (refundErr) {
                console.error("❌ Stripe refund error:", refundErr.message)
            }
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            cancelled:   true,
            cancelledBy: "admin",
            refunded,
        })

        // ── Send cancellation email (fire-and-forget) ─────────────────────────
        try {
            const user = await userModel.findById(appointmentData.userId).select("email name")
            if (user?.email) {
                await sendCancellationEmail({
                    toEmail:     user.email,
                    patientName: appointmentData.userData?.name || user.name,
                    doctorName:  appointmentData.docData?.name  || "Doctor",
                    slotDate:    appointmentData.slotDate,
                    slotTime:    appointmentData.slotTime,
                    refunded,
                    amount:      appointmentData.amount,
                })
            }
        } catch (emailErr) {
            console.error("❌ Cancellation email error:", emailErr.message)
        }

        res.json({ success: true, message: "Appointment Cancelled" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📊 API for Admin Dashboard
// ==============================

const adminDashboard = async (req, res) => {
    try {
        const doctors      = await doctorModel.find({})
        const users        = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors:             doctors.length,
            appointments:        appointments.length,
            patients:            users.length,
            latestAppointments:  appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 👥 API to get all patients
// ==============================

const getAllPatients = async (req, res) => {
    try {
        const patients = await userModel.find({}).select('-password')
        res.json({ success: true, patients })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🚫 API to block / unblock patient
// ==============================

const toggleBlockPatient = async (req, res) => {
    try {
        const { userId } = req.body
        const user = await userModel.findById(userId)

        if (!user) return res.json({ success: false, message: "Patient not found" })

        await userModel.findByIdAndUpdate(userId, { isBlocked: !user.isBlocked })
        res.json({
            success: true,
            message: user.isBlocked ? "Patient Unblocked" : "Patient Blocked"
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📅 API to get a specific patient's appointments
// ==============================

const getPatientAppointments = async (req, res) => {
    try {
        const { userId } = req.params
        const appointments = await appointmentModel.find({ userId })
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🗑️ Clear appointments
// ==============================

const clearAppointments = async (req, res) => {
    try {
        const { range } = req.body

        if (range === "all") {
            await appointmentModel.deleteMany({})

        } else if (range === "7days") {
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - 7)
            await appointmentModel.deleteMany({
                cancelled: true,
                date: { $lt: cutoff.getTime() }
            })

        } else if (range === "30days") {
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - 30)
            await appointmentModel.deleteMany({
                cancelled: true,
                date: { $lt: cutoff.getTime() }
            })

        } else {
            return res.json({ success: false, message: "Invalid range ❗" })
        }

        res.json({ success: true, message: "History cleared ✅" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🗑️ API to Delete Doctor
// ==============================

const deleteDoctor = async (req, res) => {
    try {
        const { docId } = req.body

        const doctor = await doctorModel.findById(docId)
        if (!doctor) return res.json({ success: false, message: "Doctor not found" })

        if (doctor.image) {
            const urlWithoutExtension = doctor.image.split("/upload/")[1]
            const publicId = urlWithoutExtension.replace(/^v\d+\//, "").split(".")[0]
            await cloudinary.uploader.destroy(publicId)
        }

        await doctorModel.findByIdAndDelete(docId)
        res.json({ success: true, message: "Doctor Deleted" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🗑️ API to Delete Patient
// ==============================

const deletePatient = async (req, res) => {
    try {
        const { userId } = req.body

        const user = await userModel.findById(userId)
        if (!user) return res.json({ success: false, message: "Patient not found" })

        await userModel.findOneAndDelete({ _id: userId })
        res.json({ success: true, message: "Patient and all related data deleted ✅" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 👤 Get Admin Profile
// ==============================

const getAdminProfile = async (req, res) => {
    try {
        const admin = await adminModel.findById(req.adminId).select('-password')
        if (!admin) return res.json({ success: false, message: "Admin not found ⚠️" })
        res.json({ success: true, admin })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ✏️ Update Admin Profile
// ==============================

const updateAdminProfile = async (req, res) => {
    try {
        const { name, email } = req.body
        const imageFile = req.file

        if (!name) return res.json({ success: false, message: "Name is required ❗" })

        const updateData = { name }

        if (email) {
            if (!validator.isEmail(email))
                return res.json({ success: false, message: "Please enter a valid email ‼️" })

            const existing = await adminModel.findOne({ email })
            if (existing && existing._id.toString() !== req.adminId.toString())
                return res.json({ success: false, message: "Email already in use ❗" })

            updateData.email = email
        }

        if (imageFile) {
            const imageUpload = await uploadToCloudinary(imageFile.buffer, "medinex/admin")
            updateData.image  = imageUpload.secure_url
        }

        await adminModel.findByIdAndUpdate(req.adminId, updateData)
        res.json({ success: true, message: "Profile Updated ✅" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🔐 Change Admin Password
// ==============================

const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword)
            return res.json({ success: false, message: "Please fill all fields ‼️" })

        if (newPassword.length < 8)
            return res.json({ success: false, message: "Password must be at least 8 characters 🔑" })

        const admin = await adminModel.findById(req.adminId)
        if (!admin) return res.json({ success: false, message: "Admin not found ⚠️" })

        const isMatch = await bcrypt.compare(currentPassword, admin.password)
        if (!isMatch) return res.json({ success: false, message: "Current password is incorrect ❌" })

        const salt   = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(newPassword, salt)
        await adminModel.findByIdAndUpdate(req.adminId, { password: hashed })

        res.json({ success: true, message: "Password Updated Successfully ✅" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🗑️ API to Clear Patients History
// ==============================
 
const clearPatients = async (req, res) => {
    try {
        const { range } = req.body;
 
        if (range === "all") {
            // Delete all patients and their appointments
            const patients = await userModel.find({}).select("_id");
            const userIds  = patients.map(p => p._id);
 
            await userModel.deleteMany({});
            await appointmentModel.deleteMany({ userId: { $in: userIds } });
 
        } else if (range === "7days") {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 7);
 
            // Find patients registered more than 7 days ago
            const patients = await userModel.find({
                createdAt: { $lt: cutoff }
            }).select("_id");
            const userIds = patients.map(p => p._id);
 
            await userModel.deleteMany({ _id: { $in: userIds } });
            await appointmentModel.deleteMany({ userId: { $in: userIds } });
 
        } else if (range === "30days") {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 30);
 
            const patients = await userModel.find({
                createdAt: { $lt: cutoff }
            }).select("_id");
            const userIds = patients.map(p => p._id);
 
            await userModel.deleteMany({ _id: { $in: userIds } });
            await appointmentModel.deleteMany({ userId: { $in: userIds } });
 
        } else {
            return res.json({ success: false, message: "Invalid range ❗" });
        }
 
        res.json({ success: true, message: "Patient history cleared ✅" });
 
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ==============================
// 📤 Export Controllers
// ==============================

module.exports = {
    addDoctor,
    loginAdmin,
    googleLoginAdmin,
    allDoctors,
    changeAvailability,
    appointmentsAdmin,
    appointmentCancel,
    adminDashboard,
    getAllPatients,
    toggleBlockPatient,
    getPatientAppointments,
    clearAppointments,
    clearPatients,
    deleteDoctor,
    deletePatient,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword,
}