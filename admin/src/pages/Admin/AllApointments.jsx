import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar, FiUser, FiClock,
  FiCheckCircle, FiXCircle, FiSearch, FiFilter,
  FiTrash2, FiAlertTriangle, FiFileText, FiX, FiEye,
} from "react-icons/fi";
import {
  FaCreditCard, FaMoneyBillWave, FaBirthdayCake, FaRupeeSign, FaUserMd,
  FaPills, FaDownload, FaCalendarAlt,
} from "react-icons/fa";
import { MdVerified, MdAdminPanelSettings } from "react-icons/md";
import axiosInstance from "../../api/axios";;
import { jsPDF } from "jspdf";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const rowVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const isDark = () => document.documentElement.classList.contains("dark");
const getAdminHover = () => isDark() ? "rgba(109, 40, 217, 0.2)" : "#e2e6ea";

// ── Avatar helper — colored initial when no image ─────────────────────────────
const AVATAR_COLORS = [
  ["#6366f1", "#4338ca"], // indigo
  ["#8b5cf6", "#6d28d9"], // violet
  ["#ec4899", "#be185d"], // pink
  ["#14b8a6", "#0f766e"], // teal
  ["#f59e0b", "#b45309"], // amber
  ["#10b981", "#047857"], // emerald
  ["#3b82f6", "#1d4ed8"], // blue
  ["#ef4444", "#b91c1c"], // red
];

const getAvatarColors = (name = "") => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const getInitial = (name = "") => (name?.trim()?.[0] || "?").toUpperCase();

// Cache-bust image URL so updated photos always load fresh
const bustCache = (url) => {
  if (!url || url.startsWith("blob:") || url.startsWith("data:")) return null;
  try {
    const u = new URL(url);
    u.searchParams.set("t", Math.floor(Date.now() / 60000)); // refresh every minute
    return u.toString();
  } catch {
    return url;
  }
};

