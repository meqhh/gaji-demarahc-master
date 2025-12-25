import React, { useState, useEffect } from "react";


function WelcomeToastInner({ userType = "karyawan" }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const justLoggedIn = localStorage.getItem("justLoggedIn");

    if (justLoggedIn) {
      const displayName = userType === "admin" ? "Admin Panel" : "Portal Karyawan";
      setUserName(displayName);
      setShowWelcome(true);
      localStorage.removeItem("justLoggedIn");

      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    showWelcome && (
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 text-white px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-sm flex items-center space-x-3">
          <span className="text-3xl animate-bounce">👋</span>
          <div>
            <p className="font-bold text-lg">Selamat datang!</p>
            <p className="text-sm opacity-90">{userName}</p>
          </div>
          <span className="text-2xl ml-4">✨</span>
        </div>
      </div>
    )
  );
}

function WelcomeToast({ userType = "karyawan" }) {
  // Always render inner (hooks called consistently); inner decides text based on userType
  return <WelcomeToastInner userType={userType} />;
}

export default WelcomeToast;
