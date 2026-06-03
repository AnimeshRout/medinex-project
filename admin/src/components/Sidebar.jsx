import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { adminMenu, doctorMenu } from "../config/sidebarMenu";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield, FiActivity } from "react-icons/fi";

// ── animation variants ────────────────────────────────────────────────────────
const sidebarVariants = {
  expanded: { width: 240, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  collapsed: { width: 72, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

const textVariants = {
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
  hidden: { opacity: 0, x: -8, transition: { duration: 0.15 } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const drawerVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { x: "-100%", transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.3, delay: i * 0.05, ease: "easeOut" },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────

const NavItem = ({ item, onClick, isCollapsed, isAdmin, activeItemBg, activeItemBorder, hoverBg }) => {
  const Icon = item.icon;
  return (
    <div>
      <NavLink
        to={item.path}
        onClick={onClick}
        className="group relative flex items-center gap-3 mx-2 rounded-xl
          transition-all duration-200"
        style={({ isActive }) => ({
          padding: "10px 14px",
          justifyContent: "flex-start",
          background: isActive ? activeItemBg : "transparent",
          border: isActive ? `1px solid ${activeItemBorder}` : "1px solid transparent",
          backdropFilter: isActive ? "blur(8px)" : "none",
          color: isActive ? (isAdmin ? "#4f46e5" : "#059669") : "#222428",
          fontWeight: isActive ? 700 : 500,
        })}
        onMouseEnter={e => {
          if (!e.currentTarget.style.background.includes(activeItemBg.slice(0, 10))) {
            e.currentTarget.style.background = hoverBg;
          }
        }}
        onMouseLeave={e => {
          const isActive = e.currentTarget.getAttribute("aria-current") === "page";
          e.currentTarget.style.background = isActive ? activeItemBg : "transparent";
        }}
      >
        {({ isActive }) => (
          <>
            {/* active left bar */}
            {isActive && !isCollapsed && (
              <motion.div
                layoutId="activeBar"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
                style={{
                  background: isAdmin
                    ? "linear-gradient(to bottom, #6366f1, #8b5cf6)"
                    : "linear-gradient(to bottom, #10b981, #06b6d4)",
                }}
              />
            )}

            {/* icon */}
            <div className={`flex-shrink-0 transition-transform duration-200
              ${!isActive ? "group-hover:scale-110" : ""}`}>
              <Icon size={18} />
            </div>

            {/* label */}
            <span
              style={{
                display: "inline-block",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: isCollapsed ? "0px" : "200px",
                opacity: isCollapsed ? 0 : 1,
                transition: isCollapsed
                  ? "max-width 0.25s ease, opacity 0.15s ease"
                  : "max-width 0.3s ease 0.05s, opacity 0.2s ease 0.1s",
                fontSize: "0.875rem",
              }}
            >
              {item.name}
            </span>

            {/* tooltip when collapsed */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5
                bg-gray-800 text-white text-xs font-semibold rounded-lg
                whitespace-nowrap pointer-events-none z-50 shadow-lg
                opacity-0 group-hover:opacity-100
                translate-x-1 group-hover:translate-x-0
                transition-all duration-200">
                {item.name}
                <div className="absolute right-full top-1/2 -translate-y-1/2
                  border-4 border-transparent border-r-gray-800"/>
              </div>
            )}
          </>
        )}
      </NavLink>
    </div>
  );
};

const BrandHeader = ({ isCollapsed, mobile, roleGrad, RoleIcon, roleLabel, roleSub }) => (
  <div className={`flex items-center gap-3 px-4 py-2.5 
    ${(isCollapsed && !mobile) ? "justify-center px-0 " : ""}`}>
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleGrad}
      flex items-center justify-center shadow-md flex-shrink-0`}>
      <RoleIcon size={16} className="text-white" />
    </div>
    <span
      style={{
        display: (isCollapsed && !mobile) ? "none" : "inline-block",
        overflow: "hidden",
        whiteSpace: "nowrap",
        maxWidth: (isCollapsed && !mobile) ? "0px" : "200px",
        opacity: (isCollapsed && !mobile) ? 0 : 1,
        transition: (isCollapsed && !mobile)
          ? "max-width 0.25s ease, opacity 0.15s ease"
          : "max-width 0.3s ease 0.05s, opacity 0.2s ease 0.1s",
      }}
    >
      <p className="text-sm font-extrabold text-gray-800 leading-tight">{roleLabel}</p>
      <p className="text-xs text-gray-900">{roleSub}</p>
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const Sidebar = ({ isOpen, setIsOpen, isCollapsed }) => {
  const { aToken } = useContext(AdminContext);

  const menu = aToken ? adminMenu : doctorMenu;
  const isAdmin = !!aToken;

  const roleGrad = isAdmin
    ? "from-blue-900 via-cyan-600 to-indigo-500"
    : "from-blue-900 via-cyan-600 to-emerald-500";

  const sidebarBg = isAdmin
    ? "rgba(196,181,253,0.45) 0%, rgba(147,197,253,0.45) 50%, rgba(103,232,249,0.45) 100%"
    : "rgba(221,214,254,0.45) 0%, rgba(187,247,208,0.45) 50%, rgba(125,211,252,0.45) 100%";

  const activeItemBg = isAdmin
    ? "rgba(196,181,253,0.5)"
    : "rgba(187,247,208,0.5)";

  const activeItemBorder = isAdmin
    ? "rgba(139,92,246,0.5)"
    : "rgba(52,211,153,0.5)";

  const hoverBg = isAdmin
    ? "rgba(196,181,253,0.35)"
    : "rgba(187,247,208,0.35)";

  const RoleIcon = isAdmin ? FiShield : FiActivity;
  const roleLabel = isAdmin ? "Admin Panel" : "Doctor Panel";
  const roleSub = isAdmin ? "Administrator" : "Medical Staff";

  const isMobile = window.innerWidth < 768;

  const navItemProps = {
    isCollapsed: isMobile ? false : isCollapsed,
    isAdmin,
    activeItemBg,
    activeItemBorder,
    hoverBg
  };
  const brandProps = { isCollapsed, roleGrad, RoleIcon, roleLabel, roleSub };

  const sidebarStyle = {
    background: `linear-gradient(180deg, ${sidebarBg})`,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRight: "1px solid #9fa0a2",
    boxShadow: "2px 0 16px rgba(99,102,241,0.08)",
  };

  return (
    <>
      {/* ════════════ MOBILE DRAWER ════════════ */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-[3px] z-[90] md:hidden"
            />

            <motion.div
              key="drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 h-full w-64 z-[100] md:hidden flex flex-col overflow-y-auto"
              style={sidebarStyle}
            >
              {/* top accent */}
              <div className={`h-1 w-full bg-gradient-to-r ${roleGrad}`} />

              <div className="px-2 pt-3">
                <BrandHeader {...brandProps} mobile={true} />
                <div
                  className="h-px mx-2 mb-3"
                  style={{ background: "rgba(0,0,0,0.25)" }}
                />
                <nav className="flex flex-col gap-1">
                  {menu.map((item, i) => (
                    <NavItem
                      key={item.path}
                      item={item}
                      index={i}
                      onClick={() => setIsOpen(false)}
                      {...navItemProps}
                    />
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════ DESKTOP SIDEBAR ════════════════════════ */}
      <div className="hidden md:flex flex-shrink-0 h-screen sticky top-0">
        <motion.div
          variants={sidebarVariants}
          animate={isCollapsed ? "collapsed" : "expanded"}
          className="flex flex-col h-full overflow-hidden"
          style={sidebarStyle}
        >
          {/* top accent */}
          <div className={`h-1 w-full bg-gradient-to-r ${roleGrad}`} />

          <div className={`pt-3 flex-1 overflow-y-auto overflow-x-hidden
            ${isCollapsed ? "px-1" : "px-2"}`}>

            <BrandHeader {...brandProps} />
            <div className="h-px mx-2 mb-3"
              style={{ background: "#9fa0a2" }} />

            <nav className="flex flex-col gap-1">
              {menu.map((item, i) => (
                <NavItem key={item.path} item={item} index={i} {...navItemProps} />
              ))}
            </nav>
          </div>

          {/* bottom role strip */}
          <div className={`px-3 py-3 ${isCollapsed ? "flex justify-center" : ""}`}
            style={{ borderTop: "1px solid #9fa0a2" }}>
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-400"
              style={{ background: "rgba(255,255,255,0.4)" }}>
              <RoleIcon
                size={12}
                className={isAdmin ? "text-indigo-600" : "text-emerald-600"}
              />
              <span
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: isCollapsed ? "0px" : "80px",
                  opacity: isCollapsed ? 0 : 1,
                  transition: isCollapsed
                    ? "max-width 0.25s ease, opacity 0.15s ease"
                    : "max-width 0.3s ease 0.05s, opacity 0.2s ease 0.1s",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
                className={isAdmin ? "text-indigo-700" : "text-emerald-700"}
              >
                {isAdmin ? "Admin" : "Doctor"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Sidebar;