import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUser, FiMail, FiPhone, FiMapPin,
  FiCalendar, FiEdit2, FiSave, FiCamera,
  FiTrash2, FiAlertTriangle, FiX, FiShield,
} from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'

// ── animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: "easeOut" },
  }),
}

// ── User Initial Avatar (fallback when no image) ──────────────────────────────
const UserInitialAvatar = ({ name, size = 96 }) => {
  const initial = (name?.trim()?.[0] || "U").toUpperCase();
  return (
    <div
      className="flex items-center justify-center font-extrabold text-white select-none flex-shrink-0"
      style={{
        width: size, height: size,
        fontSize: size * 0.42,
        background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.12))",
        backdropFilter: "blur(8px)",
        borderRadius: "50%",
        border: "4px solid rgba(255,255,255,0.40)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 16px rgba(0,0,0,0.2)",
        letterSpacing: "-0.02em",
      }}
    >
      {initial}
    </div>
  );
};

// ── Delete Account Modal ──────────────────────────────────────────────────────
const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          key="del-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9999]"
        />

        <div className="fixed inset-0 flex items-center justify-center z-[10000] px-4 py-6" onClick={onClose}>
          <motion.div
            key="del-modal"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{
              opacity: 1, scale: 1, y: 0,
              transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
            }}
            exit={{
              opacity: 0, scale: 0.93, y: 10,
              transition: { duration: 0.18 }
            }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-red-500 to-rose-500
              px-6 py-5 flex items-center gap-3.5">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 15 }}
                className="w-11 h-11 rounded-xl bg-white/20 flex items-center
                  justify-center flex-shrink-0"
              >
                <FiAlertTriangle size={22} className="text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1"
              >
                <p className="text-white font-extrabold text-base leading-tight">
                  Delete Account
                </p>
                <p className="text-white/75 text-xs mt-0.5">
                  This action cannot be undone
                </p>
              </motion.div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/20 border-none cursor-pointer
                  flex items-center justify-center hover:bg-white/30
                  transition-colors flex-shrink-0"
              >
                <FiX size={16} className="text-white" />
              </button>
            </div>

            {/* Body */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.25 }}
              className="px-6 py-5"
            >
              <div className="flex items-start gap-3 bg-red-100 border border-red-500
                rounded-xl p-3.5 mb-5">
                <FiTrash2 size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-900 leading-relaxed">
                  All your <strong>appointments</strong> and{" "}
                  <strong>personal data</strong> will be permanently deleted.
                  You will be logged out immediately.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full border border-gray-400
                    bg-gray-100 text-gray-800 font-semibold text-sm
                    cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ y: -1, boxShadow: "0 8px 20px rgba(239,68,68,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-full border-none
                    bg-gradient-to-r from-red-500 to-rose-500
                    text-white font-bold text-sm cursor-pointer
                    shadow-lg shadow-red-200
                    flex items-center justify-center gap-2"
                >
                  <FiTrash2 size={14} /> Yes, Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
)

