import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import axios from "axios"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { jsPDF } from "jspdf"
import {
  FaUserMd, FaStethoscope, FaMapMarkerAlt,
  FaCalendarAlt, FaClock, FaCheckCircle,
  FaTimesCircle, FaCreditCard, FaBan, FaPills, FaDownload, FaStar,
} from "react-icons/fa"
import { FiCalendar, FiFileText, FiX } from "react-icons/fi"
import { MdVerified } from "react-icons/md"
import ReviewModal from "../components/ReviewModal"

// ── jsPDF prescription download — matches payment receipt style ──────────────
const downloadPrescriptionPDF = (appointment) => {
  const rx  = appointment?.prescription
  const doc = new jsPDF()
  const W   = doc.internal.pageSize.getWidth()

  // ── Header bar ──
  doc.setFillColor(20, 184, 166)   // teal-500
  doc.rect(0, 0, W, 38, "F")

  // ── Header accent strip ──
  doc.setFillColor(6, 182, 212)    // cyan-500
  doc.rect(0, 30, W, 8, "F")

  // ── Header text ──
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("MEDINEX", W / 2, 16, { align: "center" })
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Medical Prescription", W / 2, 26, { align: "center" })

  // ── Rx ID + Date row ──
  doc.setFillColor(240, 253, 250)   // teal-50
  doc.rect(0, 38, W, 18, "F")
  doc.setTextColor(20, 184, 166)
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "bold")
  const rxId      = "RX-" + Date.now().toString().slice(-8)
  const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  doc.text("# " + rxId, 14, 49)
  doc.text("Printed: " + printDate, W - 14, 49, { align: "right" })

  // ── Helper: divider ──
  const divider = (y, r = 167, g = 243, b = 208) => {
    doc.setDrawColor(r, g, b)
    doc.setLineWidth(0.8)
    doc.line(14, y, W - 14, y)
    doc.setLineWidth(0.2)
  }

  // ── Helper: info row ──
  const row = (label, value, y) => {
    doc.setFillColor(20, 184, 166)
    doc.circle(17, y - 1.5, 1.8, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(130, 130, 160)
    doc.text(label.toUpperCase(), 22, y)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(25, 25, 50)
    doc.text(value || "—", 22, y + 8)
  }

  divider(60)
  row("Patient",    appointment?.userData?.name,    68)
  divider(82)
  row("Doctor",     appointment?.docData?.name,     90)
  divider(104)
  row("Speciality", appointment?.docData?.speciality, 112)
  divider(126)

  const slotFormatted = appointment?.slotDate
    ? appointment.slotDate.split("_").join(" ")
    : "—"

  row("Date",       slotFormatted,                  134)
  divider(148)
  row("Time",       appointment?.slotTime,          156)
  divider(170)

  // ── Medicines heading ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(20, 184, 166)
  doc.text("PRESCRIBED MEDICINES", 14, 181)

  // ── Medicines table ──
  const tableTop  = 186
  const colWidths = [52, 28, 52, 36]
  const headers   = ["Medicine", "Dosage", "Frequency", "Duration"]
  const colX      = [14, 66, 94, 146]

  // Table header bg
  doc.setFillColor(204, 251, 241)   // teal-100
  doc.rect(14, tableTop, W - 28, 10, "F")

  // Header text
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(15, 118, 110)    // teal-700
  headers.forEach((h, i) => doc.text(h, colX[i] + 2, tableTop + 7))

  // Table rows
  const medicines = rx?.medicines || []
  medicines.forEach((med, idx) => {
    const rowY = tableTop + 10 + idx * 12

    // Alternating row bg
    if (idx % 2 === 0) {
      doc.setFillColor(240, 253, 250)
      doc.rect(14, rowY, W - 28, 12, "F")
    }

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(25, 25, 50)
    doc.text(med.name      || "—", colX[0] + 2, rowY + 8)
    doc.text(med.dosage    || "—", colX[1] + 2, rowY + 8)
    doc.text(med.frequency || "—", colX[2] + 2, rowY + 8)
    doc.text(med.duration  || "—", colX[3] + 2, rowY + 8)
  })

  // Table border
  doc.setDrawColor(167, 243, 208)
  doc.setLineWidth(0.6)
  const tableBottom = tableTop + 10 + medicines.length * 12
  doc.rect(14, tableTop, W - 28, tableBottom - tableTop, "S")
  doc.setLineWidth(0.2)

  let cursorY = tableBottom + 12

  // ── Instructions box ──
  if (rx?.instructions) {
    const instrLines = doc.splitTextToSize(rx.instructions, W - 52)
    const instrH     = 14 + instrLines.length * 6
    doc.setFillColor(255, 251, 235)
    doc.setDrawColor(253, 230, 138)
    doc.setLineWidth(0.8)
    doc.roundedRect(14, cursorY, W - 28, instrH, 3, 3, "FD")
    doc.setLineWidth(0.2)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(146, 64, 14)
    doc.text("INSTRUCTIONS", 20, cursorY + 8)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(25, 25, 50)
    doc.text(instrLines, 20, cursorY + 16)
    cursorY += instrH + 8
  }

  // ── Follow-up date box ──
  if (rx?.followUpDate) {
    if (cursorY + 40 > 270) { doc.addPage(); cursorY = 20 }
    doc.setFillColor(236, 253, 245)
    doc.setDrawColor(134, 239, 172)
    doc.setLineWidth(0.8)
    doc.roundedRect(14, cursorY, W - 28, 30, 3, 3, "FD")
    doc.setLineWidth(0.2)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(21, 128, 61)
    doc.text("FOLLOW-UP DATE", 20, cursorY + 9)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(25, 25, 50)
    doc.text(rx.followUpDate, 20, cursorY + 21)
    cursorY += 38
  }

  // ── Status badges ──
  if (cursorY + 50 > 270) { doc.addPage(); cursorY = 20 }
  cursorY += 8
  doc.setFillColor(20, 184, 166)
  doc.roundedRect(14, cursorY, 52, 12, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "bold")
  doc.text("PRESCRIBED", 40, cursorY + 8, { align: "center" })

  doc.setFillColor(99, 102, 241)
  doc.roundedRect(70, cursorY, 52, 12, 3, 3, "F")
  doc.text("VERIFIED", 96, cursorY + 8, { align: "center" })

  cursorY += 18

  // ── Prescribed by ──
  if (rx?.createdBy) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(130, 130, 160)
    const createdDate = rx.createdAt
      ? new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : printDate
    doc.text(`Prescribed by: ${rx.createdBy}  |  ${createdDate}`, 14, cursorY)
    cursorY += 10
  }

  // ── Divider before footer ──
  cursorY += 6
  divider(cursorY, 200, 200, 230)
  cursorY += 4

  // ── Footer text ──
  doc.setTextColor(150, 150, 180)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("Thank you for choosing Medinex — Your Trusted Healthcare Partner", W / 2, cursorY + 8, { align: "center" })
  doc.text("support@medinex.com  |  www.medinex.com", W / 2, cursorY + 15, { align: "center" })
  cursorY += 22

  // ── Bottom bar ──
  doc.setFillColor(20, 184, 166)
  doc.rect(0, cursorY, W, 13, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("MEDINEX  —  Medical Prescription", W / 2, cursorY + 8, { align: "center" })

  doc.save(`medinex_prescription_${rxId}.pdf`)
}

