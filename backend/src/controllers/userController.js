// ==============================
// 📦 Import Required Packages
// ==============================

const validator          = require("validator")
const bcrypt             = require("bcrypt")
const userModel          = require("../models/userModel")
const jwt                = require("jsonwebtoken")
const { v2: cloudinary } = require("cloudinary")
const doctorModel        = require("../models/doctorModel")
const appointmentModel   = require("../models/appointmentModel")
const reviewModel        = require("../models/reviewModel")
const axios              = require("axios")
const stripe             = require("stripe")(process.env.STRIPE_SECRET_KEY)
const { sendCancellationEmail, sendReviewRequestEmail } = require("../utils/emailService")


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
// 👤 API to Register User
// ==============================

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password)
            return res.json({ success: false, message: "Please fill all the fields" })

        if (!validator.isEmail(email))
            return res.json({ success: false, message: "Enter a valid email" })

        if (password.length < 8)
            return res.json({ success: false, message: "Password must be at least 8 characters long" })

        const salt           = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({ name, email, password: hashedPassword })
        const user    = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🔑 API for User Login
// ==============================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user)
            return res.json({ success: false, message: "User not found" })

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🔑 API for Google Auth
// ==============================

const googleAuth = async (req, res) => {
    try {
        const { access_token } = req.body

        const { data } = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`
        )

        const { name, email, picture } = data

        let user = await userModel.findOne({ email })
        if (!user) {
            user = await userModel.create({ name, email, image: picture })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 👤 API to Get User Profile
// ==============================

const getProfile = async (req, res) => {
    try {
        const userId   = req.userId
        const userData = await userModel.findById(userId).select("-password")
        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ✏️ API to Update User Profile
// ==============================

const updateProfile = async (req, res) => {
    try {
        const userId    = req.userId
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender)
            return res.json({ success: false, message: "Please fill all the fields" })

        const updateData = {
            name,
            phone,
            address: JSON.parse(address),
            dob,
            gender
        }

        if (imageFile) {
            const imageUpload = await uploadToCloudinary(imageFile.buffer, "medinex/users")
            updateData.image  = imageUpload.secure_url
        }

        await userModel.findByIdAndUpdate(userId, updateData)
        res.json({ success: true, message: "Profile updated successfully" })

    } catch (error) {
        console.log("UPDATE PROFILE ERROR:", error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📅 API to Book Appointment
// ==============================

const bookAppointment = async (req, res) => {
    try {
        const userId = req.userId
        const { docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available)
            return res.json({ success: false, message: "Doctor Not Available" })

        const doctor = await doctorModel.findOneAndUpdate(
            {
                _id: docId,
                available: true,
                [`slots_booked.${slotDate}`]: { $ne: slotTime }
            },
            { $push: { [`slots_booked.${slotDate}`]: slotTime } },
            //{ new: true }
            { returnDocument: 'after' }
        )

        if (!doctor)
            return res.json({ success: false, message: "Slot Not Available" })

        const userData = await userModel.findById(userId).select("-password")
        const docInfo  = docData.toObject()
        delete docInfo.slots_booked

        const newAppointment = new appointmentModel({
            userId,
            docId,
            userData,
            docData:  docInfo,
            amount:   docData.fees,
            slotTime,
            slotDate,
            date:     Date.now()
        })
        await newAppointment.save()

        res.json({ success: true, message: "Appointment Booked" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 📋 API to Get User Appointments
// ==============================

const listAppointment = async (req, res) => {
    try {
        const userId       = req.userId
        const appointments = await appointmentModel.find({ userId })
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ❌ API to Cancel Appointment
// ✅ Stripe refund for online payments + cancellation email
// ==============================

const cancelAppointment = async (req, res) => {
    try {
        const userId            = req.userId
        const { appointmentId } = req.body
        const appointmentData   = await appointmentModel.findById(appointmentId)

        if (!appointmentData)
            return res.json({ success: false, message: "Appointment not found" })

        if (appointmentData.userId.toString() !== userId)
            return res.json({ success: false, message: "Unauthorized action" })

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
                console.log(`✅ Stripe refund issued for appointment ${appointmentId}`)
            } catch (refundErr) {
                console.error("❌ Stripe refund error:", refundErr.message)
                // Still cancel the appointment even if refund fails — admin can handle manually
            }
        }

        // ── Mark cancelled ────────────────────────────────────────────────────
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            cancelled:   true,
            cancelledBy: "user",
            refunded,
        })

        // ── Send cancellation email (fire-and-forget) ─────────────────────────
        try {
            const user = await userModel.findById(userId).select("email name")
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

        res.json({
            success: true,
            message: refunded
                ? "Appointment Cancelled & Refund Initiated ✅"
                : "Appointment Cancelled",
            refunded,
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 💳 Stripe Payment
// ==============================

const paymentStripe = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData   = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled)
            return res.json({ success: false, message: "Appointment not found or cancelled" })

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency:     "inr",
                    product_data: { name: `Appointment with ${appointmentData.docData.name}` },
                    unit_amount:  appointmentData.amount * 100,
                },
                quantity: 1,
            }],
            mode:        "payment",
            // ✅ request payment_intent expansion so we can store it for refunds
            payment_intent_data: {
                metadata: { appointmentId },
            },
            success_url: `${process.env.FRONTEND_URL}/verify?success=true&appointmentId=${appointmentId}`,
            cancel_url:  `${process.env.FRONTEND_URL}/verify?success=false&appointmentId=${appointmentId}`,
        })

        res.json({ success: true, session_url: session.url, sessionId: session.id })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ✅ Verify Stripe Payment
// ✅ Stores payment_intent ID for future refunds
// ==============================

const verifyStripe = async (req, res) => {
    try {
        const { appointmentId, success } = req.body

        if (success === "true") {
            // ── Retrieve the checkout session to get payment_intent ID ────────
            // We find the most recent session for this appointment via metadata
            const sessions = await stripe.checkout.sessions.list({
                limit: 10,
            })

            let paymentIntentId = null
            for (const s of sessions.data) {
                if (s.metadata?.appointmentId === appointmentId && s.payment_intent) {
                    paymentIntentId = s.payment_intent
                    break
                }
            }

            const appointment = await appointmentModel.findByIdAndUpdate(
                appointmentId,
                {
                    payment: true,
                    ...(paymentIntentId && { stripePaymentIntentId: paymentIntentId }),
                },
                { new: true }
            )
            return res.json({ success: true, message: "Payment Successful ✅", appointment })

        } else {
            await appointmentModel.findByIdAndDelete(appointmentId)
            return res.json({ success: false, message: "Payment Failed ❌" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 💊 Get Prescription (Patient)
// ==============================

const getPrescription = async (req, res) => {
    try {
        const userId            = req.userId
        const { appointmentId } = req.params

        const appointment = await appointmentModel
            .findById(appointmentId)
            .select("prescription docData isCompleted userId")

        if (!appointment)
            return res.json({ success: false, message: "Appointment not found" })

        if (appointment.userId.toString() !== userId)
            return res.json({ success: false, message: "Unauthorized" })

        res.json({ success: true, prescription: appointment.prescription })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ⭐ Submit a Review (Patient)
// ==============================

const submitReview = async (req, res) => {
    try {
        const userId = req.userId
        const { appointmentId, rating, comment } = req.body

        if (!rating || rating < 1 || rating > 5)
            return res.json({ success: false, message: "Rating must be between 1 and 5" })

        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment)
            return res.json({ success: false, message: "Appointment not found" })

        if (appointment.userId.toString() !== userId)
            return res.json({ success: false, message: "Unauthorized" })

        if (!appointment.isCompleted)
            return res.json({ success: false, message: "You can only review completed appointments" })

        // Check for duplicate review
        const existing = await reviewModel.findOne({ appointmentId })
        if (existing)
            return res.json({ success: false, message: "You have already reviewed this appointment" })

        const user = await userModel.findById(userId).select("name image")

        const review = new reviewModel({
            appointmentId,
            docId:     appointment.docId,
            userId,
            userName:  user.name,
            userImage: user.image || "",
            rating:    Number(rating),
            comment:   comment || "",
        })
        await review.save()

        // ── Update doctor's average rating on doctorModel ─────────────────────
        const allDocReviews = await reviewModel.find({ docId: appointment.docId })
        const avgRating     = allDocReviews.reduce((sum, r) => sum + r.rating, 0) / allDocReviews.length
        await doctorModel.findByIdAndUpdate(appointment.docId, {
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews:  allDocReviews.length,
        })

        res.json({ success: true, message: "Review submitted ✅" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// ⭐ Get Reviews for a Doctor (Public)
// ==============================

const getDoctorReviews = async (req, res) => {
    try {
        const { docId } = req.params
        const reviews   = await reviewModel
            .find({ docId })
            .sort({ date: -1 })
            .limit(50)

        const doctor    = await doctorModel.findById(docId).select("averageRating totalReviews")

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
// ⭐ Get Review for a Specific Appointment (Patient check)
// ==============================

const getAppointmentReview = async (req, res) => {
    try {
        const userId            = req.userId
        const { appointmentId } = req.params

        const review = await reviewModel.findOne({ appointmentId, userId })
        res.json({ success: true, review: review || null })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==============================
// 🗑️ Delete User Account
// ==============================

const deleteAccount = async (req, res) => {
    try {
        const userId = req.userId

        if (!userId)
            return res.json({ success: false, message: "Unauthorized" })

        await userModel.findByIdAndDelete(userId)
        res.json({ success: true, message: "Account deleted successfully ✅" })

    } catch (error) {
        console.log("DELETE ACCOUNT ERROR:", error)
        res.json({ success: false, message: error.message })
    }
}

// ==============================
// 📤 Export Controllers
// ==============================

module.exports = {
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
}