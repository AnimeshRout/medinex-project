import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axiosInstance from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar, FiUser, FiClock,
  FiCheckCircle, FiXCircle, FiSearch, FiFilter, FiTrash2, FiAlertTriangle,
  FiPlus, FiMinus, FiFileText, FiX,
} from "react-icons/fi";
import {
  FaCreditCard, FaMoneyBillWave, FaBirthdayCake, FaRupeeSign, FaPills,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

// ── animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const isDark = () => document.documentElement.classList.contains("dark");
const getDoctorHover = () => isDark() ? "rgba(16, 185, 129, 0.15)" : "#e2e6ea";

// ── Avatar helpers (same as AllAppointments admin) ────────────────────────────
const AVATAR_COLORS = [
  ["#6366f1", "#4338ca"],
  ["#8b5cf6", "#6d28d9"],
  ["#ec4899", "#be185d"],
  ["#14b8a6", "#0f766e"],
  ["#f59e0b", "#b45309"],
  ["#10b981", "#047857"],
  ["#3b82f6", "#1d4ed8"],
  ["#ef4444", "#b91c1c"],
];

const getAvatarColors = (name = "") => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const getInitial = (name = "") => (name?.trim()?.[0] || "?").toUpperCase();

const bustCache = (url) => {
  if (!url || url.startsWith("blob:") || url.startsWith("data:")) return null;
  try {
    const u = new URL(url);
    u.searchParams.set("t", Math.floor(Date.now() / 60000));
    return u.toString();
  } catch {
    return url;
  }
};

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
  "7days": {
    title: "Clear Last 7 Days",
    desc: "This will permanently delete all cancelled appointments from the last 7 days.",
  },
  "30days": {
    title: "Clear Last 30 Days",
    desc: "This will permanently delete all cancelled appointments from the last 30 days.",
  },
  "all": {
    title: "Clear All History",
    desc: "This will permanently delete ALL cancelled appointment history. This cannot be undone.",
  },
};

const ConfirmModal = ({ isOpen, range, onClose, onConfirm }) => {
  const info = RANGE_INFO[range] || {};

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.25 }}
                className="px-6 py-5"
              >
                <div className="flex items-start gap-3 bg-red-100 border border-red-400 rounded-xl p-3.5 mb-5">
                  <FiTrash2 size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-900 leading-relaxed">{info.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-gray-400 text-sm font-semibold text-gray-900 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1, boxShadow: "0 8px 20px rgba(239,68,68,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onConfirm}
                    className="flex-1 py-2.5 rounded-xl border-none bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold cursor-pointer shadow-lg shadow-red-200 flex items-center justify-center gap-2"
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

// ── Prescription Modal ────────────────────────────────────────────────────────
const EMPTY_MEDICINE = { name: "", dosage: "", frequency: "", duration: "" };

