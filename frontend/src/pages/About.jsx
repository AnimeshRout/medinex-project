import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import aboutAnimation from "../assets/aboutus.json";
import aboutShield from "../assets/aboutshield.json";

import {
  FiTarget, FiHeart, FiShield, FiZap,
  FiUsers, FiCalendar, FiStar, FiArrowRight,
  FiAward,
} from "react-icons/fi";
import { FaUserMd, FaHospital, FaStar, FaSmile } from "react-icons/fa";

/* ── Scroll-reveal hook — fires early so animation is never late ── */
const useReveal = (threshold = 0.05) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

/* ── Animated counter ── */
const Counter = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal(0.2);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const About = () => {
  const navigate = useNavigate();
  const missionSectionRef = useRef(null);

  const [heroRef,    heroVisible]    = useReveal(0.05);
  const [missionRef, missionVisible] = useReveal(0.05);
  const [statsRef,   statsVisible]   = useReveal(0.05);
  const [whyRef,     whyVisible]     = useReveal(0.05);
  const [teamRef,    teamVisible]    = useReveal(0.05);
  const [ctaRef,     ctaVisible]     = useReveal(0.05);

  const whyCards = [
    { icon: <FiZap />,      color: "#6366f1", bg: "#eef2ff", title: "Efficiency ⚡",      desc: "Streamlined appointment scheduling that fits into your busy lifestyle. Book in under 60 seconds." },
    { icon: <FiHeart />,    color: "#ec4899", bg: "#fdf2f8", title: "Personalization 💙", desc: "Tailored doctor recommendations and smart reminders to help you stay on top of your health." },
    { icon: <FiShield />,   color: "#22c55e", bg: "#f0fdf4", title: "Trust & Safety 🔒",  desc: "Every doctor is verified and credentialed. Your data is encrypted and 100% private." },
    { icon: <FiUsers />,    color: "#f59e0b", bg: "#fffbeb", title: "Convenience 🏥",     desc: "Access a trusted network of 500+ healthcare professionals near you, anytime." },
    { icon: <FiCalendar />, color: "#3b82f6", bg: "#eff6ff", title: "Easy Booking 📅",   desc: "Real-time availability, instant confirmations and easy rescheduling at your fingertips." },
    { icon: <FiStar />,     color: "#a855f7", bg: "#faf5ff", title: "Top Rated ⭐",        desc: "Thousands of verified patient reviews help you choose the best doctor for your needs." },
  ];

  const stats = [
    { icon: <FaUserMd   size={28} />, value: 500, suffix: "+",  label: "Verified Doctors", iconColor: "#a78bfa" },
    { icon: <FaSmile    size={28} />, value: 50,  suffix: "K+", label: "Happy Patients",   iconColor: "#34d399" },
    { icon: <FaHospital size={28} />, value: 30,  suffix: "+",  label: "Specialities",     iconColor: "#60a5fa" },
    { icon: <FaStar     size={28} />, value: 4.9, suffix: "★",  label: "Average Rating",   iconColor: "#fbbf24" },
  ];

  const commitments = [
    { icon: "🔐", title: "Verified Doctors",  desc: "Every doctor on Medinex is background-checked and credential-verified before joining our platform." },
    { icon: "⚡", title: "Instant Booking",    desc: "Real-time slot availability means no waiting — book your appointment in seconds, 24/7." },
    { icon: "🔒", title: "Your Data is Safe", desc: "End-to-end encrypted records and HIPAA-aligned practices ensure your health data stays private." },
    { icon: "💬", title: "Patient First",      desc: "From easy rescheduling to appointment reminders, every feature is built around patient convenience." },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Reveal animations ── */
        .reveal {
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-left {
          opacity: 0; transform: translateX(-44px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal-left.visible { opacity: 1; transform: translateX(0); }
        .reveal-right {
          opacity: 0; transform: translateX(44px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal-right.visible { opacity: 1; transform: translateX(0); }

        /* ── Stagger delays ── */
        .d1{transition-delay:0.05s} .d2{transition-delay:0.12s}
        .d3{transition-delay:0.19s} .d4{transition-delay:0.26s}
        .d5{transition-delay:0.33s} .d6{transition-delay:0.40s}

        /* ── Section title underline ── */
        .s-underline {
          width: 56px; height: 4px;
          background: linear-gradient(90deg,#6366f1,#a855f7);
          border-radius: 4px; margin: 10px auto 0;
        }

        /* ── Pulse dot ── */
        @keyframes pulse-ring {
          0%   { transform:scale(1);   opacity:.6; }
          100% { transform:scale(1.7); opacity:0;  }
        }
        .pulse-dot {
          position:relative; width:11px; height:11px;
          background:#22c55e; border-radius:50%; display:inline-block; flex-shrink:0;
        }
        .pulse-dot::after {
          content:""; position:absolute; inset:0;
          background:#22c55e; border-radius:50%;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        /* ── Why card ── */
        .why-card {
          background:#fff; border-radius:18px; padding:26px 22px;
          border:1px solid #d1d5db;
          box-shadow:0 2px 12px rgba(99,102,241,.06);
          transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .why-card:hover {
          transform:translateY(-6px);
          box-shadow:0 12px 32px rgba(99,102,241,.14);
          border-color:#c7d2fe;
        }

        /* ── Stat card ── */
        .stat-card {
          background:rgba(255,255,255,.13);
          backdrop-filter:blur(14px);
          border:1px solid rgba(255,255,255,.28);
          border-radius:16px; padding:28px 18px; text-align:center;
          transition: transform .25s, box-shadow .25s, background .25s;
        }
        .stat-card:hover {
          transform:translateY(-7px);
          background:rgba(255,255,255,.22);
          box-shadow:0 16px 44px rgba(0,0,0,.18);
        }
        .stat-icon-ring {
          width:62px; height:62px; border-radius:50%;
          background:#fff; border: 1.5px solid #d1d5db;
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 12px;
          box-shadow:0 3px 12px rgba(0,0,0,.13);
        }

        /* ── Commitment card ── */
        .commit-card {
          background:#fff; border-radius:18px; padding:20px 22px;
          border:1px solid #d1d5db;
          box-shadow:0 2px 12px rgba(99,102,241,.06);
          display:flex; align-items:flex-start; gap:16px;
          transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .commit-card:hover {
          transform:translateX(6px);
          box-shadow:0 8px 28px rgba(99,102,241,.13);
          border-color:#c7d2fe;
        }
        .commit-icon {
          width:48px; height:48px; border-radius:14px;
          background:#eef2ff; border:1px solid #d1d5db;
          display:flex; align-items:center;
          justify-content:center; font-size:22px; flex-shrink:0;
        }

        /* ── Buttons ── */
        .btn-primary {
          padding:12px 28px; border-radius:50px;
          background:linear-gradient(135deg,#3b82f6,#7c3aed);
          color:#fff; font-weight:600; font-size:14px;
          border:none; cursor:pointer;
          display:inline-flex; align-items:center; gap:8px;
          box-shadow:0 4px 16px rgba(99,102,241,.35);
          transition: transform .2s, box-shadow .2s;
        }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,.45); }
        .btn-outline {
          padding:12px 28px; border-radius:50px;
          border:1px solid #6366f1; background:transparent;
          color:#6366f1; font-weight:600; font-size:14px; cursor:pointer;
          display:inline-flex; align-items:center; gap:8px;
          transition: background .2s, color .2s;
        }
        .btn-outline:hover { background:#6366f1; color:#fff; }

        /* ── Grids ── */
        .hero-grid    { display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; }
        .mission-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; }
        .why-grid     { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .stats-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .commit-grid  { display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; }
        .commit-list  { display:flex; flex-direction:column; gap:14px; }

        @media(max-width:960px){
          .hero-grid    { grid-template-columns:1fr; }
          .why-grid     { grid-template-columns:repeat(2,1fr); }
          .stats-grid   { grid-template-columns:repeat(2,1fr); }
          .mission-grid { grid-template-columns:1fr; }
          .commit-grid  { grid-template-columns:1fr; }
        }
        @media(max-width:560px){
          .why-grid   { grid-template-columns:1fr; }
          .stats-grid { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

        {/* ══════════ HERO ══════════ */}
        <section ref={heroRef} style={{ padding: "56px 24px 48px", maxWidth: 1160, margin: "0 auto" }}>
          <div className="hero-grid">

            <div className={`reveal-left ${heroVisible ? "visible" : ""}`}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#eef2ff", borderRadius: 50, padding: "6px 16px", marginBottom: 22 }}>
                <span className="pulse-dot" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>About Medinex</span>
              </div>

              <h1 style={{ fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 22 }}>
                <span style={{ background: "linear-gradient(135deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Your Trusted
                </span>
                <br />
                <span style={{ background: "linear-gradient(135deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline" }}>
                  Healthcare Partner
                </span>
                <span style={{ marginLeft: 10, fontSize: "clamp(28px,3.5vw,46px)", verticalAlign: "middle" }}>🏥</span>
              </h1>

              <p style={{ fontSize: 16.5, color: "#374151", lineHeight: 1.85, marginBottom: 16 }}>
                Welcome to <strong>Medinex</strong> — your trusted partner in managing healthcare needs
                conveniently and efficiently. We simplify appointment booking and digital health record management.
              </p>
              <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.85, marginBottom: 34 }}>
                We continuously enhance our healthcare technology platform to deliver a seamless and
                reliable experience for every patient 💙
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={() => missionSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                  Our Vision <FiTarget size={15} />
                </button>
                <button className="btn-outline" onClick={() => navigate("/doctors")}>
                  Meet Doctors <FiArrowRight size={15} />
                </button>
              </div>
            </div>

            <div className={`reveal-right ${heroVisible ? "visible" : ""}`}
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ width: "min(100%, 440px)" }}>
                <Lottie animationData={aboutAnimation} loop />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ STATS BANNER ══════════ */}
        <section style={{ background: "linear-gradient(135deg,#6366f1 0%,#7c3aed 100%)", padding: "52px 24px" }}>
          <div ref={statsRef} style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div className={`reveal ${statsVisible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 36 }}>
              <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                Our Achievements 🏆
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.75)" }}>Trusted by thousands of patients across India</p>
            </div>

            <div className="stats-grid">
              {stats.map((s, i) => (
                <div key={i} className={`stat-card reveal d${i + 1} ${statsVisible ? "visible" : ""}`}>
                  <div className="stat-icon-ring" style={{ color: s.iconColor }}>{s.icon}</div>
                  <p style={{ fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 8 }}>
                    {statsVisible ? <Counter end={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
                  </p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.88)", fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ MISSION / VISION ══════════ */}
        <section style={{ padding: "72px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div className={`reveal ${missionVisible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, background: "linear-gradient(135deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              WHO WE ARE 🌍
            </h2>
            <div className="s-underline" />
          </div>

          <div ref={(el) => { missionRef.current = el; missionSectionRef.current = el; }} className="mission-grid">
            {[
              { icon: "🎯", title: "Our Mission", color: "#6366f1", bg: "#eef2ff", text: "To make quality healthcare accessible to everyone by connecting patients with the right doctors quickly, transparently and affordably. We believe every patient deserves seamless, dignified care." },
              { icon: "🔭", title: "Our Vision",  color: "#a855f7", bg: "#faf5ff", text: "To become India's most trusted digital health platform — where patients feel empowered, doctors feel supported, and every interaction moves healthcare forward for families across the country." },
            ].map((item, i) => (
              <div key={i} className={`reveal d${i + 1} ${missionVisible ? "visible" : ""}`}
                style={{ background: "#fff", borderRadius: 20, padding: "36px 30px", border: "1.5px solid #d1d5db", boxShadow: "0 4px 24px rgba(99,102,241,.08)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: item.bg, border: "1.5px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: item.color, marginBottom: 14 }}>{item.title}</h3>
                <p style={{ fontSize: 15.5, color: "#374151", lineHeight: 1.85 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ WHY CHOOSE US ══════════ */}
        <section className="why-choose-section" style={{ padding: "72px 24px" }}>
          <div ref={whyRef} style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className={`reveal ${whyVisible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 44 }}>
              <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, background: "linear-gradient(135deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                WHY CHOOSE US 🌟
              </h2>
              <div className="s-underline" />
              <p style={{ fontSize: 16, color: "#374151", marginTop: 14, maxWidth: 500, margin: "14px auto 0" }}>
                We built Medinex around what patients actually need — speed, trust, and care.
              </p>
            </div>

            <div className="why-grid">
              {whyCards.map((card, i) => (
                <div key={i} className={`why-card reveal d${i + 1} ${whyVisible ? "visible" : ""}`}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: card.bg, color: card.color, border: "1.5px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>
                    {card.icon}
                  </div>
                  <h3 style={{ fontSize: 17.5, fontWeight: 700, color: "#1f2937", marginBottom: 10 }}>{card.title}</h3>
                  <p style={{ fontSize: 15.5, color: "#374151", lineHeight: 1.85 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ OUR COMMITMENT ══════════ */}
        <section style={{ padding: "72px 24px", maxWidth: 1060, margin: "0 auto" }}>
          <div ref={teamRef}>
            <div className={`reveal ${teamVisible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 44 }}>
              <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, background: "linear-gradient(135deg,#4338ca,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, lineHeight: 1 }}>
                OUR COMMITMENT TO YOU 🛡️
              </h2>
              <div className="s-underline" />
              <p style={{ fontSize: 16, color: "#374151", marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <FiAward size={18} color="#6366f1" />
                Every feature built around your health and peace of mind ⚡
              </p>
            </div>

            <div className="commit-grid">
              <div className={`reveal-left ${teamVisible ? "visible" : ""}`}
                style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ width: "min(100%, 360px)" }}>
                  <Lottie animationData={aboutShield} loop />
                </div>
              </div>

              <div className="commit-list">
                {commitments.map((f, i) => (
                  <div key={i} className={`commit-card reveal d${i + 1} ${teamVisible ? "visible" : ""}`}>
                    <div className="commit-icon">{f.icon}</div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 6 }}>{f.title}</h3>
                      <p style={{ fontSize: 14.5, color: "#374151", lineHeight: 1.8 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ CTA ══════════ */}
        <section style={{ padding: "0 24px 72px" }}>
          <div ref={ctaRef} className={`reveal ${ctaVisible ? "visible" : ""}`}
            style={{ maxWidth: 860, margin: "0 auto", background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)", borderRadius: 28, padding: "52px 40px", textAlign: "center", boxShadow: "0 16px 48px rgba(99,102,241,.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 180, height: 180, background: "rgba(255,255,255,.08)", borderRadius: "50%", top: -60, right: -40, pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: 120, height: 120, background: "rgba(255,255,255,.06)", borderRadius: "50%", bottom: -40, left: 30, pointerEvents: "none" }} />
            <h2 style={{ fontSize: "clamp(20px,3vw,32px)", fontWeight: 800, color: "#fff", marginBottom: 12 }}>
              Ready to take charge of your health? 💪
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.85)", marginBottom: 30, lineHeight: 1.7 }}>
              Join thousands of patients who trust Medinex for quick, reliable doctor appointments 🏥
            </p>
            <button
              onClick={() => navigate("/signup")}
              style={{ padding: "13px 36px", borderRadius: 50, background: "#fff", color: "#6366f1", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.15)", display: "inline-flex", alignItems: "center", gap: 8, transition: "transform .2s, box-shadow .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.15)"; }}
            >
              Get Started Free <FiArrowRight size={16} />
            </button>
          </div>
        </section>

      </div>
    </>
  );
};

export default About;