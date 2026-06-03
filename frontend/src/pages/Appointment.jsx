import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaUserMd, FaClock, FaCalendarAlt,
  FaCheckCircle, FaTimesCircle, FaStethoscope,
  FaRupeeSign, FaMedkit, FaStar, FaQuoteLeft,
} from 'react-icons/fa'
import { FiShield, FiChevronRight, FiSend, FiX } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'


const Appointment = () => {
  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const navigate = useNavigate()

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo]     = useState(null)
  const [docSlots, setDocSlots]   = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime]   = useState('')

  // ── Reviews state ─────────────────────────────────────────────────────────
  const [reviews, setReviews]             = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews]   = useState(0)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [showAllReviews, setShowAllReviews] = useState(false)

  /* ── FETCH DOCTOR ── */
  const fetchDocInfo = () => {
    const doctor = doctors.find(doc => doc._id === docId)
    if (doctor) setDocInfo(doctor)
  }

  /* ── FETCH SLOTS ── */
  const fetchSlots = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/slots/${docId}`)
      if (data.success) {
        const slotsArray = []
        Object.keys(data.slots).forEach(dateKey => {
          const times = data.slots[dateKey]
          const [day, month, year] = dateKey.split('_').map(Number)
          const formatted = times.map(slot => {
            const [timePart, meridiem] = slot.time.split(' ')
            const [rawHours, rawMins] = timePart.split(':').map(Number)
            let hours = rawHours
            if (meridiem) {
              const m = meridiem.toUpperCase()
              if (m === 'PM' && hours !== 12) hours += 12
              if (m === 'AM' && hours === 12) hours = 0
            }
            const dt = new Date(year, month - 1, day, hours, rawMins, 0)
            return { datetime: dt, time: slot.time, isBooked: slot.isBooked }
          })
          slotsArray.push(formatted)
        })
        setDocSlots(slotsArray)
      }
    } catch {
      toast.error("Failed to load slots ❌")
    }
  }

  /* ── FETCH REVIEWS ── */
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/user/doctor-reviews/${docId}`)
      if (data.success) {
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
        setTotalReviews(data.totalReviews || 0)
      }
    } catch {
      // silent — reviews are non-critical
    } finally {
      setReviewsLoading(false)
    }
  }

  /* ── BOOK APPOINTMENT ── */
  const bookAppointment = async () => {
    if (!token) {
      toast("Login to book appointment 🔐", { icon: "⚠️" })
      return navigate("/login")
    }
    if (!slotTime) {
      toast("Please select a slot ⏰", { icon: "⚠️" })
      return
    }
    const date = docSlots[slotIndex][0].datetime
    const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success("Appointment booked 🎉")
        getDoctorsData()
        fetchSlots()
        navigate("/my-appointments")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  /* ── EFFECTS ── */
  useEffect(() => { if (doctors.length > 0) fetchDocInfo() }, [doctors, docId])
  useEffect(() => { fetchSlots() }, [docId])
  useEffect(() => { fetchReviews() }, [docId])
  useEffect(() => {
    const interval = setInterval(() => { fetchSlots() }, 3000)
    return () => clearInterval(interval)
  }, [docId])

  if (!docInfo) return null

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
    }
    const list = descriptions[speciality] || [
      `A highly qualified specialist in ${speciality} with extensive clinical experience and a patient-first approach to care.`,
    ]
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return list[seed % list.length]
  }

  // ── Star renderer ──────────────────────────────────────────────────────────
  const StarDisplay = ({ rating, size = 14, interactive = false, onRate }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <FaStar
          key={star}
          size={size}
          onClick={() => interactive && onRate && onRate(star)}
          className={`transition-colors ${interactive ? "cursor-pointer" : ""} ${
            star <= rating
              ? "text-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )

  // ── Rating bar breakdown ───────────────────────────────────────────────────
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
      : 0,
  }))

  // ── Format date ───────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* ══ DOCTOR CARD ══ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-6 mb-10"
      >
        {/* Image */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="w-full sm:w-64 md:w-72 flex-shrink-0"
        >
          <img
            src={docInfo.image}
            alt={docInfo.name}
            className="w-full h-64 sm:h-full object-cover object-top rounded-2xl shadow-lg"
          />
        </motion.div>

        {/* Info card */}
        <div className="flex-1 bg-white rounded-2xl p-5 sm:p-7 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <FaUserMd size={22} className="text-indigo-500 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{docInfo.name}</h1>
            <MdVerified size={22} className="text-indigo-500 flex-shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-2 text-gray-800 text-sm">
              <FaStethoscope size={13} className="text-indigo-400" />
              <span>{docInfo.degree} - {docInfo.speciality}</span>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-300">
              {docInfo.experience}
            </span>
          </div>

          {/* Rating summary inline with doctor card */}
          {totalReviews > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarDisplay rating={Math.round(averageRating)} size={15} />
              <span className="text-sm font-bold text-amber-500">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({totalReviews} review{totalReviews !== 1 ? "s" : ""})</span>
            </div>
          )}

          <div className="h-[2px] bg-gradient-to-r from-indigo-400 via-indigo-200 to-transparent mb-5" />

          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-2 bg-green-50 border border-green-600 rounded-xl px-3 py-2">
              <FaCheckCircle size={13} className="text-green-500" />
              <span className="text-xs font-semibold text-green-700">Verified Doctor</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-600 rounded-xl px-3 py-2">
              <FaCalendarAlt size={13} className="text-blue-500" />
              <span className="text-xs font-semibold text-blue-700">Online Booking</span>
            </div>
            <div className="flex items-center gap-2 bg-violet-50 border border-violet-600 rounded-xl px-3 py-2">
              <FaClock size={13} className="text-violet-500" />
              <span className="text-xs font-semibold text-violet-700">Instant Confirmation</span>
            </div>
          </div>

          <div className="mb-5 bg-gray-50 rounded-xl p-4 border border-gray-400">
            <p className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
              <FaMedkit size={14} className="text-indigo-400" /> About Dr. {docInfo.name.replace("Dr ", "").replace("Dr. ", "")}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {docInfo.about && docInfo.about.trim() !== ""
                ? docInfo.about
                : getDoctorDescription(docInfo.name, docInfo.speciality)
              }
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-400 rounded-xl px-4 py-2.5">
            <FaRupeeSign size={14} className="text-indigo-500" />
            <span className="text-sm font-medium text-gray-600">Appointment fee:</span>
            <span className="font-bold text-indigo-600 text-base">{currencySymbol}{docInfo.fees}</span>
          </div>
        </div>
      </motion.div>

      {/* ══ SLOTS SECTION ══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200 shadow-sm mb-8"
      >
        <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 mb-6">
          <FaCalendarAlt className="text-indigo-500" />
          Available Appointment Slots
        </h2>

        <div className="flex gap-3 overflow-x-auto py-2 mb-6 scrollbar-hide">
          {docSlots.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSlotIndex(index); setSlotTime('') }}
              className={`flex flex-col items-center justify-center min-w-[72px] sm:min-w-[80px] py-3 px-2 rounded-xl cursor-pointer transition-all flex-shrink-0 ${slotIndex === index
                ? 'bg-gradient-to-b from-indigo-500 to-violet-600 text-white shadow-md'
                : 'bg-gray-100 border border-gray-400 hover:border-indigo-400 text-gray-800'
                }`}
            >
              <p className="text-xs font-semibold">
                {item[0] && daysOfWeek[item[0].datetime.getDay()]}
              </p>
              <p className="text-xl font-extrabold mt-0.5">
                {item[0] && item[0].datetime.getDate()}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-2">
          {docSlots.length > 0 && docSlots[slotIndex].map((item, index) => (
            <motion.button
              key={index}
              disabled={item.isBooked}
              onClick={() => !item.isBooked && setSlotTime(item.time)}
              whileHover={!item.isBooked ? { y: -2 } : {}}
              whileTap={!item.isBooked ? { scale: 0.97 } : {}}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${item.isBooked
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-400'
                : item.time === slotTime
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-600 border-gray-400 hover:border-indigo-500 hover:text-indigo-600'
                }`}
            >
              <FaClock size={11} className="flex-shrink-0" />
              <span>{item.time.toLowerCase()}</span>
              {item.isBooked
                ? <FaTimesCircle size={12} className="text-red-400 flex-shrink-0" />
                : <FaCheckCircle size={12} className={item.time === slotTime ? "text-white" : "text-green-400 flex-shrink-0"} />
              }
            </motion.button>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <motion.button
            onClick={bookAppointment}
            whileHover={{ scale: 1.03, y: -2 }}
            style={{ boxShadow: "none" }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 text-white font-bold text-sm px-8 py-3.5 rounded-full transition-shadow"
          >
            <FiShield size={16} />
            Book Appointment
            <FiChevronRight size={16} />
          </motion.button>
          {!token && (
            <p className="text-xs text-gray-900 font-medium flex items-center gap-1">
              <FiShield size={12} className="text-indigo-500" />
              You'll be asked to login first
            </p>
          )}
        </div>
      </motion.div>

      {/* ══ REVIEWS SECTION ══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="mb-8"
      >
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500
            flex items-center justify-center shadow-md shadow-amber-200">
            <FaStar size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              Patient Reviews
            </h2>
            {totalReviews > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                Based on {totalReviews} verified appointment{totalReviews !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {totalReviews > 0 && (
            <div className="ml-auto flex items-center gap-1.5 bg-amber-50 border border-amber-300
              rounded-xl px-3 py-1.5">
              <FaStar size={13} className="text-amber-400" />
              <span className="text-sm font-extrabold text-amber-600">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-amber-500">/ 5</span>
            </div>
          )}
        </div>

        {/* Rating overview + breakdown — only when reviews exist */}
        {!reviewsLoading && totalReviews > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-5"
          >
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">

              {/* Big rating number */}
              <div className="flex flex-col items-center justify-center bg-gradient-to-br
                from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-8 py-5
                flex-shrink-0 min-w-[120px]">
                <span className="text-5xl font-extrabold text-amber-500 leading-none">
                  {averageRating.toFixed(1)}
                </span>
                <StarDisplay rating={Math.round(averageRating)} size={16} />
                <span className="text-xs text-gray-400 mt-1.5">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</span>
              </div>

              {/* Bar breakdown */}
              <div className="flex-1 w-full flex flex-col gap-2">
                {ratingBreakdown.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 w-10 flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-600">{star}</span>
                      <FaStar size={10} className="text-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.1 * (5 - star) }}
                        className={`h-full rounded-full ${
                          star >= 4 ? "bg-gradient-to-r from-amber-400 to-orange-400"
                          : star === 3 ? "bg-gradient-to-r from-yellow-300 to-amber-300"
                          : "bg-gradient-to-r from-gray-300 to-gray-400"
                        }`}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-7 text-right flex-shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Review cards */}
        {reviewsLoading ? (
          <div className="flex items-center justify-center py-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent"
            />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200
              flex items-center justify-center mx-auto mb-3">
              <FaStar size={22} className="text-amber-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No reviews yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Be the first to review after your appointment
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {displayedReviews.map((review, i) => (
                <motion.div
                  key={review._id || i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {review.userImage ? (
                        <img
                          src={review.userImage}
                          alt={review.userName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400
                          to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                          {review.userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-800">{review.userName}</span>
                        <span className="text-xs text-gray-400">{formatDate(review.date)}</span>
                      </div>
                      <StarDisplay rating={review.rating} size={13} />
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          <FaQuoteLeft size={10} className="inline text-indigo-300 mr-1.5" />
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Show more / less */}
            {reviews.length > 3 && (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAllReviews(p => !p)}
                className="self-center px-6 py-2.5 rounded-full border border-indigo-300
                  text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition-colors"
              >
                {showAllReviews
                  ? "Show less ↑"
                  : `Show all ${reviews.length} reviews ↓`}
              </motion.button>
            )}
          </div>
        )}
      </motion.div>

      {/* ══ RELATED DOCTORS ══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
      </motion.div>

    </div>
  )
}

export default Appointment