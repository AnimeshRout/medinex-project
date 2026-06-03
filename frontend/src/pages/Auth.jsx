import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { FaEye, FaEyeSlash, FaHeartbeat } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useGoogleLogin } from "@react-oauth/google";

import Lottie from "lottie-react";
import doctorAnimation from "../assets/doctor.json";

// ─── Timing — mirrors original 0.6s ease-in-out ──────────────────────────────
const EASE = [0.65, 0, 0.35, 1];
const DUR  = 0.6;

// ─── Reusable Input ───────────────────────────────────────────────────────────
const InputField = ({ icon: Icon, type, placeholder, value, onChange, eyeNode }) => (
  <div className="relative mb-[14px]">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none" />
    <input
      type={type}
      required
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-100 border border-gray-400 rounded-[10px]
                 py-[11px] pl-9 pr-9 text-[13px] outline-none
                 focus:border-indigo-500 focus:bg-white
                 transition-[border-color,background] duration-200
                 placeholder:text-gray-600"
    />
    {eyeNode && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500">
        {eyeNode}
      </span>
    )}
  </div>
);

// ─── Shared sub-components ────────────────────────────────────────────────────
const PrimaryBtn = ({ label, className = "" }) => (
  <button
    type="submit"
    className={`w-full py-[11px] rounded-[10px] mt-[2px]
               bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600
               text-white text-[13px] font-semibold border-none cursor-pointer
               hover:opacity-90 hover:-translate-y-px
               transition-[opacity,transform] duration-200 ${className}`}
  >
    {label}
  </button>
);

const OrDivider = () => (
  <div className="flex items-center gap-[10px] my-[11px]">
    <div className="flex-1 h-px bg-gray-400" />
    <span className="text-[11px] text-gray-800">OR</span>
    <div className="flex-1 h-px bg-gray-400" />
  </div>
);

