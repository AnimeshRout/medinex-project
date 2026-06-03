import { createContext, useState } from "react";
import axiosInstance from "../api/axios";
import toast from "react-hot-toast";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {

    // ================= ADMIN TOKEN =================
    const [aToken, setAToken] = useState(
        localStorage.getItem("aToken") || ""
    );

    // ================= STATES =================
    const [doctors,      setDoctors]      = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData,     setDashData]     = useState(false);

    // ================= GET ALL DOCTORS =================
    const getAllDoctors = async () => {
        try {

            if (!aToken) return;

            const { data } = await axiosInstance.post("/api/admin/all-doctors", {});

            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // ================= CHANGE DOCTOR AVAILABILITY =================
    const changeAvailability = async (docId) => {
        try {

            const { data } = await axiosInstance.post(
                "/api/admin/change-availability",
                { docId }
            );

            if (data.success) {
                toast.success(data.message);

                setDoctors(prev =>
                    prev.map(doc =>
                        doc._id === docId
                            ? { ...doc, available: !doc.available }
                            : doc
                    )
                );

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // ================= DELETE DOCTOR =================
    const deleteDoctor = async (docId) => {
        try {

            const { data } = await axiosInstance.post(
                "/api/admin/delete-doctor",
                { docId }
            );

            if (data.success) {
                toast.success(data.message);

                // ✅ Remove doctor from local state instantly
                setDoctors(prev => prev.filter(doc => doc._id !== docId));

                // ✅ Refresh dashboard counts
                if (dashData) getDashData();

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // ================= GET ALL APPOINTMENTS =================
    const getAllAppointments = async () => {
        try {

            const { data } = await axiosInstance.get("/api/admin/appointments");

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

    // ================= CANCEL APPOINTMENT =================
    const cancelAppointment = async (appointmentId) => {
        try {

            const { data } = await axiosInstance.post(
                "/api/admin/cancel-appointment",
                { appointmentId }
            );

            if (data.success) {
                toast.success(data.message);

                setAppointments(prev =>
                    prev.map(apt =>
                        apt._id === appointmentId
                            ? { ...apt, cancelled: true }
                            : apt
                    )
                );

                if (dashData) getDashData();

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

            const { data } = await axiosInstance.get("/api/admin/dashboard");

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

    // ================= CONTEXT VALUE =================
    const value = {
        aToken,
        setAToken,

        doctors,
        setDoctors,
        getAllDoctors,
        changeAvailability,
        deleteDoctor,

        appointments,
        setAppointments,
        getAllAppointments,
        cancelAppointment,

        dashData,
        setDashData,
        getDashData,
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;