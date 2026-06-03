import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Appointment from "./pages/Appointment";
import MyAppointments from "./pages/MyAppointments";
import MyProfile from "./pages/MyProfile";
import Verify from "./pages/Verify";
import PaymentSuccess from "./pages/PaymentSuccess"; 

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">

        <Routes>

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Doctors */}
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Static Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Appointment Booking */}
          <Route path="/appointment/:docId" element={<Appointment />} />

          {/* User Pages */}
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/my-profile" element={<MyProfile />} />

          {/* Stripe Payment Verification */}
          <Route path="/verify" element={<Verify />} />

          {/* ⭐ Payment Success Page */}
          <Route path="/payment-success" element={<PaymentSuccess />} />

        </Routes>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default App;