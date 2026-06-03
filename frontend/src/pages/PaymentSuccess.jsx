import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Lottie from "lottie-react"
import successAnimation from "../assets/success-payment.json"
import { jsPDF } from "jspdf"
import { motion } from "framer-motion"
import {
  FaUserMd, FaStethoscope, FaCalendarAlt,
  FaClock, FaRupeeSign, FaDownload, FaCheckCircle,
} from "react-icons/fa"
import { FiArrowLeft } from "react-icons/fi"
import { MdVerified } from "react-icons/md"

const PaymentSuccess = () => {
  const navigate    = useNavigate()
  const location    = useLocation()
  const appointment = location.state?.appointment

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  const formatDate = (slotDate) => {
    if (!slotDate) return ""
    const [day, month, year] = slotDate.split("_")
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  // ── backend logic preserved ──
  const downloadReceipt = () => {
    const doc = new jsPDF()
    const W = doc.internal.pageSize.getWidth()

    // ── Header bar ──
    doc.setFillColor(99, 102, 241)
    doc.rect(0, 0, W, 38, "F")

    // ── Header accent strip ──
    doc.setFillColor(124, 58, 237)
    doc.rect(0, 30, W, 8, "F")

    // ── Header text ──
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text("MEDINEX", W / 2, 16, { align: "center" })
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Appointment Receipt", W / 2, 26, { align: "center" })

    // ── Receipt ID + Date row ──
    doc.setFillColor(248, 248, 255)
    doc.rect(0, 38, W, 18, "F")
    doc.setTextColor(99, 102, 241)
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "bold")
    const receiptId = "RCP-" + Date.now().toString().slice(-8)
    const printDate = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
    doc.text("# " + receiptId, 14, 49)
    doc.text("Printed: " + printDate, W - 14, 49, { align: "right" })

    // ── Helper: thick visible divider ──
    const divider = (y, r=180, g=180, b=220) => {
      doc.setDrawColor(r, g, b)
      doc.setLineWidth(0.8)
      doc.line(14, y, W - 14, y)
      doc.setLineWidth(0.2) // reset
    }

    // ── Helper: row with emoji label ──
    const row = (label, value, y) => {
      // colored dot
      doc.setFillColor(99, 102, 241)
      doc.circle(17, y - 1.5, 1.8, "F")
      // label
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8.5)
      doc.setTextColor(130, 130, 160)
      doc.text(label.toUpperCase(), 22, y)
      // value
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.setTextColor(25, 25, 50)
      doc.text(value || "—", 22, y + 8)
    }

    divider(60)

    row("Patient Name", appointment?.userData?.name,       68)
    divider(82)
    row("Doctor",       appointment?.docData?.name,        90)
    divider(104)
    row("Speciality",   appointment?.docData?.speciality, 112)
    divider(126)
    row("Date",         formatDate(appointment?.slotDate), 134)
    divider(148)
    row("Time",         appointment?.slotTime,             156)
    divider(170)

    // ── Fee box ──
    doc.setFillColor(236, 253, 245)
    doc.setDrawColor(134, 239, 172)
    doc.setLineWidth(0.8)
    doc.roundedRect(14, 176, W - 28, 26, 4, 4, "FD")
    doc.setLineWidth(0.2)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(21, 128, 61)
    doc.text("FEE PAID", 22, 191)
    doc.setFontSize(15)
    doc.text("Rs. " + appointment?.amount, W - 22, 191, { align: "right" })

    // ── Status badges row ──
    // PAID badge
    doc.setFillColor(99, 102, 241)
    doc.roundedRect(14, 210, 44, 12, 3, 3, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "bold")
    doc.text("PAID", 36, 218, { align: "center" })

    // CONFIRMED badge
    doc.setFillColor(16, 185, 129)
    doc.roundedRect(62, 210, 60, 12, 3, 3, "F")
    doc.text("CONFIRMED", 92, 218, { align: "center" })

    // ── Note box — taller to fit bigger text ──
    doc.setFillColor(255, 251, 235)
    doc.setDrawColor(253, 230, 138)
    doc.setLineWidth(0.8)
    doc.roundedRect(14, 230, W - 28, 26, 3, 3, "FD")
    doc.setLineWidth(0.2)
    doc.setTextColor(146, 64, 14)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Please arrive 10 minutes before your appointment time.", 20, 241)
    doc.setFont("helvetica", "normal")
    doc.text("Carry a valid ID and this receipt for verification.", 20, 251)

    // ── Divider before footer ──
    divider(266, 200, 200, 230)

    // ── Footer ──
    doc.setTextColor(150, 150, 180)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text("Thank you for choosing Medinex — Your Trusted Healthcare Partner", W / 2, 274, { align: "center" })
    doc.text("support@medinex.com  |  www.medinex.com", W / 2, 281, { align: "center" })

    // ── Bottom bar ──
    doc.setFillColor(99, 102, 241)
    doc.rect(0, 284, W, 13, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text("MEDINEX  —  Appointment Receipt", W / 2, 292, { align: "center" })

    doc.save("medinex_receipt.pdf")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-md w-full max-w-md overflow-hidden"
      >
        {/* Top gradient bar */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600" />

        <div className="p-7 sm:p-10">

          {/* Lottie + heading */}
          <div className="text-center mb-6">
            <div className="w-36 mx-auto">
              <Lottie animationData={successAnimation} loop={false} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800 mt-1 flex items-center justify-center gap-2">
              <FaCheckCircle className="text-emerald-500" size={22} />
              Payment Successful
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Your appointment has been confirmed 🎉
            </p>
          </div>

          {/* Appointment details card */}
          {appointment && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4 mb-6 space-y-3"
            >
              {/* Doctor */}
              <div className="flex items-start gap-3">
                <FaUserMd size={14} className="text-indigo-400 flex-shrink-0 mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Doctor</p>
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5 truncate">
                    {appointment?.docData?.name}
                    <MdVerified size={14} className="text-indigo-500 flex-shrink-0" />
                  </p>
                </div>
              </div>

              <div className="h-[1.5px] bg-gray-300" />

              {/* Speciality */}
              <div className="flex items-start gap-3">
                <FaStethoscope size={13} className="text-violet-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Speciality</p>
                  <p className="text-sm font-medium text-gray-700">{appointment?.docData?.speciality}</p>
                </div>
              </div>

              <div className="h-[1.5px] bg-gray-300" />

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FaCalendarAlt size={13} className="text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Date</p>
                    <p className="text-sm font-medium text-gray-700">{formatDate(appointment?.slotDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaClock size={13} className="text-indigo-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Time</p>
                    <p className="text-sm font-medium text-gray-700">{appointment?.slotTime}</p>
                  </div>
                </div>
              </div>

              <div className="h-[1.5px] bg-gray-300" />

              {/* Fee */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaRupeeSign size={13} className="text-emerald-500 flex-shrink-0" />
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Fee Paid</p>
                </div>
                <span className="font-extrabold text-emerald-600 text-lg">₹{appointment?.amount}</span>
              </div>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={downloadReceipt}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 text-white font-bold text-sm py-3 rounded-xl shadow-md shadow-indigo-200 hover:opacity-90 transition"
            >
              <FaDownload size={14} /> Download Receipt
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/my-appointments")}
              className="inline-flex items-center justify-center gap-2 border-2 border-indigo-300 text-indigo-600 font-semibold text-sm py-3 rounded-xl hover:bg-indigo-50 transition"
            >
              <FiArrowLeft size={14} /> View My Appointments
            </motion.button>
          </div>

        </div>
      </motion.div>
    </div>
  )
}

export default PaymentSuccess