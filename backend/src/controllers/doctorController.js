// ==============================
// 📦 Import Required Packages
// ==============================

const doctorModel        = require("../models/doctorModel")
const bcrypt             = require("bcrypt")
const jwt                = require("jsonwebtoken")
const appointmentModel   = require("../models/appointmentModel")
const reviewModel        = require("../models/reviewModel")
const generateSlots      = require("../utils/generateSlots")
const { v2: cloudinary } = require("cloudinary")
const axios              = require("axios")
const { sendReviewRequestEmail } = require("../utils/emailService")


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
// 🔄 Change Doctor Availability
// ==============================

const changeAvailability = async (req, res) => {
    try {

        const docId   = req.docId
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: "Availability Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📋 Get Doctor List
// ==============================

const doctorList = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🔑 Doctor Login
// ==============================

const loginDoctor = async (req, res) => {
    try {

        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) return res.json({ success: false, message: 'Invalid Credentials' })

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: 'Invalid Credentials' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🔑 Doctor Google Login
// ==============================

const googleLoginDoctor = async (req, res) => {
    try {
        const { accessToken } = req.body

        const { data: profile } = await axios.get(
            "https://www.googleapis.com/oauth2/v1/userinfo",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        const doctor = await doctorModel.findOne({ email: profile.email })
        if (!doctor) return res.json({ success: false, message: "No doctor account found for this Google email ❌" })

        const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📅 Get Doctor Appointments
// ==============================

const appointmentsDoctor = async (req, res) => {
    try {

        const docId        = req.docId
        const appointments = await appointmentModel.find({ docId })
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ✅ Mark Appointment Completed
// ✅ Sends review request email to patient
// ==============================

const appointmentComplete = async (req, res) => {
    try {

        const docId             = req.docId
        const { appointmentId } = req.body
        const appointmentData   = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })

            // ── Send review request email (fire-and-forget) ───────────────────
            try {
                const userModel = require("../models/userModel")
                const user      = await userModel.findById(appointmentData.userId).select("email name")
                if (user?.email) {
                    await sendReviewRequestEmail({
                        toEmail:     user.email,
                        patientName: appointmentData.userData?.name || user.name,
                        doctorName:  appointmentData.docData?.name  || "your doctor",
                        appointmentId,
                    })
                }
            } catch (emailErr) {
                console.error("❌ Review email error:", emailErr.message)
            }

            return res.json({ success: true, message: 'Appointment Completed' })
        } else {
            return res.json({ success: false, message: 'Mark Failed' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ❌ Cancel Appointment (Doctor)
// ✅ Stripe refund for online payments + cancellation email
// ==============================

const appointmentCancel = async (req, res) => {
    try {

        const docId             = req.docId
        const { appointmentId } = req.body
        const appointmentData   = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.docId !== docId)
            return res.json({ success: false, message: 'Cancelled Failed' })

        // ── Stripe refund if paid online ──────────────────────────────────────
        let refunded = false
        if (appointmentData.payment && appointmentData.stripePaymentIntentId && !appointmentData.refunded) {
            try {
                const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
                await stripe.refunds.create({
                    payment_intent: appointmentData.stripePaymentIntentId,
                })
                refunded = true
                console.log(`✅ Stripe refund issued (doctor cancel) for appointment ${appointmentId}`)
            } catch (refundErr) {
                console.error("❌ Stripe refund error:", refundErr.message)
            }
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            cancelled:   true,
            cancelledBy: "doctor",
            refunded,
        })

        // ── Send cancellation email (fire-and-forget) ─────────────────────────
        try {
            const userModel = require("../models/userModel")
            const user      = await userModel.findById(appointmentData.userId).select("email name")
            if (user?.email) {
                const { sendCancellationEmail } = require("../utils/emailService")
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

        return res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📊 Doctor Dashboard Data
// ==============================

const doctorDashboard = async (req, res) => {
    try {

        const docId        = req.docId
        const appointments = await appointmentModel.find({ docId })

        let earnings = 0
        let patients = new Set()

        appointments.forEach((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
            patients.add(item.userId)
        })

        const dashData = {
            earnings,
            appointments:       appointments.length,
            patients:           patients.size,
            latestAppointments: appointments.slice(-5).reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 👤 Get Doctor Profile
// ==============================

const doctorProfile = async (req, res) => {
    try {

        const docId       = req.docId
        const profileData = await doctorModel.findById(docId).select('-password')
        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ✏️ Update Doctor Profile
// ==============================

const updateDoctorProfile = async (req, res) => {
    try {

        const docId     = req.docId
        const imageFile = req.file

        const fees      = req.body.fees
        const available = req.body.available
        const address   = typeof req.body.address === "string"
            ? JSON.parse(req.body.address)
            : req.body.address

        const updateData = { fees, address, available }

        if (imageFile) {
            const imageUpload = await uploadToCloudinary(imageFile.buffer, "medinex/doctors")
            updateData.image  = imageUpload.secure_url
        }

        await doctorModel.findByIdAndUpdate(docId, updateData)
        res.json({ success: true, message: 'Profile Updated ✅' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📅 Get Doctor Slots
// ==============================

const getDoctorSlots = async (req, res) => {
    try {

        const { docId }  = req.params
        const doctorData = await doctorModel.findById(docId)

        const slots = {}
        const now   = new Date()
        const today = new Date()

        for (let i = 0; i < 7; i++) {

            const date = new Date(today)
            date.setDate(today.getDate() + i)

            const dateString  = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`
            const bookedSlots = doctorData.slots_booked[dateString] || []
            const isToday     = (i === 0)

            slots[dateString] = generateSlots(date, bookedSlots, now, isToday)
        }

        res.json({ success: true, slots })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🗑️ Clear Appointment History
// ==============================

const clearAppointments = async (req, res) => {
    try {

        const docId     = req.docId
        const { range } = req.body

        if (range === "all") {
            await appointmentModel.deleteMany({ docId })

        } else if (range === "7days") {
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - 7)
            await appointmentModel.deleteMany({
                docId,
                cancelled: true,
                date: { $lt: cutoff.getTime() }
            })

        } else if (range === "30days") {
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - 30)
            await appointmentModel.deleteMany({
                docId,
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
// 💊 Add Prescription
// ==============================

const addPrescription = async (req, res) => {
    try {

        const docId = req.docId
        const { appointmentId, medicines, instructions, followUpDate } = req.body

        if (!medicines || medicines.length === 0)
            return res.json({ success: false, message: "Add at least one medicine" })

        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment)
            return res.json({ success: false, message: "Appointment not found" })

        if (appointment.docId.toString() !== docId)
            return res.json({ success: false, message: "Unauthorized" })

        if (!appointment.isCompleted)
            return res.json({ success: false, message: "Complete the appointment first" })

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            prescription: {
                medicines,
                instructions: instructions || "",
                followUpDate: followUpDate || "",
                createdAt:    new Date(),
                createdBy:    appointment.docData.name,
            }
        })

        res.json({ success: true, message: "Prescription Added ✅" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 💊 Get Prescription (Doctor)
// ==============================

const getPrescription = async (req, res) => {
    try {

        const docId             = req.docId
        const { appointmentId } = req.params

        const appointment = await appointmentModel
            .findById(appointmentId)
            .select("prescription docData userData isCompleted docId")

        if (!appointment)
            return res.json({ success: false, message: "Appointment not found" })

        if (appointment.docId.toString() !== docId)
            return res.json({ success: false, message: "Unauthorized" })

        res.json({ success: true, prescription: appointment.prescription })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ⭐ Get Doctor's Own Reviews
// ==============================

const getDoctorReviews = async (req, res) => {
    try {
        const docId   = req.docId
        const reviews = await reviewModel.find({ docId }).sort({ date: -1 })
        const doctor  = await doctorModel.findById(docId).select("averageRating totalReviews")

        res.json({
            success: true,
            reviews,
            averageRating: doctor?.averageRating || 0,
            totalReviews:  doctor?.totalReviews  || 0,
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📤 Export Controllers
// ==============================

module.exports = {
    changeAvailability,
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
}