import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axiosInstance from "../../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2, FiSave, FiX, FiMapPin, FiDollarSign,
  FiCheckCircle, FiXCircle, FiShield, FiAward, FiCamera,
} from "react-icons/fi";
import {
  FaUserMd, FaStethoscope, FaRupeeSign,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

// ── Generate doctor description ───────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
const DoctorProfile = () => {
  const {
    dToken, profileData, setProfileData, getProfileData,
  } = useContext(DoctorContext);

  const { currency } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);

  // ✅ image states
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (dToken) getProfileData();
  }, [dToken]);

  // ✅ handle image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const updateProfile = async () => {
    try {
      // ✅ use FormData if image selected, else plain JSON
      if (imageFile) {
        const formData = new FormData();
        formData.append("image",     imageFile);
        formData.append("fees",      profileData.fees);
        formData.append("available", profileData.available);
        formData.append("address",   JSON.stringify(profileData.address));

        const { data } = await axiosInstance.post("/api/doctor/update-profile", formData);
        if (data.success) {
          toast.success(data.message);
          setIsEdit(false);
          setImageFile(null);
          setImagePreview(null);
          getProfileData();
        } else {
          toast.error(data.message);
        }
      } else {
        const updateData = {
          address:   profileData.address,
          fees:      profileData.fees,
          available: profileData.available,
        };
        const { data } = await axiosInstance.post("/api/doctor/update-profile", updateData);
        if (data.success) {
          toast.success(data.message);
          setIsEdit(false);
          getProfileData();
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ cancel — reset image too
  const handleCancel = () => {
    setIsEdit(false);
    setImageFile(null);
    setImagePreview(null);
    getProfileData();
  };

  if (!profileData) return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="h-8 w-48 bg-gray-200 rounded-xl mb-6 animate-pulse"/>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <div className="bg-white rounded-2xl border border-gray-300 h-80 animate-pulse"/>
        <div className="bg-white rounded-2xl border border-gray-300 h-80 animate-pulse"/>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      {/* ── Page heading ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600
              flex items-center justify-center shadow-lg shadow-teal-200">
              <FaUserMd size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 leading-tight">
                My Profile
              </h1>
              <p className="text-xs sm:text-sm text-gray-900 mt-0.5 flex items-center gap-1">
                <MdVerified size={13} className="text-teal-500" />
                Verified Doctor Profile
              </p>
            </div>
          </div>

          {/* Edit / Save / Cancel */}
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {isEdit ? (
                <motion.div
                  key="edit-actions"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2"
                >
                  <motion.button
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={updateProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                      bg-gradient-to-r from-teal-500 to-cyan-600
                      text-white text-sm font-semibold shadow-md shadow-teal-200
                      border-none cursor-pointer"
                  >
                    <FiSave size={14} /> Save
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                      bg-gray-300 text-gray-700 text-sm font-semibold
                      border-none cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <FiX size={14} /> Cancel
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                    bg-white border border-gray-300 text-gray-700 text-sm font-semibold
                    cursor-pointer hover:border-teal-400 hover:text-teal-600
                    transition-colors shadow-sm"
                >
                  <FiEdit2 size={14} /> Edit Profile
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">

        {/* ── LEFT: Image + availability ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-4"
        >
          {/* Image card */}
          <div className="bg-white rounded-2xl border border-gray-300
            shadow-lg shadow-gray-400/60 overflow-hidden">
            <div className="relative">
              <img
                src={imagePreview || profileData?.image}
                alt={profileData?.name}
                className="w-full h-56 sm:h-64 lg:h-72 object-cover object-top"
              />
              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-16
                bg-gradient-to-t from-black/40 to-transparent"/>
              {/* Verified badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1
                bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full
                text-xs font-semibold text-teal-600">
                <MdVerified size={13} /> Verified
              </div>

              {/* ✅ Camera overlay — only in edit mode */}
              {isEdit && (
                <label htmlFor="doctor-img"
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full
                    bg-teal-500 border-2 border-white flex items-center justify-center
                    cursor-pointer hover:bg-teal-600 transition-colors shadow-lg z-10">
                  <FiCamera size={15} className="text-white"/>
                  <input type="file" id="doctor-img" hidden accept="image/*"
                    onChange={handleImageChange}/>
                </label>
              )}
            </div>

            <div className="p-4">
              <p className="font-bold text-gray-900 text-lg leading-tight">
                {profileData?.name}
              </p>
              <p className="text-sm text-gray-800 mt-0.5">
                {profileData?.degree}
              </p>
              {/* ✅ New photo indicator */}
              <AnimatePresence>
                {imageFile && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-xs text-teal-600 font-semibold mt-1.5 flex items-center gap-1"
                  >
                    <MdVerified size={12}/> New photo selected — save to apply
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Availability card */}
          <div className="bg-white rounded-2xl border border-gray-300
            shadow-lg shadow-gray-400/60 p-[22px]">
            <p className="text-xs font-bold text-gray-950 uppercase tracking-wider mb-3">
              Availability Status
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${profileData?.available ? "bg-green-400" : "bg-red-400"}`} />
                <span className={`text-sm font-semibold ${profileData?.available ? "text-green-600" : "text-red-600"}`}>
                  {profileData?.available ? "Available" : "Not Available"}
                </span>
              </div>
              {isEdit && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileData(prev => ({ ...prev, available: !prev.available }))}
                  className={`w-12 h-6 rounded-full transition-colors duration-300 relative cursor-pointer border-none
                    ${profileData?.available ? "bg-green-400" : "bg-gray-300"}`}
                >
                  <motion.div
                    animate={{ x: profileData?.available ? 24 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </motion.button>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-teal-100 dark:bg-teal-900/30 rounded-xl p-3 text-center">
                <FiAward size={16} className="text-teal-500 mx-auto mb-1" />
                <p className="text-xs text-gray-700">Experience</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">
                  {profileData?.experience}
                </p>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-xl p-3 text-center">
                <FaStethoscope size={14} className="text-indigo-500 mx-auto mb-1" />
                <p className="text-xs text-gray-700">Speciality</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">
                  {profileData?.speciality}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT: Details ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          {/* Basic info card */}
          <div className="bg-white rounded-2xl border border-gray-300
            shadow-lg shadow-gray-400/60 p-5 sm:p-6">

            <div className="flex items-center gap-2 mb-1">
              <HiSparkles size={14} className="text-teal-400" />
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Doctor Information
              </p>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-800 mt-2 mb-1">
              {profileData?.name}
            </h2>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1
                bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-400">
                <FaStethoscope size={10} /> {profileData?.speciality}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1
                bg-teal-100 text-teal-600 text-xs font-semibold rounded-full border border-teal-400">
                <FiAward size={10} /> {profileData?.experience}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1
                text-xs font-semibold rounded-full border
                ${profileData?.available
                  ? "bg-green-100 text-green-600 border-green-400"
                  : "bg-red-100 text-red-600 border-red-400"
                }`}>
                {profileData?.available
                  ? <><FiCheckCircle size={10} /> Available</>
                  : <><FiXCircle size={10} /> Not Available</>
                }
              </span>
            </div>

            <div className="h-px bg-gray-300 mb-4" />

            {/* About */}
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                About
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {profileData?.about && profileData.about.trim() !== ""
                  ? profileData.about
                  : getDoctorDescription(profileData?.name, profileData?.speciality)
                }
              </p>
            </div>

            <div className="h-px bg-gray-300 mb-4" />

            {/* Fees */}
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Appointment Fee
              </p>
              <div className="inline-flex items-center bg-indigo-100 dark:bg-indigo-900/30
                border border-indigo-400 dark:border-indigo-700 rounded-xl px-4 py-2.5">
                <FaRupeeSign size={12} className="text-indigo-500" />
                {isEdit ? (
                  <input
                    type="number"
                    value={profileData?.fees}
                    onChange={e => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                    className="w-24 text-sm font-bold text-indigo-600 bg-transparent
                      !bg-transparent outline-none border-b border-indigo-300
                      focus:border-indigo-500 [&]:bg-transparent"
                    style={{ background: "transparent" }}
                  />
                ) : (
                  <span className="text-lg font-bold text-indigo-600">
                    {profileData?.fees}
                  </span>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-300 mb-4" />

            {/* Address */}
            <div>
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Address
              </p>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center
                  justify-center flex-shrink-0 mt-0.5 border border-red-400">
                  <FiMapPin size={14} className="text-rose-500" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {isEdit ? (
                    <>
                      <input
                        type="text"
                        value={profileData?.address?.line1}
                        onChange={e => setProfileData(prev => ({
                          ...prev, address: { ...prev.address, line1: e.target.value }
                        }))}
                        placeholder="Address line 1"
                        className="w-full text-sm text-gray-700 bg-gray-200
                          border border-gray-300 rounded-lg px-3 py-2
                          outline-none focus:border-teal-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={profileData?.address?.line2}
                        onChange={e => setProfileData(prev => ({
                          ...prev, address: { ...prev.address, line2: e.target.value }
                        }))}
                        placeholder="Address line 2"
                        className="w-full text-sm text-gray-700 bg-gray-200
                          border border-gray-300 rounded-lg px-3 py-2
                          outline-none focus:border-teal-500 transition-colors"
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700 font-medium">
                        {profileData?.address?.line1}
                      </p>
                      {profileData?.address?.line2 && (
                        <p className="text-sm text-gray-500">
                          {profileData?.address?.line2}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security badge */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600
            rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FiShield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Verified Medical Professional</p>
              <p className="text-white/80 text-xs mt-0.5">
                Your profile is secured and verified by Medinex
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default DoctorProfile;