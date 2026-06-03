require("dotenv").config();

const app        = require("./app");
const connectDB  = require("./config/db");
const { connectCloudinary } = require("./config/cloudinary");

const appointmentModel = require("./models/appointmentModel");
const doctorModel      = require("./models/doctorModel");
const userModel        = require("./models/userModel");


const { startReminderCron } = require("./utils/reminderCron");


// ==============================
// 👁️ Watch for manual user deletions (Atlas UI / external tools)
// ==============================

const watchUserDeletions = () => {
    const changeStream = userModel.watch([
        { $match: { operationType: "delete" } }
    ]);

    changeStream.on("change", async (change) => {
        const deletedUserId = change.documentKey._id.toString();
        console.log(`🔴 User deleted externally (Atlas/other): ${deletedUserId}`);

        try {
            const appointments = await appointmentModel.find({
                userId:    deletedUserId,
                cancelled: false,
            });

            for (const appt of appointments) {
                const doctor = await doctorModel.findById(appt.docId);
                if (doctor && doctor.slots_booked[appt.slotDate]) {
                    doctor.slots_booked[appt.slotDate] = doctor.slots_booked[appt.slotDate]
                        .filter(t => t !== appt.slotTime);
                    doctor.markModified("slots_booked");
                    await doctor.save();
                }
            }

            await appointmentModel.deleteMany({ userId: deletedUserId });
            console.log(`✅ Auto-cleaned data for externally deleted user: ${deletedUserId}`);

        } catch (err) {
            console.error("❌ Change stream cleanup error:", err.message);
        }
    });

    changeStream.on("error", (err) => {
        console.error("❌ Change stream error:", err.message);
    });
};


// ==============================
// 🚀 Start Server
// ==============================

const start = async () => {
    try {
        await connectDB();
        connectCloudinary();

        // Start watching for external user deletions (Atlas UI etc.)
        watchUserDeletions();

        // Start daily appointment reminder cron (runs at 9:00 AM)
        startReminderCron();

        const PORT = process.env.PORT || 4001;

        app.listen(PORT, () => {
            console.log(`
╭────────────────────────────────────────────╮
│        🚀 BACKEND API DASHBOARD            │
├────────────────────────────────────────────┤
│  📍 Server    → http://localhost:${PORT}
│  🌐 Node Env  → ${process.env.NODE_ENV || "development"}
│  🗄️  Database  → MongoDB Connected
│  📅 Date      → ${new Date().toDateString()}
│  ⏰ Time      → ${new Date().toLocaleTimeString()}
│  📧 Reminders → Cron active (daily 9 AM)
╰────────────────────────────────────────────╯
`);
        });
    } catch (error) {
        console.error("❌ SERVER FAILED TO START:", error);
        process.exit(1);
    }
};

start();