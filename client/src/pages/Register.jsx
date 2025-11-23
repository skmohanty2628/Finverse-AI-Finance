import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ACCENT = "#635BFF";

export default function Register({ setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/dashboard"); // ✅ redirect to dashboard
      } else {
        alert(data.message || "Registration failed");
      }
    } catch {
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
        <h1 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
          Create Account
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-800/80 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
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
            Register
          </button>
        </form>
        <p className="mt-4 text-slate-400 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
