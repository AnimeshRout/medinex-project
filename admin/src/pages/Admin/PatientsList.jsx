import React, { useContext, useEffect, useState, useCallback } from "react";

// ── Module-level cache — survives React navigation unmount/remount ─────────────
let _patientsCache = null;
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import axiosInstance from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiX, FiSearch, FiUsers, FiCalendar, FiPhone,
    FiMail, FiMapPin, FiCheckCircle, FiTrash2, FiAlertTriangle,
    FiShield, FiSlash, FiClock,
} from "react-icons/fi";
import { FaBirthdayCake, FaVenusMars } from "react-icons/fa";
import { MdVerified, MdBlock } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

const isDark = () => document.documentElement.classList.contains("dark");
const getAdminHover    = () => isDark() ? "rgba(109, 40, 217, 0.2)" : "#f8f4ff";
const getDropdownHover = (danger) =>
    isDark()
        ? danger ? "rgba(239,68,68,0.18)" : "rgba(99,102,241,0.15)"
        : danger ? "#fce3e3"              : "#f1f0ff";

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    ["#6366f1","#4338ca"], ["#8b5cf6","#6d28d9"], ["#ec4899","#be185d"],
    ["#14b8a6","#0f766e"], ["#f59e0b","#b45309"], ["#10b981","#047857"],
    ["#3b82f6","#1d4ed8"], ["#ef4444","#b91c1c"],
];
const getAvatarColors = (name = "") => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitial      = (name = "") => (name?.trim()?.[0] || "?").toUpperCase();
const Avatar = ({ src, name, size = 36, className = "" }) => {
    const [failed, setFailed] = useState(false);
    const [bg, bg2] = getAvatarColors(name);
    if (!src || failed) {
        return (
            <div
                className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
                style={{ width: size, height: size, fontSize: size * 0.38,
                    background: `linear-gradient(135deg, ${bg}, ${bg2})`, color: "#fff" }}
            >
                {getInitial(name)}
            </div>
        );
    }
    return (
        <img src={src} alt={name} onError={() => setFailed(true)}
            className={`rounded-full object-cover flex-shrink-0 ${className}`}
            style={{ width: size, height: size }} />
    );
};

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
const RANGE_INFO = {
    "7days":  { title: "Clear Last 7 Days",  desc: "Permanently deletes all patient history from the last 7 days." },
    "30days": { title: "Clear Last 30 Days", desc: "Permanently deletes all patient history from the last 30 days." },
    "all":    { title: "Clear All History",  desc: "Permanently deletes ALL patient history. This cannot be undone." },
};
const ConfirmModal = ({ isOpen, range, onClose, onConfirm }) => {
    const info = RANGE_INFO[range] || {};
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div key="backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }} onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" />
                    <div className="fixed inset-0 flex items-center justify-center z-[10000] px-4 py-6" onClick={onClose}>
                        <motion.div key="modal"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }}
                            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                            <div className="bg-gradient-to-br from-red-500 to-rose-600 px-6 py-5 flex items-center gap-3">
                                <motion.div
                                    initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 15 }}
                                    className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                    <FiAlertTriangle size={22} className="text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-white font-extrabold text-base leading-tight">{info.title}</p>
                                    <p className="text-white/75 text-xs mt-0.5">This action cannot be undone</p>
                                </div>
                            </div>
                            <div className="px-6 py-5">
                                <div className="flex items-start gap-3 bg-red-100 border border-red-400 rounded-xl p-3.5 mb-5">
                                    <FiTrash2 size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-900 leading-relaxed">{info.desc}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={onClose}
                                        className="flex-1 py-2.5 rounded-xl border border-gray-400 text-sm font-semibold text-gray-900 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors">
                                        Cancel
                                    </motion.button>
                                    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={onConfirm}
                                        className="flex-1 py-2.5 rounded-xl border-none bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold cursor-pointer shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                                        <FiTrash2 size={14} /> Yes, Clear
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const PatientsSkeleton = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="h-10 w-48 bg-gray-200 rounded-xl animate-pulse"/>
            <div className="h-10 w-72 bg-gray-200 rounded-xl animate-pulse"/>
        </div>
        <div className="h-8 w-64 bg-gray-200 rounded-xl animate-pulse mb-5"/>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse flex-shrink-0"/>
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"/>
                        <div className="h-2.5 w-48 bg-gray-100 rounded animate-pulse"/>
                    </div>
                    <div className="h-7 w-16 bg-gray-200 rounded-full animate-pulse"/>
                </div>
            ))}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const PatientsList = () => {

    const { aToken }                       = useContext(AdminContext);
    const { slotDateFormat }               = useContext(AppContext);

    // Initialize from cache → instant render on revisit, no skeleton flash
    const [patients,     setPatients]      = useState(() => _patientsCache ?? null);
    const [selected,     setSelected]      = useState(null);
    const [appointments, setAppointments]  = useState([]);
    const [loadingApts,  setLoadingApts]   = useState(false);
    const [search,       setSearch]        = useState("");
    const [filter,       setFilter]        = useState("all");
    const [showClear,    setShowClear]     = useState(false);
    const [modalOpen,    setModalOpen]     = useState(false);
    const [modalRange,   setModalRange]    = useState(null);

    const fetchPatients = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get("/api/admin/patients");
            if (data.success) {
                _patientsCache = data.patients; // populate cache for instant future renders
                setPatients(data.patients);
            } else toast.error(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            if (!_patientsCache) setPatients([]); // only show empty state if no cache
        }
    }, []);

    useEffect(() => { if (aToken) fetchPatients(); }, [aToken, fetchPatients]);

    const openPatient = async (patient) => {
        setSelected(patient);
        setAppointments([]);
        setLoadingApts(true);
        try {
            const { data } = await axiosInstance.get(`/api/admin/patient-appointments/${patient._id}`);
            if (data.success) setAppointments(data.appointments);
        } catch { toast.error("Could not load appointments"); }
        finally { setLoadingApts(false); }
    };

    const handleToggleBlock = async (userId, e) => {
        e?.stopPropagation();
        try {
            const { data } = await axiosInstance.post("/api/admin/toggle-block-patient", { userId });
            if (data.success) {
                toast.success(data.message);
                const updater = p => p._id === userId ? { ...p, isBlocked: !p.isBlocked } : p;
                setPatients(prev => {
                    const updated = prev.map(updater);
                    _patientsCache = updated; // keep cache in sync
                    return updated;
                });
                if (selected?._id === userId) setSelected(prev => ({ ...prev, isBlocked: !prev.isBlocked }));
            } else toast.error(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const openModal = (range) => { setModalRange(range); setShowClear(false); setModalOpen(true); };

    const handleConfirmClear = async () => {
        setModalOpen(false);
        try {
            const { data } = await axiosInstance.delete("/api/admin/clear-patients", { data: { range: modalRange } });
            if (data.success) {
                toast.success("History cleared ✅");
                _patientsCache = null; // invalidate so fresh data loads
                fetchPatients();
            }
            else toast.error(data.message);
        } catch { toast.error("Failed to clear history"); }
    };

    // Show skeleton while loading (null state)
    if (patients === null) return <PatientsSkeleton />;

    const filtered = patients.filter(p => {
        const matchSearch =
            p?.name?.toLowerCase().includes(search.toLowerCase()) ||
            p?.email?.toLowerCase().includes(search.toLowerCase()) ||
            p?.phone?.includes(search);
        const matchFilter =
            filter === "all"     ? true :
            filter === "active"  ? !p.isBlocked :
            filter === "blocked" ? p.isBlocked : true;
        return matchSearch && matchFilter;
    });

    const FILTERS = ["all", "active", "blocked"];
    const filterColors = {
        all:     "bg-indigo-600 text-white border-transparent",
        active:  "bg-emerald-600 text-white border-transparent",
        blocked: "bg-red-600 text-white border-transparent",
    };
    const filterInactive = "bg-white border border-gray-300 text-gray-900 hover:border-indigo-500";

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

            <ConfirmModal isOpen={modalOpen} range={modalRange} onClose={() => setModalOpen(false)} onConfirm={handleConfirmClear} />

            {/* ── Page heading — no animation ── */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600
                        flex items-center justify-center shadow-lg shadow-violet-200">
                        <FiUsers size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 leading-tight">Patients List</h1>
                        <p className="text-xs sm:text-sm text-gray-900 mt-0.5 flex items-center gap-1">
                            <MdVerified size={13} className="text-violet-500" />
                            {filtered.length} patient{filtered.length !== 1 ? "s" : ""} found
                        </p>
                    </div>
                </div>
                <div className="relative w-full sm:w-72">
                    <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Search name, email or phone..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-400
                            rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100
                            transition-colors duration-200 text-gray-900 placeholder:text-gray-400 shadow-sm" />
                </div>
            </div>

            {/* ── Filter pills + Clear History — no animation ── */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
                {FILTERS.map(f => (
                    <motion.button key={f} onClick={() => setFilter(f)} whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize
                            cursor-pointer transition-all duration-200 border
                            ${filter === f ? filterColors[f] : filterInactive}`}>
                        {f}
                    </motion.button>
                ))}
                <span className="text-xs text-gray-800 font-medium">
                    {patients.filter(p => p.isBlocked).length} blocked
                </span>
                <div className="relative ml-auto">
                    <motion.button onClick={() => setShowClear(p => !p)} whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer
                            border border-red-400 text-red-500 bg-white hover:bg-red-50
                            transition-colors duration-200 flex items-center gap-1.5">
                        <FiTrash2 size={12} /> Clear History
                    </motion.button>
                    <AnimatePresence>
                        {showClear && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.12, ease: "easeOut" } }}
                                exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.1 } }}
                                className="absolute right-0 top-[calc(100%+6px)] w-44 rounded-2xl z-50 overflow-hidden"
                                style={{
                                    background: isDark() ? "#1e293b" : "#ffffff",
                                    border: `1px solid ${isDark() ? "#334155" : "#e2e8f0"}`,
                                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                                }}>
                                {[
                                    { label: "Last 7 days",  range: "7days",  danger: false },
                                    { label: "Last 30 days", range: "30days", danger: false },
                                    { label: "Clear All",    range: "all",    danger: true  },
                                ].map(item => (
                                    <button key={item.range} onClick={() => openModal(item.range)}
                                        onMouseEnter={e => e.currentTarget.style.background = getDropdownHover(item.danger)}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        style={{ background: "transparent", transition: "background 0.15s" }}
                                        className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm border-none cursor-pointer text-left
                                            ${item.danger ? "text-red-500 font-semibold" : isDark() ? "text-slate-300" : "text-gray-700"}`}>
                                        <FiTrash2 size={13} /> {item.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Table — no animation ── */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-lg shadow-gray-400/60 overflow-hidden">
                <div className="hidden sm:grid grid-cols-[0.4fr_2.5fr_2fr_1.5fr_1fr_1fr]
                    gap-2 px-5 py-3.5 bg-gradient-to-r from-gray-200 to-white
                    border-b border-gray-400 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <p className="text-gray-700">#</p>
                    <p className="flex items-center gap-1"><FiUsers size={11} className="text-gray-700"/> Patient</p>
                    <p className="flex items-center gap-1"><FiMail size={11} className="text-gray-700"/> Email</p>
                    <p className="flex items-center gap-1"><FiPhone size={11} className="text-gray-700"/> Phone</p>
                    <p className="flex items-center gap-1"><FiShield size={11} className="text-gray-700"/> Status</p>
                    <p className="text-gray-600">Action</p>
                </div>

                <div>
                    {filtered.map((patient, index) => (
                        <div
                            key={patient._id}
                            onClick={() => openPatient(patient)}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = getAdminHover()}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                            style={{ transition: "background-color 0.15s ease" }}
                            className="grid grid-cols-1 sm:grid-cols-[0.4fr_2.5fr_2fr_1.5fr_1fr_1fr]
                                gap-2 items-center px-5 py-3.5 border-b border-gray-100 last:border-b-0 cursor-pointer"
                        >
                            <p className="hidden sm:block text-xs font-semibold text-gray-700">{index + 1}</p>
                            <div className="flex items-center gap-2.5">
                                <div className="relative flex-shrink-0">
                                    <Avatar src={patient.image} name={patient.name} size={36} className="border-2 border-gray-200 shadow-sm" />
                                    {patient.isBlocked && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                                            <FiSlash size={7} className="text-white"/>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{patient.name}</p>
                                    <p className="text-xs text-gray-700 sm:hidden">{patient.email}</p>
                                </div>
                            </div>
                            <p className="hidden sm:block text-sm text-gray-700 truncate">{patient.email}</p>
                            <p className="hidden sm:block text-sm text-gray-700">{patient.phone || "—"}</p>
                            <div className="hidden sm:block">
                                {patient.isBlocked ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-500 text-xs font-semibold rounded-full border border-red-500">
                                        <MdBlock size={10}/> Blocked
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-500">
                                        <FiCheckCircle size={10}/> Active
                                    </span>
                                )}
                            </div>
                            <div onClick={e => e.stopPropagation()}>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={e => handleToggleBlock(patient._id, e)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border transition-colors duration-200 flex items-center gap-1.5
                                        ${patient.isBlocked
                                            ? "bg-emerald-100 text-emerald-600 border-emerald-400 hover:bg-emerald-200"
                                            : "bg-red-100 text-red-500 border-red-400 hover:bg-red-200"}`}>
                                    {patient.isBlocked ? <><FiCheckCircle size={11}/> Unblock</> : <><MdBlock size={11}/> Block</>}
                                </motion.button>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-3 border border-gray-500">
                            <FiUsers size={24} className="text-gray-700"/>
                        </div>
                        <p className="text-sm font-semibold text-gray-950">No patients found</p>
                        <p className="text-xs text-gray-800 mt-1">
                            {search ? `No match for "${search}"` : "Patients will appear here once registered"}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Patient Detail Modal ── */}
            <AnimatePresence>
                {selected && (
                    <>
                        <motion.div key="backdrop"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }} onClick={() => setSelected(null)}
                            className="fixed inset-0 bg-black/50 z-[9999]" />
                        <div className="fixed inset-0 flex items-center justify-center z-[10000] px-4 py-6" onClick={() => setSelected(null)}>
                            <motion.div key="modal"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }}
                                exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 pt-6 pb-10">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelected(null)}
                                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm
                                            flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors z-10">
                                        <FiX size={15} className="text-white"/>
                                    </motion.button>
                                    <div className="flex items-center gap-2 mb-3">
                                        <HiSparkles size={12} className="text-white/70"/>
                                        <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Patient Profile</span>
                                        <HiSparkles size={12} className="text-white/70"/>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/40 shadow-lg flex-shrink-0">
                                            <Avatar src={selected.image} name={selected.name} size={64} className="rounded-2xl" />
                                        </div>
                                        <div>
                                            <p className="text-white font-extrabold text-lg leading-tight">{selected.name}</p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-[10px] font-semibold rounded-full border
                                                ${selected.isBlocked ? "bg-red-100 text-red-600 border-red-400" : "bg-emerald-100 text-emerald-700 border-emerald-400"}`}>
                                                {selected.isBlocked ? <><MdBlock size={9}/> Blocked</> : <><FiCheckCircle size={9}/> Active</>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-5">
                                    <div className="space-y-3 mb-5">
                                        {[
                                            { icon: FiMail,         label: "Email",   value: selected.email },
                                            { icon: FiPhone,        label: "Phone",   value: selected.phone || "Not provided" },
                                            { icon: FaVenusMars,    label: "Gender",  value: selected.gender },
                                            { icon: FaBirthdayCake, label: "DOB",     value: selected.dob || "Not provided" },
                                            { icon: FiMapPin,       label: "Address",
                                                value: selected.address?.line1 ? `${selected.address.line1}, ${selected.address.line2}` : "Not provided" },
                                        ].map((row, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-200 border border-gray-300">
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    <row.icon size={12} className="text-white"/>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">{row.label}</p>
                                                    <p className="text-sm font-medium text-gray-600 break-words">{row.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => handleToggleBlock(selected._id)}
                                        className={`w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer border transition-colors duration-200
                                            flex items-center justify-center gap-2 mb-5
                                            ${selected.isBlocked
                                                ? "bg-emerald-100 text-emerald-600 border-emerald-400 hover:bg-emerald-200"
                                                : "bg-red-100 text-red-500 border-red-400 hover:bg-red-200"}`}>
                                        {selected.isBlocked ? <><FiCheckCircle size={14}/> Unblock Patient</> : <><MdBlock size={14}/> Block Patient</>}
                                    </motion.button>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                                            <FiCalendar size={12} className="text-white"/>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Appointment History</p>
                                        <span className="ml-auto text-xs font-semibold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full border border-violet-500">
                                            {appointments.length} total
                                        </span>
                                    </div>
                                    {loadingApts ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"/>
                                        </div>
                                    ) : appointments.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-200 rounded-xl border border-gray-500">
                                            <FiCalendar size={20} className="text-gray-600 mx-auto mb-2"/>
                                            <p className="text-xs text-gray-900">No appointments yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                            {[...appointments].reverse().map((apt, i) => (
                                                <div key={apt._id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-200 gap-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Avatar src={apt?.docData?.image} name={apt?.docData?.name} size={32} className="border border-gray-200 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-gray-900 truncate">{apt?.docData?.name}</p>
                                                            <p className="text-[10px] text-gray-600 flex items-center gap-1">
                                                                <FiClock size={9}/>{slotDateFormat(apt?.slotDate)}, {apt?.slotTime}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {apt.cancelled ? (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-500 rounded-full border border-red-400 flex-shrink-0">Cancelled</span>
                                                    ) : apt.isCompleted ? (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full border border-emerald-400 flex-shrink-0">Completed</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full border border-amber-400 flex-shrink-0">Upcoming</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientsList;