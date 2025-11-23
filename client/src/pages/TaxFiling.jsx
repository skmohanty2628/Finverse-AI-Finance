import React, { useMemo, useState } from "react";
import {
  Brain,
  ShieldCheck,
  FileUp,
  Activity,
  Info,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

/**
 * FinVerse — AI Tax Copilot (US Edition, Style B)
 * - USD throughout
 * - 2024 US Federal brackets (Single / MFJ / HOH)
 * - Standard vs Itemized deductions
 * - EISM/HEVIDS UI: Transparency, Governance badges, Human Oversight, Audit log
 */

const STD_DEDUCTION_2024 = {
  single: 14600,
  married: 29200, // Married Filing Jointly
  hoh: 21900, // Head of Household
};

// 2024 brackets by filing status (source: IRS).
// Each item: { upTo, rate } — progressive calc.
const BRACKETS_2024 = {
  single: [
    { upTo: 11600, rate: 0.10 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  married: [
    { upTo: 23200, rate: 0.10 },
    { upTo: 94300, rate: 0.12 },
    { upTo: 201050, rate: 0.22 },
    { upTo: 383900, rate: 0.24 },
    { upTo: 487450, rate: 0.32 },
    { upTo: 731200, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  hoh: [
    { upTo: 16550, rate: 0.10 },
    { upTo: 63100, rate: 0.12 },
    { upTo: 100500, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243700, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
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

export default function TaxFiling() {
  // Inputs
  const [filingStatus, setFilingStatus] = useState("single");
  const [regime, setRegime] = useState("standard"); // 'standard' | 'itemized'
  const [income, setIncome] = useState("");
  const [itemized, setItemized] = useState("");
  const [docs, setDocs] = useState([]);
  const [humanOversight, setHumanOversight] = useState(true);

  // Governance/Audit
  const [audit, setAudit] = useState([]);

  // Derived values
  const { taxable, tax, effRate, deductionUsed, explain } = useMemo(() => {
    const gross = Number(income) || 0;
    const item = Number(itemized) || 0;
    const deduction =
      regime === "standard"
        ? STD_DEDUCTION_2024[filingStatus]
        : Math.max(0, item);

    const txbl = Math.max(0, gross - deduction);

    const brackets = BRACKETS_2024[filingStatus];
    let remaining = txbl;
    let prev = 0;
    let t = 0;

    for (const b of brackets) {
      if (remaining <= 0) break;
      const span = Math.min(remaining, b.upTo - prev);
      t += span * b.rate;
      remaining -= span;
      prev = b.upTo;
    }

    const er = txbl > 0 ? (t / txbl) * 100 : 0;

    // Transparent explanation (for EISM Explainability)
    const rationale =
      regime === "standard"
        ? `Using the Standard Deduction of ${fmt(
            STD_DEDUCTION_2024[filingStatus]
          )} for ${labelForStatus(filingStatus)}.`
        : `Using Itemized Deductions of ${fmt(item)} based on your inputs.`;

    return {
      taxable: txbl,
      tax: t,
      effRate: er,
      deductionUsed: deduction,
      explain: rationale,
    };
  }, [income, itemized, filingStatus, regime]);

  // AI “tips” (local heuristic now; later replace with LLM API)
  const aiTips = useMemo(() => {
    const tips = [];
    const gross = Number(income) || 0;
    const dedPct = gross > 0 ? (deductionUsed / gross) * 100 : 0;

    if (gross <= 0) return [];

    if (dedPct < 8) {
      tips.push(
        "Consider maxing pre-tax contributions (401(k)/403(b), Traditional IRA) to lower taxable income."
      );
    } else {
      tips.push(
        "Nice! Your deductions meaningfully reduce taxable income. Keep digital receipts organized."
      );
    }

    tips.push(
      "Check eligibility for credits like Earned Income Tax Credit (EITC), Child Tax Credit, and Saver’s Credit."
    );

    if (regime === "itemized") {
      tips.push(
        "Ensure itemized components (mortgage interest, SALT, charitable gifts) are documented for audit trails."
      );
    } else {
      tips.push(
        "Compare Standard vs Itemized annually—itemized may win if mortgage interest + SALT + charitable donations are high."
      );
    }

    return tips;
  }, [income, deductionUsed, regime]);

  const chartData = [
    { name: "Deductions", value: Math.max(0, deductionUsed) },
    { name: "Taxable Income", value: taxable },
    { name: "Estimated Tax", value: tax },
  ];
  const CHART_COLORS = ["#22d3ee", "#6366f1", "#34d399"];

  function addAudit(event, detail) {
    setAudit((prev) => [
      {
        ts: new Date().toISOString(),
        event,
        detail,
      },
      ...prev,
    ]);
  }

  function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    setDocs(files.map((f) => f.name));
    if (files.length) addAudit("upload", `${files.length} document(s) added`);
  }

  function labelForStatus(s) {
    if (s === "single") return "Single";
    if (s === "married") return "Married Filing Jointly";
    return "Head of Household";
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 min-h-[calc(100vh-64px)] text-slate-100">
      {/* Futuristic header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 ring-1 ring-slate-700">
          <Sparkles size={16} className="text-cyan-300" />
          <span className="text-xs tracking-wide text-slate-300">
            FinVerse · AI Tax Copilot
          </span>
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold bg-gradient-to-r from-cyan-200 to-indigo-300 bg-clip-text text-transparent">
          File taxes with clarity, speed, and AI transparency
        </h1>
        <p className="mt-2 text-slate-400">
          US-based estimator with explainable suggestions. Built for governance,
          ethics, and auditability.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Inputs + Summary */}
        <div className="xl:col-span-2 space-y-6">
          {/* Inputs card */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Brain className="text-cyan-300" size={20} />
              <h2 className="font-semibold">Your Tax Profile</h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300">Filing Status</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  value={filingStatus}
                  onChange={(e) => {
                    setFilingStatus(e.target.value);
                    addAudit("set_filing_status", e.target.value);
                  }}
                >
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                  <option value="hoh">Head of Household</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300">Deduction Mode</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  value={regime}
                  onChange={(e) => {
                    setRegime(e.target.value);
                    addAudit("set_deduction_mode", e.target.value);
                  }}
                >
                  <option value="standard">Standard Deduction</option>
                  <option value="itemized">Itemized Deduction</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300">Annual Income ($)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  placeholder="e.g., 85000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  onBlur={() => addAudit("set_income", income)}
                />
              </div>

              <div className={`${regime === "standard" ? "opacity-50" : ""}`}>
                <label className="text-sm text-slate-300">
                  Itemized Deductions ($)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  placeholder="e.g., 18000"
                  disabled={regime === "standard"}
                  value={itemized}
                  onChange={(e) => setItemized(e.target.value)}
                  onBlur={() => addAudit("set_itemized", itemized)}
                />
                {regime === "standard" && (
                  <p className="mt-1 text-xs text-slate-500">
                    Using standard deduction: {fmt(STD_DEDUCTION_2024[filingStatus])}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Summary + Chart */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
              <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                <Activity className="text-indigo-300" size={20} />
                <h2 className="font-semibold">Computation Summary</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <Metric label="Taxable Income" value={fmt(taxable)} />
                <Metric label="Estimated Tax" value={fmt(tax)} />
                <Metric
                  label="Effective Rate"
                  value={`${effRate.toFixed(1)}%`}
                />
                <Metric label="Deduction Used" value={fmt(deductionUsed)} />
                <div className="col-span-2">
                  <Explain text={explain} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
              <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                <PieChartIcon className="text-emerald-300" size={20} />
                <h2 className="font-semibold">Tax Breakdown</h2>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      nameKey="name"
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(e) => e.name}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) =>
                        v.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        })
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <FileUp className="text-cyan-300" size={20} />
              <h2 className="font-semibold">Document Verification (Optional)</h2>
            </div>
            <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUpload}
                className="file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-white file:hover:bg-cyan-700 file:cursor-pointer rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 w-full max-w-xl"
              />
              <p className="text-sm text-slate-400">
                Upload W-2, 1099, receipts. AI validation coming soon.
              </p>
            </div>
            {docs.length > 0 && (
              <div className="px-6 pb-6">
                <ul className="text-sm text-slate-300 list-disc ml-5">
                  {docs.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Governance / Ethics / Audit */}
        <div className="space-y-6">
          {/* Governance panel */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-emerald-300" size={20} />
              <h2 className="font-semibold">Governance & Ethics</h2>
            </div>
            <div className="p-6 space-y-4">
              <Badge ok label="HEVIDS · Harmony / Ethics" />
              <Badge ok label="Veracity · Uses current IRS brackets" />
              <Badge ok label="Integrity · No data sold; local-only demo" />
              <Badge ok={humanOversight} label="Discernment · Human oversight ON" />
              <Badge ok label="Safeguards · Audit trail enabled" />
              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                <Info size={16} className="inline mr-2 text-slate-400" />
                Data shown is for estimation. For filing, verify with official IRS
                forms and your CPA.
              </div>

              {/* Human oversight toggle */}
              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div>
                  <p className="font-medium text-slate-200">Human Oversight</p>
                  <p className="text-sm text-slate-400">
                    Require manual approval before saving/submitting.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setHumanOversight((v) => !v);
                    addAudit("toggle_human_oversight", !humanOversight ? "on" : "off");
                  }}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
                    humanOversight ? "bg-emerald-600" : "bg-slate-700"
                  }`}
                  aria-label="Toggle human oversight"
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      humanOversight ? "translate-x-8" : "translate-x-2"
                    }`}
                  />
                </button>
              </div>

              {/* Approve action (placeholder) */}
              <button
                onClick={() => addAudit("approve_summary", "User approved AI estimate")}
                className="w-full mt-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
              >
                Approve AI Estimate (Save Draft)
              </button>
            </div>
          </div>

          {/* Audit log */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Activity className="text-cyan-300" size={20} />
              <h2 className="font-semibold">Audit Log</h2>
            </div>
            <div className="p-6">
              {audit.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Actions will appear here (inputs changed, uploads, approvals).
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {audit.map((e, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-2"
                    >
                      <span className="text-slate-400 mr-2">
                        {new Date(e.ts).toLocaleString()}
                      </span>
                      <span className="text-slate-200 font-medium">{e.event}</span>
                      {e.detail ? (
                        <span className="text-slate-400"> — {e.detail}</span>
                      ) : null}
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

/* ---------- small UI helpers ---------- */

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
        <CheckCircle2 size={18} className="text-emerald-400" />
        <span className="font-semibold">AI Transparency</span>
      </div>
      <p className="mt-2 text-sm text-slate-300">{text}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <AlertCircle size={14} />
        This is an estimate. Credits (EITC, CTC, education) are not included here.
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
