import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ACCENT = "#635BFF";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Store token & force redirect to home
        localStorage.setItem("token", data.token);
        navigate("/", { replace: true }); // 🔥 Always go to home
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white">
      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full blur-[150px] opacity-30"
        style={{ background: ACCENT }}
      ></div>

      <div className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 w-[360px] text-center">
        <h1 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-800/80 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-800/80 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <button
            type="submit"
            className="mt-3 bg-indigo-500 hover:bg-indigo-600 transition-all duration-300 text-white font-medium py-3 rounded-lg shadow-lg"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-slate-400 text-sm">
          No account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
