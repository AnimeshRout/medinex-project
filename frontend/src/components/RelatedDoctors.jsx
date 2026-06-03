import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { motion } from "framer-motion"
import { FaStethoscope, FaUserMd } from "react-icons/fa"
import { FiCheckCircle, FiChevronRight, FiXCircle } from "react-icons/fi"
import { MdOutlineLocalHospital } from "react-icons/md"

const RelatedDoctors = ({ speciality, docId }) => {
  const navigate  = useNavigate()
  const { doctors } = useContext(AppContext)
  const [relDoc, setRelDoc] = useState([])
  const [showAll, setShowAll] = useState(false)

  // ── backend logic preserved exactly ──
  useEffect(() => {
    if (!doctors || doctors.length === 0) return
    const filteredDoctors = doctors.filter(
      doc => doc.speciality === speciality && doc._id !== docId
    )
    setRelDoc(filteredDoctors)
  }, [doctors, speciality, docId])

  const goToAppointment = (id) => {
    navigate(`/appointment/${id}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (relDoc.length === 0) return null

  const displayed = showAll ? relDoc : relDoc.slice(0, 4)

  return (
    <div className="py-10 px-0">

      {/* ── Heading ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <MdOutlineLocalHospital size={26} className="text-indigo-500" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tracking-tight">
            Related Doctors
          </h2>
          <FaStethoscope size={20} className="text-violet-500" />
        </div>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 mx-auto rounded-full mb-3" />
        <p className="text-gray-900 text-sm">
          Other trusted doctors in the same speciality 🩺
        </p>
      </motion.div>

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayed.map((item, i) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => goToAppointment(item._id)}
            className="bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/10 transition-shadow"
          >
            {/* Image — aspect ratio box prevents cutting */}
            <div className="w-full aspect-[4/3] overflow-hidden bg-indigo-50">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Info */}
            <div className="p-3 sm:p-4">

              {/* Availability */}
              <div className={`flex items-center gap-1.5 text-xs font-semibold mb-2 ${item.available ? "text-green-600" : "text-red-600"}`}>
                {item.available
                  ? <FiCheckCircle size={13} className="flex-shrink-0" />
                  : <FiXCircle size={13} className="flex-shrink-0" />
                }
                {item.available ? "Available Now" : "Not Available"}
              </div>

              {/* Name */}
              <p className="text-gray-800 font-bold text-sm sm:text-base leading-tight mb-1 truncate">
                {item.name}
              </p>

              {/* Speciality */}
              <p className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-3 truncate">
                <FaStethoscope size={11} className="text-indigo-300 flex-shrink-0" />
                {item.speciality}
              </p>

              {/* Book hint */}
              <div className="flex items-center justify-end border-t border-gray-100 pt-2.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                  Book now <FiChevronRight size={13} />
                </span>
              </div>

            </div>
          </motion.div>
        ))}
      </div>

      {/* View All / Show Less button */}
      {relDoc.length > 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 border-2 border-indigo-400 text-indigo-600 font-semibold text-sm px-8 py-3 rounded-full hover:bg-indigo-600 hover:text-white transition-all"
          >
            {showAll ? (
              <>Show Less ↑</>
            ) : (
              <>View All {relDoc.length} Doctors <FiChevronRight size={15} /></>
            )}
          </motion.button>
        </motion.div>
      )}

    </div>
  )
}

export default RelatedDoctors