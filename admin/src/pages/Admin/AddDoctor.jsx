import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axios";
import { motion } from "framer-motion";
import {
  FiUser, FiMail, FiLock, FiBriefcase, FiDollarSign,
  FiBook, FiMapPin, FiFileText, FiCamera, FiPlus,
  FiActivity, FiEye, FiEyeOff,
} from "react-icons/fi";
import { FaUserMd, FaStethoscope, FaVenusMars } from "react-icons/fa";
import { MdVerified, MdLocalHospital } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

// ── animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ── Reusable input field ──────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children }) => (
  <motion.div variants={fieldVariants} className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon size={11} className="text-indigo-500" />}
      {label}
    </label>
    {children}
  </motion.div>
);

const inputCls = `w-full px-4 py-2.5 text-sm bg-white border-1 border-gray-400 rounded-xl
  outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100
  transition-all duration-200 text-gray-700 placeholder:text-gray-500 shadow-sm`;

const selectCls = `w-full px-4 py-2.5 text-sm bg-white border-1 border-gray-400 rounded-xl
  outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100
  transition-all duration-200 text-gray-500 shadow-sm cursor-pointer`;

// ─────────────────────────────────────────────────────────────────────────────
const AddDoctor = () => {

  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState("Male");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!docImg) return toast.error("Doctor image is required");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("gender", gender); 
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append("address", JSON.stringify({ line1: address1, line2: address2 }));

      const { data } = await axiosInstance.post("/api/admin/add-doctor", formData);

      if (data.success) {
        toast.success(data.message);
        setDocImg(null);
        setName(""); setEmail(""); setPassword(""); setFees("");
        setDegree(""); setAddress1(""); setAddress2(""); setAbout("");
        setGender("Male");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">

      {/* ── Page heading ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
            flex items-center justify-center shadow-lg shadow-indigo-200">
            <FaUserMd size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 leading-tight">
              Add New Doctor
            </h1>
            <p className="text-xs sm:text-sm text-gray-900 mt-0.5 flex items-center gap-1">
              <MdVerified size={13} className="text-indigo-500" />
              Fill in the details to register a new doctor
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={onSubmitHandler}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-300 shadow-lg shadow-gray-400/60 overflow-hidden"
        >

          {/* ── Hero banner ── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700
            px-6 py-5">
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm
                flex items-center justify-center shadow-md flex-shrink-0">
                <MdLocalHospital size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <HiSparkles size={12} className="text-white/70" />
                  <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                    Medinex Admin
                  </span>
                  <HiSparkles size={12} className="text-white/70" />
                </div>
                <p className="text-white font-extrabold text-base leading-tight">
                  Doctor Registration Form
                </p>
                <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                  <FiActivity size={12} />
                  Complete all fields to add a doctor to the system
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-8">

            {/* ── Image upload ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex items-center gap-5 mb-8 p-4 bg-gray-200 rounded-2xl border border-gray-400"
            >
              <label htmlFor="doc-img" className="cursor-pointer group relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden
                  border-2 border-dashed border-indigo-400 bg-white shadow-sm
                  group-hover:border-indigo-600 transition-colors duration-200">
                  <img
                    className="w-full h-full object-cover"
                    src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                    alt="doctor"
                  />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full
                  bg-indigo-500 border-2 border-white flex items-center justify-center
                  shadow-md group-hover:bg-indigo-600 transition-colors duration-200">
                  <FiCamera size={13} className="text-white" />
                </div>
              </label>

              <input type="file" id="doc-img" hidden onChange={e => setDocImg(e.target.files[0])} />

              <div>
                <p className="text-sm font-bold text-gray-950 mb-1">Doctor Photo</p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Upload a clear professional photo.<br />
                  JPG, PNG supported. Max 5MB.
                </p>
                {docImg && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-indigo-600 font-semibold mt-1.5 flex items-center gap-1"
                  >
                    <MdVerified size={12} /> Image selected
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* ── Section: Personal Info ── */}
            <SectionLabel icon={FiUser} label="Personal Information" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
            >
              <Field label="Doctor Name" icon={FiUser}>
                <input className={inputCls} type="text" placeholder="Dr. John Smith"
                  value={name} onChange={e => setName(e.target.value)} required />
              </Field>

              <Field label="Email Address" icon={FiMail}>
                <input className={inputCls} type="email" placeholder="doctor@medinex.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </Field>

              {/* Password with show/hide toggle */}
              <Field label="Password" icon={FiLock}>
                <div className="relative">
                  <input
                    className={`${inputCls} pr-11`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                      text-gray-400 hover:text-indigo-600 transition-colors duration-200
                      cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </Field>

              <Field label="Education / Degree" icon={FiBook}>
                <input className={inputCls} type="text" placeholder="MBBS, MD, etc."
                  value={degree} onChange={e => setDegree(e.target.value)} required />
              </Field>

              {/* Gender radio buttons */}
              <motion.div variants={fieldVariants} className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FaVenusMars size={11} className="text-indigo-500" />
                  Gender
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  {["Male", "Female", "Other"].map(g => (
                    <label
                      key={g}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                        border-1 cursor-pointer transition-all duration-200 text-sm font-semibold
                        ${gender === g
                          ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                          : "bg-white border-gray-400 text-gray-700 hover:border-indigo-500"}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        transition-colors duration-200
                        ${gender === g ? "border-indigo-500" : "border-gray-400"}`}>
                        {gender === g && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="hidden"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </motion.div>

            </motion.div>

            {/* ── Section: Professional Info ── */}
            <SectionLabel icon={FaStethoscope} label="Professional Details" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
            >
              <Field label="Speciality" icon={FaStethoscope}>
                <select className={selectCls} value={speciality}
                  onChange={e => setSpeciality(e.target.value)}>
                  {["General physician", "Gynecologist", "Dermatologist",
                    "Pediatricians", "Neurologist", "Gastroenterologist"].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                </select>
              </Field>

              <Field label="Experience" icon={FiBriefcase}>
                <select className={selectCls} value={experience}
                  onChange={e => setExperience(e.target.value)}>
                  {[...Array(10)].map((_, i) => (
                    <option key={i}>{i + 1} Year</option>
                  ))}
                </select>
              </Field>

              <Field label="Consultation Fees (₹)" icon={FiDollarSign}>
                <input
                  className={inputCls}
                  type="number"
                  placeholder="e.g. 500"
                  value={fees}
                  onChange={e => setFees(e.target.value)}
                  onWheel={e => e.target.blur()}
                  required
                />
              </Field>
            </motion.div>

            {/* ── Section: Address ── */}
            <SectionLabel icon={FiMapPin} label="Clinic Address" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
            >
              <Field label="Address Line 1" icon={FiMapPin}>
                <input className={inputCls} type="text" placeholder="Street / Building"
                  value={address1} onChange={e => setAddress1(e.target.value)} required />
              </Field>

              <Field label="Address Line 2" icon={FiMapPin}>
                <input className={inputCls} type="text" placeholder="City / Area"
                  value={address2} onChange={e => setAddress2(e.target.value)} required />
              </Field>
            </motion.div>

            {/* ── Section: About ── */}
            <SectionLabel icon={FiFileText} label="About Doctor" />

            <motion.div variants={fieldVariants} initial="hidden" animate="visible">
              <textarea
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Write a brief bio about the doctor — expertise, achievements, approach..."
                value={about}
                onChange={e => setAbout(e.target.value)}
                required
              />
            </motion.div>

            {/* ── Submit ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-6 flex flex-col sm:flex-row items-center gap-3"
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(99,102,241,0.35)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-3 rounded-xl
                  bg-gradient-to-r from-indigo-500 to-violet-600
                  text-white text-sm font-bold cursor-pointer
                  shadow-lg shadow-indigo-200 border-none
                  flex items-center justify-center gap-2
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200"
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 rounded-full border-2 border-white border-t-transparent inline-block"
                    />
                    Adding Doctor...
                  </>
                ) : (
                  <>
                    <FiPlus size={16} /> Add Doctor
                  </>
                )}
              </motion.button>

              <p className="text-xs text-gray-900 sm:ml-2">
                All fields marked are required to proceed.
              </p>
            </motion.div>

          </div>
        </motion.div>
      </form>
    </div>
  );
};

// ── Section Label helper ──────────────────────────────────────────────────────
const SectionLabel = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600
      flex items-center justify-center shadow-sm flex-shrink-0">
      <Icon size={12} className="text-white" />
    </div>
    <p className="text-sm font-bold text-gray-700">{label}</p>
    <div className="flex-1 h-px bg-gray-300 ml-1" />
  </div>
);

export default AddDoctor;