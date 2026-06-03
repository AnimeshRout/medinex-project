import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { isDark } = useTheme();
  const location = useLocation();

  const darkBg = isDark ? { backgroundColor: "#0f172a" } : {};

  return (
    <div className="flex h-screen" style={darkBg}>

      {/* ── Sidebar ── */}
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCollapsed={isCollapsed}
      />

      {/* ── Right section ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={darkBg}>

        {/* ── Navbar ── */}
        <Navbar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* ── Page content ──── */}
        <main className="flex-1 overflow-y-auto" style={darkBg}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: "easeInOut" }}
              style={{ minHeight: "100%" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;