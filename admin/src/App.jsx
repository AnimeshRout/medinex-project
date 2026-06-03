import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

import AdminLayout from "./pages/Admin/AdminLayout";

import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllApointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import PatientsList from "./pages/Admin/PatientsList";
import AdminProfile from "./pages/Admin/AdminProfile"

import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorProfile from "./pages/Doctor/DoctorProfile";

import { AdminContext } from "./context/AdminContext";
import { DoctorContext } from "./context/DoctorContext";

import { Toaster } from "react-hot-toast";

// ── Protected route wrappers ──────────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { aToken } = useContext(AdminContext);
  return aToken ? children : <Navigate to="/" replace />;
};

const DoctorRoute = ({ children }) => {
  const { dToken } = useContext(DoctorContext);
  return dToken ? children : <Navigate to="/" replace />;
};

// ─────────────────────────────────────────────────────────────────────────────
const App = () => {

  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return (
    <BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 600,
            padding: "10px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      <Routes>

        {/* ================= LOGIN ================= */}
        <Route
          path="/"
          element={
            aToken
              ? <Navigate to="/admin-dashboard" replace />
              : dToken
              ? <Navigate to="/doctor-dashboard" replace />
              : <Login />
          }
        />

        {/* ================= ADMIN ROUTES ================= */}
        <Route element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route path="/admin-dashboard"  element={<Dashboard />} />
          <Route path="/all-appointments" element={<AllAppointments />} />
          <Route path="/add-doctor"       element={<AddDoctor />} />
          <Route path="/doctors-list"     element={<DoctorsList />} />
          <Route path="/patients-list"    element={<PatientsList />} />
          <Route path="/admin-profile"    element={<AdminProfile />} />
        </Route>

        {/* ================= DOCTOR ROUTES ================= */}
        <Route element={
          <DoctorRoute>
            <AdminLayout />
          </DoctorRoute>
        }>
          <Route path="/doctor-dashboard"      element={<DoctorDashboard />} />
          <Route path="/doctor-appointments"   element={<DoctorAppointments />} />
          <Route path="/doctor-profile"        element={<DoctorProfile />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route
          path="*"
          element={
            aToken
              ? <Navigate to="/admin-dashboard" replace />
              : dToken
              ? <Navigate to="/doctor-dashboard" replace />
              : <Navigate to="/" replace />
          }
        />

      </Routes>

    </BrowserRouter>
  );
};

export default App;