// ── Field Row ─────────────────────────────────────────────────────────────────
const FieldRow = ({ icon, label, children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start
    gap-1 sm:gap-3 mb-4 last:mb-0">
    <div className="flex items-center gap-2 text-xs sm:text-sm
      font-semibold text-gray-600 pt-0.5">
      {icon} {label}
    </div>
    <div>{children}</div>
  </div>
)

// ── Section Card ──────────────────────────────────────────────────────────────
const SectionCard = ({ icon, title, children, delay = 0 }) => (
  <motion.div
    custom={delay}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="bg-white rounded-2xl p-6 sm:p-7 mb-5
      border border-gray-300 shadow-[0_2px_16px_rgba(99,102,241,0.07)]"
  >
    <div className="flex items-center gap-2 mb-5">
      <span className="text-gray-600">{icon}</span>
      <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">{title}</p>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent" />
    </div>
    {children}
  </motion.div>
)

// ── Edit Input ────────────────────────────────────────────────────────────────
const EditInput = ({ value, onChange, placeholder, type = "text", style }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={style}
    className="w-full bg-gray-200 border border-gray-300 rounded-xl
      px-3 py-2.5 text-sm text-gray-800 outline-none
      focus:border-indigo-500 focus:bg-white transition-all duration-200
      placeholder:text-gray-500"
  />
)

// ─────────────────────────────────────────────────────────────────────────────
const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  // track if existing image fails to load
  const [imgError, setImgError] = useState(false)

  const {
    token, backendUrl, userData, setUserData,
    loadUserProfileData, setToken,
  } = useContext(AppContext)
  const navigate = useNavigate()

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone || "")
      formData.append('address', JSON.stringify(userData.address || {}))
      formData.append('gender', userData.gender || "")
      formData.append('dob', userData.dob || "")
      if (image) formData.append('image', image)

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
        setImgError(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log("PROFILE UPDATE ERROR:", error)
      toast.error(error.response?.data?.message || "Something went wrong ⚠️")
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const { data } = await axios.delete(
        backendUrl + "/api/user/delete-account",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success("Account deleted successfully ✅")
        localStorage.removeItem("token")
        setToken("")
        setUserData(null)
        navigate("/")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account ‼️")
    } finally {
      setDeleteOpen(false)
    }
  }

  if (!userData) return null

  // ── avatar source logic ──
  // priority: new file picked → existing image (if valid) → initial avatar
  const avatarSrc = image
    ? URL.createObjectURL(image)
    : (!imgError && userData.image) ? userData.image : null

  // whether to show the initial avatar fallback
  const showInitial = !avatarSrc

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 sm:py-14 max-w-3xl mx-auto">

      {/* ── Delete Modal ── */}
      <DeleteAccountModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
      />

      {/* ══ HEADER CARD ══ */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl mb-6
          bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600
          shadow-[0_8px_32px_rgba(99,102,241,0.3)] p-6 sm:p-8 mt-10 border border-gray-300"
      >
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full
          bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full
          bg-white/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row
          items-center sm:items-start gap-5">

          {/* ── Avatar ── */}
          {isEdit ? (
            <label htmlFor="avatar-upload" className="cursor-pointer flex-shrink-0">
              <div className="relative group">
                {showInitial ? (
                  <div className="relative">
                    <UserInitialAvatar name={userData.name} size={96} />
                    <div className="absolute inset-0 rounded-full bg-black/40
                      flex items-center justify-center
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <FiCamera size={22} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={avatarSrc} alt="profile"
                      className="w-24 h-24 rounded-full object-cover
                        border-4 border-white/40 shadow-lg"
                      onError={() => setImgError(true)}
                    />
                    <div className="absolute inset-0 rounded-full bg-black/40
                      flex items-center justify-center
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <FiCamera size={22} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file" id="avatar-upload" hidden
                onChange={e => { setImage(e.target.files[0]); setImgError(false); }}
              />
            </label>
          ) : (
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex-shrink-0"
            >
              {showInitial ? (
                <UserInitialAvatar name={userData.name} size={96} />
              ) : (
                <img
                  src={avatarSrc} alt="profile"
                  className="w-24 h-24 rounded-full object-cover
                    border-4 border-white/40 shadow-lg"
                  onError={() => setImgError(true)}
                />
              )}
            </motion.div>
          )}

          {/* Name + meta */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            {isEdit ? (
              <input
                type="text"
                value={userData.name}
                onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                className="bg-white/15 border border-white/40 rounded-xl
                  px-4 py-2 text-xl sm:text-2xl font-bold text-white
                  outline-none w-full max-w-xs placeholder:text-white/60
                  focus:bg-white/20 transition-colors"
              />
            ) : (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl sm:text-3xl font-extrabold text-white
                  leading-tight truncate"
              >
                {userData.name}
              </motion.h1>
            )}

            <p className="text-white/80 text-sm mt-1.5 truncate">
              {userData.email}
            </p>

            <div className="inline-flex items-center gap-1.5 mt-3
              bg-white/20 rounded-full px-3 py-1
              text-xs font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Active Patient
              <MdVerified size={12} className="text-green-400 ml-0.5" />
            </div>
          </div>

          {/* Edit / Save buttons */}
          <div className="flex gap-2.5 flex-shrink-0 flex-wrap
            justify-center sm:justify-end">
            <AnimatePresence mode="wait">
              {isEdit ? (
                <motion.div
                  key="save-btns"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex gap-2.5 flex-wrap justify-center"
                >
                  <motion.button
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={updateUserProfileData}
                    className="inline-flex items-center gap-2 px-5 py-2.5
                      rounded-full bg-white text-indigo-600 font-bold text-sm
                      border-none cursor-pointer shadow-lg
                      hover:shadow-xl transition-shadow"
                  >
                    <FiSave size={14} /> Save
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setIsEdit(false); setImage(false) }}
                    className="inline-flex items-center gap-2 px-4 py-2.5
                      rounded-full bg-white/20 text-white font-semibold text-sm
                      border border-white/30 cursor-pointer
                      hover:bg-white/30 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button
                  key="edit-btn"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setIsEdit(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5
                    rounded-full border border-white/50 bg-white/10 text-white
                    font-semibold text-sm cursor-pointer
                    hover:bg-white/20 transition-colors"
                >
                  <FiEdit2 size={14} /> Edit Profile
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ══ CONTACT INFO ══ */}
      <SectionCard icon={<FiMail size={13} />} title="Contact Information" delay={1}>

        <FieldRow icon={<FiMail size={14} className="text-indigo-400" />} label="Email">
          <p className="text-sm font-medium text-indigo-500">{userData.email}</p>
        </FieldRow>

        <FieldRow icon={<FiPhone size={14} className="text-green-400" />} label="Phone">
          {isEdit ? (
            <EditInput
              value={userData.phone || ""}
              placeholder="Enter phone number"
              onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))}
            />
          ) : (
            <p className="text-sm font-medium text-indigo-500">
              {userData.phone
                || <span className="text-gray-600 italic font-normal">Not added</span>}
            </p>
          )}
        </FieldRow>

        <FieldRow icon={<FiMapPin size={14} className="text-amber-400" />} label="Address">
          {isEdit ? (
            <div className="flex flex-col gap-2">
              <EditInput
                value={userData.address?.line1 || ""}
                placeholder="Address line 1"
                onChange={e => setUserData(prev => ({
                  ...prev, address: { ...prev.address, line1: e.target.value }
                }))}
              />
              <EditInput
                value={userData.address?.line2 || ""}
                placeholder="Address line 2"
                onChange={e => setUserData(prev => ({
                  ...prev, address: { ...prev.address, line2: e.target.value }
                }))}
              />
            </div>
          ) : (
            <div className="text-sm font-medium text-gray-800">
              {userData.address?.line1 || userData.address?.line2 ? (
                <>
                  {userData.address?.line1 && <p>{userData.address.line1}</p>}
                  {userData.address?.line2 && (
                    <p className="text-gray-600">{userData.address.line2}</p>
                  )}
                </>
              ) : (
                <span className="text-gray-500 italic font-normal">Not added</span>
              )}
            </div>
          )}
        </FieldRow>
      </SectionCard>

      {/* ══ BASIC INFO ══ */}
      <SectionCard icon={<FiUser size={13} />} title="Basic Information" delay={2}>

        <FieldRow icon={<FiUser size={14} className="text-violet-400" />} label="Gender">
          {isEdit ? (
            <select
              value={userData.gender || "Not Selected"}
              onChange={e => setUserData(prev => ({ ...prev, gender: e.target.value }))}
              className="bg-gray-200 border border-gray-300 rounded-xl
                px-3 py-2.5 text-sm text-gray-800 outline-none
                focus:border-indigo-500 transition-colors min-w-40 cursor-pointer"
            >
              <option value="Not Selected">Not Selected</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p className="text-sm font-medium text-gray-800">
              {userData.gender
                || <span className="text-gray-400 italic font-normal">Not Selected</span>}
            </p>
          )}
        </FieldRow>

        <FieldRow icon={<FiCalendar size={14} className="text-blue-400" />} label="Birthday">
          {isEdit ? (
            <EditInput
              type="date"
              value={userData.dob === "Not Selected" ? "" : userData.dob || ""}
              onChange={e => setUserData(prev => ({ ...prev, dob: e.target.value }))}
              style={{ maxWidth: 200 }}
            />
          ) : (
            <p className="text-sm font-medium text-gray-800">
              {userData.dob
                || <span className="text-gray-500 italic font-normal">Not added</span>}
            </p>
          )}
        </FieldRow>
      </SectionCard>

      {/* ══ BOTTOM BUTTONS ══ */}
      <AnimatePresence mode="wait">
        {isEdit ? (
          <motion.div
            key="edit-bottom"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 mt-2 flex-wrap"
          >
            <motion.button
              whileHover={{ y: -1, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={updateUserProfileData}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full
              bg-gradient-to-r from-indigo-500 to-violet-600
              text-white font-bold text-sm border-none cursor-pointer
              shadow-lg shadow-indigo-900 transition-shadow"
            >
              <FiSave size={15} /> Save Changes
            </motion.button>
            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setIsEdit(false); setImage(false) }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                border border-gray-500 bg-transparent text-gray-800
                font-semibold text-sm cursor-pointer
                hover:bg-gray-200 transition-colors"
            >
              Cancel
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="view-bottom"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between gap-3 mt-2 flex-wrap"
          >
            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setIsEdit(true)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full
                border border-indigo-500 bg-transparent text-indigo-600
                font-semibold text-sm cursor-pointer
                hover:bg-indigo-600 hover:text-white transition-all duration-200"
            >
              <FiEdit2 size={15} /> Edit Profile
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full
                border border-red-500 bg-transparent text-red-500
                font-semibold text-sm cursor-pointer
                hover:bg-red-500 hover:text-white
                transition-all duration-200 sm:w-auto w-full justify-center"
            >
              <FiTrash2 size={15} /> Delete Account
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Security note ══ */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-6 flex items-center gap-2.5 px-4 py-3
          bg-indigo-200 border border-indigo-500 rounded-xl"
      >
        <FiShield size={14} className="text-indigo-500 flex-shrink-0" />
        <p className="text-xs text-indigo-700">
          Your profile is secured and verified by Medinex
        </p>
      </motion.div>

    </div>
  )
}

export default MyProfile