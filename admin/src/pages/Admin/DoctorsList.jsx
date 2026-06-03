import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX, FiMail, FiBriefcase, FiMapPin, FiFileText,
  FiCheckCircle, FiXCircle, FiSearch, FiUsers, FiTrash2,
} from "react-icons/fi";
import {
  FaUserMd, FaRupeeSign, FaGraduationCap, FaStethoscope, FaVenusMars,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

// ── animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// ── Single professional speciality badge ──────────────────────────────────────
// Instead of a rainbow of bg-color-100 classes (which look cartoonish and
// clash in dark mode), we use one neutral muted style everywhere.
// The icon color provides enough visual differentiation.
const SpecialityBadge = ({ speciality }) => {
  // Assign a small accent dot color per speciality for subtle identity
  const dotColor = () => {
    if (speciality.includes("General"))    return "#60a5fa"; // blue
    if (speciality.includes("Gynecolog"))  return "#f472b6"; // pink
    if (speciality.includes("Dermatolog")) return "#fb923c"; // orange
    if (speciality.includes("Pediatric"))  return "#34d399"; // emerald
    if (speciality.includes("Neurolog"))   return "#a78bfa"; // violet
    if (speciality.includes("Gastro"))     return "#fbbf24"; // amber
    return "#818cf8"; // indigo default
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1
        text-[10px] font-semibold rounded-full
        border border-slate-200 bg-slate-50 text-slate-600
        dark-badge"
      style={{ letterSpacing: "0.01em" }}
    >
      {/* Accent dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: dotColor() }}
      />
      {speciality}
    </span>
  );
};

// ── Generate doctor description ───────────────────────────────────────────────
const getDoctorDescription = (name, speciality) => {
  const descriptions = {
    "General physician": [
      "A dedicated primary care physician with a holistic approach to patient health. Specializes in preventive care, chronic disease management, and routine check-ups for patients of all ages.",
      "Experienced in diagnosing and treating a wide range of everyday illnesses. Known for a compassionate bedside manner and thorough, patient-centered health evaluations.",
      "Committed to building long-term relationships with patients, focusing on overall wellness, early detection, and lifestyle-based health improvements.",
      "A trusted family doctor with expertise in managing acute and chronic conditions. Provides comprehensive medical care with an emphasis on preventive health and patient education.",
      "Known for a thorough and empathetic approach to primary care. Skilled in diagnosing complex multi-system conditions and coordinating specialist referrals when needed.",
    ],
    "Gynecologist": [
      "A highly experienced women's health specialist providing comprehensive obstetric and gynecological care. Expert in prenatal care, hormonal disorders, and minimally invasive procedures.",
      "Dedicated to empowering women through every stage of life — from adolescence to menopause — with personalized, evidence-based gynecological care.",
      "Specializes in high-risk pregnancies, fertility consultations, and advanced laparoscopic surgeries with a strong focus on patient comfort and safety.",
      "A compassionate gynecologist with expertise in PCOS, endometriosis, and reproductive health. Committed to providing dignified, patient-first women's healthcare.",
    ],
    "Dermatologist": [
      "A board-certified dermatologist with expertise in treating acne, eczema, psoriasis, and skin cancer. Known for combining medical precision with cosmetic dermatology.",
      "Passionate about skin health, offering advanced treatments for both medical conditions and aesthetic concerns including laser therapy and anti-aging solutions.",
      "Specializes in diagnosing complex skin disorders and developing personalized skincare regimens backed by the latest dermatological research.",
      "An expert in pediatric and adult dermatology, with a focus on inflammatory skin conditions, dermatoscopy, and evidence-based aesthetic treatments.",
    ],
    "Pediatricians": [
      "A caring pediatrician dedicated to the health and well-being of infants, children, and adolescents. Expert in developmental milestones, vaccinations, and childhood illnesses.",
      "Known for creating a warm, child-friendly environment where young patients feel at ease. Specializes in newborn care, growth monitoring, and pediatric nutrition.",
      "Committed to partnering with families to ensure every child thrives — from routine wellness visits to managing complex childhood conditions with compassion.",
    ],
    "Neurologist": [
      "A distinguished neurologist specializing in disorders of the brain, spinal cord, and nervous system. Expert in epilepsy, migraines, Parkinson's disease, and stroke management.",
      "Combines cutting-edge diagnostics with compassionate care for patients with neurological conditions. Experienced in EMG, EEG, and advanced neuroimaging interpretation.",
      "Dedicated to improving quality of life for patients with chronic neurological conditions through individualized treatment plans and the latest therapeutic approaches.",
      "Skilled in managing both common and rare neurological disorders, with a special interest in headache medicine, movement disorders, and neuromuscular diseases.",
    ],
    "Gastroenterologist": [
      "An expert gastroenterologist specializing in disorders of the digestive tract, liver, and pancreas. Skilled in endoscopy, colonoscopy, and management of IBD and IBS.",
      "Committed to providing comprehensive digestive health care — from routine screenings to complex gastrointestinal conditions — with a focus on minimally invasive techniques.",
      "Known for meticulous diagnostic workups and patient education around gut health, nutrition, and long-term digestive wellness management.",
    ],
  };
  const list = descriptions[speciality] || [
    `A highly qualified specialist in ${speciality} with extensive clinical experience and a patient-first approach to care.`,
  ];
  const seed = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return list[seed % list.length];
};

// ── Dark-mode-aware dropdown item hover ──────────────────────────────────────
const isDark = () => document.documentElement.classList.contains("dark");
const getDropdownHoverBg  = (danger) =>
  isDark()
    ? danger ? "rgba(239,68,68,0.18)" : "rgba(99,102,241,0.15)"
    : danger ? "#fce3e3"              : "#f1f0ff";

// ─────────────────────────────────────────────────────────────────────────────
const DoctorsList = () => {

  const { doctors, aToken, getAllDoctors, changeAvailability, deleteDoctor } =
    useContext(AdminContext);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (aToken) getAllDoctors();
  }, [aToken]);

  if (!doctors) return (
    <div className="flex items-center justify-center h-64">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent"
      />
    </div>
  );

  const filtered = doctors
    .filter(Boolean)
    .filter(d =>
      d?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d?.speciality?.toLowerCase().includes(search.toLowerCase())
    );

  const handleDelete = async () => {
    await deleteDoctor(selectedDoctor._id);
    setSelectedDoctor(null);
    setConfirmDelete(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* ── Page heading ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
            flex items-center justify-center shadow-lg shadow-indigo-200">
            <FaUserMd size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 leading-tight">
              Doctors List
            </h1>
            <p className="text-xs sm:text-sm text-gray-900 mt-0.5 flex items-center gap-1">
              <MdVerified size={13} className="text-indigo-500" />
              {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or speciality..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-400
              rounded-xl outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100
              transition-colors duration-200 text-gray-900 placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </motion.div>

      {/* ── Doctor Grid ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {filtered.map((item) => (
          <motion.div
            key={item._id}
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => { setSelectedDoctor(item); setConfirmDelete(false); }}
            className="bg-white rounded-2xl border border-gray-300
              shadow-lg shadow-gray-500/50 overflow-hidden cursor-pointer group"
          >
            {/* Image */}
            <div className="w-full aspect-[4/3] overflow-hidden
              bg-gradient-to-br from-slate-100 to-slate-200">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover object-top
                  group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0
                  ${item.available ? "bg-emerald-500" : "bg-red-400"}`} />
                <p className="text-sm font-extrabold text-gray-800 truncate">
                  {item.name}
                </p>
              </div>

              {/* ── Professional single-style badge ── */}
              <SpecialityBadge speciality={item.speciality} />

              <div
                className="flex items-center gap-2 mt-3"
                onClick={e => e.stopPropagation()}
              >
                <div
                  onClick={() => changeAvailability(item._id)}
                  className={`relative w-9 h-5 rounded-full cursor-pointer
                    transition-colors duration-300 flex-shrink-0
                    ${item.available ? "bg-emerald-500" : "bg-slate-400"}`}
                >
                  <motion.div
                    animate={{ x: item.available ? 16 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </div>
                <span className={`text-xs font-semibold
                  ${item.available ? "text-emerald-500" : "text-slate-400"}`}>
                  {item.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-3 border border-gray-500">
            <FiUsers size={24} className="text-gray-700" />
          </div>
          <p className="text-sm font-semibold text-gray-950">No doctors found</p>
          <p className="text-xs text-gray-800 mt-1">
            {search ? `No match for "${search}"` : "Add doctors to see them here"}
          </p>
        </motion.div>
      )}

      {/* ── Doctor Detail Modal ── */}
      <AnimatePresence>
        {selectedDoctor && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => { setSelectedDoctor(null); setConfirmDelete(false); }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            />

            <div className="fixed inset-0 flex items-center justify-center z-[10000] px-4 py-6" onClick={() => { setSelectedDoctor(null); setConfirmDelete(false); }}>
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{
                  opacity: 1, scale: 1, y: 0,
                  transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
                }}
                exit={{
                  opacity: 0, scale: 0.93, y: 10,
                  transition: { duration: 0.18 }
                }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md
                  max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700
                  px-6 pt-6 pb-10">
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedDoctor(null); setConfirmDelete(false); }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20
                      backdrop-blur-sm flex items-center justify-center border border-white/30
                      cursor-pointer hover:bg-white/30 transition-colors z-10"
                  >
                    <FiX size={15} className="text-white" />
                  </motion.button>

                  <div className="flex items-center gap-2 mb-3">
                    <HiSparkles size={12} className="text-white/70" />
                    <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                      Doctor Profile
                    </span>
                    <HiSparkles size={12} className="text-white/70" />
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      className="w-16 h-16 rounded-2xl object-cover object-top
                        border-2 border-white/40 shadow-lg flex-shrink-0"
                    />
                    <div>
                      <p className="text-white font-extrabold text-lg leading-tight">
                        {selectedDoctor.name}
                      </p>
                      {/* Modal header badge — white/semi-transparent on gradient bg */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1.5
                        text-[10px] font-semibold rounded-full
                        bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                        <FaStethoscope size={8} />
                        {selectedDoctor.speciality}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  <div className="flex justify-end mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5
                      text-xs font-bold rounded-full border
                      ${selectedDoctor.available
                        ? "bg-emerald-100 text-emerald-600 border-emerald-400"
                        : "bg-red-100 text-red-500 border-red-400"}`}>
                      {selectedDoctor.available
                        ? <><FiCheckCircle size={11} /> Available</>
                        : <><FiXCircle size={11} /> Unavailable</>}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: FiMail,         label: "Email",      value: selectedDoctor.email },
                      { icon: FaGraduationCap, label: "Degree",    value: selectedDoctor.degree },
                      { icon: FiBriefcase,     label: "Experience", value: selectedDoctor.experience },
                      { icon: FaVenusMars,     label: "Gender",     value: selectedDoctor.gender || "Not Specified" },
                      { icon: FaRupeeSign,     label: "Fees",       value: `₹${selectedDoctor.fees}` },
                      {
                        icon: FiMapPin, label: "Address",
                        value: `${selectedDoctor.address?.line1 || ""}, ${selectedDoctor.address?.line2 || ""}`
                      },
                    ].map((row, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gray-200 border border-gray-300"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600
                          flex items-center justify-center flex-shrink-0 shadow-sm">
                          <row.icon size={12} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">
                            {row.label}
                          </p>
                          <p className="text-sm font-sans text-gray-600 break-words">
                            {row.value}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* About */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-200 border border-gray-300"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600
                        flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FiFileText size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1">
                          About
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedDoctor.about && selectedDoctor.about.trim() !== ""
                            ? selectedDoctor.about
                            : getDoctorDescription(selectedDoctor.name, selectedDoctor.speciality)
                          }
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* ── Delete section ── */}
                  <div className="mt-5 pt-4 border-t border-gray-400">
                    {!confirmDelete ? (
                      <motion.button
                        whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setConfirmDelete(true)}
                        className="w-full py-2.5 rounded-xl text-sm font-bold
                          cursor-pointer border border-red-400 bg-red-100 text-red-500
                          hover:bg-red-200 transition-colors duration-200
                          flex items-center justify-center gap-2"
                      >
                        <FiTrash2 size={14} /> Remove Doctor
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl p-3.5"
                        style={{
                          background: isDark()
                            ? "rgba(239,68,68,0.12)"
                            : "#fee2e2",
                          border: "1px solid rgba(239,68,68,0.4)",
                        }}
                      >
                        <p className="text-sm font-semibold text-red-500 text-center mb-3">
                          Are you sure? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 py-2 rounded-xl text-sm font-semibold
                              cursor-pointer transition-colors"
                            style={{
                              background: isDark() ? "#1e293b" : "#fff",
                              border: isDark() ? "1px solid #475569" : "1px solid #d1d5db",
                              color: isDark() ? "#cbd5e1" : "#374151",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = isDark() ? "#334155" : "#f9fafb"}
                            onMouseLeave={e => e.currentTarget.style.background = isDark() ? "#1e293b" : "#fff"}
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleDelete}
                            className="flex-1 py-2 rounded-xl text-sm font-bold
                              bg-gradient-to-r from-red-500 to-rose-600
                              text-white cursor-pointer border-none
                              flex items-center justify-center gap-1.5
                              shadow-lg shadow-red-200"
                          >
                            <FiTrash2 size={13} /> Yes, Delete
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DoctorsList;