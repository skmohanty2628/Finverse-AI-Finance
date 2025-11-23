import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Wallet,
  Calendar,
  FileText,
  Tag,
  Info,
  Wand2,
  Save,
} from "lucide-react";

/**
 * FinVerse — Expenses (Cinematic, Interactive, Persistent)
 * - Dark glass UI + blue-lavender glow (#635BFF)
 * - Add/Delete expenses live
 * - Monthly summary note (personal context) saved in localStorage
 * - AI Feedback: natural text + mini bars per category
 * - Data persisted in localStorage (no backend required)
 */

const ACCENT = "#635BFF";
const LS_KEY = "finverse_expenses";
const LS_NOTE = "finverse_expenses_note";

// Categories & guideline % (rough 50/30/20 inspired)
const CATEGORIES = [
  { id: "Housing", pct: 0.30 },
  { id: "Food", pct: 0.15 },
  { id: "Utilities", pct: 0.08 },
  { id: "Transport", pct: 0.10 },
  { id: "Health", pct: 0.06 },
  { id: "Insurance", pct: 0.05 },
  { id: "Education", pct: 0.05 },
  { id: "Entertainment", pct: 0.06 },
  { id: "Misc", pct: 0.15 },
];

function fmt(n) {
  if (!isFinite(n)) return "$0";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function Expenses() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [rows, setRows] = useState([]);
  const [note, setNote] = useState("");
  const [tips, setTips] = useState([]); // AI feedback lines
  const [showPanel, setShowPanel] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      setRows(saved);
    } catch {}
    const savedNote = localStorage.getItem(LS_NOTE);
    if (savedNote != null) setNote(savedNote);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  }, [rows]);
  useEffect(() => {
    localStorage.setItem(LS_NOTE, note);
  }, [note]);

  function addRow() {
    const amt = Number(amount);
    if (!date || !category || !description || !amt || amt <= 0) return;
    const entry = {
      id: cryptoId(),
      date,
      category,
      description,
      amount: amt,
    };
    setRows((r) => [entry, ...r]);
    setDescription("");
    setAmount("");
  }

  function delRow(id) {
    setRows((r) => r.filter((x) => x.id !== id));
  }

  const totals = useMemo(() => {
    const byCat = {};
    let grand = 0;
    rows.forEach((r) => {
      grand += r.amount;
      byCat[r.category] = (byCat[r.category] || 0) + r.amount;
    });
    return { byCat, grand };
  }, [rows]);

  const bars = useMemo(() => {
    const list = CATEGORIES.map((c) => {
      const actual = totals.byCat[c.id] || 0;
      const share = totals.grand > 0 ? actual / totals.grand : 0;
      return { ...c, actual, share };
    }).sort((a, b) => b.actual - a.actual);
    return list;
  }, [totals]);

  function genAI() {
    const out = [];
    const total = totals.grand;

    if (total === 0) {
      out.push("No expenses recorded yet. Add a few entries to get personalized insights.");
      setTips(out);
      setShowPanel(true);
      return;
    }

    // 1) Dominant categories
    const top = [...bars].slice(0, 3).filter((b) => b.actual > 0);
    if (top.length) {
      const topLine = top
        .map((t) => `${t.id} ${Math.round(t.share * 100)}%`)
        .join(" · ");
      out.push(`Top spending categories: ${topLine}.`);
    }

    // 2) Overspend vs guideline
    const over = bars.filter((b) => b.share > b.pct + 0.05); // >5% over guideline
    if (over.length) {
      out.push(
        `Overspending detected vs guideline: ` +
          over.map((o) => `${o.id} (+${Math.round((o.share - o.pct) * 100)}%)`).join(", ") +
          `. Consider targeted reductions or swapping discretionary choices.`
      );
    } else {
      out.push("Spending aligns closely with guideline caps. Great balance across categories.");
    }

    // 3) Smart micro-suggestions from patterns
    const food = bars.find((b) => b.id === "Food");
    if (food && food.share > 0.20) {
      out.push("Try weekly meal prep or grocery lists to curb Food expenses by ~10–15%.");
    }
    const entertainment = bars.find((b) => b.id === "Entertainment");
    if (entertainment && entertainment.share > 0.10) {
      out.push("Entertainment is trending high — consider a monthly cap or off-peak alternatives.");
    }
    const housing = bars.find((b) => b.id === "Housing");
    if (housing && housing.share > 0.35) {
      out.push("Housing >35% of spend — review lease/loan options, roommates, or refinancing.");
    }

    // 4) Use the monthly note as context
    if (note && note.trim().length > 6) {
      out.push(`Context noted: “${note.trim()}”. Adjust discretionary categories to support this goal.`);
    }

    // 5) Positive reinforcement
    if (!over.length && total > 0) {
      out.push("Nice work! Consider auto-transferring a fixed amount to savings/emergency right after payday.");
    }

    setTips(out);
    setShowPanel(true);
  }

  const totalDisplay = fmt(totals.grand);

  return (
    <div className="p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 min-h-[calc(100vh-64px)] text-slate-100">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 ring-1 ring-slate-700">
          <Sparkles size={16} className="text-cyan-300" />
          <span className="text-xs tracking-wide text-slate-300">FinVerse · AI Expense Manager</span>
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold bg-gradient-to-r from-cyan-200 to-indigo-300 bg-clip-text text-transparent">
          Track spending with clarity and smart guidance
        </h1>
        <p className="mt-2 text-slate-400">
          Add expenses live, keep a monthly note, and get explainable AI feedback with guideline comparisons.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT (2/3): Input + Table + Feedback */}
        <div className="xl:col-span-2 space-y-6">
          {/* Input Card */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Wallet className="text-indigo-300" size={20} />
              <h2 className="font-semibold">Add Expense</h2>
            </div>
            <div className="p-6 grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-slate-300">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300">Category</label>
                <div className="relative">
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.id}</option>
                    ))}
                  </select>
                  <Tag size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300">Description</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Groceries at Costco"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <FileText size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300">Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 120"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="md:col-span-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={addRow}
                  className="flex-1 inline-flex items-center justify-center gap-2 font-semibold text-white px-4 py-3 rounded-lg transition shadow-lg"
                  style={{
                    background: ACCENT,
                    boxShadow: `0 10px 30px -8px ${ACCENT}66, inset 0 0 0 1px #7F76FF`,
                  }}
                >
                  <Plus size={18} /> Add Expense
                </button>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl overflow-hidden">
            {/* glow strip */}
            <div
              className="absolute -top-24 left-1/2 h-48 w-[140%] -translate-x-1/2 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: ACCENT }}
            />
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <FileText className="text-cyan-300" size={20} />
              <h2 className="font-semibold">Expenses</h2>
              <div className="ml-auto text-sm text-slate-300">
                Total this month: <b>{totalDisplay}</b>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-300">
                  <tr className="text-left">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Description</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-slate-500">
                        No expenses yet. Add your first entry above.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="border-t border-slate-800">
                        <td className="py-2 pr-4">{r.date}</td>
                        <td className="py-2 pr-4">{r.category}</td>
                        <td className="py-2 pr-4">{r.description}</td>
                        <td className="py-2 pr-4">{fmt(r.amount)}</td>
                        <td className="py-2 pr-2 text-right">
                          <button
                            onClick={() => delRow(r.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Summary + Feedback CTA */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Info className="text-indigo-300" size={20} />
              <h2 className="font-semibold">Monthly Summary & AI Feedback</h2>
            </div>
            <div className="p-6 grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-slate-300">Your context for this month (optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Saving for vacation, higher grocery costs, car service, etc."
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  We’ll use this to tailor the feedback (and we keep it on your device).
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={genAI}
                  className="inline-flex items-center justify-center gap-2 font-semibold text-white px-4 py-3 rounded-lg transition shadow-lg"
                  style={{
                    background: ACCENT,
                    boxShadow: `0 10px 30px -8px ${ACCENT}66, inset 0 0 0 1px #7F76FF`,
                  }}
                >
                  <Wand2 size={18} /> Generate AI Feedback
                </button>
                <button
                  onClick={() => localStorage.setItem(LS_NOTE, note)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700"
                >
                  <Save size={18} /> Save Note
                </button>
              </div>
            </div>

            {/* Feedback panel + mini bars */}
            {showPanel && (
              <div className="px-6 pb-6 animate-fade-in">
                {/* Text insights */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 mb-4">
                  <div className="font-semibold text-slate-200 mb-2">AI Insights</div>
                  {tips.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      Add expenses and click “Generate AI Feedback” to see suggestions.
                    </p>
                  ) : (
                    <ul className="list-disc ml-5 text-sm text-slate-300 space-y-1">
                      {tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Mini animated bars */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="font-semibold text-slate-200 mb-2">Category Breakdown</div>
                  {bars.map((b, i) => (
                    <div key={b.id} className="mb-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>
                          {b.id} · {fmt(b.actual)}
                        </span>
                        <span>
                          {Math.round(b.share * 100)}% &nbsp;|&nbsp; guide {Math.round(b.pct * 100)}%
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
                              : i === 3
                              ? "bg-[#f59e0b]"
                              : "bg-[#a78bfa]"
                          }`}
                          style={{ width: `${(b.share * 100).toFixed(0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {totals.grand === 0 && (
                    <p className="text-sm text-slate-500">No data yet — add expenses to see breakdown.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (1/3): Quick Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl relative overflow-hidden">
            <div
              className="absolute -top-24 left-1/2 h-48 w-[140%] -translate-x-1/2 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: ACCENT }}
            />
            <div className="p-6 border-b border-slate-800">
              <h2 className="font-semibold">Summary</h2>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Total Spend</span>
                <span className="text-slate-100 font-semibold">{totalDisplay}</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-slate-300">
                Guideline is approximate. Use it to spot patterns, not as a hard rule.
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-800">
              <h2 className="font-semibold">Tips</h2>
            </div>
            <div className="p-6 text-sm text-slate-300 space-y-2">
              <p>• Try batching purchases to reduce impulse spending.</p>
              <p>• Set a fixed transfer to savings on payday.</p>
              <p>• Track 3–5 biggest merchants to spot habits.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- tiny helpers ---------- */

function cryptoId() {
  return Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
}

/* tiny fade-in animation */
if (typeof document !== "undefined" && !document.getElementById("fv-anim-exp")) {
  const style = document.createElement("style");
  style.id = "fv-anim-exp";
  style.innerHTML = `
@keyframes fadeInFV { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeInFV .35s ease-out both; }
`;
  document.head.appendChild(style);
}
