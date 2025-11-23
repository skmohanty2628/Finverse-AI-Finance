import React, { useEffect, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  TrendingUp,
  Wallet2,
  PieChart,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const ACCENT = "#635BFF";

export default function Home() {
  // ✅ Get user from Layout context (not as a prop)
  const { user } = useOutletContext();
  const greet = user?.name || "User";

  const gridRef = useRef(null);
  const canvasRef = useRef(null);

  // 🎇 particles background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);
    const count = Math.min(120, Math.floor((w * h) / 12000));
    const dots = Array.from({ length: count }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.5 + 0.2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,91,255,${d.a})`;
        ctx.fill();

        for (let j = i + 1; j < dots.length; j++) {
          const d2 = dots[j];
          const dx = d.x - d2.x;
          const dy = d.y - d2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 80) {
            ctx.strokeStyle = `rgba(99,91,255,${0.08 * (1 - dist / 80)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-[120%] rounded-full blur-3xl opacity-25"
        style={{ background: ACCENT }}
      />

      <div className="relative px-6 md:px-10 py-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 ring-1 ring-slate-700">
          <Sparkles size={16} className="text-cyan-300" />
          <span className="text-xs tracking-wide text-slate-300">
            FinVerse · Home
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-6 text-center"
        >
          <div className="text-sm text-slate-400">Welcome back,</div>
          <h1 className="mt-1 text-3xl md:text-5xl font-semibold">
            <span className="bg-gradient-to-r from-cyan-200 to-indigo-300 bg-clip-text text-transparent">
              {greet}
            </span>
            <span className="block mt-1 text-slate-200">
              — Your AI Financial Super App.
            </span>
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            Manage your taxes, insurance, investments, and budgets — all in one
            intelligent platform.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={scrollToGrid}
              className="inline-flex items-center gap-2 font-semibold text-white px-5 py-3 rounded-lg"
              style={{
                background: ACCENT,
                boxShadow: `0 10px 30px -8px ${ACCENT}66, inset 0 0 0 1px #7F76FF`,
              }}
            >
              Start Exploring <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* features grid */}
        <div ref={gridRef} className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <FeatureCard
  to="/tax-filing"
  icon={<FileText size={20} className="text-rose-300" />}
  title="AI Tax Copilot"
  desc="Prepare, optimize, and understand your U.S. taxes with explainable steps."
/>

          <FeatureCard
            to="/insurance"
            icon={<ShieldCheck size={20} className="text-emerald-300" />}
            title="Insurance Navigator"
            desc="Compare coverage, spot gaps, and jump to trusted providers."
          />
          <FeatureCard
            to="/investments"
            icon={<TrendingUp size={20} className="text-cyan-300" />}
            title="Investment Planner"
            desc="Generate a tailored plan, then save or regenerate until it feels right."
          />
          <FeatureCard
            to="/expenses"
            icon={<Wallet2 size={20} className="text-indigo-300" />}
            title="Expense Tracker"
            desc="Log spending live, get AI feedback, and view animated category bars."
          />
          <FeatureCard
            to="/budget"
            icon={<PieChart size={20} className="text-yellow-300" />}
            title="Budget Forecaster"
            desc="Create an AI-guided monthly split with clear dollar amounts."
          />
          <FeatureCard
            to="/dashboard"
            icon={<TrendingUp size={20} className="text-fuchsia-300" />}
            title="Open Dashboard"
            desc="See your unified cockpit: quick KPIs, recent activity, and AI tips."
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-block relative">
            <span className="text-slate-300 text-sm md:text-base">
              Empowered by AI — Designed for Transparency, Security & Growth.
            </span>
            <span
              className="absolute left-0 right-0 -bottom-1 h-[2px] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(99,91,255,.0), rgba(99,91,255,.8), rgba(99,91,255,.0))",
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- small UI helpers ---------- */
function FeatureCard({ to, icon, title, desc }) {
  return (
    <Link
      to={to}
      className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl p-5 overflow-hidden transition hover:border-indigo-500/40"
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[140%] -translate-x-1/2 rounded-full opacity-20 blur-3xl transition"
        style={{ background: ACCENT }}
      />
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-800/80 p-2 ring-1 ring-slate-700">{icon}</div>
        <div>
          <div className="text-slate-200 font-semibold">{title}</div>
          <div className="text-slate-400 text-sm">{desc}</div>
        </div>
        <ChevronRight className="ml-auto text-slate-500 group-hover:text-slate-300 transition" size={18} />
      </div>
    </Link>
  );
}