// Avatar component — shows image if valid, colored initial otherwise
const Avatar = ({ src, name, size = 36, className = "" }) => {
  const [failed, setFailed] = useState(false);
  const bustedSrc = bustCache(src);
  const [bg, text2] = getAvatarColors(name);

  if (!bustedSrc || failed) {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
        style={{
          width: size, height: size, fontSize: size * 0.38,
          background: `linear-gradient(135deg, ${bg}, ${text2})`,
          color: "#fff",
        }}
      >
        {getInitial(name)}
      </div>
    );
  }

  return (
    <img
      src={bustedSrc}
      alt={name}
      onError={() => setFailed(true)}
      className={`rounded-full object-cover flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const RANGE_INFO = {
  "7days":  { title: "Clear Last 7 Days",  desc: "Permanently deletes all cancelled appointments from the last 7 days." },
  "30days": { title: "Clear Last 30 Days", desc: "Permanently deletes all cancelled appointments from the last 30 days." },
  "all":    { title: "Clear All History",  desc: "Permanently deletes ALL cancelled appointment history. This cannot be undone." },
};

const ConfirmModal = ({ isOpen, range, onClose, onConfirm }) => {
  const info = RANGE_INFO[range] || {};
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[10000] px-4 py-6" onClick={onClose}>
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
              exit={{ opacity: 0, scale: 0.93, y: 10, transition: { duration: 0.18 } }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-gradient-to-br from-red-500 to-rose-600 px-6 py-5 flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 15 }}
                  className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
                >
                  <FiAlertTriangle size={22} className="text-white" />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <p className="text-white font-extrabold text-base leading-tight">{info.title}</p>
                  <p className="text-white/75 text-xs mt-0.5">This action cannot be undone</p>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.25 }}
                className="px-6 py-5"
              >
                <div className="flex items-start gap-3 bg-red-200 border border-red-600 rounded-xl p-3.5 mb-5">
                  <FiTrash2 size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-900 leading-relaxed">{info.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-gray-600
                      text-sm font-semibold text-gray-900 bg-gray-100
                      cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1, boxShadow: "0 8px 20px rgba(239,68,68,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onConfirm}
                    className="flex-1 py-2.5 rounded-xl border-none
                      bg-gradient-to-r from-red-500 to-rose-600
                      text-white text-sm font-bold cursor-pointer
                      shadow-lg shadow-red-200
                      flex items-center justify-center gap-2"
                  >
                    <FiTrash2 size={14} /> Yes, Clear
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── PDF Download ──────────────────────────────────────────────────────────────
const downloadPrescriptionPDF = (appointment) => {
  const rx       = appointment?.prescription;
  const doc      = new jsPDF();
  const W        = doc.internal.pageSize.getWidth();
  const rxId     = "RX-" + Date.now().toString().slice(-8);
  const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // ── Header band ──
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, W, 38, "F");
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 30, W, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22); doc.setFont("helvetica", "bold");
  doc.text("MEDINEX", W / 2, 16, { align: "center" });
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text("Medical Prescription", W / 2, 26, { align: "center" });

  // ── Ref strip ──
  doc.setFillColor(240, 253, 250);
  doc.rect(0, 38, W, 16, "F");
  doc.setTextColor(20, 184, 166);
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("REF: " + rxId, 14, 49);
  doc.text("Printed: " + printDate, W - 14, 49, { align: "right" });

  // ── Patient / appointment details ──
  const details = [
    ["Patient",    appointment?.userData?.name],
    ["Doctor",     appointment?.docData?.name],
    ["Speciality", appointment?.docData?.speciality],
    ["Date",       appointment?.slotDate?.replace(/_/g, " ")],
    ["Time",       appointment?.slotTime],
  ];

  let y = 62;
  doc.setDrawColor(204, 251, 241); doc.setLineWidth(0.5);

  details.forEach(([label, value]) => {
    doc.line(14, y, W - 14, y);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), 14, y + 6);
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(15, 23, 42);
    doc.text(value || "—", 14, y + 14);
    y += 20;
  });

  doc.line(14, y, W - 14, y);
  y += 8;

  // ── Medicines table ──
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(20, 184, 166);
  doc.text("PRESCRIBED MEDICINES", 14, y);
  y += 6;

  const cols = [14, 66, 110, 155];
  const headers = ["Medicine", "Dosage", "Frequency", "Duration"];

  // Table header
  doc.setFillColor(204, 251, 241);
  doc.rect(14, y, W - 28, 10, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(15, 118, 110);
  headers.forEach((h, i) => doc.text(h, cols[i] + 2, y + 7));
  y += 10;

  const medicines = rx?.medicines || [];
  medicines.forEach((med, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(240, 253, 250);
      doc.rect(14, y, W - 28, 11, "F");
    }
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(15, 23, 42);
    doc.text(med.name      || "—", cols[0] + 2, y + 7.5);
    doc.text(med.dosage    || "—", cols[1] + 2, y + 7.5);
    doc.text(med.frequency || "—", cols[2] + 2, y + 7.5);
    doc.text(med.duration  || "—", cols[3] + 2, y + 7.5);
    y += 11;
  });

  // Table border
  doc.setDrawColor(167, 243, 208); doc.setLineWidth(0.6);
  doc.rect(14, y - medicines.length * 11 - 10, W - 28, medicines.length * 11 + 10, "S");
  y += 10;

  // ── Instructions ──
  if (rx?.instructions) {
    if (y + 30 > 270) { doc.addPage(); y = 20; }
    const lines = doc.splitTextToSize(rx.instructions, W - 52);
    const boxH  = 14 + lines.length * 6;
    doc.setFillColor(255, 251, 235); doc.setDrawColor(253, 230, 138); doc.setLineWidth(0.8);
    doc.roundedRect(14, y, W - 28, boxH, 3, 3, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(146, 64, 14);
    doc.text("INSTRUCTIONS", 20, y + 8);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(15, 23, 42);
    doc.text(lines, 20, y + 15);
    y += boxH + 8;
  }

  // ── Follow-up ──
  if (rx?.followUpDate) {
    if (y + 30 > 270) { doc.addPage(); y = 20; }
    doc.setFillColor(236, 253, 245); doc.setDrawColor(134, 239, 172); doc.setLineWidth(0.8);
    doc.roundedRect(14, y, W - 28, 28, 3, 3, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(21, 128, 61);
    doc.text("FOLLOW-UP DATE", 20, y + 9);
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(15, 23, 42);
    doc.text(rx.followUpDate, 20, y + 20);
    y += 36;
  }

  // ── Badges + prescribed by ──
  if (y + 40 > 270) { doc.addPage(); y = 20; }
  y += 6;
  doc.setFillColor(20, 184, 166);  doc.roundedRect(14, y, 52, 11, 2, 2, "F");
  doc.setFillColor(99, 102, 241);  doc.roundedRect(70, y, 52, 11, 2, 2, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("PRESCRIBED", 40, y + 7.5, { align: "center" });
  doc.text("VERIFIED",   96, y + 7.5, { align: "center" });
  y += 18;

  if (rx?.createdBy) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
    const createdDate = rx.createdAt
      ? new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : printDate;
    doc.text(`Prescribed by: ${rx.createdBy}  ·  ${createdDate}`, 14, y);
    y += 10;
  }

  // ── Footer ──
  y += 4;
  doc.setDrawColor(200, 200, 230); doc.setLineWidth(0.6); doc.line(14, y, W - 14, y);
  doc.setTextColor(148, 163, 184); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
  doc.text("Thank you for choosing Medinex — Your Trusted Healthcare Partner", W / 2, y + 7, { align: "center" });

  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFillColor(20, 184, 166); doc.rect(0, footerY, W, 12, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("MEDINEX  —  Medical Prescription  ·  " + rxId, W / 2, footerY + 8, { align: "center" });

  doc.save(`medinex_rx_${rxId}.pdf`);
};

// ── Prescription View Modal ───────────────────────────────────────────────────
const PrescriptionViewModal = ({ isOpen, appointment, onClose }) => {
  const rx = appointment?.prescription;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="rx-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiFileText size={20} className="text-white"/>
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-base leading-tight">Prescription</p>
                    <p className="text-white/75 text-xs mt-0.5">
                      Dr. {appointment?.docData?.name} · {appointment?.slotDate?.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1
                    bg-white/20 text-white text-[10px] font-bold rounded-full
                    border border-white/30 uppercase tracking-wider">
                    <MdAdminPanelSettings size={11}/> Read Only
                  </span>
                  <button onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <FiX size={16} className="text-white"/>
                  </button>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-200 border-b border-gray-500 flex flex-wrap gap-4 flex-shrink-0">
                {[
                  { label: "Patient", value: appointment?.userData?.name },
                  { label: "Doctor",  value: appointment?.docData?.name },
                  { label: "Date & Time", value: `${appointment?.slotDate?.replace(/_/g, " ")} · ${appointment?.slotTime}` },
                ].map((r, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{r.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{r.value}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-5">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
                  <FaPills size={14} className="text-teal-500"/> Medicines
                </p>
                {rx?.medicines?.length > 0 ? (
                  <div className="rounded-xl border border-gray-600 overflow-hidden mb-5">
                    <div className="grid grid-cols-4 bg-teal-100 border-b border-gray-600 px-3 py-2">
                      {["Medicine", "Dosage", "Frequency", "Duration"].map((h, i) => (
                        <p key={i} className="text-xs font-bold text-teal-700 uppercase tracking-wide">{h}</p>
                      ))}
                    </div>
                    {rx.medicines.map((med, i) => (
                      <div key={i} className={`grid grid-cols-4 px-3 py-2.5 text-sm text-gray-700
                        border-b border-gray-600 last:border-b-0
                        ${i % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>
                        <p className="font-semibold text-gray-900 truncate">{med.name || "—"}</p>
                        <p>{med.dosage    || "—"}</p>
                        <p>{med.frequency || "—"}</p>
                        <p>{med.duration  || "—"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 mb-5 bg-gray-100 rounded-xl border border-dashed border-gray-600">
                    <p className="text-sm text-gray-700">No medicines prescribed</p>
                  </div>
                )}
                {rx?.instructions && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-gray-800 mb-1.5">Instructions</p>
                    <div className="bg-amber-100 border border-amber-600 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                      {rx.instructions}
                    </div>
                  </div>
                )}
                {rx?.followUpDate && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-gray-800 mb-1.5">Follow-up Date</p>
                    <div className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-600 rounded-xl px-4 py-2 text-sm font-semibold text-indigo-700">
                      <FaCalendarAlt size={12}/> {rx.followUpDate}
                    </div>
                  </div>
                )}
                {rx?.createdBy && (
                  <p className="text-xs text-gray-600 mt-4 pt-4 border-t border-gray-400">
                    Prescribed by <span className="font-semibold text-gray-900">{rx.createdBy}</span>
                    {rx.createdAt && (
                      <span> on {new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    )}
                  </p>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-400 flex-shrink-0 bg-white flex gap-3">
                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-600 text-sm font-semibold text-gray-600 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors">
                  Close
                </motion.button>
                {rx?.medicines?.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={() => downloadPrescriptionPDF(appointment)}
                    className="flex-1 inline-flex items-center justify-center gap-2
                      bg-gradient-to-r from-teal-500 to-cyan-600
                      text-white font-bold text-sm py-2.5 rounded-xl
                      shadow-md shadow-teal-200 cursor-pointer">
                    <FaDownload size={13}/> Download Rx
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ cancelled, isCompleted, onCancel, onViewRx, hasPrescription }) => {
  if (cancelled) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1
      bg-red-100 text-red-600 text-xs font-semibold rounded-full border border-red-600">
      <FiXCircle size={11} /> Cancelled
    </span>
  );
  if (isCompleted) return (
    <div className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1
        bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-600">
        <FiCheckCircle size={11} /> Completed
      </span>
      {hasPrescription && (
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onViewRx}
          className="inline-flex items-center gap-1 px-2 py-0.5
            bg-teal-100 text-teal-600 text-[10px] font-semibold
            rounded-full border border-teal-600 cursor-pointer
            hover:bg-teal-200 transition-colors w-fit">
          <FiEye size={10}/> View Rx
        </motion.button>
      )}
    </div>
  );
  return (
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
      onClick={onCancel}
      className="w-8 h-8 rounded-lg bg-red-100 border border-red-600
        flex items-center justify-center cursor-pointer
        hover:bg-red-200 transition-colors duration-150" title="Cancel">
      <FiXCircle size={15} className="text-red-600" />
    </motion.button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const AllApointments = () => {

  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [showClear,  setShowClear]  = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [modalRange, setModalRange] = useState(null);
  const [rxOpen,        setRxOpen]       = useState(false);
  const [rxAppointment, setRxAppointment] = useState(null);

  useEffect(() => {
    if (aToken) getAllAppointments();
  }, [aToken]);

  const openModal = (range) => { setModalRange(range); setShowClear(false); setModalOpen(true); };

  const handleConfirmClear = async () => {
    setModalOpen(false);
    try {
      const { data } = await axiosInstance.delete("/api/admin/clear-appointments", { data: { range: modalRange } });
      if (data.success) { toast.success("History cleared ✅"); getAllAppointments(); }
      else toast.error(data.message);
    } catch { toast.error("Failed to clear history"); }
  };

  const reversed = [...(appointments || [])].reverse();
  const filtered = reversed.filter(item => {
    const patientName = item?.userData?.name?.toLowerCase() || "";
    const doctorName  = item?.docData?.name?.toLowerCase()  || "";
    const matchSearch = patientName.includes(search.toLowerCase()) || doctorName.includes(search.toLowerCase());
    const matchFilter =
      filter === "all"       ? true :
      filter === "completed" ? item.isCompleted :
      filter === "cancelled" ? item.cancelled :
      filter === "pending"   ? (!item.isCompleted && !item.cancelled) : true;
    return matchSearch && matchFilter;
  });

  const FILTERS = ["all", "pending", "completed", "cancelled"];
  const filterColors = {
    all: "bg-indigo-600 text-white", pending: "bg-amber-500 text-white",
    completed: "bg-emerald-500 text-white", cancelled: "bg-red-500 text-white",
  };
  const filterInactive = "bg-white border border-gray-300 text-gray-800 hover:border-indigo-300";
  const gridCols = "grid-cols-[32px_1.6fr_110px_56px_1.6fr_1.6fr_80px_120px]";

  if (!appointments) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent"/>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      <ConfirmModal isOpen={modalOpen} range={modalRange}
        onClose={() => setModalOpen(false)} onConfirm={handleConfirmClear} />

      <PrescriptionViewModal isOpen={rxOpen} appointment={rxAppointment} onClose={() => setRxOpen(false)} />

      {/* ── Heading ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} className="mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
            flex items-center justify-center shadow-lg shadow-blue-200">
            <FiCalendar size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 leading-tight">All Appointments</h1>
            <p className="text-xs sm:text-sm text-gray-900 mt-0.5 flex items-center gap-1">
              <MdVerified size={13} className="text-blue-500" />
              {filtered.length} appointment{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Search ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }} className="mb-3">
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input type="text" placeholder="Search patient or doctor name..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-300
              rounded-xl outline-none focus:border-violet-500 transition-colors
              text-gray-900 placeholder:text-gray-500 shadow-sm" />
        </div>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }} className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <FiFilter size={14} className="text-gray-600 flex-shrink-0" />
          {FILTERS.map(f => (
            <motion.button key={f} onClick={() => setFilter(f)} whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize
                cursor-pointer transition-all duration-200 border
                ${filter === f ? filterColors[f] + " border-transparent shadow-sm" : filterInactive}`}>
              {f}
            </motion.button>
          ))}
          <div className="hidden sm:block flex-1" />
          <div className="relative w-30 sm:w-auto">
            <motion.button onClick={() => setShowClear(p => !p)} whileTap={{ scale: 0.95 }}
              className="w-30 sm:w-auto px-3 py-1.5 rounded-full text-xs font-semibold
                cursor-pointer border border-red-400 text-red-500 bg-white hover:bg-red-100
                transition-colors duration-200 flex items-center justify-center gap-1.5">
              <FiTrash2 size={12} /> Clear History
            </motion.button>
            <AnimatePresence>
              {showClear && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } }}
                  className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+6px)] w-44
                    rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: isDark() ? "#1e293b" : "#ffffff",
                    border: `1px solid ${isDark() ? "#334155" : "#e2e8f0"}`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  }}>
                  {[
                    { label: "Last 7 days",  range: "7days",  danger: false },
                    { label: "Last 30 days", range: "30days", danger: false },
                    { label: "Clear All",    range: "all",    danger: true  },
                  ].map(item => (
                    <button key={item.range} onClick={() => openModal(item.range)}
                      onMouseEnter={e => e.currentTarget.style.background =
                        isDark()
                          ? item.danger ? "rgba(239,68,68,0.18)" : "rgba(99,102,241,0.15)"
                          : item.danger ? "#fce3e3" : "#f1f0ff"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      style={{ background: "transparent", transition: "background 0.15s" }}
                      className={`flex items-center gap-2 w-full px-4 py-2.5
                        text-sm border-none cursor-pointer text-left
                        ${item.danger ? "text-red-500 font-semibold" : isDark() ? "text-slate-300" : "text-gray-700"}`}>
                      <FiTrash2 size={13} /> {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-white rounded-2xl border border-gray-300 shadow-lg shadow-gray-400/60 overflow-hidden">

        {/* Desktop header */}
        <div className={`hidden sm:grid ${gridCols}
          gap-2 px-5 py-3.5 bg-gradient-to-r from-gray-200 to-white
          border-b border-gray-400 text-xs font-bold text-gray-600 uppercase tracking-wider`}>
          <p>#</p>
          <p className="flex items-center gap-1"><FiUser size={11}/> Patient</p>
          <p className="flex items-center gap-1"><FaCreditCard size={11}/> Payment</p>
          <p className="flex items-center gap-1"><FaBirthdayCake size={11}/> Age</p>
          <p className="flex items-center gap-1"><FiClock size={11}/> Date & Time</p>
          <p className="flex items-center gap-1"><FaUserMd size={11}/> Doctor</p>
          <p className="flex items-center gap-1"><FaRupeeSign size={11}/> Fees</p>
          <p>Status</p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence>
            {filtered.map((item, index) => (
              <motion.div
                key={item?._id || index}
                variants={rowVariants} layout
                onMouseEnter={e => e.currentTarget.style.backgroundColor = getAdminHover()}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                style={{ transition: "background-color 0.2s ease" }}
                className="border-b border-gray-400 last:border-b-0"
              >
                {/* Desktop row */}
                <div className={`hidden sm:grid ${gridCols} gap-2 items-center px-5 py-3.5`}>
                  <p className="text-xs font-semibold text-gray-700">{index + 1}</p>

                  {/* Patient with avatar fallback */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={item?.userData?.image}
                        name={item?.userData?.name}
                        size={36}
                        className="border-2 border-gray-200 shadow-sm"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white"/>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{item?.userData?.name}</p>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                    text-xs font-semibold rounded-full border w-fit
                    ${item?.payment ? "bg-blue-100 text-blue-600 border-blue-600" : "bg-amber-100 text-amber-600 border-amber-400"}`}>
                    {item?.payment ? <><FaCreditCard size={10}/> Online</> : <><FaMoneyBillWave size={10}/> Cash</>}
                  </span>

                  <p className="text-sm text-gray-700 font-medium">
                    {item?.userData?.dob && item.userData.dob !== "Not Selected" ? calculateAge(item.userData.dob) : "—"}
                    <span className="text-xs ml-0.5">{item?.userData?.dob && item.userData.dob !== "Not Selected" ? "yrs" : ""}</span>
                  </p>

                  <div className="flex items-center gap-1.5">
                    <FiClock size={12} className="text-indigo-400 flex-shrink-0"/>
                    <p className="text-sm text-gray-700">
                      {slotDateFormat(item?.slotDate)},
                      <span className="font-semibold text-gray-800 ml-1">{item?.slotTime}</span>
                    </p>
                  </div>

                  {/* Doctor with avatar fallback */}
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      src={item?.docData?.image}
                      name={item?.docData?.name}
                      size={36}
                      className="border-2 border-gray-200 shadow-sm"
                    />
                    <p className="text-sm font-medium text-gray-700 truncate">{item?.docData?.name}</p>
                  </div>

                  <p className="text-sm font-bold text-gray-800">{currency}{item?.amount}</p>

                  <StatusBadge
                    cancelled={item?.cancelled}
                    isCompleted={item?.isCompleted}
                    onCancel={() => cancelAppointment(item._id)}
                    onViewRx={() => { setRxAppointment(item); setRxOpen(true); }}
                    hasPrescription={item?.prescription?.medicines?.length > 0}
                  />
                </div>

                {/* Mobile card */}
                <div className="sm:hidden px-4 py-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={item?.userData?.image}
                          name={item?.userData?.name}
                          size={36}
                          className="border-2 border-gray-200 shadow-sm"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white"/>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 leading-tight truncate">{item?.userData?.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <FiClock size={9}/> {slotDateFormat(item?.slotDate)}, {item?.slotTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <StatusBadge
                        cancelled={item?.cancelled}
                        isCompleted={item?.isCompleted}
                        onCancel={() => cancelAppointment(item._id)}
                        onViewRx={() => { setRxAppointment(item); setRxOpen(true); }}
                        hasPrescription={item?.prescription?.medicines?.length > 0}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-0.5">
                    <Avatar src={item?.docData?.image} name={item?.docData?.name} size={24} className="border border-gray-200" />
                    <p className="text-xs font-medium text-gray-600 flex-1 min-w-0 truncate">{item?.docData?.name}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 flex-shrink-0
                      text-[10px] font-semibold rounded-full border
                      ${item?.payment ? "bg-blue-100 text-blue-600 border-blue-600" : "bg-amber-100 text-amber-600 border-amber-600"}`}>
                      {item?.payment ? <><FaCreditCard size={8}/> Online</> : <><FaMoneyBillWave size={8}/> Cash</>}
                    </span>
                    <span className="text-xs font-bold text-gray-800 flex-shrink-0">{currency}{item?.amount}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-3 border border-gray-500">
              <FiCalendar size={24} className="text-gray-700"/>
            </div>
            <p className="text-sm font-semibold text-gray-950">{search ? "No results found" : "No appointments yet"}</p>
            <p className="text-xs text-gray-800 mt-1">
              {search ? `No match for "${search}"` : "Appointments will appear here once booked"}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AllApointments;