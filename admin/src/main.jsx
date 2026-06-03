import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";

import './index.css'
import App from './App.jsx'

import AdminContextProvider from './context/AdminContext'
import DoctorContextProvider from './context/DoctorContext'
import AppContextProvider from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
    <AdminContextProvider>
      <DoctorContextProvider>
        <AppContextProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <App />
          </GoogleOAuthProvider>
        </AppContextProvider>
      </DoctorContextProvider>
    </AdminContextProvider>
    </ThemeProvider>
  </StrictMode>
)
