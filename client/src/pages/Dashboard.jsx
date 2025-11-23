import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Wallet2,
  PieChart,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * FinVerse — Dashboard (Future-Ready)
 * - Cinematic dark glass UI + #635BFF accent
 * - Tries to fetch live data from backend APIs (MongoDB later)
 * - Graceful fallback to local mocks if API not ready
 * - No charts; just clean, explainable KPIs + recent activity + AI summary
 *
 * Expected Backend Endpoints (you can implement these later):
 * GET /api/summary
 *   { tax:{status:"draft|filed", estDue: number}, insurance:{policies:number, gaps:["Health"]},
 *     investments:{savedPlans:number, lastProjected:number}, expenses:{monthTotal:number, topCat:"Food"},
 *     budget:{lastSplit:{Essentials:number,Savings:number,Investments:number,Lifestyle:number}} }
 *
 * GET /api/investments/saved      -> [{id, bias, years, monthly, cagr, projected, savedAt}, ...]
 * GET /api/expenses/monthly       -> { monthTotal:number, byCat:{[cat]: number}, month:string }
 * GET /api/budget/saved           -> [{ts, income, risk, plan:{...}}, ...]
 * GET /api/tax/latest             -> { status, estDue, year }
 * GET /api/insurance/latest       -> { policies, openActions:number, lastCheck:string }
 */

const ACCENT = "#635BFF";

// ---- tiny helpers
const fmt = (n) =>
  isFinite(n)
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    : "$0";

async function getJSON(url, { timeout = 4500 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal, credentials: "include" });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (e) {
    throw e;
  }
}