// ─── Updated GoogleBtn ──────────────────────────────────
const GoogleBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 py-[10px] rounded-[10px]
               border-1 border-gray-400 bg-white text-[13px] text-gray-900
               cursor-pointer hover:bg-gray-200
               hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)]
               transition-[background,box-shadow] duration-200"
  >
    <FcGoogle size={17} /> Continue with Google
  </button>
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
const Auth = ({ initialMode = "login" }) => {
  const [mode, setMode]                     = useState(initialMode);
  const isActive                            = mode === "signup";
  const [name, setName]                     = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [rememberMe, setRememberMe]         = useState(false);
  const [showPassLogin, setShowPassLogin]   = useState(false);
  const [showPassSignup, setShowPassSignup] = useState(false);

  const navigate = useNavigate();
  const { backendUrl, token, setToken, userData } = useContext(AppContext);

  useEffect(() => {
    if (token && userData) navigate("/");
  }, [token, userData, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/user/login", { email, password });
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success("Login successful 🎉");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong ⚠️");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/user/register", { name, email, password });
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success("Account created! Welcome 🎉");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong ⚠️");
    }
  };

  // ─── Google Auth ────────────────────────────────────────────────────────────
  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await axios.post(backendUrl + "/api/user/google-auth", {
          access_token: tokenResponse.access_token,
        });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Signed in with Google 🎉");
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Google sign-in failed ⚠️");
      }
    },
    onError: () => toast.error("Google sign-in was cancelled"),
  });

  return (
    <section className="px-4 py-12 relative z-[1]">

      {/*
        ══════════════════════════════════════════════════════════════════════════
        CARD
        ══════════════════════════════════════════════════════════════════════════
      */}
      <div className="relative w-full max-w-[860px] min-h-[520px] bg-white rounded-[30px]
                      shadow-[0_8px_32px_rgba(99,102,241,0.13)] overflow-hidden mx-auto
                      max-[640px]:rounded-[20px] max-[640px]:min-h-0">

        {/*
          ────────────────────────────────────────────────────────────────────────
          MOBILE BANNER  — shown only on ≤640 px
          ────────────────────────────────────────────────────────────────────────
        */}
        <div className="hidden max-[640px]:flex flex-col items-center text-center
                        bg-gradient-to-br from-indigo-500 to-violet-600 text-white
                        px-5 pt-6 pb-5 rounded-t-[20px]">
          <div className="w-[120px] mb-2">
            <Lottie animationData={doctorAnimation} loop />
          </div>

          <AnimatePresence mode="wait">
            {!isActive ? (
              <motion.div key="mob-login-hdr"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <h3 className="text-[18px] font-bold my-1">Welcome Back! 👋</h3>
                <p className="text-[12px] opacity-90 leading-relaxed mb-2">
                  Sign in to manage your appointments 🏥
                </p>
              </motion.div>
            ) : (
              <motion.div key="mob-signup-hdr"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <h3 className="text-[18px] font-bold my-1">Join Medinex 🌟</h3>
                <p className="text-[12px] opacity-90 leading-relaxed mb-2">
                  500+ doctors. Book in seconds ⚡
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/*
          ────────────────────────────────────────────────────────────────────────
          MOBILE FORMS  — shown only on ≤640 px
          ────────────────────────────────────────────────────────────────────────
        */}
        <div className="hidden max-[640px]:block px-6 py-8 bg-white">
          <AnimatePresence mode="wait">
            {!isActive ? (
              <motion.form key="mob-form-login" onSubmit={handleLogin}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: EASE }}>

                <h2 className="text-[26px] font-bold text-[#4338ca] mb-1">Sign In 👋</h2>
                <p className="text-[13px] text-gray-900 mb-[22px]">
                  Welcome back! Please enter your details.
                </p>

                <InputField icon={FiMail} type="email" placeholder="Enter your email"
                  value={email} onChange={e => setEmail(e.target.value)} />
                <InputField icon={FiLock}
                  type={showPassLogin ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  eyeNode={<span onClick={() => setShowPassLogin(v => !v)}>
                    {showPassLogin ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                  </span>} />

                <div className="flex items-center justify-between text-[12px] mb-[14px]">
                  <label className="flex items-center gap-1.5 text-gray-900 cursor-pointer">
                    <input type="checkbox" checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-[14px] h-[14px] accent-indigo-500 cursor-pointer" />
                    Remember Me
                  </label>
                  <a href="/forgot-password"
                    className="text-indigo-500 font-medium no-underline hover:underline">
                    Forgot password?
                  </a>
                </div>

                <PrimaryBtn label="Sign In" />
                <OrDivider />
                <GoogleBtn onClick={handleGoogleAuth} />

                <p className="text-[12px] text-center mt-4 text-gray-800">
                  Don't have an account?{" "}
                  <span onClick={() => setMode("signup")}
                    className="text-indigo-500 cursor-pointer font-semibold">Sign Up</span>
                </p>
              </motion.form>
            ) : (
              <motion.form key="mob-form-signup" onSubmit={handleSignup}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: EASE }}>

                <h2 className="text-[26px] font-bold text-[#4338ca] mb-1">Create Account ✨</h2>
                <p className="text-[13px] text-gray-600 mb-[20px]">
                  Join Medinex — book appointments in seconds ⚡
                </p>

                <InputField icon={FiUser} type="text" placeholder="Enter your full name"
                  value={name} onChange={e => setName(e.target.value)} />
                <InputField icon={FiMail} type="email" placeholder="Enter your email"
                  value={email} onChange={e => setEmail(e.target.value)} />
                <InputField icon={FiLock}
                  type={showPassSignup ? "text" : "password"}
                  placeholder="Create a password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  eyeNode={<span onClick={() => setShowPassSignup(v => !v)}>
                    {showPassSignup ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                  </span>} />

                <PrimaryBtn label="Create Account 🚀" className="mt-2" />
                <OrDivider />
                <GoogleBtn onClick={handleGoogleAuth} />

                <p className="text-[12px] text-center mt-4 text-gray-800">
                  Already have an account?{" "}
                  <span onClick={() => setMode("login")}
                    className="text-indigo-500 cursor-pointer font-semibold">Sign In</span>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/*
          ════════════════════════════════════════════════════════════════════════
          DESKTOP — hidden on ≤640 px
          ════════════════════════════════════════════════════════════════════════
        */}

        {/*
          ── SIGN-IN PANEL ──────────────────────────────────────────────────────
        */}

        <motion.div
          className="absolute top-0 left-0 w-1/2 h-full z-[2]
                     flex items-center justify-center px-10 bg-white
                     max-[640px]:hidden"
          animate={{
            x:       isActive ? "100%" : "0%",
            opacity: isActive ? 0 : 1,
          }}
          transition={{
            x: {
              duration: isActive ? 0 : DUR * 0.5,
              delay:    isActive ? 0 : DUR * 0.5,
              ease:     EASE,
            },
            opacity: {
              duration: DUR * 0.2,
              delay:    isActive ? 0 : DUR * 0.55,
            },
          }}
        >
          <form onSubmit={handleLogin} className="w-full max-w-[290px]">
            <h2 className="text-[26px] font-bold text-[#4338ca] mb-1">Sign In 👋</h2>
            <p className="text-[13px] text-gray-600 mb-[22px]">
              Welcome back! Please enter your details.
            </p>

            <InputField icon={FiMail} type="email" placeholder="Enter your email"
              value={email} onChange={e => setEmail(e.target.value)} />
            <InputField icon={FiLock}
              type={showPassLogin ? "text" : "password"}
              placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)}
              eyeNode={<span onClick={() => setShowPassLogin(v => !v)}>
                {showPassLogin ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
              </span>} />

            <div className="flex items-center justify-between text-[12px] mb-[14px]">
              <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer">
                <input type="checkbox" checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-[14px] h-[14px] accent-indigo-500 cursor-pointer" />
                Remember Me
              </label>
              <a href="/forgot-password"
                className="text-indigo-500 font-medium no-underline hover:underline">
                Forgot password?
              </a>
            </div>

            <PrimaryBtn label="Sign In" />
            <OrDivider />
            <GoogleBtn onClick={handleGoogleAuth} />

            <p className="text-[12px] text-center mt-4 text-gray-800">
              Don't have an account?{" "}
              <span onClick={() => setMode("signup")}
                className="text-indigo-500 cursor-pointer font-semibold">Sign Up</span>
            </p>
          </form>
        </motion.div>

        {/*
          ── SIGN-UP PANEL ──────────────────────────────────────────────────────
        */}

        <motion.div
          className="absolute top-0 left-0 w-1/2 h-full
                     flex items-center justify-center px-10 bg-white
                     max-[640px]:hidden"
          initial={{ x: "0%", opacity: 0, zIndex: 1 }}
          animate={{
            x:       isActive ? "100%" : "0%",
            opacity: isActive ? 1 : 0,
            zIndex:  isActive ? 5 : 1,
          }}
          transition={{
            x: {
              duration: DUR * 0.5,
              delay:    isActive ? DUR * 0.5 : 0,
              ease:     EASE,
            },
            opacity: {
              duration: DUR * 0.3,
              delay:    isActive ? DUR * 0.48 : 0,
            },
            zIndex: {
              duration: 0,
              delay: isActive ? DUR * 0.48 : 0,
            },
          }}
        >
          <form onSubmit={handleSignup} className="w-full max-w-[290px]">
            <h2 className="text-[26px] font-bold text-[#4338ca] mb-1">Create Account ✨</h2>
            <p className="text-[13px] text-gray-600 mb-[20px]">
              Join Medinex — book appointments in seconds ⚡
            </p>

            <InputField icon={FiUser} type="text" placeholder="Enter your full name"
              value={name} onChange={e => setName(e.target.value)} />
            <InputField icon={FiMail} type="email" placeholder="Enter your email"
              value={email} onChange={e => setEmail(e.target.value)} />
            <InputField icon={FiLock}
              type={showPassSignup ? "text" : "password"}
              placeholder="Create a password"
              value={password} onChange={e => setPassword(e.target.value)}
              eyeNode={<span onClick={() => setShowPassSignup(v => !v)}>
                {showPassSignup ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
              </span>} />

            <PrimaryBtn label="Create Account 🚀" className="mt-2" />
            <OrDivider />
            <GoogleBtn onClick={handleGoogleAuth} />

            <p className="text-[12px] text-center mt-4 text-gray-800">
              Already have an account?{" "}
              <span onClick={() => setMode("login")}
                className="text-indigo-500 cursor-pointer font-semibold">Sign In</span>
            </p>
          </form>
        </motion.div>

        {/*
          ════════════════════════════════════════════════════════════════════════
          SLIDING OVERLAY  — the pill-shaped gradient panel that sweeps across
          ════════════════════════════════════════════════════════════════════════
        */}
        <motion.div
          className="absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-[10]
                     max-[640px]:hidden"
          animate={{
            x: isActive ? "-100%" : "0%",
            borderRadius: isActive
              ? "0px 150px 100px 0px"
              : "150px 0px 0px 100px",
          }}
          transition={{ duration: DUR, ease: EASE }}
        >
          {/* 200%-wide inner strip */}
          <motion.div
            className="relative h-full flex"
            style={{ width: "200%", left: "-100%" }}
            animate={{ x: isActive ? "50%" : "0%" }}
            transition={{ duration: DUR, ease: EASE }}
          >
            {/* Gradient bg spans full 200% strip */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-700" />

            <motion.div
              className="relative z-[1] w-1/2 h-full flex flex-col items-center justify-center
                         px-8 text-center text-white"
              animate={{ x: isActive ? "0%" : "-200%" }}
              transition={{ duration: DUR, ease: EASE }}
            >
              <FaHeartbeat size={32} className="mb-3 opacity-90" />
              <h2 className="text-[22px] font-bold mb-[10px]">Welcome to Medinex 🌟</h2>
              <p className="text-[13px] opacity-[0.88] leading-[1.7] mb-5">
                Your trusted healthcare companion 💙<br />
                Create your account and start booking<br />appointments easily ⚡
              </p>          
              <div className="w-[200px] mx-auto mb-3">
                <Lottie animationData={doctorAnimation} loop />
              </div>
            </motion.div>

            <motion.div
              className="relative z-[1] w-1/2 h-full flex flex-col items-center justify-center
                         px-8 text-center text-white"
              animate={{ x: isActive ? "200%" : "0%" }}
              transition={{ duration: DUR, ease: EASE }}
            >
              <FaHeartbeat size={32} className="mb-3 opacity-90" />
              <h2 className="text-[22px] font-bold mb-[10px]">Welcome Back! 👋</h2>
              <p className="text-[13px] opacity-[0.88] leading-[1.7] mb-5">
                Good to see you again 😊<br />
                Sign in and continue your healthcare journey<br />with trusted doctors on Medinex 🏥
              </p>
              <div className="w-[200px] mx-auto mb-3">
                <Lottie animationData={doctorAnimation} loop />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
        {/* ══ end overlay ══ */}

      </div>
    </section>
  );
};

export default Auth;