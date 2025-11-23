import React, { useMemo, useState } from "react";
import {
  Shield,
  ShieldCheck,
  HeartPulse,
  Car,
  Home,
  Users,
  DollarSign,
  ExternalLink,
  Sparkles,
  Activity,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

/**
 * FinVerse — AI Insurance Advisor (Style B)
 * - Professional, dark, glass UI (matches Tax page)
 * - AI-like recommendations (local heuristic now; ready to swap with LLM later)
 * - Governance (HEVIDS), Human Oversight, Audit Log, Explainability
 */

const CATEGORIES = [
  { id: "health", label: "Health", icon: <HeartPulse size={16} className="text-rose-300" /> },
  { id: "auto", label: "Auto", icon: <Car size={16} className="text-cyan-300" /> },
  { id: "life", label: "Life", icon: <Shield size={16} className="text-indigo-300" /> },
  { id: "home", label: "Home/Renters", icon: <Home size={16} className="text-emerald-300" /> },
];

const PROVIDERS = {
  health: [
    { name: "UnitedHealthcare", url: "https://www.uhc.com" },
    { name: "Blue Cross Blue Shield", url: "https://www.bcbs.com" },
    { name: "Kaiser Permanente", url: "https://healthy.kaiserpermanente.org" },
  ],
  auto: [
    { name: "GEICO", url: "https://www.geico.com" },
    { name: "Progressive", url: "https://www.progressive.com" },
    { name: "State Farm", url: "https://www.statefarm.com" },
  ],
  life: [
    { name: "Northwestern Mutual", url: "https://www.northwesternmutual.com" },
    { name: "New York Life", url: "https://www.newyorklife.com" },
    { name: "MassMutual", url: "https://www.massmutual.com" },
  ],
  home: [
    { name: "Lemonade", url: "https://www.lemonade.com" },
    { name: "Allstate", url: "https://www.allstate.com" },
    { name: "Liberty Mutual", url: "https://www.libertymutual.com" },
  ],
};

function fmt(n) {
  if (isNaN(n)) return "$0";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function Insurance() {
  // Inputs
  const [category, setCategory] = useState("health");
  const [age, setAge] = useState("");
  const [dependents, setDependents] = useState("");
  const [income, setIncome] = useState("");
  const [coverageNeeded, setCoverageNeeded] = useState("");

  // Results / UI state
  const [plans, setPlans] = useState([]);
  const [explain, setExplain] = useState("");
  const [humanOversight, setHumanOversight] = useState(true);
  const [audit, setAudit] = useState([]);

  function addAudit(event, detail) {
    setAudit((prev) => [
      { ts: new Date().toISOString(), event, detail },
      ...prev,
    ]);
  }

  const affordabilityBand = useMemo(() => {
    const inc = Number(income) || 0;
    if (inc <= 0) return { band: "Unknown", pct: 0.0 };
    // monthly affordability ~3% of monthly income by default
    const monthly = inc / 12;
    return { band: "Target Premium", pct: monthly * 0.03 };
  }, [income]);

  const chartData = useMemo(() => {
    // simple split to visualize risk mix suggestion per category
    if (category === "life") return [
      { name: "Term", value: 70 },
      { name: "Whole", value: 20 },
      { name: "Riders", value: 10 },
    ];
    if (category === "auto") return [
      { name: "Liability", value: 50 },
      { name: "Collision", value: 30 },
      { name: "Comprehensive", value: 20 },
    ];
    if (category === "home") return [
      { name: "Dwelling", value: 50 },
      { name: "Personal Property", value: 25 },
      { name: "Liability/Other", value: 25 },
    ];
    // health
    return [
      { name: "Hospitalization", value: 55 },
      { name: "OPD/Prescription", value: 25 },
      { name: "Preventive/Care", value: 20 },
    ];
  }, [category]);

  const CHART_COLORS = ["#22d3ee", "#6366f1", "#34d399"];

  function generatePlans() {
    const a = Number(age) || 0;
    const d = Number(dependents) || 0;
    const inc = Number(income) || 0;
    const cov = Number(coverageNeeded) || 0;
    const providers = PROVIDERS[category];

    // Heuristic scoring to pick 2–3 plans with reasons
    const recs = [];
    const targetMonthly = inc > 0 ? (inc / 12) * 0.02 + d * 25 + (category === "auto" ? 40 : 0) : 120;

    providers.forEach((p, idx) => {
      let premium = targetMonthly * (1 + idx * 0.12);
      let reason = "Balanced coverage-to-premium ratio for your profile.";
      let conf = 0.82;

      if (category === "health") {
        if (a < 30 && d === 0) {
          reason = "Lower-premium plan with good network for younger individuals.";
          premium *= 0.85;
          conf = 0.86;
        } else if (d > 0) {
          reason = "Family-friendly plan with dependents and preventive coverage.";
          conf = 0.88;
        }
      }

      if (category === "life") {
        const suggestedCoverage = inc * 10 + d * 50000; // simple rule of thumb
        reason = `Suggest Term Life ≈ ${fmt(suggestedCoverage)}; riders for disability/critical illness recommended.`;
        conf = 0.84;
      }

      if (category === "auto") {
        reason = "Liability + collision recommended; comprehensive if vehicle is newer or financed.";
        conf = 0.83;
      }

      if (category === "home") {
        reason = "Dwelling + personal property + liability bundle for better pricing.";
        conf = 0.81;
      }

      if (cov > 0) {
        reason += ` Target coverage noted: ${fmt(cov)}.`;
      }

      recs.push({
        provider: p.name,
        url: p.url,
        estMonthly: Math.max(25, Math.round(premium)),
        reason,
        confidence: conf,
      });
    });

    setPlans(recs.slice(0, 3));
    setExplain(makeExplain(category, a, d, inc, cov));
    addAudit("generate_plans", `${category} • ${recs.length} options`);
  }

  function makeExplain(cat, a, d, inc, cov) {
    const base = `Recommendations factor age, dependents, income, affordability, and category-specific risks.`;
    if (cat === "life")
      return `${base} Term coverage ~10× income, adjusted for dependents. Riders suggested for added protection.`;
    if (cat === "auto")
      return `${base} Liability is mandatory; collision/comprehensive chosen based on vehicle age and finance status.`;
    if (cat === "home")
      return `${base} Dwelling limits align with rebuild cost; personal property & liability tailored to assets.`;
    return `${base} Hospitalization prioritized; OPD/prescription and preventive care balanced for network value.`;
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 min-h-[calc(100vh-64px)] text-slate-100">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 ring-1 ring-slate-700">
          <Sparkles size={16} className="text-cyan-300" />
          <span className="text-xs tracking-wide text-slate-300">FinVerse · AI Insurance Advisor</span>
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold bg-gradient-to-r from-cyan-200 to-indigo-300 bg-clip-text text-transparent">
          Smart, explainable insurance tailored to you
        </h1>
        <p className="mt-2 text-slate-400">Private, transparent, and governance-ready recommendations.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2/3 — Inputs + Results */}
        <div className="xl:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Shield className="text-indigo-300" size={20} />
              <h2 className="font-semibold">Your Profile</h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300">Insurance Type</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    addAudit("set_category", e.target.value);
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-300">Age</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  placeholder="e.g., 29"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onBlur={() => addAudit("set_age", age)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Dependents</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  placeholder="e.g., 2"
                  value={dependents}
                  onChange={(e) => setDependents(e.target.value)}
                  onBlur={() => addAudit("set_dependents", dependents)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Annual Income ($)</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  placeholder="e.g., 120000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  onBlur={() => addAudit("set_income", income)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-300">Target Coverage (optional, $)</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  placeholder="e.g., 500000"
                  value={coverageNeeded}
                  onChange={(e) => setCoverageNeeded(e.target.value)}
                  onBlur={() => addAudit("set_coverage", coverageNeeded)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Affordability guide for premium: ~{fmt(affordabilityBand.pct)} / month
                </p>
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={generatePlans}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Generate AI Recommendations
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recommendation Cards */}
            <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
              <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                <Users className="text-emerald-300" size={20} />
                <h2 className="font-semibold">Recommended Plans</h2>
              </div>
              <div className="p-6 space-y-3">
                {plans.length === 0 ? (
                  <p className="text-sm text-slate-400">Fill profile and click “Generate AI Recommendations”.</p>
                ) : (
                  plans.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:shadow-lg transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-100">{p.provider}</div>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 text-sm"
                          onClick={() => addAudit("open_provider", p.provider)}
                        >
                          Visit <ExternalLink size={16} />
                        </a>
                      </div>
                      <div className="mt-1 text-sm text-slate-300">{p.reason}</div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <DollarSign size={14} /> Est. Monthly: <b className="ml-1">{fmt(p.estMonthly)}</b>
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <ShieldCheck size={14} /> Confidence: <b className="ml-1">{Math.round(p.confidence * 100)}%</b>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chart + Explainability */}
            <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
              <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                <Activity className="text-cyan-300" size={20} />
                <h2 className="font-semibold">Coverage Mix & Transparency</h2>
              </div>
              <div className="p-6">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={85}
                        label={(e) => e.name}
                      >
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={["#22d3ee", "#6366f1", "#34d399"][i % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <Explain text={explain || "AI will explain the reasoning behind your recommendations here once generated."} />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1/3 — Governance */}
        <div className="space-y-6">
          {/* Governance & Ethics */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-emerald-300" size={20} />
              <h2 className="font-semibold">Governance & Ethics</h2>
            </div>
            <div className="p-6 space-y-3">
              <Badge ok label="HEVIDS · Harmony / Ethics" />
              <Badge ok label="Veracity · Reasoned, explainable criteria" />
              <Badge ok label="Integrity · No data sold; local-only demo" />
              <Badge ok={humanOversight} label="Discernment · Human oversight ON" />
              <Badge ok label="Safeguards · Audit trail enabled" />
              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                <Info size={16} className="inline mr-2 text-slate-400" />
                Quotes vary by location/history. Always verify benefits and exclusions on insurer sites.
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div>
                  <p className="font-medium text-slate-200">Human Oversight</p>
                  <p className="text-sm text-slate-400">Require manual approval before saving choices.</p>
                </div>
                <button
                  onClick={() => {
                    setHumanOversight((v) => !v);
                    addAudit("toggle_human_oversight", !humanOversight ? "on" : "off");
                  }}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
                    humanOversight ? "bg-emerald-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      humanOversight ? "translate-x-8" : "translate-x-2"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={() => addAudit("approve_recommendations", "User approved suggested shortlist")}
                className="w-full mt-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
              >
                Approve Recommendations (Save Draft)
              </button>
            </div>
          </div>

          {/* Audit Log */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Activity className="text-cyan-300" size={20} />
              <h2 className="font-semibold">Audit Log</h2>
            </div>
            <div className="p-6">
              {audit.length === 0 ? (
                <p className="text-sm text-slate-400">Actions will appear here (profile edits, approvals, link opens).</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {audit.map((e, i) => (
                    <li key={i} className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
                      <span className="text-slate-400 mr-2">{new Date(e.ts).toLocaleString()}</span>
                      <span className="text-slate-200 font-medium">{e.event}</span>
                      {e.detail ? <span className="text-slate-400"> — {e.detail}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- small UI helpers (shared look & feel) ---------- */

function Explain({ text }) {
  return (
    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-center gap-2 text-slate-300">
        <CheckCircle2 size={18} className="text-emerald-400" />
        <span className="font-semibold">AI Transparency</span>
      </div>
      <p className="mt-2 text-sm text-slate-300">{text}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <AlertCircle size={14} />
        This is guidance, not a binding quote. Final benefits/premiums depend on insurer underwriting.
      </div>
    </div>
  );
}

function Badge({ ok, label }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ${
        ok
          ? "bg-emerald-900/40 text-emerald-200 ring-emerald-800"
          : "bg-amber-900/40 text-amber-200 ring-amber-800"
      }`}
    >
      <ShieldCheck size={16} />
      {label}
    </div>
  );
}