// --- local safe mocks (used when API not available)
const mocks = {
  summary: {
    tax: { status: "draft", estDue: 1380, year: new Date().getFullYear() },
    insurance: { policies: 1, gaps: ["Life"], openActions: 1, lastCheck: "This week" },
    investments: { savedPlans: 2, lastProjected: 1531394 },
    expenses: { monthTotal: 2480, topCat: "Housing" },
    budget: { lastSplit: { Essentials: 50, Savings: 20, Investments: 20, Lifestyle: 10 } },
  },
  savedPlans: [
    {
      id: "demo1",
      bias: "balanced",
      years: 20,
      monthly: 500,
      cagr: 0.1,
      projected: 1531394,
      savedAt: new Date().toLocaleString(),
    },
  ],
  expensesMonthly: {
    month: new Date().toLocaleString("en-US", { month: "long" }),
    monthTotal: 2480,
    byCat: { Housing: 1500, Food: 520, Utilities: 200, Transport: 160, Misc: 100 },
  },
  budgetSaved: [
    {
      ts: new Date().toLocaleString(),
      income: 6000,
      risk: "Moderate",
      plan: { Essentials: 50, Savings: 20, Investments: 20, Lifestyle: 10 },
    },
  ],
  taxLatest: { status: "draft", estDue: 1380, year: new Date().getFullYear() },
  insuranceLatest: { policies: 1, openActions: 1, lastCheck: "This week" },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [expensesMonthly, setExpensesMonthly] = useState(null);
  const [budgetSaved, setBudgetSaved] = useState([]);
  const [taxLatest, setTaxLatest] = useState(null);
  const [insLatest, setInsLatest] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const [sum, sp, exp, bud, tax, ins] = await Promise.all([
          getJSON("/api/summary"),
          getJSON("/api/investments/saved"),
          getJSON("/api/expenses/monthly"),
          getJSON("/api/budget/saved"),
          getJSON("/api/tax/latest"),
          getJSON("/api/insurance/latest"),
        ]);
        if (!mounted) return;
        setSummary(sum);
        setSavedPlans(sp || []);
        setExpensesMonthly(exp || null);
        setBudgetSaved(bud || []);
        setTaxLatest(tax || null);
        setInsLatest(ins || null);
      } catch {
        // fallback to mocks
        if (!mounted) return;
        setSummary(mocks.summary);
        setSavedPlans(mocks.savedPlans);
        setExpensesMonthly(mocks.expensesMonthly);
        setBudgetSaved(mocks.budgetSaved);
        setTaxLatest(mocks.taxLatest);
        setInsLatest(mocks.insuranceLatest);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  // Build a small “AI” tip using current snapshot
  const aiTip = useMemo(() => {
    const s = summary || mocks.summary;
    const parts = [];
    if (s.expenses?.monthTotal > 0) {
      parts.push(`This month’s spend is ${fmt(s.expenses.monthTotal)} (top: ${s.expenses.topCat}).`);
    }
    if (s.investments?.savedPlans > 0) {
      parts.push(`You’ve saved ${s.investments.savedPlans} investment plan(s).`);
    }
    if (s.budget?.lastSplit) {
      const inv = s.budget.lastSplit.Investments ?? 0;
      if (inv < 15) parts.push(`Consider nudging investments to ~15–20% for long-term growth.`);
    }
    if (s.insurance?.gaps?.length) {
      parts.push(`Insurance gap noted: ${s.insurance.gaps.join(", ")}.`);
    }
    if (s.tax?.status === "draft") {
      parts.push(`Tax status: Draft — estimated due ${fmt(s.tax.estDue)}.`);
    }
    return parts.join(" ");
  }, [summary]);

  const sum = summary || mocks.summary;

  return (
    <div className="p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 min-h-[calc(100vh-64px)] text-slate-100">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 ring-1 ring-slate-700">
          <Sparkles size={16} className="text-cyan-300" />
          <span className="text-xs tracking-wide text-slate-300">FinVerse · Overview</span>
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold bg-gradient-to-r from-cyan-200 to-indigo-300 bg-clip-text text-transparent">
          Your financial cockpit
        </h1>
        <p className="mt-2 text-slate-400">
          Unified snapshot across Taxes, Insurance, Investments, Expenses, and Budget.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <Tile
          icon={<Landmark className="text-rose-300" size={18} />}
          title="Tax Filing"
          subtitle={taxLatest?.status || sum.tax.status}
          metric={fmt(taxLatest?.estDue ?? sum.tax.estDue)}
          to="/tax"
          loading={loading}
        />
        <Tile
          icon={<ShieldCheck className="text-emerald-300" size={18} />}
          title="Insurance"
          subtitle={`${insLatest?.policies ?? sum.insurance.policies} policy · ${
            insLatest?.openActions ?? sum.insurance.openActions
          } action`}
          metric={insLatest?.lastCheck ?? sum.insurance.lastCheck}
          to="/insurance"
          loading={loading}
        />
        <Tile
          icon={<TrendingUp className="text-cyan-300" size={18} />}
          title="Investments"
          subtitle={`${sum.investments.savedPlans} plan(s) saved`}
          metric={fmt(sum.investments.lastProjected)}
          to="/investments"
          loading={loading}
        />
        <Tile
          icon={<Wallet2 className="text-indigo-300" size={18} />}
          title="Expenses"
          subtitle={`Top: ${sum.expenses.topCat}`}
          metric={fmt(sum.expenses.monthTotal)}
          to="/expenses"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: AI Summary + Budget Split */}
        <div className="xl:col-span-2 space-y-6">
          {/* AI Summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl relative overflow-hidden">
            <Glow />
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Sparkles className="text-cyan-300" size={20} />
              <h2 className="font-semibold">AI Summary</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <Skeleton lines={3} />
              ) : (
                <p className="text-slate-300 text-sm">{aiTip || "All good — no actions needed right now."}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <Quick to="/tax" label="File / Review Taxes" />
                <Quick to="/insurance" label="Check Coverage" />
                <Quick to="/investments" label="Open Investment Planner" />
                <Quick to="/expenses" label="Log Expenses" />
                <Quick to="/budget" label="Plan Monthly Budget" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <PieChart className="text-indigo-300" size={20} />
              <h2 className="font-semibold">Recent Activity</h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Investment plans */}
              <div>
                <div className="text-slate-300 font-semibold mb-2">Saved Plans</div>
                {loading ? (
                  <Skeleton lines={3} />
                ) : savedPlans.length ? (
                  <ul className="space-y-2 text-sm">
                    {savedPlans.slice(0, 3).map((p) => (
                      <li key={p.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                        <div className="flex justify-between">
                          <span className="text-slate-200 capitalize">{p.bias}</span>
                          <span className="text-slate-400">{p.years}y • {(p.cagr * 100).toFixed(1)}% CAGR</span>
                        </div>
                        <div className="text-slate-300">
                          {fmt(p.monthly)}/mo → Target {fmt(p.projected)}
                        </div>
                        {p.savedAt && <div className="text-xs text-slate-500 mt-1">{p.savedAt}</div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-500">No plans yet.</div>
                )}
              </div>

              {/* Expenses snapshot */}
              <div>
                <div className="text-slate-300 font-semibold mb-2">
                  {expensesMonthly?.month || "This Month"} Expenses
                </div>
                {loading ? (
                  <Skeleton lines={4} />
                ) : expensesMonthly ? (
                  <div className="space-y-2 text-sm">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Total</span>
                        <span className="font-semibold">{fmt(expensesMonthly.monthTotal)}</span>
                      </div>
                    </div>
                    {Object.entries(expensesMonthly.byCat)
                      .slice(0, 4)
                      .map(([k, v], i) => (
                        <div key={k}>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{k}</span>
                            <span>{fmt(v)}</span>
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
                                  : "bg-[#f59e0b]"
                              }`}
                              style={{
                                width: `${
                                  expensesMonthly.monthTotal
                                    ? Math.round((v / expensesMonthly.monthTotal) * 100)
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No expense data yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Budget Split quick view */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl relative overflow-hidden">
            <Glow />
            <div className="p-6 border-b border-slate-800">
              <h2 className="font-semibold">Budget Snapshot</h2>
            </div>
            <div className="p-6 space-y-3">
              {loading ? (
                <Skeleton lines={5} />
              ) : sum.budget?.lastSplit ? (
                Object.entries(sum.budget.lastSplit).map(([cat, pct], i) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{cat}</span>
                      <span>{pct}%</span>
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
                            : "bg-[#f59e0b]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">No budget data yet.</div>
              )}

              <Link
                to="/budget"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg"
              >
                Open Budget Forecaster <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------- UI bits --------- */

function Tile({ icon, title, subtitle, metric, to, loading }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl p-5 hover:border-indigo-500/40 transition relative overflow-hidden"
    >
      <Glow />
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-800/80 p-2 ring-1 ring-slate-700">{icon}</div>
        <div className="min-w-0">
          <div className="text-slate-200 font-semibold">{title}</div>
          <div className="text-slate-400 text-sm truncate">{loading ? "—" : subtitle}</div>
        </div>
        <ChevronRight className="ml-auto text-slate-500 group-hover:text-slate-300 transition" size={18} />
      </div>
      <div className="mt-4 text-xl font-semibold text-slate-100">{loading ? <Loader2 className="animate-spin" /> : metric}</div>
    </Link>
  );
}

function Quick({ to, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-sm font-semibold text-white px-3 py-2 rounded-lg"
      style={{ background: ACCENT, boxShadow: `0 10px 30px -8px ${ACCENT}66, inset 0 0 0 1px #7F76FF` }}
    >
      {label} <ChevronRight size={16} />
    </Link>
  );
}

function Glow() {
  return (
    <div
      className="absolute -top-24 left-1/2 h-48 w-[140%] -translate-x-1/2 rounded-full opacity-20 blur-3xl pointer-events-none"
      style={{ background: ACCENT }}
    />
  );
}

function Skeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-slate-800/80 animate-pulse" />
      ))}
    </div>
  );
}
