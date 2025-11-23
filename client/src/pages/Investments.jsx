import React, { useMemo, useState } from "react";
import {
  Sparkles,
  Wand2,
  RotateCw,
  Save,
  Calendar,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Info,
  Gauge,
  Rocket,
} from "lucide-react";

/**
 * FinVerse — AI Investment Planner (Style B, Cinematic, NO Charts)
 * - One AI plan at a time: Generate → (Save | Regenerate)
 * - Dark glass UI + blue-lavender glow (#635BFF)
 * - Allocation bars (no charts)
 * - SIP + optional lump sum math for projected value
 */

const ACCENT = "#635BFF"; // blue-lavender glow

function fmt(n) {
  if (!isFinite(n)) return "$0";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// Basic CAGR anchors by bias
const BIAS = {
  cautious: { range: [0.045, 0.065], label: "Cautious" },
  balanced: { range: [0.07, 0.095], label: "Balanced" },
  growth: { range: [0.10, 0.125], label: "Growth" },
};

// future value with simple monthly compounding (SIP + lump sum)
function projectFV({ principal = 0, monthly = 0, years = 0, annualRate = 0.08 }) {
  const n = Math.max(0, Math.round(years * 12));
  const i = annualRate / 12;

  const fvPrincipal = principal * Math.pow(1 + annualRate, years);
  const fvSip = i > 0 ? monthly * ((Math.pow(1 + i, n) - 1) / i) : monthly * n;

  const totalInvested = principal + monthly * n;
  const projected = fvPrincipal + fvSip;
  const returns = Math.max(0, projected - totalInvested);

  return { totalInvested, projected, returns };
}

// create a single "AI" plan with gentle randomness
function generatePlan({ bias, years, monthly, principal }) {
  const [min, max] = BIAS[bias].range;
  // Slightly reward longer horizon with higher end of CAGR
  const horizonBump = Math.min(0.02, Math.max(0, (years - 5) * 0.0015));
  const cagr = clamp(randRange(min, max) + horizonBump, min, max + 0.01);

  // Allocation templates influenced by bias; add tiny randomness
  let base = {
    Equity: bias === "growth" ? 0.75 : bias === "balanced" ? 0.6 : 0.45,
    Bonds: bias === "cautious" ? 0.4 : bias === "balanced" ? 0.28 : 0.16,
    Gold: bias === "cautious" ? 0.1 : 0.08,
    "Real Estate": bias === "growth" ? 0.08 : 0.06,
    Crypto: bias === "growth" ? 0.06 : bias === "balanced" ? 0.03 : 0.01,
  };

  // jitter & re-normalize to 100%
  const jittered = Object.fromEntries(
    Object.entries(base).map(([k, v]) => [k, clamp(v + randRange(-0.02, 0.02), 0, 0.9)])
  );
  const sum = Object.values(jittered).reduce((a, b) => a + b, 0);
  const mix = Object.fromEntries(
    Object.entries(jittered).map(([k, v]) => [k, v / sum])
  );

  // Projection
  const fv = projectFV({ principal, monthly, years, annualRate: cagr });

  // Rationale
  const rationale = makeRationale({ bias, years, monthly, cagr, mix });

  return {
    bias,
    years,
    monthly,
    principal,
    cagr,
    mix,
    ...fv,
    rationale,
  };
}

function clamp(x, a, b) {
  return Math.min(b, Math.max(a, x));
}
function randRange(a, b) {
  return a + Math.random() * (b - a);
}
function pct(n) {
  return `${Math.round(n * 100)}%`;
}
function makeRationale({ bias, years, monthly, cagr, mix }) {
  const biasText =
    bias === "cautious"
      ? "capital preservation with steady income"
      : bias === "balanced"
      ? "risk-adjusted growth with diversification"
      : "long-term appreciation accepting higher volatility";

  const mixString = Object.entries(mix)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${pct(v)}`)
    .join(" · ");

  return `This plan targets ${biasText}. Allocation emphasizes ${mixString}.
Given a ${years}-year horizon and a monthly contribution of ${fmt(monthly)}, the expected CAGR is about ${(cagr * 100).toFixed(
    1
  )}% (not guaranteed). Consider annual rebalancing and increasing SIP with income growth.`;
}

export default function Investments() {
  // Inputs
  const [years, setYears] = useState("20");
  const [monthly, setMonthly] = useState("500");
  const [principal, setPrincipal] = useState("0");
  const [bias, setBias] = useState("balanced");
  // Plan state
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState([]);

  function goGenerate() {
    setLoading(true);
    // subtle "AI thinking" delay
    setTimeout(() => {
      const p = generatePlan({
        bias,
        years: Number(years) || 0,
        monthly: Number(monthly) || 0,
        principal: Number(principal) || 0,
      });
      setPlan(p);
      setLoading(false);
    }, 650);
  }

  function saveCurrent() {
    if (!plan) return;
    setSaved((s) => [{ ...plan, id: cryptoRandom() }, ...s].slice(0, 10));
  }
  function regenerate() {
    goGenerate();
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 min-h-[calc(100vh-64px)] text-slate-100">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 ring-1 ring-slate-700">
          <Sparkles size={16} className="text-cyan-300" />
          <span className="text-xs tracking-wide text-slate-300">FinVerse · AI Investment Planner</span>
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold bg-gradient-to-r from-cyan-200 to-indigo-300 bg-clip-text text-transparent">
          Generate a personalized, transparent investment plan
        </h1>
        <p className="mt-2 text-slate-400">
          Clean, cinematic workflow: pick inputs → let AI propose one plan → save or regenerate.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT (2/3): Inputs + Plan */}
        <div className="xl:col-span-2 space-y-6">
          {/* Inputs */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Rocket className="text-indigo-300" size={20} />
              <h2 className="font-semibold">Your Inputs</h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300">Investment Horizon (years)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                    placeholder="e.g., 20"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                  />
                  <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300">Monthly Investment ($)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                    placeholder="e.g., 500"
                    value={monthly}
                    onChange={(e) => setMonthly(e.target.value)}
                  />
                  <Wallet size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300">Initial Lump Sum ($)</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  placeholder="e.g., 10000"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Bias</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  value={bias}
                  onChange={(e) => setBias(e.target.value)}
                >
                  <option value="cautious">Cautious</option>
                  <option value="balanced">Balanced</option>
                  <option value="growth">Growth</option>
                </select>
              </div>

              <div className="md:col-span-2 mt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={goGenerate}
                  className="flex-1 inline-flex items-center justify-center gap-2 font-semibold text-white px-4 py-3 rounded-lg transition shadow-lg"
                  style={{
                    background: ACCENT,
                    boxShadow: `0 10px 30px -8px ${ACCENT}66, inset 0 0 0 1px #7F76FF`,
                  }}
                >
                  <Wand2 size={18} /> Generate AI Plan
                </button>
                <button
                  onClick={regenerate}
                  disabled={!plan}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                    plan
                      ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                      : "bg-slate-800/60 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <RotateCw size={18} /> Regenerate
                </button>
                <button
                  onClick={saveCurrent}
                  disabled={!plan}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                    plan
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-emerald-700/40 text-emerald-200/60 cursor-not-allowed"
                  }`}
                >
                  <Save size={18} /> Save Plan
                </button>
              </div>
            </div>
          </div>

          {/* Generated Plan Card */}
          <div
            className={`rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl relative overflow-hidden ${
              loading ? "animate-pulse" : "animate-fade-in"
            }`}
          >
            {/* glow strip */}
            <div
              className="absolute -top-24 left-1/2 h-48 w-[140%] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
              style={{ background: ACCENT }}
            />
            <div className="p-6 border-b border-slate-800 flex items-center gap-2 relative">
              <TrendingUp className="text-cyan-300" size={20} />
              <h2 className="font-semibold">AI Plan</h2>
              {plan && (
                <span className="ml-auto text-xs rounded-full px-2 py-1 bg-slate-800 text-slate-300">
                  {BIAS[plan.bias].label}
                </span>
              )}
            </div>

            <div className="p-6 grid lg:grid-cols-2 gap-6">
              {/* Left: numbers */}
              <div className="grid grid-cols-2 gap-4">
                <Metric label="Total Invested" value={fmt(plan?.totalInvested || 0)} />
                <Metric label="Projected Value" value={fmt(plan?.projected || 0)} />
                <Metric label="Expected Returns" value={fmt(plan?.returns || 0)} />
                <Metric
                  label="CAGR (est.)"
                  value={plan ? `${(plan.cagr * 100).toFixed(1)}%` : "—"}
                />
              </div>

              {/* Right: Allocation bars + explain */}
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Gauge size={18} className="text-emerald-400" />
                    <span className="font-semibold">Allocation</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {(plan ? Object.entries(plan.mix) : []).map(([k, v], i) => (
                      <div key={k}>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">{k}</span>
                          <span className="text-slate-300">{Math.round(v * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              i === 0
                                ? "bg-[#22d3ee]"
                                : i === 1
                                ? "bg-[#6366f1]"
                                : i === 2
                                ? "bg-[#34d399]"
                                : i === 3
                                ? "bg-[#f59e0b]"
                                : "bg-[#a78bfa]"
                            }`}
                            style={{ width: `${v * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {!plan && <div className="text-slate-500 text-sm">No plan yet. Generate to see allocation.</div>}
                  </div>
                </div>

                <Explain
                  text={
                    loading
                      ? "Generating a tailored portfolio…"
                      : plan
                      ? plan.rationale
                      : "Click “Generate AI Plan” to receive a personalized allocation and projection with transparent reasoning."
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (1/3): Saved Plans */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-300" size={20} />
              <h2 className="font-semibold">Saved Plans</h2>
            </div>
            <div className="p-6">
              {saved.length === 0 ? (
                <p className="text-sm text-slate-400">Saved plans will appear here.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {saved.map((s) => (
                    <li key={s.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                      <div className="flex justify-between">
                        <span className="text-slate-200 font-medium">
                          {BIAS[s.bias].label} · {s.years}y
                        </span>
                        <span className="text-slate-400">
                          {fmt(s.monthly)}/mo • CAGR {(s.cagr * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-slate-300">
                        Invested {fmt(s.totalInvested)} → Target {fmt(s.projected)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Info className="text-cyan-300" size={20} />
              <h2 className="font-semibold">Notes</h2>
            </div>
            <div className="p-6 text-sm text-slate-300 space-y-2">
              <p>
                These are estimates for planning only. Market returns vary; fees and taxes can change outcomes.
              </p>
              <p>
                For a deeper experience later, we can connect this to a backend + OpenAI for real conversational advice and persistence in MongoDB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function Explain({ text }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-center gap-2 text-slate-300">
        <Info size={18} className="text-cyan-300" />
        <span className="font-semibold">AI Transparency</span>
      </div>
      <p className="mt-2 text-sm text-slate-300 whitespace-pre-line">{text}</p>
    </div>
  );
}

function cryptoRandom() {
  // simple unique id for saved plans
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* tiny fade-in animation */
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeInFV { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeInFV .35s ease-out both; }
`;
if (typeof document !== "undefined" && !document.getElementById("fv-anim")) {
  style.id = "fv-anim";
  document.head.appendChild(style);
}
