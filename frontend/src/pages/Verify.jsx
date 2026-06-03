import axios from "axios"
import React, { useContext, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { FaShieldAlt, FaCreditCard } from "react-icons/fa"

const Verify = () => {

  const [searchParams] = useSearchParams()
  const success       = searchParams.get("success")
  const appointmentId = searchParams.get("appointmentId")

  const { backendUrl, token } = useContext(AppContext)
  const navigate = useNavigate()

  // ── backend logic preserved ──
  const verifyStripe = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/verifyStripe",
        { success, appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success(data.message)
        navigate("/payment-success", { state: { appointment: data.appointment } })
      } else {
        toast.error(data.message)
        navigate("/my-appointments")
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
      navigate("/my-appointments")
    }
  }

  useEffect(() => {
    if (token && appointmentId && success) verifyStripe()
  }, [token, appointmentId, success])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-14 flex flex-col items-center gap-6 max-w-sm w-full text-center"
      >
        {/* Animated icons */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center">
            <FaCreditCard size={32} className="text-indigo-500" />
          </div>
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <FaShieldAlt className="text-indigo-500" size={18} />
            Verifying Payment
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Please wait while we confirm your payment with Stripe. Do not close this tab.
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-indigo-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Verify