import { useState, createContext } from "react";
import axiosInstance from "../api/axios";
import toast from "react-hot-toast";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {

    // ================= DOCTOR TOKEN =================
    const [dToken, setDToken] = useState(
        localStorage.getItem("dToken") || ""
    );

    // ================= STATES =================
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);

    // ================= GET APPOINTMENTS =================
    const getAppointments = async () => {
        try {
            if (!dToken) return;
            const { data } = await axiosInstance.get("/api/doctor/appointments");
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // ================= COMPLETE APPOINTMENT =================
    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axiosInstance.post(
                "/api/doctor/complete-appointment",
                { appointmentId }
            );
            if (data.success) {
                toast.success(data.message);
                getAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // ================= CANCEL APPOINTMENT =================
    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axiosInstance.post(
                "/api/doctor/cancel-appointment",
                { appointmentId }
            );
            if (data.success) {
                toast.success(data.message);
                getAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // ================= GET DASHBOARD DATA =================
    const getDashData = async () => {
        try {
            const { data } = await axiosInstance.get("/api/doctor/dashboard");
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // ================= GET PROFILE DATA =================
    const getProfileData = async () => {
        try {
            const { data } = await axiosInstance.get("/api/doctor/profile");
            if (data.success) {
                setProfileData(data.profileData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // ================= UPDATE PROFILE ✅ NEW =================
    const updateProfile = async (updateData) => {
        try {
            const { data } = await axiosInstance.post(
                "/api/doctor/update-profile",
                updateData
            );
            if (data.success) {
                toast.success(data.message);
                await getProfileData();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
            return false;
        }
    };

    // ================= CONTEXT VALUE =================
    const value = {
        dToken,
        setDToken,

        appointments,
        setAppointments,
        getAppointments,

        completeAppointment,
        cancelAppointment,

        dashData,
        setDashData,
        getDashData,

        profileData,
        setProfileData,
        getProfileData,
        updateProfile, 
    };

    return (
        <DoctorContext.Provider value={value}>
            {children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;