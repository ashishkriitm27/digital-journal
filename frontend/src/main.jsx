import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google' // <-- Yeh import karein
import App from './App.jsx'
import './index.css'

// Apni Google Client ID yahan paste kijiye
const GOOGLE_CLIENT_ID = "814940556396-9gklf9spqc5rmkuq7nubkk1t6km8rop0.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)