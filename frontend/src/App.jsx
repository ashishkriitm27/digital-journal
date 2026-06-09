// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state refresh handle karne ke liye

  // useEffect check karega ki user pehle se logged in hai ya nahi
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Token ko headers mein bhej rahe hain verification ke liye
          const response = await axios.get('https://digital-journal-b2h1.onrender.com/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setUser(response.data.user);
        } catch (error) {
          console.error("Session expired or invalid token");
          localStorage.removeItem('token'); // Invalid token saaf karo
        }
      }
      setLoading(false); // Check poora hone ke baad loading band
    };

    checkLoginStatus();
  }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;
    
    try {
      const response = await axios.post('https://digital-journal-b2h1.onrender.com/api/auth/google', {
        token: googleToken
      });

      const { token, user: backendUser } = response.data;
      
      localStorage.setItem('token', token); 
      setUser(backendUser);

    } catch (error) {
      console.error("Login Error:", error);
      alert("Backend se connect nahi ho paya!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Jab tak check chal raha hai, tab tak ek simple loading ya blank screen dikhao
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center text-white">
        <p className="text-sm font-medium tracking-widest text-slate-4xl animate-pulse">LOADING SESSION...</p>
      </div>
    );
  }

  // Traffic routing logic
  if (!user) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}