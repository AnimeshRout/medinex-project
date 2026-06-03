import { createContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"

export const AppContext = createContext()

const AppContextProvider = ({ children }) => {

    // ================= GLOBAL CONFIG =================

    const currencySymbol = "₹"

    const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:4001"

    // ================= STATE =================

    const [doctors, setDoctors] = useState([])

    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    )

    const [userData, setUserData] = useState(null)

    // ================= GET DOCTORS =================

    const getDoctorsData = async () => {

        try {

            const { data } = await axios.get(
                backendUrl + "/api/doctor/list"
            )

            if (data.success) {

                setDoctors(data.doctors)

            } else {

                toast.error(data.message)

            }

        }

        catch (error) {

            console.log(error)

            toast.error(
                error.response?.data?.message || error.message
            )

        }

    }

    // ================= GET USER PROFILE =================

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setUserData(data.userData)
            } else {
                // ✅ Token invalid — clear it so Auth page doesn't redirect
                setToken("")
                localStorage.removeItem("token")
            }
        } catch (error) {
            setToken("")
            localStorage.removeItem("token")
        }
    }

    // ================= LOAD DOCTORS ON APP START =================

    useEffect(() => {

        getDoctorsData()

    }, [])

    // ================= LOAD USER PROFILE WHEN TOKEN CHANGES =================

    useEffect(() => {

        if (token) {

            localStorage.setItem("token", token)

            loadUserProfileData()

        } else {

            localStorage.removeItem("token")

            setUserData(null)

        }

    }, [token])

    // ================= GLOBAL CONTEXT VALUE =================

    const value = {

        doctors,
        getDoctorsData,

        currencySymbol,

        backendUrl,

        token,
        setToken,

        userData,
        setUserData,
        loadUserProfileData

    }

    return (

        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>

    )

}

export default AppContextProvider