import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Wallet2,
  PieChart,
  RefreshCcw,
  Save,
  Info,
} from "lucide-react";

/**
 * FinVerse — Budget Planner (Cinematic, Style B)
 * - Dark glass UI + blue-lavender glow (#635BFF)
 * - Inputs: income, savings goal, risk (Low/Moderate/High)
 * - Generate → AI explanation + animated allocation bars
 * - Regenerate / Save (persists in localStorage)
 */

const ACCENT = "#635BFF";
const LS_KEY = "finverse_budget_plans";

function fmt(n) {
  if (!isFinite(n)) return "$0";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// Return percentage splits based on risk + a gentle randomization
function makePlan(risk) {
  let base;
  if (risk === "Low") {
    base = { Essentials: 55, Savings: 25, Investments: 10, Lifestyle: 10 };
  } else if (risk === "High") {
    base = { Essentials: 45, Savings: 15, Investments: 30, Lifestyle: 10 };
  } else {
    base = { Essentials: 50, Savings: 20, Investments: 20, Lifestyle: 10 };
  }
  // tiny variation to feel “AI”
  const jitter = (v) => Math.max(0, v + Math.round((Math.random() - 0.5) * 4));
  let plan = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, jitter(v)]));
  // normalize to 100
  const sum = Object.values(plan).reduce((a, b) => a + b, 0) || 1;
  plan = Object.fromEntries(Object.entries(plan).map(([k, v]) => [k, Math.round((v / sum) * 100)]));
  // fix rounding drift
  const drift = 100 - Object.values(plan).reduce((a, b) => a + b, 0);
  if (drift !== 0) plan.Essentials = Math.min(100, Math.max(0, plan.Essentials + drift));
  return plan;
}

const REASONS = {
  Low: "You prefer stability and cash buffers — the split favors essentials and higher savings with modest investing.",
  Moderate:
    "Balanced approach — steady savings plus meaningful investing while preserving day-to-day comfort.",
  High: "Growth-focused — larger investing slice, accepting higher volatility for long-term upside.",
};

