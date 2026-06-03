import React, { useContext } from "react"
import { assets } from "../assets/assets"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { motion } from "framer-motion"
import { FiArrowRight, FiShield, FiClock, FiStar } from "react-icons/fi"
import { FaUserMd, FaStethoscope, FaHeartbeat } from "react-icons/fa"
import { MdVerified } from "react-icons/md"

const Header = () => {
  const navigate = useNavigate()
  const { token } = useContext(AppContext)

  const handleBooking = () => {
    navigate(token ? "/doctors" : "/login")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const stats = [
    { icon: <FaUserMd size={13} />, label: "500+ Doctors", color: "text-indigo-200" },
    { icon: <FiStar size={13} />, label: "4.9★ Rated", color: "text-yellow-300" },
    { icon: <FiShield size={13} />, label: "Verified Only", color: "text-green-300" },
    { icon: <FiClock size={13} />, label: "24/7 Available", color: "text-blue-200" },
  ]

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  }

  const floatingCard = (delay, fromX) => ({
    initial: { opacity: 0, scale: 0.85, x: fromX },
    animate: { opacity: 1, scale: 1, x: 0 },
    transition: { delay, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
  })

  const miniCards = [
    { icon: <MdVerified size={16} className="text-indigo-500" />, bg: "bg-indigo-100", label: "Verified", sub: "500+ Doctors" },
    { icon: <FiStar size={16} className="text-yellow-500" />, bg: "bg-yellow-100", label: "4.9 ★", sub: "Top Rated" },
    { icon: <FiClock size={16} className="text-green-500" />, bg: "bg-green-100", label: "Instant", sub: "Confirmation" },
    { icon: <FaUserMd size={16} className="text-blue-500" />, bg: "bg-blue-100", label: "Online", sub: "24/7 Booking" },
  ]

  return (
    <div className="relative mx-4 md:mx-8 lg:mx-10 mt-8 mb-4 overflow-hidden rounded-3xl">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-600 to-emerald-500 rounded-3xl" />
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-10 md:px-14 lg:px-16 py-10 md:py-12 lg:py-0 gap-6 lg:gap-4">

        {/* ── LEFT TEXT ── */}
        <motion.div
          className="flex-1 flex flex-col items-center lg:items-start gap-5 text-center lg:text-left w-full max-w-lg lg:max-w-none lg:py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 self-center lg:self-start"
          >
            <FaHeartbeat size={13} className="text-red-300 flex-shrink-0" />
            <span className="text-white text-xs font-semibold">
              Trusted by 50,000+ patients across India
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white"
          >
            Book Appointment
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-100 to-white">
              With Trusted Doctors
            </span>
          </motion.h1>

          {/* Avatars + Description */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3">
            <img src={assets.group_profiles} alt="Doctors" className="w-24 sm:w-28 flex-shrink-0" />
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-sm">
              Simply browse through our extensive list of trusted doctors and schedule
              your appointment hassle-free in under 60 seconds.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
            <motion.button
              onClick={handleBooking}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              {token ? "Book Appointment" : "Create Account"}
              <FiArrowRight size={15} />
            </motion.button>
            <motion.button
              onClick={() => navigate("/doctors")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/60 text-white font-semibold text-sm px-5 py-3.5 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <FaStethoscope size={13} /> View Doctors
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={itemVariants}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 justify-center lg:justify-start"
          >
            {stats.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-1.5">
                  <span className={s.color}>{s.icon}</span>
                  <span className="text-white/85 text-xs font-semibold whitespace-nowrap">{s.label}</span>
                </div>
                {i < stats.length - 1 && (
                  <span className="text-white/40 font-bold hidden sm:inline">·</span>
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT — image + floating cards (desktop only, lg+) ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
          className="hidden lg:flex flex-1 justify-end items-end self-end relative"
          style={{ minHeight: '420px' }}
        >
          {/* Doctor image — sits at bottom, no overlap with cards */}
          <motion.img
            src={assets.header_img}
            alt="Doctors"
            className="relative z-10 w-[420px] xl:w-[480px] object-contain object-bottom drop-shadow-2xl"
            style={{ maxHeight: '420px' }}
          />

          {/* Floating cards — positioned relative to the right column, not the image */}

          {/* Card: Verified — left, upper area */}
          <motion.div {...floatingCard(0.8, -16)}
            className="absolute top-1 left-25 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2.5 z-20"
          >
            <div className="w-9 h-9 bg-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <MdVerified size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-gray-900 leading-tight">Verified</p>
              <p className="text-[10px] text-gray-600 font-medium leading-tight">500+ Doctors</p>
            </div>
          </motion.div>

          {/* Card: 4.9★ — left, below Verified (still well above doctors) */}
          <motion.div {...floatingCard(1.0, -16)}
            className="absolute top-[20%] left-8 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2.5 z-20"
          >
            <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiStar size={18} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-gray-900 leading-tight">4.9 ★</p>
              <p className="text-[10px] text-gray-600 font-medium leading-tight">Top Rated</p>
            </div>
          </motion.div>

          {/* Card: Instant — right, upper area */}
          <motion.div {...floatingCard(1.1, 16)}
            className="absolute top-[20%] right-4 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2.5 z-20"
          >
            <div className="w-9 h-9 bg-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiClock size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-gray-900 leading-tight">Instant</p>
              <p className="text-[10px] text-gray-600 font-medium leading-tight">Confirmation</p>
            </div>
          </motion.div>

          {/* Card: Online — top-center, above the doctors */}
          <motion.div {...floatingCard(1.3, 0)}
            className="absolute top-1 right-5 -translate-x-1/2 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2.5 z-20"
          >
            <div className="w-9 h-9 bg-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaUserMd size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-gray-900 leading-tight">Online</p>
              <p className="text-[10px] text-gray-600 font-medium leading-tight">24/7 Booking</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── TABLET (md) — image centered below text, no floating cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="hidden md:flex lg:hidden justify-center w-full"
        >
          <img
            src={assets.header_img}
            alt="Doctors"
            className="w-72 sm:w-80 object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* ── MOBILE — image + 2x2 mini stat cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex md:hidden flex-col items-center gap-4 w-full pb-4"
        >
          {/* Doctor image on mobile */}
          <img
            src={assets.header_img}
            alt="Doctors"
            className="w-56 sm:w-64 object-contain drop-shadow-2xl"
          />

          {/* Mini stat cards grid */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {miniCards.map((c, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/90 rounded-xl px-3 py-2 shadow-md">
                <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-900 leading-tight">{c.label}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default Header