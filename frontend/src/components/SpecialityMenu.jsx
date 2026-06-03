import React from "react"
import { specialityData } from "../assets/assets"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FiArrowRight } from "react-icons/fi"
import { FaStethoscope } from "react-icons/fa"
import { MdOutlineLocalHospital } from "react-icons/md"

const cardColors = [
  { bg: "from-indigo-100 to-blue-50", border: "border-indigo-200", iconBg: "bg-indigo-100", text: "text-indigo-700", viewBg: "bg-indigo-600" },
  { bg: "from-violet-100 to-purple-50", border: "border-violet-200", iconBg: "bg-violet-100", text: "text-violet-700", viewBg: "bg-violet-600" },
  { bg: "from-pink-100 to-rose-50", border: "border-pink-200", iconBg: "bg-pink-100", text: "text-pink-700", viewBg: "bg-pink-600" },
  { bg: "from-sky-100 to-cyan-50", border: "border-sky-200", iconBg: "bg-sky-100", text: "text-sky-700", viewBg: "bg-sky-600" },
  { bg: "from-emerald-100 to-green-50", border: "border-emerald-200", iconBg: "bg-emerald-100", text: "text-emerald-700", viewBg: "bg-emerald-600" },
  { bg: "from-amber-100 to-yellow-50", border: "border-amber-200", iconBg: "bg-amber-100", text: "text-amber-700", viewBg: "bg-amber-600" },
]

const Card = ({ item, c, mobile = false }) => (
  <Link
    to={`/doctors/${item.speciality}`}
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    className={`flex flex-col items-center justify-between
      bg-gradient-to-br ${c.bg} border-2 ${c.border}
      rounded-2xl shadow-sm
      hover:shadow-xl hover:shadow-black/15
      transition-shadow cursor-pointer group
      ${mobile ? "w-full h-full py-5 px-3" : "min-w-[148px] h-full py-5 px-4"}`}
  >
    <div className={`${c.iconBg} border-2 ${c.border} ${mobile ? "p-3" : "p-3.5"} rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
      <img
        className={`${mobile ? "w-10" : "w-12"} object-contain`}
        src={item.image}
        alt={item.speciality}
      />
    </div>
    <p className={`${mobile ? "text-xs" : "text-sm"} font-bold ${c.text} text-center leading-tight mb-3`}>
      {item.speciality}
    </p>
    <div className={`${c.viewBg} text-white rounded-full px-3 py-1 flex items-center gap-1 text-xs font-bold group-hover:gap-2 transition-all duration-200`}>
      View <FiArrowRight size={12} />
    </div>
  </Link>
)

const SpecialityMenu = () => {
  if (!specialityData?.length) return null

  return (
    <div id="speciality" className="flex flex-col items-center gap-6 py-16 px-4 max-w-7xl mx-auto">

      {/* ── HEADING ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-400 rounded-full px-4 py-1.5 mb-4">
          <MdOutlineLocalHospital size={14} className="text-indigo-500" />
          <span className="text-indigo-600 text-xs font-semibold">Our Specialities</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-3">
          <FaStethoscope size={22} className="text-indigo-500" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight">
            Find by Speciality
          </h1>
          <FaStethoscope size={22} className="text-violet-500 scale-x-[-1]" />
        </div>

        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 mx-auto rounded-full mb-4" />

        <p className="text-gray-900 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Browse through our trusted doctors by speciality and schedule your
          appointment hassle-free 🩺
        </p>
      </motion.div>

      {/* ── CARDS ── */}
      <div className="w-full pt-2">

        {/* Mobile: 2-column grid (< sm) */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {specialityData.map((item, i) => {
            const c = cardColors[i % cardColors.length]
            return (
              <motion.div
                key={item.speciality}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                className="h-full"
              >
                <Card item={item} c={c} mobile />
              </motion.div>
            )
          })}
        </div>

        {/* Tablet / Desktop: horizontal scroll row (sm+) */}
        <div className="hidden sm:flex items-stretch gap-5 overflow-x-auto scrollbar-hide pb-4 pt-10 px-2 justify-start xl:justify-center" style={{ overflowY: "visible" }}>
          {specialityData.map((item, i) => {
            const c = cardColors[i % cardColors.length]
            return (
              <motion.div
                key={item.speciality}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -10, scale: 1.03, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
              >
                <Card item={item} c={c} />
              </motion.div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default SpecialityMenu