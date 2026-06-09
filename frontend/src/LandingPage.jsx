// frontend/src/LandingPage.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function LandingPage({ onLoginSuccess }) {
  return (
    <div className="min-h-screen bg-[#070b13] text-white flex flex-col justify-center items-center p-6 selection:bg-blue-500/30">
      <div className="max-w-md w-full text-center space-y-6 bg-[#0d1527] p-8 rounded-2xl shadow-2xl border border-slate-800/80">
        
        {/* DIGITAL.JOURNAL LOGO HEADER */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse"></span>
            <h1 className="text-xl font-black tracking-wider text-slate-100">DIGITAL.JOURNAL</h1>
          </div>
          <div className="w-12 h-[1px] bg-slate-800/80 mx-auto"></div>
        </div>

        {/* SUBTITLE */}
        <p className="text-sm text-slate-400">
          Sign in to access your personal workspace.
        </p>

        {/* Google OAuth Button */}
        <div className="flex justify-center pt-2">
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={() => console.log("Google Login Failed")}
            useOneTap
            theme="filled_blue"
            shape="pill"
          />
        </div>

        {/* FOOTER TEXT */}
        <p className="text-xs text-slate-500 tracking-wide">
          Secure authentication handled by Google.
        </p>
      </div>
    </div>
  );
}