const PrescriptionModal = ({ isOpen, appointment, onClose, onSaved }) => {
  const [medicines, setMedicines]       = useState([{ ...EMPTY_MEDICINE }]);
  const [instructions, setInstructions] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    if (appointment?.prescription?.medicines?.length > 0) {
      setMedicines(appointment.prescription.medicines);
      setInstructions(appointment.prescription.instructions || "");
      setFollowUpDate(appointment.prescription.followUpDate || "");
    } else {
      setMedicines([{ ...EMPTY_MEDICINE }]);
      setInstructions("");
      setFollowUpDate("");
    }
  }, [appointment]);

  const addMedicine    = () => setMedicines(p => [...p, { ...EMPTY_MEDICINE }]);
  const removeMedicine = (i) => setMedicines(p => p.filter((_, idx) => idx !== i));
  const updateMedicine = (i, field, value) =>
    setMedicines(p => p.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const handleSave = async () => {
    if (medicines.some(m => !m.name.trim())) {
      toast.error("Please fill medicine name for all rows");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/doctor/add-prescription", {
        appointmentId: appointment._id,
        medicines,
        instructions,
        followUpDate,
      });
      if (data.success) {
        toast.success("Prescription saved ✅");
        onSaved();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to save prescription");
    }
    setLoading(false);
  };

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
              key="Prescription-modal"
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
              exit={{ opacity: 0, scale: 0.93, y: 10, transition: { duration: 0.18 } }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiFileText size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-base leading-tight">Add Prescription</p>
                    <p className="text-white/75 text-xs mt-0.5">
                      {appointment?.userData?.name} · {appointment?.slotDate}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                  <FiX size={16} className="text-white" />
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="overflow-y-auto flex-1 px-6 py-5">

                {/* Medicines */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <FaPills size={14} className="text-teal-500" /> Medicines
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={addMedicine}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                        bg-teal-100 text-teal-600 text-xs font-semibold border border-teal-600
                        cursor-pointer hover:bg-teal-200 transition-colors"
                    >
                      <FiPlus size={12} /> Add Medicine
                    </motion.button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {medicines.map((med, i) => (
                      <div key={i} className="bg-gray-100 rounded-xl p-3 border border-gray-400">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide mb-1">Medicine Name</p>
                            <input
                              placeholder="e.g. Paracetamol"
                              value={med.name}
                              onChange={e => updateMedicine(i, "name", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-400 text-sm outline-none focus:border-teal-500 bg-white text-gray-800 transition-colors"
                            />
                          </div>
                          <button
                            onClick={() => removeMedicine(i)}
                            disabled={medicines.length === 1}
                            className="w-7 h-7 mt-4 rounded-lg bg-red-100 border border-red-500 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-red-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <FiMinus size={12} className="text-red-500" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide mb-1">Dosage</p>
                            <input
                              placeholder="500mg"
                              value={med.dosage}
                              onChange={e => updateMedicine(i, "dosage", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-400 text-sm outline-none focus:border-teal-500 bg-white text-gray-800 transition-colors"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide mb-1">Frequency</p>
                            <input
                              placeholder="Twice a day"
                              value={med.frequency}
                              onChange={e => updateMedicine(i, "frequency", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-400 text-sm outline-none focus:border-teal-500 bg-white text-gray-800 transition-colors"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wide mb-1">Duration</p>
                            <input
                              placeholder="5 days"
                              value={med.duration}
                              onChange={e => updateMedicine(i, "duration", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-400 text-sm outline-none focus:border-teal-500 bg-white text-gray-800 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-800 mb-2">Instructions</p>
                  <textarea
                    placeholder="e.g. Take after food. Avoid cold drinks."
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-400 text-sm outline-none focus:border-teal-500 bg-gray-100 text-gray-800 resize-none transition-colors"
                  />
                </div>

                {/* Follow-up date */}
                <div className="mb-2">
                  <p className="text-sm font-bold text-gray-800 mb-2">Follow-up Date <span className="text-gray-600 font-normal">(optional)</span></p>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-gray-400 text-sm outline-none focus:border-teal-400 bg-gray-100 text-gray-800 transition-colors"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-400 flex-shrink-0 bg-white">
                <motion.button
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-500 text-sm font-semibold text-gray-700 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ y: -1, boxShadow: "0 8px 20px rgba(20,184,166,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl border-none bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-bold cursor-pointer shadow-lg shadow-teal-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? "Saving..." : <><FiFileText size={14} /> Save Prescription</>}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ cancelled, cancelledBy, isCompleted, onCancel, onComplete, onPrescription, hasPrescription }) => {
  if (cancelled) return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1
        bg-red-100 text-red-500 text-xs font-semibold rounded-full border border-red-500">
        <FiXCircle size={11} /> Cancelled
      </span>
      {cancelledBy === "doctor" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5
          bg-orange-100 text-orange-500 text-[10px] font-semibold
          rounded-full border border-orange-500">
          by Doctor
        </span>
      )}
    </div>
  );
  if (isCompleted) return (
    <div className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1
        bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-500">
        <FiCheckCircle size={11} /> Completed
      </span>
      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={onPrescription}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold
          rounded-full border cursor-pointer transition-colors
          ${hasPrescription
            ? "bg-teal-100 text-teal-600 border-teal-500 hover:bg-teal-200"
            : "bg-indigo-100 text-indigo-600 border-indigo-500 hover:bg-indigo-200"
          }`}
      >
        <FiFileText size={10} />
        {hasPrescription ? "Edit Prescription" : "Add Prescription"}
      </motion.button>
    </div>
  );
  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={onCancel}
        className="w-8 h-8 rounded-lg bg-red-100 border border-red-500
          flex items-center justify-center cursor-pointer
          hover:bg-red-200 transition-colors duration-150"
        title="Cancel"
      >
        <FiXCircle size={15} className="text-red-500" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={onComplete}
        className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-500
          flex items-center justify-center cursor-pointer
          hover:bg-emerald-200 transition-colors duration-150"
        title="Complete"
      >
        <FiCheckCircle size={15} className="text-emerald-500" />
      </motion.button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const DoctorAppointments = () => {
  const {
    dToken, appointments, getAppointments,
    completeAppointment, cancelAppointment,
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState("all");
  const [showClear, setShowClear]   = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalRange, setModalRange] = useState(null);

  const [rxOpen, setRxOpen]               = useState(false);
  const [rxAppointment, setRxAppointment] = useState(null);

  useEffect(() => {
    if (dToken) getAppointments();
  }, [dToken]);

  const openModal = (range) => {
    setModalRange(range);
    setShowClear(false);
    setModalOpen(true);
  };

  const handleConfirmClear = async () => {
    setModalOpen(false);
    try {
      const { data } = await axiosInstance.delete("/api/doctor/clear-appointments", {
        data: { range: modalRange }
      });
      if (data.success) {
        toast.success("History cleared ✅");
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const openPrescription = (item) => {
    setRxAppointment(item);
    setRxOpen(true);
  };

  const reversed = [...(appointments || [])].reverse();

  const filtered = reversed.filter(item => {
    const name = item?.userData?.name?.toLowerCase() || "";
    const matchSearch = name.includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
        filter === "completed" ? item.isCompleted :
          filter === "cancelled" ? item.cancelled :
            filter === "pending" ? (!item.isCompleted && !item.cancelled) : true;
    return matchSearch && matchFilter;
  });

  const FILTERS = ["all", "pending", "completed", "cancelled"];
  const filterColors = {
    all: "bg-indigo-600 text-white",
    pending: "bg-amber-500 text-white",
    completed: "bg-emerald-500 text-white",
    cancelled: "bg-red-500 text-white",
  };
  const filterInactive = "bg-white border border-gray-400 text-gray-600 hover:border-indigo-300";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        isOpen={modalOpen}
        range={modalRange}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmClear}
      />

      {/* ── Prescription Modal ── */}
      <PrescriptionModal
        isOpen={rxOpen}
        appointment={rxAppointment}
        onClose={() => setRxOpen(false)}
        onSaved={() => getAppointments()}
      />

      {/* ── Page heading ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600
            flex items-center justify-center shadow-lg shadow-teal-200">
            <FiCalendar size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 leading-tight">
              All Appointments
            </h1>
            <p className="text-xs sm:text-sm text-gray-900 mt-0.5 flex items-center gap-1">
              <MdVerified size={13} className="text-teal-500" />
              {filtered.length} appointment{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Search + Filter bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-5"
      >
        <div className="relative flex-1">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search patient name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-300
              rounded-xl outline-none focus:border-emerald-500 transition-colors duration-200
              text-gray-700 placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter size={14} className="text-gray-900 flex-shrink-0" />
          {FILTERS.map(f => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize
                cursor-pointer transition-all duration-200 border
                ${filter === f ? filterColors[f] + " border-transparent shadow-sm" : filterInactive}`}
            >
              {f}
            </motion.button>
          ))}

          <div className="relative">
            <motion.button
              onClick={() => setShowClear(p => !p)}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer
                border border-red-400 text-red-500 bg-white hover:bg-red-100
                transition-colors duration-200 flex items-center gap-1.5"
            >
              <FiTrash2 size={12} /> Clear History
            </motion.button>

            <AnimatePresence>
              {showClear && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.15, ease: "easeOut" } }}
                  exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } }}
                  className="absolute left-0 top-[calc(100%+6px)] w-44 rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: isDark() ? "#1e293b" : "#ffffff",
                    border: `1px solid ${isDark() ? "#334155" : "#e2e8f0"}`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  }}
                >
                  {[
                    { label: "Last 7 days",  range: "7days",  danger: false },
                    { label: "Last 30 days", range: "30days", danger: false },
                    { label: "Clear All",    range: "all",    danger: true  },
                  ].map(item => (
                    <button
                      key={item.range}
                      onClick={() => openModal(item.range)}
                      onMouseEnter={e => e.currentTarget.style.background =
                        isDark()
                          ? item.danger ? "rgba(239,68,68,0.18)" : "rgba(20,184,166,0.15)"
                          : item.danger ? "#fce3e3" : "#f0fdf9"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      style={{ background: "transparent", transition: "background 0.15s" }}
                      className={`flex items-center gap-2 w-full px-4 py-2.5
                        text-sm border-none cursor-pointer text-left
                        ${item.danger ? "text-red-500 font-semibold" : isDark() ? "text-slate-300" : "text-gray-700"}`}
                    >
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-white rounded-2xl border border-gray-300
          shadow-lg shadow-gray-400/60 overflow-hidden"
      >
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-[0.4fr_2fr_0.8fr_0.6fr_2fr_0.8fr_1fr]
          gap-2 px-5 py-3.5 bg-gradient-to-r from-gray-200 to-white
          border-b border-gray-400 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <p className="text-gray-600">#</p>
          <p className="flex items-center gap-1"><FiUser size={11} className="text-gray-600" /> Patient</p>
          <p className="flex items-center gap-1"><FaCreditCard size={11} className="text-gray-600" /> Payment</p>
          <p className="flex items-center gap-1"><FaBirthdayCake size={11} className="text-gray-700" /> Age</p>
          <p className="flex items-center gap-1"><FiClock size={11} className="text-gray-600" /> Date & Time</p>
          <p className="flex items-center gap-1"><FaRupeeSign size={11} className="text-gray-600" /> Fees</p>
          <p className="text-gray-600">Action</p>
        </div>

        {/* Rows */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence>
            {filtered.map((item, index) => (
              <motion.div
                key={item._id || index}
                variants={rowVariants}
                layout
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = getDoctorHover();
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                className="grid grid-cols-1 sm:grid-cols-[0.4fr_2fr_0.8fr_0.6fr_2fr_0.8fr_1fr]
                  gap-2 sm:gap-2 items-center px-5 py-3.5
                  border-b border-gray-400 last:border-b-0"
                style={{ transition: "background-color 0.2s ease" }}
              >
                {/* # */}
                <p className="hidden sm:block text-xs font-semibold text-gray-700">
                  {index + 1}
                </p>

                {/* Patient — Avatar with colored initial fallback */}
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={item?.userData?.image}
                      name={item?.userData?.name}
                      size={36}
                      className="border-2 border-gray-200 shadow-sm"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                      rounded-full bg-green-400 border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item?.userData?.name}</p>
                    <p className="text-xs text-gray-700 sm:hidden">
                      {slotDateFormat(item?.slotDate)}, {item?.slotTime}
                    </p>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                    text-xs font-semibold rounded-full border
                    ${item?.payment
                      ? "bg-blue-100 text-blue-600 border-blue-400"
                      : "bg-amber-100 text-amber-600 border-amber-400"}`}>
                    {item?.payment
                      ? <><FaCreditCard size={10} /> Online</>
                      : <><FaMoneyBillWave size={10} /> Cash</>}
                  </span>
                </div>

                {/* Age */}
                <p className="hidden sm:block text-sm text-gray-900 font-medium">
                  {item?.userData?.dob ? calculateAge(item?.userData?.dob) : "—"}
                  <span className="text-xs text-gray-900 ml-0.5">
                    {item?.userData?.dob ? "yrs" : ""}
                  </span>
                </p>

                {/* Date & Time */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <FiClock size={12} className="text-indigo-400 flex-shrink-0" />
                  <p className="text-sm text-gray-900">
                    {slotDateFormat(item?.slotDate)},
                    <span className="font-semibold text-gray-900 ml-1">{item?.slotTime}</span>
                  </p>
                </div>

                {/* Fees */}
                <p className="text-sm font-bold text-gray-800">
                  {currency}{item?.amount}
                </p>

                {/* Action */}
                <StatusBadge
                  cancelled={item?.cancelled}
                  cancelledBy={item?.cancelledBy}
                  isCompleted={item?.isCompleted}
                  onCancel={() => cancelAppointment(item._id)}
                  onComplete={() => completeAppointment(item._id)}
                  onPrescription={() => openPrescription(item)}
                  hasPrescription={item?.prescription?.medicines?.length > 0}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-3 border border-gray-500">
              <FiCalendar size={24} className="text-gray-700" />
            </div>
            <p className="text-sm font-semibold text-gray-950">
              {search ? "No results found" : "No appointments yet"}
            </p>
            <p className="text-xs text-gray-800 mt-1">
              {search ? `No patient matching "${search}"` : "Appointments will appear here once booked"}
            </p>
          </motion.div>
        )}
      </motion.div>

    </div>
  );
};

export default DoctorAppointments;