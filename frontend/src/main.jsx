import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

import AppContextProvider from "./context/AppContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AppContextProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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
            <App />
          </GoogleOAuthProvider>
        </AppContextProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);