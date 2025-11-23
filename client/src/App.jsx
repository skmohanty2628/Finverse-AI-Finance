import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Insurance from "./pages/Insurance.jsx";
import Investments from "./pages/Investments.jsx";
import Expenses from "./pages/Expenses.jsx";
import BudgetPlanner from "./pages/BudgetPlanner.jsx";
import TaxFiling from "./pages/TaxFiling.jsx";
import CreditScore from "./pages/CreditScore.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  // ✅ Load user from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          id: payload.id,
          name: payload.name,
          email: payload.email,
        });
      } catch (e) {
        console.error("Token decode error:", e);
      }
    }
  }, []);

  return (
    <Routes>
      {/* 🔓 Public Routes */}
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/register" element={<Register setUser={setUser} />} />

      {/* 🔐 Protected Layout with Sidebar */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Child routes inside Layout */}
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="insurance" element={<Insurance />} />
        <Route path="investments" element={<Investments />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="budget" element={<BudgetPlanner />} />
        <Route path="tax-filing" element={<TaxFiling />} />
        <Route path="credit-score" element={<CreditScore />} />
        
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<h1 className="p-8 text-xl">Page Not Found</h1>} />
    </Routes>
  );
}
