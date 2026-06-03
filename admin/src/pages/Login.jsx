import React, { useContext, useEffect, useRef, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import axiosInstance from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import loginAnimation from "../assets/login.json";
import {
  FiMail, FiLock, FiEye, FiEyeOff,
  FiShield, FiActivity, FiArrowRight,FiUser,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { HiSparkles } from "react-icons/hi";
import { useGoogleLogin } from "@react-oauth/google"; 

// ─── Role config ─────────────────────────────────────────────────────────────
const ROLES = {
  Admin: {
    accentBg: "bg-gradient-to-br from-blue-900 via-cyan-600 to-indigo-500",
    overlayGrad: "linear-gradient(135deg, #1e3a5f 0%, #0891b2 50%, #6366f1 100%)",
    chipBg: "bg-blue-50 text-blue-700",
    focusRing: "focus:border-blue-600",
    hoverRing: "hover:border-blue-500",
    btnBg: "bg-gradient-to-r from-blue-900 via-blue-500 to-indigo-900",
    btnShadow: "shadow-blue-400/40",
    linkColor: "text-blue-600",
    pillBg: "bg-indigo-600/70 border-indigo-600/50 hover:bg-indigo-400/50",
    icon: FiShield,
    tag: "Administrator Portal",
    switchBtn: "Switch to Doctor",
    taglineHead: "Admin Control Centre",
    taglineSub: "Manage doctors, appointments & analytics from one powerful dashboard.",
    endpoint: "/api/admin/login",
    googleEndpoint: "/api/admin/google-login", // ← NEW
    storageKey: "aToken",
    dashboardPath: "/admin-dashboard",
    heading: "Admin Sign In",
    subheading: "Access the admin dashboard to manage operations.",
    switchLabel: "Doctor Login?",
  },
  Doctor: {
    accentBg: "bg-gradient-to-br from-blue-900 via-cyan-600 to-emerald-500",
    overlayGrad: "linear-gradient(135deg, #1e3a5f 0%, #0891b2 50%, #10b981 100%)",
    chipBg: "bg-emerald-50 text-emerald-700",
    focusRing: "focus:border-emerald-600",
    hoverRing: "hover:border-emerald-500",
    btnBg: "bg-gradient-to-r from-emerald-900 via-emerald-500 to-teal-900",
    btnShadow: "shadow-emerald-400/40",
    linkColor: "text-emerald-600",
    pillBg: "bg-emerald-600/70 border-emerald-600/50 hover:bg-emerald-400/50",
    icon: FiActivity,
    tag: "Doctor Portal",
    switchBtn: "Switch to Admin",
    taglineHead: "Welcome, Doctor 🩺",
    taglineSub: "View your appointments, manage your schedule and patient records.",
    endpoint: "/api/doctor/login",
    googleEndpoint: "/api/doctor/google-login", // ← NEW
    storageKey: "dToken",
    dashboardPath: "/doctor-dashboard",
    heading: "Doctor Sign In",
    subheading: "Sign in to view your schedule and patient records.",
    switchLabel: "Admin Login?",
  },
};

// ─── Input field ──────────────────────────────────────────────────────────────
const Field = ({ icon: Icon, type, placeholder, value, onChange, right, focusRing, hoverRing }) => (
  <div className="relative mb-4">
    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
    <input
      type={type} required placeholder={placeholder}
      value={value} onChange={onChange}
      className={`w-full bg-white border-1 border-gray-600 rounded-xl
        py-3 pl-9 pr-10 text-[15px] font-serif text-gray-800 placeholder:text-gray-600
        outline-none transition-all duration-200 ${hoverRing} ${focusRing}`}
    />
    {right && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500">
        {right}
      </span>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const Login = () => {
  const [role, setRole] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("role") === "doctor" ? "Doctor" : "Admin";
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [phase, setPhase] = useState("idle");
  const [overlayGrad, setOverlayGrad] = useState("");
  const nextRoleRef = useRef(null);

  const navigate = useNavigate();
  const { setAToken } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const cfg = ROLES[role];

  const triggerSwitch = () => {
    if (phase !== "idle") return;
    const next = role === "Admin" ? "Doctor" : "Admin";
    nextRoleRef.current = next;
    setOverlayGrad(ROLES[next].overlayGrad);
    setPhase("enter");
  };

  const onOverlayAnimationComplete = () => {
    if (phase === "enter") {
      setRole(nextRoleRef.current);
      setEmail("");
      setPassword("");
      setShowPass(false);
      setPhase("exit");
    } else if (phase === "exit") {
      setPhase("idle");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(cfg.endpoint, { email, password });
      if (data.success) {
        localStorage.setItem(cfg.storageKey, data.token);
        role === "Admin" ? setAToken(data.token) : setDToken(data.token);
        toast.success(`${role} Login Successful 🎉`);
        navigate(cfg.dashboardPath);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong ⚠️");
    } finally {
      setLoading(false);
    }
  };

  // ── NEW: Google login handler ──────────────────────────────────────────────
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.post(cfg.googleEndpoint, {
          accessToken: tokenResponse.access_token,
        });
        if (data.success) {
          localStorage.setItem(cfg.storageKey, data.token);
          role === "Admin" ? setAToken(data.token) : setDToken(data.token);
          toast.success(`${role} Google Login Successful 🎉`);
          navigate(cfg.dashboardPath);
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Google login failed ⚠️");
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Google Sign-In was cancelled or failed"),
  });
  // ──────────────────────────────────────────────────────────────────────────

  const overlayVariants = {
    enter: {
      initial: { x: "100%" },
      animate: { x: "0%", transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } },
    },
    exit: {
      initial: { x: "0%" },
      animate: { x: "-100%", transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } },
    },
  };

  const ov = overlayVariants[phase] ?? null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 py-8 overflow-hidden relative">

      {/* ── full-page wipe overlay ── */}
      <AnimatePresence>
        {phase !== "idle" && ov && (
          <motion.div
            key={phase + "-overlay"}
            initial={ov.initial}
            animate={ov.animate}
            onAnimationComplete={onOverlayAnimationComplete}
            style={{ background: overlayGrad }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.3 } }}
              className="w-36 drop-shadow-2xl"
            >
              <Lottie animationData={loginAnimation} loop />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.3 } }}
              className="text-white/90 text-sm font-semibold tracking-widest uppercase"
            >
              {nextRoleRef.current === "Doctor" ? "Doctor Portal" : "Admin Portal"}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── card ── */}
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/50
        flex flex-col md:flex-row min-h-[560px] relative z-10">

        {/* ════ FORM PANE ════ */}
        <div className="flex-1 bg-white flex items-center justify-center p-8 sm:p-12">
          <motion.div
            key={role + "-form"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            {/* chip */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              text-xs font-bold uppercase tracking-wider mb-5 ${cfg.chipBg}`}>
              <cfg.icon size={11} />
              {cfg.tag}
            </div>

            <h1 className="text-2xl font-extrabold text-gray-800 leading-tight mb-1">
              {cfg.heading}
            </h1>
            <p className="text-sm text-gray-700 mb-7">{cfg.subheading}</p>

            <form onSubmit={handleSubmit}>
              <Field
                icon={FiUser} type="text" placeholder="Enter your name"
                value={name} onChange={e => setName(e.target.value)}
                focusRing={cfg.focusRing}
                hoverRing={cfg.hoverRing}
              />
              <Field
                icon={FiMail} type="email" placeholder="Enter your email"
                value={email} onChange={e => setEmail(e.target.value)}
                focusRing={cfg.focusRing}
                hoverRing={cfg.hoverRing}
              />
              <Field
                icon={FiLock}
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
                focusRing={cfg.focusRing}
                hoverRing={cfg.hoverRing}
                right={
                  <span onClick={() => setShowPass(p => !p)}>
                    {showPass ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                  </span>
                }
              />

              <div className="text-right -mt-2 mb-5">
                <a href="#" className={`text-xs font-medium ${cfg.linkColor} hover:underline`}>
                  Forgot password?
                </a>
              </div>

              <motion.button
                type="submit" disabled={loading}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                className={`w-full py-3 rounded-xl text-white text-sm font-bold
                  shadow-lg ${cfg.btnShadow} ${cfg.btnBg}
                  transition-opacity disabled:opacity-60 cursor-pointer
                  flex items-center justify-center gap-2`}
              >
                {loading
                  ? "Signing in…"
                  : <><span>Sign In</span><FiArrowRight size={14} /></>
                }
              </motion.button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-600" />
              <span className="text-xs text-slate-900 font-medium">OR</span>
              <div className="flex-1 h-px bg-slate-600" />
            </div>

            {/* ── UPDATED: Google button now wired up ── */}
            <motion.button
              type="button" whileTap={{ scale: 0.98 }}
              onClick={() => handleGoogleLogin()} // ← NEW
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl
                border border-gray-600 bg-white text-sm text-gray-900 font-medium
                cursor-pointer transition-all hover:bg-gray-100 hover:shadow-sm
                disabled:opacity-60"
            >
              <FcGoogle size={17} />
              Continue with Google
            </motion.button>

            <p className="text-xs text-center mt-5 text-gray-900">
              {cfg.switchLabel}{" "}
              <span
                onClick={triggerSwitch}
                className={`font-bold underline cursor-pointer ${cfg.linkColor}`}
              >
                {cfg.switchBtn}
              </span>
            </p>
          </motion.div>
        </div>

        {/* ════ VISUAL PANE ════ */}
        <div className={`w-full md:w-[42%] flex-shrink-0 relative overflow-hidden
          flex flex-col items-center justify-center gap-5 p-8 ${cfg.accentBg}`}>

          {/* blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-12 -left-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />

          {/* fixed lottie */}
          <div className="w-44 sm:w-52 relative z-10 drop-shadow-2xl">
            <Lottie animationData={loginAnimation} loop />
          </div>

          <motion.div
            key={role + "-text"}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center relative z-10"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <HiSparkles size={14} className="text-white/70" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                Medinex Professional
              </span>
              <HiSparkles size={14} className="text-white/70" />
            </div>
            <h2 className="text-xl font-extrabold text-white leading-snug mb-3">
              {cfg.taglineHead}
            </h2>
            <p className="text-xs text-white font-semibold leading-relaxed max-w-[200px] mx-auto">
              {cfg.taglineSub}
            </p>
          </motion.div>

          {/* switch pill — visible against both gradients */}
          <motion.button
            onClick={triggerSwitch}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className={`relative z-10 inline-flex items-center gap-2 mt-1
              px-5 py-2.5 rounded-full border-2
              text-white text-xs font-bold
              cursor-pointer transition-all backdrop-blur-sm
              shadow-lg shadow-black/20
              ${cfg.pillBg}`}
          >
            {React.createElement(ROLES[role === "Admin" ? "Doctor" : "Admin"].icon, { size: 13 })}
            {cfg.switchBtn}
            <FiArrowRight size={13} />
          </motion.button>

        </div>
      </div>
    </div>
  );
};

export default Login;