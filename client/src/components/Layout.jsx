import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Chatbot from "./Chatbot.jsx";

export default function Layout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          name: payload.name || "User",
          email: payload.email || "example@email.com",
        });
      } catch (err) {
        console.error("Invalid token:", err);
      }
    } else {
      // Fallback fetch if token missing
      fetch("http://localhost:4000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setUser({
              name: data.user.name,
              email: data.user.email,
            });
          }
        })
        .catch(() => console.log("No active session found"));
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <Sidebar user={user} setUser={setUser} />

      {/* Main Content */}
      <main className="flex-1 bg-[#0b1020] text-white p-8 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto">
          <Outlet context={{ user, setUser }} />
        </div>

        {/* ✅ Only the Botpress chatbot appears now */}
        <Chatbot />
      </main>
    </div>
  );
}
