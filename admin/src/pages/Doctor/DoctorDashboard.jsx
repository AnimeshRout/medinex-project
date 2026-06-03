import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import doctorDashAnimation from "../../assets/doctordash.json";
import {
  FiCalendar, FiUsers, FiList,
  FiCheckCircle, FiXCircle, FiClock, FiTrendingUp,
} from "react-icons/fi";
import { FaUserMd, FaRupeeSign } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

// ── animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const rowVariants = {
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const isDark = () => document.documentElement.classList.contains("dark");
// Doctor: gray in light, green tint in dark
const getDoctorHover = () => isDark() ? "rgba(16, 185, 129, 0.15)" : "#f8faff";

// ── stat card config ──────────────────────────────────────────────────────────
const STAT_CARDS = (currency, dashData) => [
  {
    label:  "Total Earnings",
    value:  `₹${dashData?.earnings ?? 0}`,
    icon:   FaRupeeSign,
    bg:     "bg-gradient-to-br from-emerald-500 to-teal-600",
    light:  "bg-emerald-50",
    text:   "text-emerald-700",
    shadow: "shadow-emerald-200",
  },
  {
    label:  "Appointments",
    value:  dashData?.appointments ?? 0,
    icon:   FiCalendar,
    bg:     "bg-gradient-to-br from-blue-500 to-cyan-600",
    light:  "bg-blue-50",
    text:   "text-blue-700",
    shadow: "shadow-blue-200",
  },
  {
    label:  "Patients",
    value:  dashData?.patients ?? 0,
    icon:   FiUsers,
    bg:     "bg-gradient-to-br from-violet-500 to-indigo-600",
    light:  "bg-violet-50",
    text:   "text-violet-700",
    shadow: "shadow-violet-200",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
const DoctorDashboard = () => {
  const {
    dToken, dashData, getDashData,
    completeAppointment, cancelAppointment,
  } = useContext(DoctorContext);

  const { currency, slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (dToken) getDashData();
  }, [dToken, getDashData]);

  if (!dashData) return null;

  const stats = STAT_CARDS(currency, dashData);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* ── Hero banner with Lottie ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl mb-6 sm:mb-8
          bg-gradient-to-br from-blue-900 via-cyan-600 to-emerald-500
          shadow-xl shadow-cyan-200/40"
      >
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full
          bg-white/10 pointer-events-none"/>
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full
          bg-white/10 pointer-events-none"/>

        <div className="flex items-center justify-between px-5 sm:px-8 py-5 sm:py-6 relative z-10">

          {/* Left text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <HiSparkles size={14} className="text-white/70"/>
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                Medinex Professional
              </span>
              <HiSparkles size={14} className="text-white/70"/>
            </div>

            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm
                flex items-center justify-center shadow-md flex-shrink-0 mt-1">
                <FaUserMd size={18} className="text-white"/>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-none">
                Doctor Dashboard
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-white/80 flex items-center gap-1 mt-1 ml-13">
              <MdVerified size={13} className="text-teal-300"/>
              Welcome back — here's your overview
            </p>

            {/* quick stats strip */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {[
                { label: "Earnings",     value: `₹${dashData?.earnings ?? 0}` },
                { label: "Appointments", value: dashData?.appointments ?? 0 },
                { label: "Patients",     value: dashData?.patients ?? 0 },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5
                  bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5
                  border border-white/20">
                  <span className="text-sm font-extrabold text-white">{s.value}</span>
                  <span className="text-xs text-white/70">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lottie animation */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-28 sm:w-36 lg:w-44 flex-shrink-0 ml-4 drop-shadow-2xl"
          >
            <Lottie animationData={doctorDashAnimation} loop/>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden bg-white rounded-2xl p-5
              border border-gray-300 shadow-lg ${stat.shadow} cursor-pointer`}
          >
            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full
              opacity-10 ${stat.bg}`}/>

            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                ${stat.bg} shadow-md`}>
                <stat.icon size={20} className="text-white"/>
              </div>
              <FiTrendingUp size={16} className="text-gray-300"/>
            </div>

            <p className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-1">
              {stat.value}
            </p>
            <p className={`text-xs font-semibold uppercase tracking-wider ${stat.text}`}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Latest bookings ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-300
          shadow-lg shadow-gray-400/60 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4
          border-b border-gray-400 bg-gradient-to-r from-gray-200 to-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500
            flex items-center justify-center shadow-sm">
            <FiList size={15} className="text-white"/>
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm sm:text-base">Latest Bookings</p>
            <p className="text-xs text-gray-900">Your most recent appointments</p>
          </div>
          <span className="ml-auto text-xs font-semibold bg-blue-50 text-blue-600
            px-2.5 py-1 rounded-full border border-blue-400">
            {dashData?.latestAppointments?.length ?? 0} total
          </span>
        </div>

        {/* Rows */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {dashData?.latestAppointments?.map((item, index) => (
            <motion.div
              key={item?._id || index}
              variants={rowVariants}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = getDoctorHover();
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-3.5
                border-b border-gray-300 last:border-b-0"
              style={{ transition: "background-color 0.15s ease" }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={item?.userData?.image}
                  alt="patient"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover
                    border-2 border-gray-600 shadow-sm"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5
                  rounded-full bg-green-400 border-2 border-white"/>
              </div>

              {/* Patient info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {item?.userData?.name}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <FiClock size={10}/>
                  {slotDateFormat(item?.slotDate)}
                </p>
              </div>

              {/* Status / actions */}
              <div className="flex-shrink-0">
                {item?.cancelled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                    bg-red-100 text-red-500 text-xs font-semibold rounded-full
                    border border-red-400">
                    <FiXCircle size={11}/> Cancelled
                  </span>
                ) : item?.isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                    bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full
                    border border-emerald-400">
                    <FiCheckCircle size={11}/> Completed
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => cancelAppointment(item._id)}
                      className="w-8 h-8 rounded-lg bg-red-100 border border-red-400
                        flex items-center justify-center cursor-pointer
                        hover:bg-red-200 transition-colors duration-150"
                      title="Cancel"
                    >
                      <FiXCircle size={15} className="text-red-500"/>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => completeAppointment(item._id)}
                      className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-400
                        flex items-center justify-center cursor-pointer
                        hover:bg-emerald-200 transition-colors duration-150"
                      title="Complete"
                    >
                      <FiCheckCircle size={15} className="text-emerald-500"/>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state */}
        {(!dashData?.latestAppointments || dashData.latestAppointments.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center
              justify-center mb-3 border border-gray-500">
              <FiCalendar size={24} className="text-gray-700"/>
            </div>
            <p className="text-sm font-semibold text-gray-950">No bookings yet</p>
            <p className="text-xs text-gray-800 mt-1">
              Your latest appointments will appear here
            </p>
          </div>
        )}
      </motion.div>

    </div>
  );
};

export default DoctorDashboard;