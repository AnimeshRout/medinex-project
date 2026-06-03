import React, { useContext } from "react"
import { assets } from "../assets/assets"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { motion } from "framer-motion"
import { FiArrowRight, FiCalendar, FiInfo } from "react-icons/fi"
import { FaUserMd, FaHeartbeat, FaStar } from "react-icons/fa"
import { MdVerified } from "react-icons/md"

const Banner = () => {
  const navigate = useNavigate()
  const { token } = useContext(AppContext)

  const handleClick = () => {
    navigate(token ? "/doctors" : "/login")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const features = [
    { icon: <FaUserMd size={14} />, text: "100+ Doctors" },
    { icon: <MdVerified size={14} />, text: "Verified Only" },
    { icon: <FaStar size={14} />, text: "4.9★ Rated" },
    { icon: <FiCalendar size={14} />, text: "Instant Booking" },
  ]

  return (
    <div className="relative overflow-hidden mx-4 md:mx-8 lg:mx-10 my-16">

      {/* Background */}

      {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 rounded-3xl" />
      <div className="absolute -top-10 -left-10 w-52 h-52 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-1/3 w-32 h-32 bg-blue-300/10 rounded-full blur-xl pointer-events-none" /> */}

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-600 to-emerald-500 rounded-3xl" />
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 md:px-14 lg:px-16 py-10 md:py-14 gap-8 md:gap-6">

        {/* ── LEFT ── */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-5"
        >

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-4 py-1.5"
          >
            <FaHeartbeat size={13} className="text-red-300" />
            <span className="text-white text-xs font-semibold">
              Your Health, Our Priority 🏥
            </span>
          </motion.div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Book Appointment
            </h2>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              With Trusted Doctors ✨
            </h2>
          </div>

          <p className="text-white/80 text-sm sm:text-base max-w-sm leading-relaxed">
            Skip the waiting room. Find the right specialist, book instantly
            and get the care you deserve — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1.5"
              >
                <span className="text-white/80">{f.icon}</span>
                <span className="text-white text-xs font-semibold">{f.text}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mt-1">
            <motion.button
              onClick={handleClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              {token ? "Book Appointment" : "Create Account"}
              <FiArrowRight size={15} />
            </motion.button>
            <motion.button
              onClick={() => {
                navigate("/about")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/60 text-white font-semibold text-sm px-6 py-3.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <FiInfo size={15} className="flex-shrink-0" /> Learn More
            </motion.button>
          </div>

        </motion.div>

        {/* ── RIGHT IMAGE ── */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
          className="flex-1 flex justify-center md:justify-end relative"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-white/8 rounded-3xl blur-2xl pointer-events-none" />

          <motion.img
            src={assets.appointment_img}
            alt="Doctor Appointment"
            className="relative z-10 w-56 sm:w-64 md:w-72 lg:w-80 xl:w-96 object-contain drop-shadow-2xl"
            whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
          />
        </motion.div>

      </div>
    </div>
  )
}

export default Banner