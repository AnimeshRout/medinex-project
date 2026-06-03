import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    // ================= GLOBAL VARIABLES =================
    const currency = "₹";

    // ================= CALCULATE AGE =================
    const calculateAge = (dob) => {
        try {

            const today = new Date();
            const birthDate = new Date(dob);

            let age = today.getFullYear() - birthDate.getFullYear();

            const monthDifference = today.getMonth() - birthDate.getMonth();

            if (
                monthDifference < 0 ||
                (monthDifference === 0 && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }

            return age;

        } catch (error) {
            console.error("Age calculation error:", error);
            return "";
        }
    };

    // ================= MONTHS ARRAY =================
    const months = [
        "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // ================= FORMAT SLOT DATE =================
    const slotDateFormat = (slotDate) => {
        try {

            const dateArray = slotDate.split("_");

            const day   = dateArray[0];
            const month = months[Number(dateArray[1])];
            const year  = dateArray[2];

            return `${day} ${month} ${year}`;

        } catch (error) {
            console.error("Date format error:", error);
            return slotDate;
        }
    };

    // ================= CONTEXT VALUE =================
    const value = {
        calculateAge,
        slotDateFormat,
        currency,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;