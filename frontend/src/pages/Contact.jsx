import React, { useEffect, useRef, useState } from "react";
import {
  FiMapPin, FiPhone, FiMail, FiBriefcase,
  FiArrowRight, FiSend, FiUser, FiMessageSquare,
  FiClock, FiCheckCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Lottie from "lottie-react";
import contactAnimation from "../assets/contactus.json";
import { useTheme } from "../context/ThemeContext";

/* ── Scroll-reveal hook ── */
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const Contact = () => {
  const { isDark } = useTheme();

  const [heroRef,   heroVisible]   = useReveal(0.1);
  const [infoRef,   infoVisible]   = useReveal(0.15);
  const [formRef,   formVisible]   = useReveal(0.15);
  const [careerRef, careerVisible] = useReveal(0.15);

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]         = useState(false);
  const [focused, setFocused]   = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const inputStyle = (field) => ({
    width: "100%", padding: "13px 14px 13px 42px",
    background: isDark ? "#0f172a" : focused === field ? "#fff" : "#f8faff",
    border: `1px solid ${focused === field ? "#6366f1" : isDark ? "#475569" : "#9ca3af"}`,
    borderRadius: 12, fontSize: 14, outline: "none",
    transition: "all 0.2s", boxSizing: "border-box",
    color: isDark ? "#f1f5f9" : "#111827",
  });

  const iconStyle = {
    position: "absolute", left: 14, top: "50%",
    transform: "translateY(-50%)", color: "#9ca3af",
    pointerEvents: "none", display: "flex", alignItems: "center",
  };

  const contactInfo = [
    {
      icon: <FiMapPin size={22} />, color: "#6366f1", bg: "#eef2ff",
      title: "Our Office",
      lines: ["Bhubaneswar, Odisha, India", "Pin: 751024"],
    },
    {
      icon: <FiPhone size={22} />, color: "#22c55e", bg: "#f0fdf4",
      title: "Phone",
      lines: ["+91 7847944467", "+91 9861755048"],
    },
    {
      icon: <FiMail size={22} />, color: "#3b82f6", bg: "#eff6ff",
      title: "Email",
      lines: ["support@medinex.com", "hello@medinex.com"],
    },
    {
      icon: <FiClock size={22} />, color: "#f59e0b", bg: "#fffbeb",
      title: "Working Hours",
      lines: ["Mon – Sat: 9am – 6pm", "Sun: Emergency only 🚨"],
    },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .reveal {
          opacity: 0; transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-left {
          opacity: 0; transform: translateX(-40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-left.visible  { opacity: 1; transform: translateX(0); }
        .reveal-right {
          opacity: 0; transform: translateX(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-right.visible { opacity: 1; transform: translateX(0); }

        .d1{transition-delay:.08s} .d2{transition-delay:.16s}
        .d3{transition-delay:.24s} .d4{transition-delay:.32s}

        .s-underline {
          width: 56px; height: 4px;
          background: linear-gradient(90deg,#6366f1,#a855f7);
          border-radius: 4px;
        }

        @keyframes pulse-ring {
          0%   { transform:scale(1);   opacity:.6; }
          100% { transform:scale(1.7); opacity:0;  }
        }
        .pulse-dot {
          width:11px; height:11px; background:#22c55e;
          border-radius:50%; display:inline-block; flex-shrink:0; position:relative;
        }
        .pulse-dot::after {
          content:""; position:absolute; inset:0;
          background:#22c55e; border-radius:50%;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        /* Info card — border-1 gray-600 */
        .contact-info-card {
          background: #fff; border-radius: 18px;
          padding: 22px 18px; border: 1px solid #d1d5db;
          box-shadow: 0 2px 14px rgba(99,102,241,.07);
          display: flex; align-items: flex-start; gap: 14px;
          transition: transform .25s, box-shadow .25s;
        }
        .contact-info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(99,102,241,.13);
        }

        /* Form */
        .form-field { position: relative; margin-bottom: 16px; }
        .form-field textarea {
          width: 100%; padding: 13px 14px 13px 42px;
          background: ${isDark ? "#0f172a" : "#f8faff"};
          border: 1px solid ${isDark ? "#475569" : "#9ca3af"};
          border-radius: 12px; font-size: 14px; outline: none;
          resize: vertical; min-height: 110px; font-family: inherit;
          transition: all 0.2s;
          color: ${isDark ? "#f1f5f9" : "#111827"};
          box-sizing: border-box;
        }
        .form-field textarea:focus {
          border-color: #6366f1;
          background: ${isDark ? "#0f172a" : "#fff"};
        }
        .form-field textarea::placeholder {
          color: ${isDark ? "#64748b" : "#9ca3af"};
        }
        .textarea-icon {
          position: absolute; left: 14px; top: 14px;
          color: #9ca3af; pointer-events: none;
          display: flex; align-items: flex-start;
        }

        /* Grids */
        .hero-contact-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 40px; align-items: center;
        }
        .contact-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 48px; align-items: start;
        }
        .info-cards-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media(max-width:860px) {
          .contact-grid   { grid-template-columns: 1fr; gap: 36px; }
        }
        @media(max-width:700px) {
          .hero-contact-grid { grid-template-columns: 1fr; text-align: center; }
          .info-cards-grid   { grid-template-columns: 1fr; }
        }
        @media(max-width:480px) {
          .info-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

        {/* ══════════ HERO BANNER ══════════ */}
        <section style={{
          background: "linear-gradient(135deg,#6366f1 0%,#7c3aed 100%)",
          padding: "52px 24px 48px",
        }}>
          <div ref={heroRef} className="hero-contact-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>

            <div className={`reveal-left ${heroVisible ? "visible" : ""}`}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,.18)", borderRadius: 50,
                padding: "6px 18px", marginBottom: 20,
              }}>
                <span className="pulse-dot" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>We're here to help</span>
              </div>
              <h1 style={{
                fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 800,
                color: "#fff", marginBottom: 16, lineHeight: 1.15,
              }}>
                Get In Touch 👋
              </h1>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,.88)", lineHeight: 1.75, maxWidth: 440 }}>
                Have questions about appointments, doctors, or our platform?
                We'd love to hear from you 💙<br /><br />
                Our team typically responds within{" "}
                <strong style={{ color: "#fff" }}>2 hours ⚡</strong>
              </p>
            </div>

            <div className={`reveal-right ${heroVisible ? "visible" : ""}`}
              style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: "min(100%, 380px)" }}>
                <Lottie animationData={contactAnimation} loop />
              </div>
            </div>

          </div>
        </section>

        {/* ══════════ MAIN — INFO + FORM ══════════ */}
        <section style={{ padding: "64px 24px", background: "transparent" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <div className="contact-grid">

              {/* ── LEFT — Info cards ── */}
              <div ref={infoRef}>

                <div className={`reveal-left ${infoVisible ? "visible" : ""}`} style={{ marginBottom: 28 }}>
                  <h2 style={{
                    fontSize: "clamp(22px,3vw,32px)", fontWeight: 800,
                    background: "linear-gradient(135deg,#4338ca,#7c3aed)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    marginBottom: 10,
                  }}>
                    Contact Information
                  </h2>
                  <div className="s-underline" style={{ width: "100%", maxWidth: "100%" }} />
                  <p style={{ fontSize: 15, color: isDark ? "#94a3b8" : "#111827", marginTop: 14, lineHeight: 1.7 }}>
                    Reach out through any of the channels below — our team typically responds within 2 hours ⚡
                  </p>
                </div>

                <div className="info-cards-grid">
                  {contactInfo.map((item, i) => (
                    <div
                      key={i}
                      className={`contact-info-card reveal-left d${i + 1} ${infoVisible ? "visible" : ""}`}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 13,
                        background: item.bg, color: item.color,
                        border: "1px solid #9ca3af",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <p style={{
                          fontSize: 12, fontWeight: 700,
                          color: isDark ? "#f1f5f9" : "#111827",
                          textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 5,
                        }}>
                          {item.title}
                        </p>
                        {item.lines.map((line, j) => (
                          <p key={j} style={{ fontSize: 14, color: isDark ? "#cbd5e1" : "#111827", fontWeight: 500, lineHeight: 1.7 }}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp */}
                <div className={`reveal-left d4 ${infoVisible ? "visible" : ""}`} style={{ marginTop: 20 }}>
                  <a
                    href="https://wa.me/917847944467"
                    target="_blank" rel="noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      padding: "12px 24px", borderRadius: 50,
                      background: "#25d366", color: "#fff",
                      fontWeight: 600, fontSize: 14, textDecoration: "none",
                      boxShadow: "0 4px 16px rgba(37,211,102,.35)",
                      transition: "transform .2s, box-shadow .2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,211,102,.45)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,211,102,.35)"; }}
                  >
                    <FaWhatsapp size={20} /> Chat on WhatsApp
                  </a>
                </div>

              </div>

              {/* ── RIGHT — Form ── */}
              <div ref={formRef}>
                <div
                  className={`reveal-right ${formVisible ? "visible" : ""}`}
                  style={{
                    background: isDark ? "#1e293b" : "#fff",
                    borderRadius: 24,
                    padding: "36px 32px",
                    boxShadow: "0 8px 36px rgba(99,102,241,.11)",
                    border: `1px solid ${isDark ? "#475569" : "#d1d5db"}`,
                  }}
                >
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: isDark ? "#f1f5f9" : "#111827", marginBottom: 6 }}>
                    Send us a Message 📩
                  </h3>
                  <p style={{ fontSize: 14, color: isDark ? "#94a3b8" : "#374151", marginBottom: 24 }}>
                    Fill in the form below and we'll get back to you shortly.
                  </p>

                  {sent ? (
                    <div style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", padding: "40px 20px", textAlign: "center",
                    }}>
                      <div style={{
                        width: 68, height: 68, borderRadius: "50%",
                        background: "linear-gradient(135deg,#22c55e,#16a34a)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 16,
                      }}>
                        <FiCheckCircle size={32} color="#fff" />
                      </div>
                      <h4 style={{ fontSize: 20, fontWeight: 700, color: isDark ? "#f1f5f9" : "#111827", marginBottom: 8 }}>
                        Message Sent! 🎉
                      </h4>
                      <p style={{ fontSize: 14, color: isDark ? "#94a3b8" : "#374151" }}>
                        Thanks for reaching out. We'll reply within 2 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>

                      <div className="form-field">
                        <div style={iconStyle}><FiUser size={15} /></div>
                        <input
                          type="text" required placeholder="Your full name"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          style={inputStyle("name")}
                          onFocus={() => setFocused("name")}
                          onBlur={() => setFocused("")}
                        />
                      </div>

                      <div className="form-field">
                        <div style={iconStyle}><FiMail size={15} /></div>
                        <input
                          type="email" required placeholder="Your email address"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          style={inputStyle("email")}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused("")}
                        />
                      </div>

                      <div className="form-field">
                        <div style={iconStyle}><FiMessageSquare size={15} /></div>
                        <input
                          type="text" required placeholder="Subject"
                          value={formData.subject}
                          onChange={e => setFormData({ ...formData, subject: e.target.value })}
                          style={inputStyle("subject")}
                          onFocus={() => setFocused("subject")}
                          onBlur={() => setFocused("")}
                        />
                      </div>

                      <div className="form-field">
                        <div className="textarea-icon"><FiMessageSquare size={15} /></div>
                        <textarea
                          required placeholder="Write your message here..."
                          value={formData.message}
                          onChange={e => setFormData({ ...formData, message: e.target.value })}
                          onFocus={() => setFocused("message")}
                          onBlur={() => setFocused("")}
                        />
                      </div>

                      <button
                        type="submit"
                        style={{
                          width: "100%", padding: "13px", borderRadius: 12,
                          background: "linear-gradient(135deg,#3b82f6,#6366f1,#7c3aed)",
                          color: "#fff", fontWeight: 600, fontSize: 15,
                          border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          boxShadow: "0 4px 16px rgba(99,102,241,.35)",
                          transition: "opacity .2s, transform .15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = ".9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = "1";  e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        <FiSend size={16} /> Send Message
                      </button>

                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ CAREERS ══════════ */}
        <section style={{ padding: "0 24px 72px", background: "transparent" }}>
          <div
            ref={careerRef}
            className={`reveal ${careerVisible ? "visible" : ""}`}
            style={{
              maxWidth: 860, margin: "0 auto",
              background: "linear-gradient(135deg,#6366f1 0%,#7c3aed 100%)",
              borderRadius: 28, padding: "52px 40px",
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              gap: 32, flexWrap: "wrap",
              boxShadow: "0 16px 48px rgba(99,102,241,.28)",
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position:"absolute", width:160, height:160, background:"rgba(255,255,255,.07)", borderRadius:"50%", top:-50, right:-30, pointerEvents:"none" }} />
            <div style={{ position:"absolute", width:100, height:100, background:"rgba(255,255,255,.05)", borderRadius:"50%", bottom:-30, left:40, pointerEvents:"none" }} />

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,.2)", borderRadius: 50,
                padding: "5px 14px", marginBottom: 14,
              }}>
                <FiBriefcase size={13} color="#fff" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>We're hiring!</span>
              </div>
              <h2 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 800, color: "#fff", marginBottom: 10 }}>
                Careers at Medinex 🚀
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.85)", lineHeight: 1.7 }}>
                Learn more about our teams and open positions. Join us in transforming healthcare in India 🏥
              </p>
            </div>

            <button
              style={{
                padding: "14px 32px", borderRadius: 50,
                background: "#fff", color: "#6366f1",
                fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 18px rgba(0,0,0,.13)",
                transition: "transform .2s, box-shadow .2s",
                whiteSpace: "nowrap", flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,.13)"; }}
            >
              Explore Jobs <FiArrowRight size={16} />
            </button>

          </div>
        </section>

      </div>
    </>
  );
};

export default Contact;