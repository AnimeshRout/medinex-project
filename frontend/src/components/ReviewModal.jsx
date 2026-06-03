// ── ReviewModal.jsx ───────────────────────────────────────────────────────────

import React, { useContext, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppContext } from "../context/AppContext"
import axios from "axios"
import toast from "react-hot-toast"
import { FaStar, FaTimes } from "react-icons/fa"
import { FiSend, FiX } from "react-icons/fi"
import { MdVerified } from "react-icons/md"

const ReviewModal = ({ isOpen, appointment, onClose, onSubmitted }) => {
  const { backendUrl, token } = useContext(AppContext)

  const [rating, setRating]       = useState(0)
  const [hovered, setHovered]     = useState(0)
  const [comment, setComment]     = useState("")
  const [loading, setLoading]     = useState(false)
  const [existing, setExisting]   = useState(null)  // existing review if already submitted
  const [checking, setChecking]   = useState(true)

  // ── Labels per star ────────────────────────────────────────────────────────
  const labels = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" }
  const colors = {
    1: "text-red-500",
    2: "text-orange-400",
    3: "text-yellow-400",
    4: "text-amber-400",
    5: "text-emerald-500",
  }

  // ── Check if already reviewed ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !appointment?._id || !token) return
    const check = async () => {
      setChecking(true)
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/user/appointment-review/${appointment._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (data.success && data.review) {
          setExisting(data.review)
          setRating(data.review.rating)
          setComment(data.review.comment || "")
        } else {
          setExisting(null)
          setRating(0)
          setComment("")
        }
      } catch {
        setExisting(null)
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [isOpen, appointment?._id])

  const handleSubmit = async () => {
    if (rating === 0) {
      toast("Please select a star rating ⭐", { icon: "⚠️" })
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/submit-review`,
        { appointmentId: appointment._id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success("Review submitted ✅")
        onSubmitted?.()
        onClose()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const activeRating = hovered || rating

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="rx-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[10000] px-4 py-6" onClick={onClose}>
            <motion.div
              key="review-modal"
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
              exit={{ opacity: 0, scale: 0.93, y: 10, transition: { duration: 0.18 } }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-6 py-5
                flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaStar size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-base leading-tight">
                      {existing ? "Your Review" : "Rate Your Experience"}
                    </p>
                    <p className="text-white/75 text-xs mt-0.5">
                      {appointment?.docData?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center
                    cursor-pointer hover:bg-white/30 transition-colors"
                >
                  <FiX size={16} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                {checking ? (
                  <div className="flex justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent"
                    />
                  </div>
                ) : existing ? (
                  // ── Already reviewed view ─────────────────────────────────
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200
                      flex items-center justify-center mx-auto mb-3">
                      <MdVerified size={28} className="text-emerald-500" />
                    </div>
                    <p className="text-base font-bold text-gray-800 mb-1">
                      Review Already Submitted
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      You rated this appointment
                    </p>
                    <div className="flex justify-center gap-1 mb-3">
                      {[1,2,3,4,5].map(s => (
                        <FaStar
                          key={s}
                          size={28}
                          className={s <= existing.rating ? "text-amber-400" : "text-gray-200"}
                        />
                      ))}
                    </div>
                    {existing.comment && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3
                        border border-gray-200 italic mt-3">
                        "{existing.comment}"
                      </p>
                    )}
                  </div>
                ) : (
                  // ── Submit review form ────────────────────────────────────
                  <>
                    {/* Doctor info strip */}
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200
                      rounded-xl px-4 py-3 mb-5">
                      {appointment?.docData?.image && (
                        <img
                          src={appointment.docData.image}
                          alt={appointment.docData.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-200 flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {appointment?.docData?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {appointment?.docData?.speciality} · {appointment?.slotDate?.replace(/_/g, "/")}
                        </p>
                      </div>
                    </div>

                    {/* Star selector */}
                    <div className="flex flex-col items-center mb-5">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        How would you rate your experience?
                      </p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setRating(star)}
                            className="cursor-pointer p-1"
                          >
                            <FaStar
                              size={36}
                              className={`transition-colors duration-150 ${
                                star <= activeRating ? "text-amber-400" : "text-gray-200"
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                      {/* Label */}
                      <AnimatePresence mode="wait">
                        {activeRating > 0 && (
                          <motion.p
                            key={activeRating}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className={`text-sm font-bold mt-2 ${colors[activeRating]}`}
                          >
                            {labels[activeRating]}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Comment */}
                    <div className="mb-5">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Write a comment <span className="text-gray-400 font-normal">(optional)</span>
                      </p>
                      <textarea
                        placeholder="Share your experience with other patients..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm
                          text-gray-700 outline-none focus:border-amber-400 resize-none
                          bg-gray-50 transition-colors placeholder:text-gray-400"
                      />
                      <p className="text-right text-xs text-gray-400 mt-1">
                        {comment.length}/500
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm
                          font-semibold text-gray-600 bg-white cursor-pointer
                          hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ y: -1, boxShadow: "0 8px 20px rgba(245,158,11,0.35)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        disabled={loading || rating === 0}
                        className="flex-1 py-2.5 rounded-xl border-none
                          bg-gradient-to-r from-amber-400 to-orange-500
                          text-white text-sm font-bold cursor-pointer
                          shadow-lg shadow-amber-200 flex items-center justify-center gap-2
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Submitting..." : <><FiSend size={14} /> Submit Review</>}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ReviewModal