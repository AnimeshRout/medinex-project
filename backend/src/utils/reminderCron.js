// ==============================
// ⏰ Appointment Reminder Cron
// ==============================
// ==============================

const cron            = require("node-cron");
const appointmentModel = require("../models/appointmentModel");
const userModel        = require("../models/userModel");
const { sendAppointmentReminder } = require("./emailService");

// ── Format slotDate ──────────────────────────────
const formatSlotDate = (slotDate) => {
    const [d, m, y] = slotDate.split("_");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

// ── Check if a slotDate string matches tomorrow ───────────────────────────────
const isTomorrow = (slotDate) => {
    const [d, m, y] = slotDate.split("_").map(Number);
    const tomorrow  = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
        d === tomorrow.getDate() &&
        m === tomorrow.getMonth() + 1 &&
        y === tomorrow.getFullYear()
    );
};

// ── Main reminder function ────────────────────────────────────────────────────
const sendReminders = async () => {
    try {
        console.log("⏰ [ReminderCron] Checking for tomorrow's appointments...");

        // Find all non-cancelled, non-completed upcoming appointments
        const appointments = await appointmentModel.find({
            cancelled:   false,
            isCompleted: false,
        });

        const tomorrowAppts = appointments.filter(a => isTomorrow(a.slotDate));
        console.log(`📋 [ReminderCron] Found ${tomorrowAppts.length} appointment(s) for tomorrow`);

        for (const appt of tomorrowAppts) {
            try {
                // Get fresh user email (userData snapshot may be stale)
                const user = await userModel.findById(appt.userId).select("email name");
                if (!user || !user.email) continue;

                await sendAppointmentReminder({
                    toEmail:    user.email,
                    patientName: appt.userData?.name || user.name,
                    doctorName:  appt.docData?.name  || "your doctor",
                    slotDate:    formatSlotDate(appt.slotDate),
                    slotTime:    appt.slotTime,
                    fees:        appt.amount,
                });

                console.log(`✅ [ReminderCron] Reminder sent to ${user.email}`);
            } catch (err) {
                console.error(`❌ [ReminderCron] Failed for appt ${appt._id}: ${err.message}`);
            }
        }
    } catch (err) {
        console.error("❌ [ReminderCron] Error:", err.message);
    }
};

// ── Schedule: every day at 9:00 AM ───────────────────────────────────────────
const startReminderCron = () => {
    // "0 9 * * *" = at 09:00 every day
    cron.schedule("0 9 * * *", sendReminders, {
        timezone: "Asia/Kolkata", // ← change to your timezone if needed
    });
    console.log("✅ [Reminders] Scheduled — runs daily at 9:00 AM IST");
};

module.exports = { startReminderCron };