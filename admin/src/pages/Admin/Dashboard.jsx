import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import adminDashAnimation from "../../assets/admindash.json";
import {
  FiUsers, FiCalendar, FiUserCheck, FiList,
  FiCheckCircle, FiXCircle, FiTrendingUp, FiActivity,
} from "react-icons/fi";
import { FaUserMd } from "react-icons/fa";
import { MdVerified, MdAdminPanelSettings } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

const containerVariants = {
  hidden:  {},
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

// Light mode: gray hover, Dark mode: violet tint hover
const getAdminHover = () =>
  isDark() ? "rgba(109, 40, 217, 0.2)" : "#e2e6ea";

const STAT_CARDS = (dashData) => [
  {
    label:  "Total Doctors",
    value:  dashData?.doctors ?? 0,
    icon:   FaUserMd,
    bg:     "bg-gradient-to-br from-blue-500 to-cyan-600",
    shadow: "shadow-blue-200",
    text:   "text-blue-700",
    bar:    "bg-blue-500",
    barW:   Math.min((dashData?.doctors ?? 0) * 10, 100),
  },
  {
    label:  "Appointments",
    value:  dashData?.appointments ?? 0,
    icon:   FiCalendar,
    bg:     "bg-gradient-to-br from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-200",
    text:   "text-emerald-700",
    bar:    "bg-emerald-500",
    barW:   Math.min((dashData?.appointments ?? 0) * 2, 100),
  },
  {
    label:  "Patients",
    value:  dashData?.patients ?? 0,
    icon:   FiUsers,
    bg:     "bg-gradient-to-br from-violet-500 to-indigo-600",
    shadow: "shadow-violet-200",
    text:   "text-violet-700",
    bar:    "bg-violet-500",
    barW:   Math.min((dashData?.patients ?? 0) * 2, 100),
  },
];

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) getDashData();
  }, [aToken]);

  if (!dashData) return null;

  const stats = STAT_CARDS(dashData);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* ── Hero banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl mb-6 sm:mb-8
          bg-gradient-to-br from-blue-900 via-cyan-600 to-indigo-500
          shadow-xl shadow-indigo-200/40"
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none"/>
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none"/>

        <div className="flex items-center justify-between px-5 sm:px-8 py-5 sm:py-6 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <HiSparkles size={14} className="text-white/70"/>
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                Medinex Admin
              </span>
              <HiSparkles size={14} className="text-white/70"/>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm
                flex items-center justify-center shadow-md flex-shrink-0">
                <MdAdminPanelSettings size={20} className="text-white"/>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-none">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-white/80 flex items-center gap-1 mt-1 ml-1">
              <MdVerified size={13} className="text-cyan-300"/>
              Welcome back — here's your overview
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {[
                { label: "Doctors",      value: dashData?.doctors ?? 0 },
                { label: "Appointments", value: dashData?.appointments ?? 0 },
                { label: "Patients",     value: dashData?.patients ?? 0 },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5
                  bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/20">
                  <span className="text-sm font-extrabold text-white">{s.value}</span>
                  <span className="text-xs text-white/70">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-28 sm:w-36 lg:w-44 flex-shrink-0 ml-4 drop-shadow-2xl">
            <Lottie animationData={adminDashAnimation} loop/>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div
        variants={containerVariants} initial="hidden" animate="visible"
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
            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 ${stat.bg}`}/>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg} shadow-md`}>
                <stat.icon size={20} className="text-white"/>
              </div>
              <FiTrendingUp size={16} className="text-gray-400"/>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-1">{stat.value}</p>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${stat.text}`}>
              {stat.label}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.barW}%` }}
                transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                className={`h-1.5 rounded-full ${stat.bar}`}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Activity + Quick Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-300 shadow-lg shadow-gray-400/60 p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500
              flex items-center justify-center shadow-sm">
              <FiActivity size={15} className="text-white"/>
            </div>
            <p className="font-bold text-gray-950">Hospital Activity</p>
          </div>
          {stats.map((stat, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex justify-between text-sm text-gray-800 mb-1.5">
                <span className="font-medium">{stat.label}</span>
                <span className={`font-bold ${stat.text}`}>{stat.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.barW}%` }}
                  transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${stat.bar}`}
                />
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-300 shadow-lg shadow-gray-400/60 p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600
              flex items-center justify-center shadow-sm">
              <FiUserCheck size={15} className="text-white"/>
            </div>
            <p className="font-bold text-gray-950">Quick Stats</p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Total Doctors",      value: dashData?.doctors,      icon: FaUserMd,   color: "text-blue-600",    bg: "bg-blue-100" },
              { label: "Total Patients",     value: dashData?.patients,     icon: FiUsers,    color: "text-violet-600",  bg: "bg-violet-100" },
              { label: "Total Appointments", value: dashData?.appointments, icon: FiCalendar, color: "text-emerald-600", bg: "bg-emerald-100" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className={`flex items-center justify-between p-3.5 rounded-xl ${item.bg}`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon size={15} className={item.color}/>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className={`text-base font-extrabold ${item.color}`}>{item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Latest bookings ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="bg-white rounded-2xl border border-gray-300 shadow-lg shadow-gray-400/60 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4
          border-b border-gray-400 bg-gradient-to-r from-gray-200 to-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500
            flex items-center justify-center shadow-sm">
            <FiList size={15} className="text-white"/>
          </div>
          <div>
            <p className="font-bold text-gray-950 text-sm sm:text-base">Latest Bookings</p>
            <p className="text-xs text-gray-800">Most recent appointments</p>
          </div>
          <span className="ml-auto text-xs font-semibold bg-blue-50 text-blue-600
            px-2.5 py-1 rounded-full border border-blue-600">
            {dashData?.latestAppointments?.length ?? 0} total
          </span>
        </div>

        {/* Rows */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {[...dashData.latestAppointments].reverse().map((item, index) => (
            <motion.div
              key={item?._id || index}
              variants={rowVariants}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = getAdminHover();
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              style={{ transition: "background-color 0.2s ease" }}
              className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-3.5
                border-b border-gray-400 last:border-b-0"
            >
              {/* Doctor image with fallback */}
              <div className="relative flex-shrink-0">
                {item?.docData?.image ? (
                  <img
                    src={item.docData.image}
                    alt="doctor"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover
                      border-2 border-gray-200 shadow-sm"
                    onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                  />
                ) : null}
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full
                    bg-gradient-to-br from-indigo-400 to-violet-500
                    border-2 border-gray-200 shadow-sm
                    items-center justify-center"
                  style={{ display: item?.docData?.image ? "none" : "flex" }}
                >
                  <FaUserMd size={16} className="text-white"/>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5
                  rounded-full bg-blue-500 border-2 border-white"/>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-950 truncate">
                  {item?.docData?.name}
                </p>
                <p className="text-xs text-gray-900 flex items-center gap-1 mt-0.5">
                  <FiCalendar size={10}/>
                  {slotDateFormat(item?.slotDate)}
                </p>
              </div>

              {/* Status */}
              <div className="flex-shrink-0">
                {item?.cancelled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                    bg-red-100 text-red-600 text-xs font-semibold rounded-full border border-red-500">
                    <FiXCircle size={11}/> Cancelled
                  </span>
                ) : item?.isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                    bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-500">
                    <FiCheckCircle size={11}/> Completed
                  </span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={() => cancelAppointment(item._id)}
                    className="w-8 h-8 rounded-lg bg-red-100 border border-red-500
                      flex items-center justify-center cursor-pointer
                      hover:bg-red-200 transition-colors duration-150"
                    title="Cancel"
                  >
                    <FiXCircle size={15} className="text-red-600"/>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {(!dashData?.latestAppointments || dashData.latestAppointments.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-3 border border-gray-500">
              <FiCalendar size={24} className="text-gray-700"/>
            </div>
            <p className="text-sm font-semibold text-gray-950">No bookings yet</p>
            <p className="text-xs text-gray-800 mt-1">Latest appointments will appear here</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;