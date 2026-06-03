import React, { useContext, useEffect, useState, useRef, useCallback } from "react";

// ── Module-level cache — survives React navigation ─────────────
let _adminCache = null;
import { AdminContext } from "../../context/AdminContext";
import axiosInstance from "../../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiUser, FiMail, FiEdit2, FiSave, FiX,
    FiShield, FiCalendar, FiLock, FiEye, FiEyeOff, FiCamera,
} from "react-icons/fi";
import { MdVerified, MdAdminPanelSettings } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

// ── animation variants ────────────────────────────────────────────────────────
const fieldVariants = {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const inputCls = `w-full px-4 py-2.5 text-sm bg-white border-1 border-gray-400 rounded-xl
    outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
    transition-all duration-200 text-gray-950 placeholder:text-gray-400 shadow-sm`;

// ── Section Label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600
            flex items-center justify-center shadow-sm flex-shrink-0">
            <Icon size={12} className="text-white"/>
        </div>
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <div className="flex-1 h-px bg-gray-300 ml-1"/>
    </div>
);

// ── Password Field ────────────────────────────────────────────────────────────
const PasswordField = ({ label, value, setValue, show, setShow }) => (
    <motion.div variants={fieldVariants} className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider
            flex items-center gap-1.5">
            <FiLock size={13} className="text-indigo-500"/> {label}
        </label>
        <div className="relative">
            <input
                className={`${inputCls} pr-11`}
                type={show ? "text" : "password"}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={label}
            />
            <button type="button" onClick={() => setShow(p => !p)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer">
                {show ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
            </button>
        </div>
    </motion.div>
);

// ── Admin Initial Avatar (fallback when no image) ─────────────────────────────
const AdminInitialAvatar = ({ name, size = 64 }) => {
    const initial = (name?.trim()?.[0] || "A").toUpperCase();
    return (
        <div
            className="flex items-center justify-center font-extrabold text-white select-none"
            style={{
                width: size, height: size,
                fontSize: size * 0.42,
                background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.12))",
                backdropFilter: "blur(8px)",
                borderRadius: "14px",
                border: "2px solid rgba(255,255,255,0.35)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 16px rgba(0,0,0,0.2)",
                letterSpacing: "-0.02em",
            }}
        >
            {initial}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
const AdminProfile = () => {

    const { aToken } = useContext(AdminContext);

    // Initialize from cache → instant render on revisit, no skeleton flash
    const [admin,       setAdmin]       = useState(() => _adminCache ?? null);
    const [loading,     setLoading]     = useState(false);
    // Only show skeleton on true first-load (no cache) after a delay
    const [showSkeleton, setShowSkeleton] = useState(false);
    const skeletonTimer = useRef(null);

    // profile edit
    const [editing,     setEditing]     = useState(false);
    const [name,        setName]        = useState("");
    const [email,       setEmail]       = useState("");
    const [imageFile,   setImageFile]   = useState(null);
    const [imagePreview,setImagePreview]= useState(null);
    const [imgError,    setImgError]    = useState(false);

    // password change
    const [changingPwd,    setChangingPwd]    = useState(false);
    const [currentPwd,     setCurrentPwd]     = useState("");
    const [newPwd,         setNewPwd]         = useState("");
    const [confirmPwd,     setConfirmPwd]     = useState("");
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd,     setShowNewPwd]     = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [pwdLoading,     setPwdLoading]     = useState(false);

    // ── fetch profile ──
    const fetchProfile = useCallback(async () => {
        // Only show skeleton if there's NO cached data at all (true first load)
        if (!_adminCache) {
            skeletonTimer.current = setTimeout(() => setShowSkeleton(true), 150);
        }
        try {
            const { data } = await axiosInstance.get("/api/admin/profile");
            if (data.success) {
                _adminCache = data.admin; // populate cache for instant future renders
                setAdmin(data.admin);
                setName(data.admin.name  || "Admin");
                setEmail(data.admin.email || "");
                setImgError(false);
            } else toast.error(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            clearTimeout(skeletonTimer.current);
            setShowSkeleton(false);
        }
    }, []);

    useEffect(() => {
        if (aToken) {
            // If we have cached data, hydrate name/email immediately
            if (_adminCache) {
                setName(_adminCache.name  || "Admin");
                setEmail(_adminCache.email || "");
            }
            fetchProfile(); // always refresh in background
        }
        return () => clearTimeout(skeletonTimer.current);
    }, [aToken, fetchProfile]);

    // ── image select ──
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setImgError(false);
    };

    // ── save profile ──
    const handleSave = async () => {
        if (!name.trim()) return toast.error("Name cannot be empty ❗");
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name",  name);
            formData.append("email", email);
            if (imageFile) formData.append("image", imageFile);

            const { data } = await axiosInstance.post("/api/admin/update-profile", formData);
            if (data.success) {
                toast.success(data.message);
                setEditing(false);
                setImageFile(null);
                _adminCache = null; // invalidate cache so fresh data is fetched
                fetchProfile();
            } else toast.error(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    // ── cancel edit ──
    const handleCancelEdit = () => {
        setEditing(false);
        setImageFile(null);
        setImagePreview(null);
        setImgError(false);
        setName(admin.name  || "Admin");
        setEmail(admin.email || "");
    };

    // ── change password ──
    const handleChangePassword = async () => {
        if (!currentPwd || !newPwd || !confirmPwd)
            return toast.error("Please fill all password fields ‼️");
        if (newPwd.length < 8)
            return toast.error("New password must be at least 8 characters 🔑");
        if (newPwd !== confirmPwd)
            return toast.error("Passwords do not match ❌");
        if (newPwd === currentPwd)
            return toast.error("New password must be different from current ‼️");

        setPwdLoading(true);
        try {
            const { data } = await axiosInstance.post("/api/admin/change-password", {
                currentPassword: currentPwd,
                newPassword:     newPwd
            });
            if (data.success) {
                toast.success(data.message);
                setChangingPwd(false);
                setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
            } else toast.error(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setPwdLoading(false);
        }
    };

    // ── Loading — only rendered after 150 ms delay ──
    if (!admin) return (
        <AnimatePresence>
            {showSkeleton && (
                <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto"
                >
                    <div className="h-8 w-48 bg-gray-200 rounded-xl mb-6 animate-pulse"/>
                    <div className="bg-white rounded-2xl border border-gray-300 h-40 animate-pulse mb-5"/>
                    <div className="bg-white rounded-2xl border border-gray-300 h-24 animate-pulse"/>
                </motion.div>
            )}
        </AnimatePresence>
    );

    //existing image → fallback initial
    const displayImage = imagePreview || (!imgError && admin.image) || null;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">

            {/* ── Page heading ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }} className="mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
                        flex items-center justify-center shadow-lg shadow-indigo-200">
                        <MdAdminPanelSettings size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 leading-tight">
                            My Profile
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-900 mt-0.5 flex items-center gap-1">
                            <MdVerified size={13} className="text-indigo-500" />
                            Manage your admin account
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── Profile Card ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-300 shadow-lg overflow-hidden mb-5">

                {/* Hero banner */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-6">
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none"/>
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none"/>
                    <div className="relative z-10 flex items-center gap-4">

                        {/* ── Avatar: real image OR styled initial ── */}
                        <div className="relative flex-shrink-0">
                            {displayImage ? (
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/40 shadow-lg">
                                    <img
                                        src={displayImage}
                                        alt="Admin"
                                        className="w-full h-full object-cover"
                                        onError={() => { setImgError(true); }}
                                    />
                                </div>
                            ) : (
                                <AdminInitialAvatar name={admin.name} size={64} />
                            )}

                            {/* Camera overlay — only in edit mode */}
                            {editing && (
                                <label htmlFor="admin-img"
                                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full
                                        bg-indigo-500 border-2 border-white flex items-center justify-center
                                        cursor-pointer hover:bg-indigo-600 transition-colors shadow-md z-10">
                                    <FiCamera size={13} className="text-white"/>
                                    <input type="file" id="admin-img" hidden accept="image/*"
                                        onChange={handleImageChange}/>
                                </label>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <HiSparkles size={12} className="text-white/70"/>
                                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                                    Medinex Admin
                                </span>
                                <HiSparkles size={12} className="text-white/70"/>
                            </div>
                            <p className="text-white font-extrabold text-xl leading-tight">
                                {admin.name || "Admin"}
                            </p>
                            <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                                <MdVerified size={11} className="text-cyan-400"/>
                                Verified Administrator
                            </p>
                        </div>

                        {/* Edit / Save buttons */}
                        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                            {!editing ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                        bg-white/20 backdrop-blur-sm text-white text-xs font-bold
                                        border border-white/30 cursor-pointer hover:bg-white/30 transition-colors"
                                >
                                    <FiEdit2 size={12}/> Edit
                                </motion.button>
                            ) : (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={handleSave} disabled={loading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                            bg-white text-indigo-600 text-xs font-bold
                                            border border-white/30 cursor-pointer
                                            hover:bg-indigo-100 transition-colors disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <motion.span animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent inline-block"/>
                                        ) : <><FiSave size={12}/> Save</>}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={handleCancelEdit}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                            bg-white/20 backdrop-blur-sm text-white text-xs font-bold
                                            border border-white/30 cursor-pointer hover:bg-white/30 transition-colors"
                                    >
                                        <FiX size={12}/> Cancel
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile fields */}
                <div className="p-5 sm:p-6 space-y-4">

                    <SectionLabel icon={FiUser} label="Personal Information" />

                    {/* Name */}
                    <motion.div variants={fieldVariants} initial="hidden" animate="visible"
                        className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider
                            flex items-center gap-1.5">
                            <FiUser size={13} className="text-indigo-500"/> Display Name
                        </label>
                        {editing ? (
                            <input className={inputCls} type="text" value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter your name" autoFocus/>
                        ) : (
                            <div className="p-3 rounded-xl bg-gray-200 border-1 border-gray-400">
                                <span className="text-sm font-semibold text-gray-700">
                                    {admin.name || "Admin"}
                                </span>
                            </div>
                        )}
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={fieldVariants} initial="hidden" animate="visible"
                        transition={{ delay: 0.05 }} className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider
                            flex items-center gap-1.5">
                            <FiMail size={13} className="text-indigo-500"/> Email Address
                        </label>
                        {editing ? (
                            <input className={inputCls} type="email" value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter email address"/>
                        ) : (
                            <div className="p-3 rounded-xl bg-gray-200 border-1 border-gray-400">
                                <span className="text-sm font-semibold text-gray-700">
                                    {admin.email}
                                </span>
                            </div>
                        )}
                    </motion.div>

                    {/* Role — always read only */}
                    <motion.div variants={fieldVariants} initial="hidden" animate="visible"
                        transition={{ delay: 0.1 }} className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider
                            flex items-center gap-1.5">
                            <FiShield size={13} className="text-indigo-500"/> Role
                        </label>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-200 border-1 border-indigo-400">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600
                                flex items-center justify-center flex-shrink-0">
                                <FiShield size={13} className="text-white"/>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-indigo-800">Administrator</p>
                                <p className="text-[10px] text-indigo-600">Full platform access</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Member since */}
                    {admin.createdAt && (
                        <motion.div variants={fieldVariants} initial="hidden" animate="visible"
                            transition={{ delay: 0.15 }} className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider
                                flex items-center gap-1.5">
                                <FiCalendar size={13} className="text-indigo-500"/> Member Since
                            </label>
                            <div className="p-3 rounded-xl bg-gray-200 border-1 border-gray-400">
                                <span className="text-sm font-semibold text-gray-700">
                                    {new Date(admin.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric", month: "long", day: "numeric"
                                    })}
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* Image selected indicator */}
                    <AnimatePresence>
                        {imageFile && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                                <MdVerified size={12}/> New photo selected — save to apply
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* ── Change Password Card ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-300 shadow-lg overflow-hidden">

                <div className="flex items-center justify-between px-5 py-4
                    border-b border-gray-400 bg-gradient-to-r from-gray-200 to-white">
                    <SectionLabel icon={FiLock} label="Change Password" />
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setChangingPwd(p => !p);
                            setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer
                            border transition-colors mb-4
                            ${changingPwd
                                ? "bg-red-200 text-red-500 border-red-500 hover:bg-red-200"
                                : "bg-indigo-200 text-indigo-600 border-indigo-500 hover:bg-indigo-200"}`}
                    >
                        {changingPwd ? "Cancel" : "Change"}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {changingPwd && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-5 sm:p-6 space-y-4 overflow-hidden"
                        >
                            <PasswordField label="Current Password" value={currentPwd}
                                setValue={setCurrentPwd} show={showCurrentPwd} setShow={setShowCurrentPwd}/>
                            <PasswordField label="New Password" value={newPwd}
                                setValue={setNewPwd} show={showNewPwd} setShow={setShowNewPwd}/>
                            <PasswordField label="Confirm New Password" value={confirmPwd}
                                setValue={setConfirmPwd} show={showConfirmPwd} setShow={setShowConfirmPwd}/>

                            <motion.button
                                whileHover={{ y: -1, boxShadow: "0 8px 24px rgba(99,102,241,0.35)" }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleChangePassword}
                                disabled={pwdLoading}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600
                                    text-white text-sm font-bold border-none cursor-pointer
                                    shadow-lg shadow-indigo-200 flex items-center justify-center gap-2
                                    disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                                {pwdLoading ? (
                                    <>
                                        <motion.span animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 rounded-full border-2 border-white border-t-transparent inline-block"/>
                                        Updating...
                                    </>
                                ) : <><FiLock size={14}/> Update Password</>}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!changingPwd && (
                    <div className="px-5 py-4">
                        <p className="text-xs text-gray-900">
                            Keep your account secure by using a strong, unique password.
                        </p>
                    </div>
                )}
            </motion.div>

        </div>
    );
};

export default AdminProfile;