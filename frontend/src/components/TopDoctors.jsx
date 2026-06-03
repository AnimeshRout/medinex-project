import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { motion } from "framer-motion"
import { FiChevronRight, FiCheckCircle, FiXCircle } from "react-icons/fi"
import { FaUserMd, FaStethoscope } from "react-icons/fa"
import { MdVerified, MdOutlineLocalHospital } from "react-icons/md"

const TopDoctors = () => {
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  const goToAppointment = (id) => {
    navigate(`/appointment/${id}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToDoctors = () => {
    navigate("/doctors")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex flex-col items-center gap-6 my-16 px-4 md:px-10 max-w-7xl mx-auto">

      {/* ── HEADING ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-400 rounded-full px-4 py-1.5 mb-4">
          <MdOutlineLocalHospital size={14} className="text-indigo-500" />
          <span className="text-indigo-600 text-xs font-semibold">Handpicked For You</span>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <FaUserMd size={24} className="text-indigo-500" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight">
            Top Doctors to Book
          </h1>
          <FaStethoscope size={20} className="text-violet-500" />
        </div>

        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 mx-auto rounded-full mb-4" />

        <p className="text-gray-900 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Browse through our highly rated and trusted specialists 🌟
        </p>
      </motion.div>

      {/* ── DOCTOR GRID ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 pt-4">
        {doctors && doctors.length > 0 ? (
          doctors.slice(0, 8).map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => goToAppointment(item._id)}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-200 shadow-sm hover:shadow-xl hover:shadow-black/10 transition-shadow flex flex-col"
            >
              {/* Image */}
              <div className="w-full h-44 sm:h-52 md:h-56 overflow-hidden bg-indigo-100">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4 flex flex-col flex-1">

                {/* Availability */}
                <div className={`flex items-center gap-1.5 text-xs font-semibold mb-2 ${item.available ? "text-green-600" : "text-red-600"}`}>
                  {item.available
                    ? <FiCheckCircle size={13} className="flex-shrink-0" />
                    : <FiXCircle className="flex-shrink-0" />
                  }
                  {item.available ? "Available Now" : "Not Available"}
                </div>

                {/* Name */}
                <div className="flex items-center gap-1.5 mb-1">
                  <FaUserMd size={13} className="text-indigo-500 flex-shrink-0" />
                  <p className="text-sm sm:text-base font-bold text-gray-800 truncate">
                    {item.name}
                  </p>
                  <MdVerified size={14} className="text-indigo-500 flex-shrink-0" />
                </div>

                {/* Speciality */}
                <p className="flex items-center gap-1.5 text-xs text-gray-600/70 font-medium truncate mb-3">
                  <FaStethoscope size={13} className="text-indigo-400 flex-shrink-0" />
                  {item.speciality}
                </p>

                {/* Book hint */}
                <div className="flex items-center justify-end border-t border-gray-300 pt-2.5 mt-auto">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500">
                    Book now <FiChevronRight size={13} />
                  </span>
                </div>

              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-3 col-span-full"
          >
            <FaUserMd size={48} className="text-indigo-200" />
            <p className="text-gray-500 text-sm font-medium">No doctors available</p>
          </motion.div>
        )}
      </div>

      {/* ── VIEW MORE BUTTON ── */}
      <motion.button
        onClick={goToDoctors}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 text-white font-bold text-sm px-10 py-3.5 rounded-full shadow-indigo-400 shadow-indigo-600 hover:shadow-md transition-shadow mt-4"
      >
        <FaUserMd size={15} />
        View All Doctors
        <FiChevronRight size={16} />
      </motion.button>

    </div>
  )
}

export default TopDoctors