export default function BudgetPlanner() {
  const [income, setIncome] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [risk, setRisk] = useState("Moderate");

  const [forecast, setForecast] = useState(null);
  const [saved, setSaved] = useState([]);

  const [loading, setLoading] = useState(false);

  // load saved
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      setSaved(s);
    } catch {}
  }, []);
  // persist saved
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(saved));
  }, [saved]);

  function generate() {
    if (!income || Number(income) <= 0) {
      alert("Enter your monthly income.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const plan = makePlan(risk);
      setForecast({
        plan,
        risk,
        income: Number(income),
        savingsGoal: Number(savingsGoal || 0),
        reasoning: REASONS[risk],
        ts: new Date().toLocaleString(),
      });
      setLoading(false);
    }, 500);
  }

  function regenerate() {
    if (!forecast) return generate();
    setLoading(true);
    setTimeout(() => {
      const plan = makePlan(risk);
      setForecast({ ...forecast, plan, risk, reasoning: REASONS[risk], ts: new Date().toLocaleString() });
      setLoading(false);
    }, 450);
  }

  function saveForecast() {
    if (!forecast) return;
    const entry = { ...forecast };
    setSaved((s) => [entry, ...s].slice(0, 8));
  }

  const total = forecast?.income || 0;

  return (
    <div className="p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 min-h-[calc(100vh-64px)] text-slate-100">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 ring-1 ring-slate-700">
          <Sparkles size={16} className="text-cyan-300" />
          <span className="text-xs tracking-wide text-slate-300">FinVerse · AI Budget Forecaster</span>
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold bg-gradient-to-r from-cyan-200 to-indigo-300 bg-clip-text text-transparent">
          Plan your month with clarity, speed, and guidance
        </h1>
        <p className="mt-2 text-slate-400">
          Enter income, choose risk — get an explainable budget split with animated visuals. Save or regenerate anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT (2/3): Input + Forecast */}
        <div className="xl:col-span-2 space-y-6">
          {/* Inputs */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Wallet2 className="text-indigo-300" size={20} />
              <h2 className="font-semibold">Your Inputs</h2>
            </div>
            <div className="p-6 grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-slate-300">Monthly Income ($)</label>
                <input
                  type="number"
                  placeholder="e.g., 6000"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Savings Goal ($)</label>
                <input
                  type="number"
                  placeholder="optional"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Risk Preference</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  value={risk}
                  onChange={(e) => setRisk(e.target.value)}
                >
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                </select>
              </div>

              <div className="md:col-span-3 flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  onClick={generate}
                  className="flex-1 inline-flex items-center justify-center gap-2 font-semibold text-white px-4 py-3 rounded-lg transition shadow-lg"
                  style={{
                    background: ACCENT,
                    boxShadow: `0 10px 30px -8px ${ACCENT}66, inset 0 0 0 1px #7F76FF`,
                  }}
                >
                  <PieChart size={18} /> Generate Forecast
                </button>
                <button
                  onClick={regenerate}
                  disabled={!forecast}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                    forecast ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-800/60 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <RefreshCcw size={18} /> Regenerate
                </button>
                <button
                  onClick={saveForecast}
                  disabled={!forecast}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                    forecast ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-emerald-700/40 text-emerald-200/60 cursor-not-allowed"
                  }`}
                >
                  <Save size={18} /> Save Forecast
                </button>
              </div>
            </div>
          </div>

          {/* Forecast Display */}
          <div
            className={`rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl relative overflow-hidden ${
              loading ? "animate-pulse" : "animate-fade-in"
            }`}
          >
            {/* glow strip */}
            <div
              className="absolute -top-24 left-1/2 h-48 w-[140%] -translate-x-1/2 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: ACCENT }}
            />
            <div className="p-6 border-b border-slate-800 flex items-center gap-2 relative">
              <Sparkles className="text-cyan-300" size={20} />
              <h2 className="font-semibold">AI Forecast</h2>
            </div>

            {forecast ? (
              <div className="p-6 space-y-5">
                <p className="text-slate-300 text-sm">{forecast.reasoning}</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Metric label="Income" value={fmt(forecast.income)} />
                  <Metric label="Savings Goal" value={forecast.savingsGoal ? fmt(forecast.savingsGoal) : "—"} />
                </div>

                <div className="space-y-3">
                  {Object.entries(forecast.plan).map(([cat, pct], i) => (
                    <div key={cat}>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{cat}</span>
                        <span>
                          {pct}% &nbsp;|&nbsp; {fmt((pct / 100) * total)}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            i === 0
                              ? "bg-[#22d3ee]"
                              : i === 1
                              ? "bg-[#6366f1]"
                              : i === 2
                              ? "bg-[#34d399]"
                              : "bg-[#f59e0b]"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <Info size={16} className="inline mr-2 text-slate-400" />
                  Treat this as a flexible guide. Adjust splits when life events change (move, car purchase, travel).
                </div>
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-400">
                Enter your income and click <b>Generate Forecast</b> to see an AI-guided budget with explanations.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (1/3): Saved Plans */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800">
              <h2 className="font-semibold">Saved Forecasts</h2>
            </div>
            <div className="p-6 text-sm text-slate-300 space-y-3">
              {saved.length === 0 && <p className="text-slate-500">No forecasts saved yet.</p>}
              {saved.map((f, i) => (
                <div
                  key={i}
                  className="border border-slate-800 rounded-lg p-3 hover:bg-slate-800/60 transition"
                >
                  <div className="font-semibold text-slate-200 mb-1">{f.ts}</div>
                  <div className="text-slate-400 mb-1">
                    Income: {fmt(f.income)} · Risk: {f.risk}
                  </div>
                  <ul className="text-xs text-slate-400 space-y-1">
                    {Object.entries(f.plan).map(([cat, pct]) => (
                      <li key={cat}>
                        {cat}: {pct}% ({fmt((pct / 100) * f.income)})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- tiny helpers --- */
function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}

/* fade-in animation once per page */
if (typeof document !== "undefined" && !document.getElementById("fv-anim-budget2")) {
  const style = document.createElement("style");
  style.id = "fv-anim-budget2";
  style.innerHTML = `
@keyframes fadeInFV { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeInFV .35s ease-out both; }
`;
  document.head.appendChild(style);
}