// ── Prescription View Modal ───────────────────────────────────────────────────
const PrescriptionViewModal = ({ isOpen, appointment, onClose }) => {
  const rx = appointment?.prescription

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="rx-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[10000] px-4 py-6" onClick={onClose}>
            <motion.div
              key="rx-modal"
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
              exit={{ opacity: 0, scale: 0.93, y: 10, transition: { duration: 0.18 } }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiFileText size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-base leading-tight">Prescription</p>
                    <p className="text-white/75 text-xs mt-0.5">
                      Dr. {appointment?.docData?.name} · {appointment?.slotDate?.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                >
                  <FiX size={16} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-6 py-5">

                <p className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
                  <FaPills size={14} className="text-teal-500" /> Medicines
                </p>

                {rx?.medicines?.length > 0 ? (
                  <div className="rounded-xl border border-gray-400 overflow-hidden mb-5">
                    <div className="grid grid-cols-4 bg-gray-200 border-b border-gray-400 px-3 py-2">
                      {["Medicine", "Dosage", "Frequency", "Duration"].map((h, i) => (
                        <p key={i} className="text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</p>
                      ))}
                    </div>
                    {rx.medicines.map((med, i) => (
                      <div key={i} className={`grid grid-cols-4 px-3 py-2.5 text-sm text-gray-700 ${i % 2 === 0 ? "bg-white" : "bg-gray-100/50"} border-b border-gray-400 last:border-b-0`}>
                        <p className="font-semibold text-gray-900 truncate">{med.name || "—"}</p>
                        <p className="text-gray-700">{med.dosage || "—"}</p>
                        <p className="text-gray-700">{med.frequency || "—"}</p>
                        <p className="text-gray-700">{med.duration || "—"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mb-5">No medicines added.</p>
                )}

                {rx?.instructions && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-gray-800 mb-1.5">Instructions</p>
                    <div className="bg-amber-100 border border-amber-500 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                      {rx.instructions}
                    </div>
                  </div>
                )}

                {rx?.followUpDate && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-gray-800 mb-1.5">Follow-up Date</p>
                    <div className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-600 rounded-xl px-4 py-2 text-sm font-semibold text-indigo-700">
                      <FaCalendarAlt size={12} />
                      {rx.followUpDate}
                    </div>
                  </div>
                )}

                {rx?.createdBy && (
                  <p className="text-xs text-gray-600 mt-4">
                    Prescribed by <span className="font-semibold text-gray-900">{rx.createdBy}</span>
                    {rx.createdAt && ` on ${new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-400 flex-shrink-0 bg-white flex gap-3">
                <motion.button
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-400 text-sm font-semibold text-gray-700 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => downloadPrescriptionPDF(appointment)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-sm py-2.5 rounded-xl shadow-md shadow-teal-200 hover:opacity-90 transition cursor-pointer"
                >
                  <FaDownload size={13} /> Download Prescription
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments]     = useState([])
  const [loadingPayment, setLoadingPayment] = useState("")

  // ── Prescription state ──
  const [rxOpen, setRxOpen]               = useState(false)
  const [rxAppointment, setRxAppointment] = useState(null)

  // ── Review state ──
  const [reviewOpen, setReviewOpen]               = useState(false)
  const [reviewAppointment, setReviewAppointment] = useState(null)

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_")
    return `${dateArray[0]} ${months[Number(dateArray[1]) - 1]} ${dateArray[2]}`
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/user/appointments",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        setAppointments(data.appointments.reverse().filter(a => !a.cancelled))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const appointmentStripe = async (appointmentId) => {
    try {
      setLoadingPayment(appointmentId)
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-stripe",
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        window.location.replace(data.session_url)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoadingPayment("")
    }
  }

  const openPrescription = (item) => {
    setRxAppointment(item)
    setRxOpen(true)
  }

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    getUserAppointments()
  }, [token])

  return (
    <div className="min-h-screen px-4 sm:px-8 md:px-12 lg:px-20 py-10">

      {/* ── Prescription View Modal ── */}
      <PrescriptionViewModal
        isOpen={rxOpen}
        appointment={rxAppointment}
        onClose={() => setRxOpen(false)}
      />

      {/* ── Review Modal ── */}
      <ReviewModal
        isOpen={reviewOpen}
        appointment={reviewAppointment}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => getUserAppointments()}
      />

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <FiCalendar size={28} className="text-indigo-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tracking-tight">
            My Appointments
          </h1>
        </div>
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full" />
        <p className="text-gray-700 text-sm mt-2">
          Manage and track all your upcoming and past appointments 📋
        </p>
      </motion.div>

      {/* ── CARDS ── */}
      <div className="flex flex-col gap-5">
        {appointments.length > 0 ? (
          appointments.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:shadow-black/10 transition-shadow overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-0">

                {/* Left accent bar */}
                <div className={`w-full sm:w-1.5 flex-shrink-0 ${item.cancelled ? 'bg-red-400' : item.isCompleted ? 'bg-emerald-500' : item.payment ? 'bg-green-500' : 'bg-gradient-to-b from-indigo-500 to-violet-600'}`} />

                {/* Content */}
                <div className="flex flex-col sm:flex-row gap-5 p-5 flex-1">

                  {/* Doctor image */}
                  <div className="flex-shrink-0 flex justify-center sm:justify-start">
                    <img
                      src={item.docData?.image}
                      alt="doctor"
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover object-top rounded-2xl border border-gray-300 shadow-sm"
                    />
                  </div>

                  {/* Doctor info */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <FaUserMd size={15} className="text-indigo-500 flex-shrink-0" />
                      <p className="font-bold text-gray-800 text-base sm:text-lg truncate">
                        {item.docData?.name}
                      </p>
                      <MdVerified size={16} className="text-indigo-500 flex-shrink-0" />
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-700 text-xs mb-3">
                      <FaStethoscope size={11} className="text-indigo-500" />
                      {item.docData?.speciality}
                    </div>

                    {(item.docData?.address?.line1 || item.docData?.address?.line2) && (
                      <div className="flex items-start gap-1.5 text-gray-700 text-xs mb-2">
                        <FaMapMarkerAlt size={11} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>
                          {item.docData?.address?.line1}
                          {item.docData?.address?.line2 && `, ${item.docData?.address?.line2}`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 flex-wrap mt-2">
                      <div className="flex items-center gap-1.5 bg-indigo-100 border border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-700">
                        <FaCalendarAlt size={11} />
                        {slotDateFormat(item.slotDate)}
                      </div>
                      <div className="flex items-center gap-1.5 bg-violet-100 border border-violet-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-violet-700">
                        <FaClock size={11} />
                        {item.slotTime}
                      </div>
                    </div>

                  </div>

                  {/* Action buttons */}
                  <div className="flex sm:flex-col flex-row gap-2 justify-end sm:justify-center flex-shrink-0">

                    {/* Pay Online */}
                    {!item.cancelled && !item.payment && !item.isCompleted && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => appointmentStripe(item._id)}
                        disabled={loadingPayment === item._id}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 hover:opacity-90 transition whitespace-nowrap disabled:opacity-60"
                      >
                        <FaCreditCard size={12} />
                        {loadingPayment === item._id ? "Redirecting..." : "Pay Online"}
                      </motion.button>
                    )}

                    {/* Paid */}
                    {!item.cancelled && item.payment && !item.isCompleted && (
                      <span className="inline-flex items-center gap-1.5 bg-green-100 border border-green-500 text-green-700 font-semibold text-xs px-4 py-2.5 rounded-xl whitespace-nowrap">
                        <FaCheckCircle size={12} /> Paid
                      </span>
                    )}

                    {/* Completed */}
                    {item.isCompleted && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-500 text-emerald-700 font-semibold text-xs px-4 py-2.5 rounded-xl whitespace-nowrap">
                        <FaCheckCircle size={12} /> Completed
                      </span>
                    )}

                    {/* ✅ Review button — only for completed appointments */}
                    {item.isCompleted && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setReviewAppointment(item); setReviewOpen(true) }}
                        className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-500 text-amber-700 font-semibold text-xs px-4 py-2.5 rounded-xl whitespace-nowrap hover:bg-amber-200 transition cursor-pointer"
                      >
                        <FaStar size={12} /> Review
                      </motion.button>
                    )}

                    {/* View Prescription */}
                    {item.isCompleted && item.prescription?.medicines?.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => openPrescription(item)}
                        className="inline-flex items-center gap-1.5 bg-teal-100 border border-teal-500 text-teal-700 font-semibold text-xs px-4 py-2.5 rounded-xl whitespace-nowrap hover:bg-teal-200 transition cursor-pointer"
                      >
                        <FiFileText size={12} /> View Prescription
                      </motion.button>
                    )}

                    {/* Cancel */}
                    {!item.cancelled && !item.isCompleted && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => cancelAppointment(item._id)}
                        className="inline-flex items-center gap-1.5 border border-gray-400 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-red-100 hover:border-red-300 hover:text-red-600 transition whitespace-nowrap"
                      >
                        <FaBan size={12} /> Cancel
                      </motion.button>
                    )}

                    {/* Cancelled */}
                    {item.cancelled && (
                      <span className="inline-flex items-center gap-1.5 bg-red-100 border border-red-500 text-red-500 font-semibold text-xs px-4 py-2.5 rounded-xl whitespace-nowrap">
                        <FaTimesCircle size={12} /> Cancelled
                      </span>
                    )}

                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <FiCalendar size={52} className="text-indigo-400" />
            <p className="text-gray-700 text-base font-medium">No appointments booked yet.</p>
            <button
              onClick={() => navigate("/doctors")}
              className="text-sm text-indigo-600 font-semibold underline hover:text-indigo-800 transition"
            >
              Book your first appointment →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MyAppointments