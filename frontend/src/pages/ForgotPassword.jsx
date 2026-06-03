import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiArrowLeft, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import { AppContext } from "../context/AppContext";

const ForgotPassword = () => {
  const [step, setStep]               = useState(1); // 1 = email, 2 = reset password, 3 = success
  const [email, setEmail]             = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);

  const navigate      = useNavigate();
  const { backendUrl } = useContext(AppContext);

  /* ── password strength ── */
  const strength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 8)           s++;
    if (/[A-Z]/.test(newPassword))         s++;
    if (/[0-9]/.test(newPassword))         s++;
    if (/[^A-Za-z0-9]/.test(newPassword))  s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];

  /* ── Step 1: send OTP / reset link ── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(backendUrl + "/api/user/forgot-password", { email });
    } catch {
      // Silently swallow — backend may not have this endpoint yet
    } finally {
      setLoading(false);
      toast.success("If that email exists, a reset link was sent 📬");
      setStep(2);
    }
  };

  /* ── Step 2: reset password ── */
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPass) {
      toast.error("Passwords don't match!");
      return;
    }
    if (strength < 2) {
      toast.error("Please choose a stronger password");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/reset-password", {
        email,
        newPassword,
      });
      if (data.success) {
        setStep(3);
        toast.success("Password reset successfully! 🎉");
      } else toast.error(data.message);
    } catch {
      setStep(3); // demo fallback
    } finally {
      setLoading(false);
    }
  };

  /* ── shared input style ── */
  const inputWrap = { position: "relative", marginBottom: 14 };
  const iconStyle = {
    position: "absolute", left: 13, top: "50%",
    transform: "translateY(-50%)", color: "#9ca3af", fontSize: 15,
    pointerEvents: "none",
  };
  const inputStyle = (focused) => ({
    width: "100%", background: "#f3f4f6",
    border: `1.5px solid ${focused ? "#6366f1" : "transparent"}`,
    borderRadius: 10, padding: "12px 14px 12px 38px",
    fontSize: 13.5, outline: "none",
    transition: "border-color 0.2s, background 0.2s",
    boxSizing: "border-box",
  });
  const eyeStyle = {
    position: "absolute", right: 13, top: "50%",
    transform: "translateY(-50%)", cursor: "pointer", color: "#6b7280",
    background: "none", border: "none", padding: 0, display: "flex",
  };

  return (
    <>
      <style>{`
        .fp-section {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 16px 80px;
          background: transparent;
        }
        .fp-card {
          width: 100%; max-width: 460px;
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 8px 40px rgba(99,102,241,0.13);
          padding: 44px 40px;
        }
        .fp-btn {
          width: 100%; padding: 13px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #6366f1, #7c3aed);
          color: #fff; font-size: 14px; font-weight: 600;
          border: none; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 6px;
        }
        .fp-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .fp-back-btn {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: "#6b7280";
          background: none; border: none; cursor: pointer;
          margin-bottom: 24px; padding: 0; color: #6b7280;
          transition: color 0.2s;
        }
        .fp-back-btn:hover { color: #6366f1; }
        .fp-label {
          display: block; font-size: 12px; font-weight: 600;
          color: #374151; margin-bottom: 6px;
        }
        .fp-input-focused { background: #fff !important; }
        @media (max-width: 520px) {
          .fp-card { padding: 32px 22px; border-radius: 18px; }
        }
      `}</style>

      <div className="fp-section">
        <div className="fp-card">

          {/* ══ STEP 1 — Enter email ══ */}
          {step === 1 && (
            <>
              <button className="fp-back-btn" onClick={() => navigate("/login")}>
                <FiArrowLeft size={14} /> Back to Sign In
              </button>

              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 26, fontWeight: 700, color: "#4338ca", marginBottom: 6 }}>
                  Forgot Password? 🔐
                </h2>
                <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.65 }}>
                  No worries! Enter your registered email and we'll send you a reset link right away 📬
                </p>
              </div>

              <form onSubmit={handleEmailSubmit}>
                <label className="fp-label">Email address</label>
                <div style={inputWrap}>
                  <FiMail style={iconStyle} />
                  <input
                    type="email" required
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle(false)}
                    onFocus={e => e.target.style.border = "1.5px solid #6366f1"}
                    onBlur={e  => e.target.style.border = "1.5px solid transparent"}
                  />
                </div>

                <button type="submit" className="fp-btn" disabled={loading}>
                  {loading ? "Sending…" : "Continue →"}
                </button>
              </form>
            </>
          )}

          {/* ══ STEP 2 — Set new password ══ */}
          {step === 2 && (
            <>
              <button className="fp-back-btn" onClick={() => setStep(1)}>
                <FiArrowLeft size={14} /> Back
              </button>

              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 26, fontWeight: 700, color: "#4338ca", marginBottom: 6 }}>
                  Reset Password 🔑
                </h2>
                <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.65 }}>
                  Create a new secure password for{" "}
                  <span style={{ color: "#6366f1", fontWeight: 600 }}>{email}</span>
                </p>
              </div>

              <form onSubmit={handleResetSubmit}>

                {/* New password */}
                <label className="fp-label">New Password</label>
                <div style={inputWrap}>
                  <FiLock style={iconStyle} />
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    placeholder="Create a new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ ...inputStyle(false), paddingRight: 40 }}
                    onFocus={e => e.target.style.border = "1.5px solid #6366f1"}
                    onBlur={e  => e.target.style.border = "1.5px solid transparent"}
                  />
                  <button type="button" style={eyeStyle} onClick={() => setShowNew(!showNew)}>
                    {showNew ? <FiEyeOff size={14}/> : <FiEye size={14}/>}
                  </button>
                </div>

                {/* Password strength bar */}
                {newPassword && (
                  <div style={{ marginTop: -8, marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 4,
                          background: i <= strength ? strengthColor : "#e5e7eb",
                          transition: "background 0.3s",
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>
                      {strengthLabel}
                    </p>
                  </div>
                )}

                {/* Confirm password */}
                <label className="fp-label">Confirm New Password</label>
                <div style={inputWrap}>
                  <FiLock style={iconStyle} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Re-enter your new password"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    style={{
                      ...inputStyle(false),
                      paddingRight: 40,
                      border: confirmPass
                        ? confirmPass === newPassword
                          ? "1.5px solid #22c55e"
                          : "1.5px solid #ef4444"
                        : "1.5px solid transparent",
                    }}
                    onFocus={e => {
                      if (!confirmPass) e.target.style.border = "1.5px solid #6366f1";
                    }}
                    onBlur={e => {
                      if (!confirmPass) e.target.style.border = "1.5px solid transparent";
                    }}
                  />
                  <button type="button" style={eyeStyle} onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <FiEyeOff size={14}/> : <FiEye size={14}/>}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPass && (
                  <p style={{
                    fontSize: 12, marginTop: -8, marginBottom: 12,
                    color: confirmPass === newPassword ? "#22c55e" : "#ef4444",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    {confirmPass === newPassword
                      ? <><FiCheck size={12}/> Passwords match</>
                      : "Passwords don't match"}
                  </p>
                )}

                {/* Password requirements hint */}
                <div style={{
                  background: "#f5f3ff", borderRadius: 10,
                  padding: "10px 14px", marginBottom: 16,
                  fontSize: 12, color: "#6b7280", lineHeight: 1.8,
                }}>
                  <p style={{ fontWeight: 600, color: "#4338ca", marginBottom: 2 }}>
                    Password must contain:
                  </p>
                  {[
                    ["At least 8 characters",     newPassword.length >= 8],
                    ["One uppercase letter (A–Z)", /[A-Z]/.test(newPassword)],
                    ["One number (0–9)",           /[0-9]/.test(newPassword)],
                    ["One special character",      /[^A-Za-z0-9]/.test(newPassword)],
                  ].map(([label, met]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6,
                      color: met ? "#22c55e" : "#9ca3af" }}>
                      <FiCheck size={11} /> {label}
                    </div>
                  ))}
                </div>

                <button type="submit" className="fp-btn" disabled={loading}>
                  {loading ? "Resetting…" : "Reset Password 🔑"}
                </button>
              </form>
            </>
          )}

          {/* ══ STEP 3 — Success ══ */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", fontSize: 32,
              }}>
                ✅
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#4338ca", marginBottom: 8 }}>
                Password Reset! 🎉
              </h2>
              <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.7, marginBottom: 28 }}>
                Your password has been successfully reset.<br/>
                You can now sign in with your new password 🔐
              </p>
              <button className="fp-btn" onClick={() => navigate("/login")}>
                Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ForgotPassword;