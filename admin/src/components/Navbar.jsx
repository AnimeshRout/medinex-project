import React, { useContext, useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu, FiLogOut, FiHome, FiChevronDown,
  FiShield, FiActivity,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import ThemeToggle from "./ThemeToggle";

// ─────────────────────────────────────────────────────────────────────────────
const Navbar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef(null);

  const role    = aToken ? "Admin" : dToken ? "Doctor" : "";
  const isAdmin = !!aToken;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("aToken");
    localStorage.removeItem("dToken");
    setAToken("");
    setDToken("");
    navigate("/");
  };

  const roleGrad = isAdmin
    ? "from-blue-900 via-cyan-600 to-indigo-500"
    : "from-blue-900 via-cyan-600 to-emerald-500";

  const roleBadgeBg = isAdmin
    ? "bg-indigo-100/80 text-indigo-800 border-indigo-300/60"
    : "bg-emerald-100/80 text-emerald-800 border-emerald-300/60";

  const RoleIcon = isAdmin ? FiShield : FiActivity;

  const navBg = isAdmin
    ? "linear-gradient(135deg, rgba(196,181,253,0.7) 0%, rgba(147,197,253,0.7) 50%, rgba(103,232,249,0.7) 100%)"
    : "linear-gradient(135deg, rgba(221,214,254,0.7) 0%, rgba(187,247,208,0.7) 50%, rgba(125,211,252,0.7) 100%)"
;
//linear-gradient(135deg, rgba(236, 231, 254, 0.7) 0%, rgba(194, 222, 253, 0.7) 50%, rgba(143, 238, 250, 0.7) 100%) // option-1
//linear-gradient(135deg, rgba(212, 202, 253, 0.7) 0%, rgba(166, 207, 253, 0.7) 50%, rgba(119, 234, 249, 0.7) 100%) // option-2
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50"
      style={{
        background: navBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #9fa0a2",
        boxShadow: "0 2px 16px rgba(99,102,241,0.12)",
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">

        {/* ── LEFT ── */}
        <div className="flex items-center gap-3">

          {/* Mobile hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl border-none
              cursor-pointer text-gray-900 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.45)" }}
          >
            <FiMenu size={20}/>
          </motion.button>

          {/* Desktop collapse */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-2 rounded-xl border border-gray-200
              cursor-pointer text-gray-900 items-center justify-center
              transition-colors duration-200"
            style={{ background: "rgba(255,255,255,0.45)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.65)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.45)"}
          >
            <FiMenu size={20}/>
          </motion.button>

          {/* Logo */}
          <motion.img
            src={assets.logo}
            alt="Medinex"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-28 sm:w-36 h-10 object-contain cursor-pointer"
          />

          {/* Role badge */}
          <AnimatePresence>
            {role && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className={`inline-flex items-center gap-1.5
                  px-3 py-1 rounded-full text-xs font-bold
                  border border-gray-600 uppercase tracking-wider mt-1 ${roleBadgeBg}`}
                style={{ backdropFilter: "blur(8px)" }}
              >
                <RoleIcon size={10}/>
                {role}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT ── */}
        {(aToken || dToken) && (
          <div className="flex items-center gap-2">

            {/* ── Dark / Light toggle — sits beside admin dropdown ── */}
            <ThemeToggle />

            {/* ── Admin / Doctor dropdown ── */}
            <div className="relative" ref={dropdownRef}>

              {/* Avatar trigger */}
              <motion.button
                onClick={() => setOpenMenu(p => !p)}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl
                  border border-gray-300 cursor-pointer transition-all duration-200"
                style={{
                  background: openMenu
                    ? "rgba(255,255,255,0.55)"
                    : "rgba(255,255,255,0.30)",
                }}
                onMouseEnter={e => { if (!openMenu) e.currentTarget.style.background = "rgba(255,255,255,0.45)" }}
                onMouseLeave={e => { if (!openMenu) e.currentTarget.style.background = "rgba(255,255,255,0.30)" }}
              >
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleGrad}
                  flex items-center justify-center shadow-md flex-shrink-0`}>
                  <RoleIcon size={16} className="text-white"/>
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-950 leading-tight">{role}</p>
                  <p className="text-[10px] text-gray-900 flex items-center gap-0.5">
                    <MdVerified size={10} className="text-teal-500"/> Verified
                  </p>
                </div>

                <motion.span
                  animate={{ rotate: openMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden sm:block"
                >
                  <FiChevronDown size={14} className="text-gray-600"/>
                </motion.span>
              </motion.button>

              {/* Dropdown */}
              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1,
                      transition: { duration: 0.18, ease: "easeOut" } }}
                    exit={{ opacity: 0, y: -6, scale: 0.97,
                      transition: { duration: 0.13 } }}
                    className="absolute right-0 top-[calc(100%+8px)]
                      w-48 rounded-2xl overflow-hidden
                      border z-[100]"
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(20px)",
                      borderColor: "rgba(99,102,241,0.15)",
                      boxShadow: "0 8px 32px rgba(99,102,241,0.15)",
                    }}
                  >
                    {/* Header */}
                    <div className={`px-4 py-3 bg-gradient-to-r ${roleGrad}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20
                          flex items-center justify-center">
                          <RoleIcon size={14} className="text-white"/>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{role} Portal</p>
                          <p className="text-[10px] text-white/70">Medinex Professional</p>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="py-1.5">
                      <button
                        onClick={() => { navigate("/"); setOpenMenu(false); }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        style={{ background: "transparent", transition: "background 0.2s" }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5
                          text-sm text-gray-700 text-left border-none cursor-pointer"
                      >
                        <FiHome size={14} className="text-indigo-400"/> Home
                      </button>

                      <div className="mx-4 my-1 h-px bg-gray-300"/>

                      <button
                        onClick={logout}
                        onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        style={{ background: "transparent", transition: "background 0.2s" }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5
                          text-sm text-red-500 font-semibold text-left border-none cursor-pointer"
                      >
                        <FiLogOut size={14}/> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;