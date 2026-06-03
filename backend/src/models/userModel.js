// ==============================
// 📦 Import Mongoose
// ==============================

const mongoose = require("mongoose");

// ==============================
// 👤 User Schema
// ==============================

const userSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, default: "" },
    image:     { type: String, default: "" },
    address:   { type: Object, default: { line1: '', line2: '' } },
    gender:    { type: String, default: "Not Selected" },
    dob:       { type: String, default: "Not Selected" },
    phone:     { type: String, default: "00000000" },
    isBlocked: { type: Boolean, default: false },
})


// ==============================
// 🧹 Helper: Clean up user's appointments & doctor slots
// ==============================

const cleanupUserData = async (userId) => {
    const appointmentModel = require("./appointmentModel");
    const doctorModel      = require("./doctorModel");

    // Find all NON-cancelled appointments for this user
    const appointments = await appointmentModel.find({
        userId:    userId.toString(),
        cancelled: false,
    });

    for (const appt of appointments) {
        const doctor = await doctorModel.findById(appt.docId);
        if (doctor && doctor.slots_booked[appt.slotDate]) {
            // Remove only this user's time slot
            doctor.slots_booked[appt.slotDate] = doctor.slots_booked[appt.slotDate]
                .filter(t => t !== appt.slotTime);

            // Required because slots_booked is a plain Object type in the schema
            doctor.markModified("slots_booked");
            await doctor.save();
        }
    }

    // Delete ALL appointments (including cancelled) for this user
    await appointmentModel.deleteMany({ userId: userId.toString() });
};


// ==============================
// 🔁 Hook 1: findOneAndDelete
// ==============================

userSchema.pre("findOneAndDelete", async function () {
    try {
        const user = await this.model.findOne(this.getFilter());
        if (user) await cleanupUserData(user._id);
    } catch (err) {
        console.log("HOOK ERROR:", err)
    }
});


// ==============================
// 🔁 Hook 2: deleteOne
// ==============================

userSchema.pre("deleteOne", { document: false, query: true }, async function () {
    try {
        const user = await this.model.findOne(this.getFilter());
        if (user) await cleanupUserData(user._id);
    } catch (err) {
        console.log("HOOK ERROR:", err)
    }
});


// ==============================
// 🔁 Hook 3: deleteMany
// ==============================

userSchema.pre("deleteMany", { document: false, query: true }, async function () {
    try {
        const users = await this.model.find(this.getFilter());
        for (const user of users) {
            await cleanupUserData(user._id);
        }
    } catch (err) {
        console.log("HOOK ERROR:", err)
    }
});


// ==============================
// 📦 Create & Export User Model
// ==============================

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
module.exports = userModel;