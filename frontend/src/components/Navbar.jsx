import React, { useContext, useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu, FiX, FiUser, FiActivity,
  FiChevronDown, FiCalendar, FiLogOut,
} from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";

// ── animation variants ────────────────────────────────────────────────────────
const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.18, ease: "easeOut" }
  },
  exit: {
    opacity: 0, y: -6, scale: 0.97,
    transition: { duration: 0.13, ease: "easeIn" }
  },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { x: "100%", transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ── nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { name: "HOME", path: "/" },
  { name: "ALL DOCTORS", path: "/doctors" },
  { name: "ABOUT", path: "/about" },
  { name: "CONTACT", path: "/contact" },
];

// ── User Initial Avatar ───────────────────────────────────────────────────────
const UserInitialAvatar = ({ name, size = 36, className = "" }) => {
  const initial = (name?.trim()?.[0] || "U").toUpperCase();
  const COLORS = [
    ["#6366f1","#4338ca"], ["#8b5cf6","#6d28d9"], ["#ec4899","#be185d"],
    ["#14b8a6","#0f766e"], ["#f59e0b","#b45309"], ["#10b981","#047857"],
    ["#3b82f6","#1d4ed8"], ["#ef4444","#b91c1c"],
  ];
  const [bg, bg2] = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
      style={{
        width: size, height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, ${bg}, ${bg2})`,
        color: "#fff",
      }}
    >
      {initial}
    </div>
  );
};

// ── Avatar — shows image if valid, initial otherwise ──────────────────────────
const Avatar = ({ src, name, size = 36, className = "" }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <UserInitialAvatar name={name} size={size} className={className} />;
  }
  return (
    <img
      src={src} alt={name}
      onError={() => setFailed(true)}
      className={`rounded-full object-cover flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken, userData } = useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const loginRef = useRef(null);
  const profileRef = useRef(null);

  // close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginDropdown(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = showMenu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showMenu]);

  const { isDark } = useTheme()
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setProfileDropdown(false);
    navigate("/login");
  };

  return (
    <>

      {/* ════════════════ NAVBAR ════════════════ */}
      <header className="sticky top-0 z-[9000]
        backdrop-blur-xl bg-gray-200/60
        border-b border-gray-400/50
        shadow-[0_2px_16px_rgba(99,102,241,0.08)]">
        <div className="flex items-center justify-between
          px-6 sm:px-8 py-4 max-w-[1280px] mx-auto">

          {/* LOGO */}
          <motion.img
            onClick={() => navigate("/")}
            src={assets.logo}
            alt="Medinex"
            className="w-50 h-12 cursor-pointer self-center object-contain"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          />

          {/* ── DESKTOP NAV ── */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `font-semibold text-[15px] font-semibold tracking-[0.4px]
                   no-underline relative 
                   ${isActive ? "text-indigo-600" : "text-gray-700"}`
                }
              >
                {({ isActive }) => (
                  <motion.span
                    className="relative"
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                  >
                    {/* text colour transition */}
                    <motion.span
                      variants={{
                        rest: { color: isActive ? "#4f46e5" : "#374151" },
                        hover: {
                          color: "#4f46e5",
                          transition: { duration: 0.22, ease: "easeOut" }
                        },
                      }}
                      style={{ display: "inline-block" }}
                    >
                      {item.name}
                    </motion.span>
                  </motion.span>
                )}
              </NavLink>
            ))}
          </ul>

          {/* ── RIGHT SECTION ── */}
          <div className="flex items-center gap-3">

            {token && userData ? (

              /* ── PROFILE DROPDOWN ── */
              <div ref={profileRef} className="relative">
                <motion.div
                  onClick={() => setProfileDropdown(p => !p)}
                  className={`flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-xl
                    transition-colors duration-200
                    ${profileDropdown ? "bg-indigo-200" : "hover:bg-indigo-200/60"}`}
                  whileTap={{ scale: 0.97 }}
                >
                  <Avatar
                    src={userData.image}
                    name={userData.name}
                    size={36}
                    className="border-2 border-indigo-500"
                  />
                  <motion.span
                    animate={{ rotate: profileDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiChevronDown size={15} className="text-gray-500" />
                  </motion.span>
                </motion.div>

                <AnimatePresence>
                  {profileDropdown && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className="absolute right-0 top-[calc(100%+8px)]
                        w-52 rounded-2xl overflow-hidden
                        bg-white/95 backdrop-blur-xl
                        border border-indigo-500
                        shadow-[0_8px_32px_rgba(99,102,241,0.15)]
                        z-[100]"
                    >
                      {/* user info */}
                      <div className="px-4 py-3 border-b border-gray-400">
                        <p className="text-[13px] font-semibold text-gray-900">{userData.name}</p>
                        <p className="text-[11px] text-gray-700 mt-0.5">{userData.email}</p>
                      </div>

                      {/* menu items */}
                      {[
                        { icon: <FiUser size={14} />, label: "My Profile", action: () => { navigate("/my-profile"); setProfileDropdown(false); } },
                        { icon: <FiCalendar size={14} />, label: "My Appointments", action: () => { navigate("/my-appointments"); setProfileDropdown(false); } },
                        { icon: <FiLogOut size={14} />, label: "Logout", action: logout, danger: true },
                      ].map((item, i) => (
                        <motion.button
                          key={i}
                          onClick={item.action}
                          whileHover={{
                            backgroundColor: item.danger
                              ? (isDark ? "rgba(185,28,28,0.15)" : "#fef2f2")
                              : (isDark ? "rgba(49,46,129,0.25)" : "#f5f3ff")
                          }}
                          className={`flex items-center gap-2.5 w-full px-4 py-2.5
                            text-[13px] text-left bg-transparent border-none cursor-pointer
                            transition-colors duration-150
                            ${item.danger ? "text-red-500" : "text-gray-700"}`}
                        >
                          {item.icon} {item.label}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            ) : (
              <>
                {/* ── LOGIN DROPDOWN (desktop) ── */}
                <div ref={loginRef} className="relative hidden md:block">
                  <motion.button
                    onClick={() => setLoginDropdown(p => !p)}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-1.5 font-semibold text-[15px] text-gray-700
                      px-3.5 py-2.5 rounded-xl border-none cursor-pointer
                      transition-colors duration-200
                      ${loginDropdown ? "bg-indigo-200 text-indigo-600" : "bg-transparent hover:bg-indigo-200/60"}`}
                  >
                    Log in
                    <motion.span
                      animate={{ rotate: loginDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiChevronDown size={15} />
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {loginDropdown && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+10px)]
                          w-56 rounded-2xl overflow-hidden
                          bg-white/97 backdrop-blur-xl
                          border border-indigo-500
                          shadow-[0_12px_40px_rgba(99,102,241,0.18)]
                          z-[100] py-3"
                      >
                        {/* Patients */}
                        <p className="text-[11px] font-bold text-gray-700 uppercase
                          tracking-[0.8px] px-4 pb-1.5">
                          Patients
                        </p>
                        {[
                          { label: "Patient Login", action: () => { navigate("/login"); setLoginDropdown(false); } },
                          { label: "Create Account", action: () => { navigate("/signup"); setLoginDropdown(false); } },
                        ].map((item) => (
                          <motion.button
                            key={item.label}
                            onClick={item.action}
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5
                              text-[13.5px] text-gray-700 text-left
                              border-none cursor-pointer hover:text-indigo-600 transition-colors duration-200"
                          >
                            <FiUser size={14} className="text-indigo-500" />
                            {item.label}
                          </motion.button>
                        ))}

                        <div className="my-3 mx-4 h-[0.5px] bg-gray-400 rounded-full" />

                        {/* Doctors */}
                        <p className="text-[11px] font-bold text-gray-600 uppercase
                          tracking-[0.8px] px-4 pb-1.5">
                          Doctors
                        </p>
                        <motion.button
                          onClick={() => { window.open("http://localhost:5174?role=doctor", "_blank"); setLoginDropdown(false); }}
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5
                            text-[13.5px] text-gray-700 text-left
                            bg-transparent border-none cursor-pointer hover:text-indigo-600 transition-colors duration-200"
                        >
                          <FiActivity size={14} className="text-indigo-500" />
                          Doctor Login
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Create Account button (desktop) */}
                <motion.button
                  onClick={() => navigate("/signup")}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 8px 24px rgba(99,102,241,0.5)",
                    transition: { type: "spring", stiffness: 400, damping: 20 },
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="hidden md:block bg-gradient-to-r from-blue-500 to-violet-600
                    text-white font-serif font-semibold text-[15px]
                    px-6 py-2.5 rounded-full border-none cursor-pointer
                    shadow-[0_4px_14px_rgba(99,102,241,0.35)]
                    whitespace-nowrap"
                >
                  Create Account
                </motion.button>
              </>
            )}

            {/* Dark / Light toggle */}
            <ThemeToggle />

            {/* Mobile hamburger */}
            <motion.button
              onClick={() => setShowMenu(true)}
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-1.5 bg-transparent border-none
                cursor-pointer text-gray-700"
            >
              <FiMenu size={26} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ════════════════ MOBILE DRAWER ════════════════ */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              variants={backdropVariants}
              initial="hidden" animate="visible" exit="exit"
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-[4px] z-[9998]"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              variants={drawerVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed top-0 right-0 h-full w-[280px] max-w-[82vw]
                bg-white/97 backdrop-blur-2xl
                border-l border-indigo-100/50
                shadow-[-8px_0_40px_rgba(99,102,241,0.12)]
                z-[9999] flex flex-col overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-400/50">
                <img src={assets.logo} className="w-24" alt="Medinex" />
                <motion.button
                  onClick={() => setShowMenu(false)}
                  whileTap={{ scale: 0.9 }}
                  className="bg-gray-300 border-none cursor-pointer
                    rounded-lg p-1.5 text-gray-700 flex items-center"
                >
                  <FiX size={18} />
                </motion.button>
              </div>

              {/* Nav links */}
              <nav className="py-3">
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={() => setShowMenu(false)}
                      className={({ isActive }) =>
                        `block px-5 py-3 text-sm font-semibold no-underline
                         border-l-[3px] transition-all duration-150
                         ${isActive
                          ? "text-indigo-600 border-indigo-500 bg-indigo-200/60"
                          : "text-gray-700 border-transparent hover:bg-indigo-200/40"
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <div className="h-px bg-gray-300 mx-5" />

              {/* Auth section */}
              <div className="px-5 py-4 flex flex-col gap-2">
                {!token ? (
                  <>
                    <p className="text-[11px] font-bold text-gray-600 uppercase
                      tracking-[0.8px] mb-1">
                      Patients
                    </p>

                    <motion.button
                      onClick={() => { navigate("/login"); setShowMenu(false); }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 px-4 rounded-xl border-none cursor-pointer
                        bg-gradient-to-r from-blue-500 to-violet-600
                        text-white font-semibold text-[13.5px] text-center"
                    >
                      Patient Login
                    </motion.button>

                    <motion.button
                      onClick={() => { navigate("/signup"); setShowMenu(false); }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 px-4 rounded-xl cursor-pointer
                        border border-indigo-400 bg-gray-200
                        text-indigo-600 font-semibold text-[13.5px] text-center"
                    >
                      Create Account
                    </motion.button>

                    <p className="text-[11px] font-bold text-gray-600 uppercase
                      tracking-[0.8px] mt-3 mb-1">
                      Doctors
                    </p>

                    <motion.button
                      onClick={() => { window.open("http://localhost:5174?role=doctor", "_blank"); setShowMenu(false); }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 px-4 rounded-xl cursor-pointer
                        border border-gray-400 bg-gray-200
                        text-gray-700 font-medium text-[13.5px]
                        flex items-center gap-2"
                    >
                      <FiActivity size={15} className="text-indigo-500" />
                      Doctor Login
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* User info card */}
                    {userData && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3.5
                          bg-indigo-100 rounded-xl mb-1"
                      >
                        <Avatar
                          src={userData.image}
                          name={userData.name}
                          size={40}
                          className="border-2 border-indigo-500"
                        />
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{userData.name}</p>
                          <p className="text-[11px] text-gray-600">{userData.email}</p>
                        </div>
                      </motion.div>
                    )}

                    {[
                      { icon: <FiUser size={15} />, label: "My Profile", path: "/my-profile" },
                      { icon: <FiCalendar size={15} />, label: "My Appointments", path: "/my-appointments" },
                    ].map((item) => (
                      <motion.button
                        key={item.path}
                        onClick={() => { navigate(item.path); setShowMenu(false); }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2.5 w-full py-3 px-3.5
                          rounded-xl border border-gray-400 bg-transparent
                          text-gray-700 font-medium text-[13.5px] cursor-pointer"
                      >
                        {item.icon} {item.label}
                      </motion.button>
                    ))}

                    <motion.button
                      onClick={logout}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2.5 w-full py-3 px-3.5 mt-1
                        rounded-xl border border-red-500 bg-red-100
                        text-red-500 font-semibold text-[13.5px] cursor-pointer"
                    >
                      <FiLogOut size={15} /> Logout
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;