import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Shield,
  TrendingUp,
  Wallet,
  Calculator,
  CreditCard,
  LogOut,
  Sparkles,
  User,
} from "lucide-react";

export default function Sidebar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const links = [
    { name: "Home", path: "/", icon: <Home size={18} /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Insurance", path: "/insurance", icon: <Shield size={18} /> },
    { name: "Investments", path: "/investments", icon: <TrendingUp size={18} /> },
    { name: "Expenses", path: "/expenses", icon: <Wallet size={18} /> },
    { name: "Budget Planner", path: "/budget", icon: <Calculator size={18} /> },
    { name: "Tax Filing", path: "/tax-filing", icon: <CreditCard size={18} /> },
    { name: "Credit Score", path: "/credit-score", icon: <User size={18} /> },
  ];

  return (
    <aside className="flex flex-col justify-between h-screen w-64 bg-white/80 backdrop-blur border-r border-slate-200">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
          <Sparkles size={22} className="text-indigo-600" />
          <h1 className="text-lg font-bold text-indigo-700">FinVerse</h1>
          <span className="text-xs text-slate-400 ml-auto">AI-Powered Finance</span>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-4">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
            Navigation
          </p>
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>

        {/* AI-Powered section */}
        <div className="px-4 mt-6">
          <div className="bg-indigo-50 rounded-lg p-3 text-xs text-slate-500">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-indigo-500" />
              <span className="font-medium text-indigo-600">AI-Powered</span>
            </div>
            Smart recommendations tailored to your financial goals.
          </div>
        </div>
      </div>

      {/* User + Logout */}
      <div className="p-4 border-t border-slate-200">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold uppercase">
              {user.name?.[0] || "U"}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">{user.name}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full justify-center text-sm text-indigo-600 font-medium border border-indigo-100 hover:bg-indigo-50 py-2 rounded-lg transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
