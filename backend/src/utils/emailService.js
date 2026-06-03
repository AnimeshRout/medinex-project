// ==============================
// 📧 Email Utility — Nodemailer
// ==============================

const nodemailer = require("nodemailer");

// ── Transporter ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || "smtp.gmail.com",
    port:   parseInt(process.env.EMAIL_PORT || "587"),
    secure: false, // true for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ── Shared HTML wrapper ───────────────────────────────────────────────────────
const htmlWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 32px auto; background: #fff;
      border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0d9488, #0891b2);
      padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p  { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 12px; padding: 18px 20px; margin: 18px 0; }
    .info-row { display: flex; justify-content: space-between;
      padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 600; }
    .info-value { color: #1e293b; font-weight: 700; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px;
      font-size: 12px; font-weight: 700; }
    .badge-teal   { background: #ccfbf1; color: #0d9488; }
    .badge-amber  { background: #fef3c7; color: #d97706; }
    .badge-red    { background: #fee2e2; color: #dc2626; }
    .badge-green  { background: #dcfce7; color: #16a34a; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0;
      padding: 18px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
    .btn { display: inline-block; background: linear-gradient(135deg, #0d9488, #0891b2);
      color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 10px;
      font-weight: 700; font-size: 14px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Medinex</h1>
      <p>Your trusted healthcare companion</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} Medinex · This is an automated email, please do not reply.
    </div>
  </div>
</body>
</html>`;


// ── 1. Appointment Reminder ───────────────────────────────────────────────────
const sendAppointmentReminder = async ({ toEmail, patientName, doctorName, slotDate, slotTime, fees }) => {
    const content = `
      <h2 style="color:#1e293b;margin:0 0 6px;">Hi ${patientName} 👋</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 18px;">
        This is a friendly reminder about your upcoming appointment tomorrow.
      </p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">👨‍⚕️ Doctor</span>
          <span class="info-value">${doctorName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📅 Date</span>
          <span class="info-value">${slotDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">⏰ Time</span>
          <span class="info-value">${slotTime}</span>
        </div>
        <div class="info-row">
          <span class="info-label">💰 Fees</span>
          <span class="info-value">₹${fees}</span>
        </div>
      </div>
      <p style="color:#475569;font-size:13px;">
        Please arrive 10 minutes early and carry any relevant medical records.
      </p>`;

    await transporter.sendMail({
        from:    process.env.EMAIL_FROM || "Medinex <noreply@medinex.com>",
        to:      toEmail,
        subject: `⏰ Appointment Reminder — Tomorrow with ${doctorName}`,
        html:    htmlWrapper(content),
    });
};


// ── 2. Cancellation + Refund Confirmation ────────────────────────────────────
const sendCancellationEmail = async ({ toEmail, patientName, doctorName, slotDate, slotTime, refunded, amount }) => {
    const refundBadge = refunded
        ? `<span class="badge badge-green">✅ Refund Issued</span>`
        : `<span class="badge badge-amber">💵 Cash / No Refund Needed</span>`;

    const content = `
      <h2 style="color:#1e293b;margin:0 0 6px;">Appointment Cancelled</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 18px;">
        Your appointment has been cancelled. Here are the details:
      </p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">👨‍⚕️ Doctor</span>
          <span class="info-value">${doctorName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📅 Date</span>
          <span class="info-value">${slotDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">⏰ Time</span>
          <span class="info-value">${slotTime}</span>
        </div>
        <div class="info-row">
          <span class="info-label">💳 Refund</span>
          <span class="info-value">${refundBadge}</span>
        </div>
        ${refunded ? `<div class="info-row">
          <span class="info-label">💰 Amount</span>
          <span class="info-value">₹${amount} (3–5 business days)</span>
        </div>` : ""}
      </div>
      <p style="color:#475569;font-size:13px;">
        We're sorry for the inconvenience. You can book a new appointment anytime on Medinex.
      </p>`;

    await transporter.sendMail({
        from:    process.env.EMAIL_FROM || "Medinex <noreply@medinex.com>",
        to:      toEmail,
        subject: `❌ Appointment Cancelled — ${doctorName} on ${slotDate}`,
        html:    htmlWrapper(content),
    });
};


// ── 3. Review Request Email ───────────────────────────────────────────────────
const sendReviewRequestEmail = async ({ toEmail, patientName, doctorName, appointmentId, frontendUrl }) => {
    const reviewUrl = `${frontendUrl || process.env.FRONTEND_URL}/my-appointments?review=${appointmentId}`;

    const content = `
      <h2 style="color:#1e293b;margin:0 0 6px;">How was your experience? ⭐</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 18px;">
        Hi ${patientName}, your appointment with <strong>${doctorName}</strong> has been completed.
        We'd love to hear your feedback!
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${reviewUrl}" class="btn">⭐ Leave a Review</a>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;">
        Your review helps other patients find the right doctor.
      </p>`;

    await transporter.sendMail({
        from:    process.env.EMAIL_FROM || "Medinex <noreply@medinex.com>",
        to:      toEmail,
        subject: `⭐ How was your appointment with ${doctorName}? Leave a review`,
        html:    htmlWrapper(content),
    });
};


module.exports = {
    sendAppointmentReminder,
    sendCancellationEmail,
    sendReviewRequestEmail,
};