import React, { useState, useEffect } from "react";
import { Gauge, ArrowUpRight, ArrowDownRight, Loader2, Sparkles } from "lucide-react";

export default function CreditScore() {
  const [score, setScore] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate API call delay
    setTimeout(() => {
      const mockScore = 725; // example score
      setScore(mockScore);
      if (mockScore >= 750) setStatus("Excellent");
      else if (mockScore >= 700) setStatus("Good");
      else if (mockScore >= 650) setStatus("Fair");
      else setStatus("Poor");
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100 p-8 rounded-2xl">
      <div className="flex items-center gap-2 mb-8">
        <Sparkles className="text-indigo-400" />
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-cyan-200 to-indigo-300 bg-clip-text text-transparent">
          Credit Score Overview
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="animate-spin text-indigo-400" size={40} />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-around items-center gap-10">
          {/* Circular Score Gauge */}
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              <path
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  score >= 750
                    ? "#22d3ee"
                    : score >= 700
                    ? "#6366f1"
                    : score >= 650
                    ? "#facc15"
                    : "#f43f5e"
                }
                strokeWidth="3"
                strokeDasharray={`${(score / 850) * 100}, 100`}
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-4xl font-bold">{score}</div>
              <div className="text-sm text-slate-400">out of 850</div>
            </div>
          </div>

          {/* Details */}
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-semibold text-indigo-300">
              Your Status: {status}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              A credit score of <span className="text-indigo-300 font-medium">{score}</span> is considered{" "}
              <span className="text-indigo-400 font-semibold">{status}</span>. 
              Keeping your score above 750 can help you qualify for better loan rates, higher limits, 
              and exclusive financial products.
            </p>
            <div className="bg-slate-800/50 rounded-xl p-4 text-sm border border-slate-700">
              <p className="text-slate-300 font-medium mb-2">AI Recommendation</p>
              {score >= 750 ? (
                <p className="text-emerald-400 flex items-center gap-2">
                  <ArrowUpRight size={16} /> Excellent score! Continue timely payments and low credit utilization.
                </p>
              ) : score >= 700 ? (
                <p className="text-cyan-400 flex items-center gap-2">
                  <ArrowUpRight size={16} /> Good job! Pay off small balances and avoid new credit inquiries.
                </p>
              ) : score >= 650 ? (
                <p className="text-yellow-400 flex items-center gap-2">
                  <ArrowDownRight size={16} /> Fair score. Reduce debts and maintain consistent on-time payments.
                </p>
              ) : (
                <p className="text-rose-400 flex items-center gap-2">
                  <ArrowDownRight size={16} /> Poor score. Focus on clearing overdue accounts and avoid missed payments.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
