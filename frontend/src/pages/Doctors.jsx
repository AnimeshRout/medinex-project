import React, { useContext, useEffect, useState } from "react"
import { AppContext } from "../context/AppContext"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiFilter, FiX, FiChevronRight, FiCheckCircle, FiXCircle, FiSliders } from "react-icons/fi"
import { FaUserMd, FaStethoscope } from "react-icons/fa"
import { MdOutlineLocalHospital } from "react-icons/md"

const specialities = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
]

const Doctors = () => {

  const { speciality } = useParams()

  const [filterDoc, setFilterDoc]   = useState([])
  const [showFilter, setShowFilter] = useState(false)

  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  // ── exact backend logic from original code ──
  const applyFilter = () => {
    if (!doctors) return
    if (speciality) {
      const filtered = doctors.filter(doc => doc.speciality === speciality)
      setFilterDoc(filtered)
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  // ── animation variants ──
  const cardVariants = {
    hidden:  { opacity: 0, y: 28 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.4, delay: i * 0.06 }
    }),
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 md:px-12 lg:px-20 py-10">

      {/* ══ HEADER ══ */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon above heading */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <MdOutlineLocalHospital size={32} className="text-indigo-500" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight">
            All Doctors
          </h1>
          <FaStethoscope size={26} className="text-violet-500" />
        </div>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 mx-auto mt-3 rounded-full" />
        <p className="text-gray-900 mt-3 text-sm md:text-base">
          Browse through our trusted specialists and book an appointment instantly ⚡
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">

        {/* ══ MOBILE FILTER BUTTON ══ */}
        <motion.button
          onClick={() => setShowFilter(!showFilter)}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 sm:hidden bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600"
        >
          {showFilter ? <FiX size={16} /> : <FiFilter size={16} />}
          {showFilter ? "Close Filters" : "Filter by Speciality"}
        </motion.button>

        {/* ══ FILTER PANEL ══ */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className={`
            flex-col gap-2 min-w-[185px] w-full sm:w-auto
            bg-white rounded-2xl p-4
            border border-gray-300 shadow-sm
            sm:sticky sm:top-24
            ${showFilter ? "flex" : "hidden sm:flex"}
          `}
        >
          {/* Filter panel title with icon */}
          <div className="flex items-center gap-2 px-3 mb-2">
            <FiSliders size={13} className="text-indigo-500" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Speciality
            </p>
          </div>

          {specialities.map((spec, i) => (
            <motion.p
              key={i}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                speciality === spec
                  ? navigate("/doctors")
                  : navigate(`/doctors/${spec}`)
              }
              className={`
                flex items-center justify-between gap-2
                px-3 py-2.5 rounded-xl text-sm font-medium
                cursor-pointer transition-colors select-none
                ${speciality === spec
                  ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-600"
                  : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-700"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <FaUserMd size={13} className={speciality === spec ? "text-white" : "text-indigo-400"} />
                {spec}
              </span>
              {speciality === spec && <FiX size={13} />}
            </motion.p>
          ))}
        </motion.div>

        {/* ══ CARDS SECTION ══ */}
        <div className="flex-1 w-full min-w-0">

          {/* Active filter badge */}
          <AnimatePresence>
            {speciality && (
              <motion.div
                key="badge"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 mb-5 flex-wrap"
              >
                <span className="text-sm text-gray-900">Showing:</span>
                <span className="inline-flex items-center gap-1.5 bg-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {speciality}
                  <button onClick={() => navigate("/doctors")}>
                    <FiX size={12} />
                  </button>
                </span>
                <span className="text-xs text-gray-800">
                  {filterDoc.length} doctor{filterDoc.length !== 1 ? "s" : ""}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── DOCTOR CARDS GRID ── */}
          {filterDoc.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filterDoc.map((item, i) => (
                <motion.div
                  key={item._id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  onClick={() => {
                    navigate(`/appointment/${item._id}`)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-300 shadow-sm hover:shadow-xl hover:shadow-black/20 transition-shadow"
                >
                  {/* Doctor image */}
                  <div className="w-full h-44 sm:h-52 overflow-hidden bg-indigo-100">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full object-cover object-top"
                      src={item.image}
                      alt={item.name}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-4">

                    {/* Availability — with icon */}
                    <div className={`flex items-center gap-1.5 text-xs font-semibold mb-2 ${item.available ? "text-green-600" : "text-red-600"}`}>
                      {item.available
                        ? <FiCheckCircle size={13} />
                        : <FiXCircle size={13} />
                      }
                      {item.available ? "Available" : "Not Available"}
                    </div>

                    {/* Name */}
                    <p className="text-indigo-700 font-bold text-sm sm:text-base leading-tight mb-1 truncate">
                      {item.name}
                    </p>

                    {/* Speciality — with icon */}
                    <p className="text-gray-500/70 text-xs font-medium mb-3 flex items-center gap-1 truncate">
                      <FaStethoscope size={11} className="text-indigo-500 flex-shrink-0" />
                      {item.speciality}
                    </p>

                    {/* Book hint */}
                    <div className="flex items-center justify-end border-t border-gray-300 pt-2.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500">
                        Book now <FiChevronRight size={13} />
                      </span>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <FaUserMd size={52} className="text-indigo-200" />
              <p className="text-gray-400 text-base font-medium">
                No doctors found for this speciality.
              </p>
              <button
                onClick={() => navigate("/doctors")}
                className="text-sm text-indigo-600 font-semibold underline hover:text-indigo-800 transition"
              >
                View all doctors
              </button>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Doctors