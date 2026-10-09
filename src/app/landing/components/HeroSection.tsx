'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, PiggyBank, TrendingUp, Sparkles, Clock, ShieldCheck, Wallet, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

function formatFundStat(amount: number): string {
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return `₦${billions % 1 === 0 ? billions.toFixed(0) : billions.toFixed(1)}B`;
  }
  const millions = amount / 1_000_000;
  return `₦${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
}

function useCountUp(target: string, triggered: boolean, duration = 1800) {
  const [display, setDisplay] = useState('–');
  const animating = useRef(false);

  useEffect(() => {
    if (!triggered || animating.current) return;
    animating.current = true;

    const numMatch = target.match(/[\d,.]+/);
    if (!numMatch) { setDisplay(target); return; }

    const numStr = numMatch[0].replace(/,/g, '');
    const end = parseFloat(numStr);
    if (isNaN(end)) { setDisplay(target); return; }

    const prefix = target.slice(0, target.indexOf(numMatch[0]));
    const suffix = target.slice(target.indexOf(numMatch[0]) + numMatch[0].length);

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * end);
      const formatted = current >= 1000
        ? current.toLocaleString('en-NG')
        : current.toString();
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(target);
    };
    requestAnimationFrame(tick);
  }, [triggered, target, duration]);

  return display;
}

function StatCard({ value, label, delay, colorClass }: { value: string; label: string; delay: number; colorClass?: string }) {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, triggered);

  useEffect(() => {
    const timer = setTimeout(() => setTriggered(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex flex-col items-center justify-center py-6 sm:py-8 px-4 text-center transition-all duration-700 ${
        triggered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none mb-1.5 font-tabular ${colorClass || 'text-[#00E599]'}`}>
        {count}
      </div>
      <div className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-slate-400 uppercase mt-1">{label}</div>
    </div>
  );
}

const DEFAULT_STATS = [
  { value: '500+', label: 'ACTIVE MEMBERS', color: 'text-white' },
  { value: '₦500M', label: 'MANAGED FUNDS', color: 'text-[#00E599]' },
  { value: '9–25%', label: 'RETURNS P.A.', color: 'text-emerald-400' },
  { value: '24hrs', label: 'EXPRESS LOANS', color: 'text-rose-400' },
];

export default function HeroSection() {
  const { user, userRole } = useAuth();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    const BASELINE_MEMBERS = 500;
    const BASELINE_FUNDS = 500_000_000;

    async function loadLiveStats() {
      try {
        let additionalMembers = 0;
        const { count: memberCount, error: memberErr } = await supabase
          .from('members').select('*', { count: 'exact', head: true });
        if (!memberErr && typeof memberCount === 'number') additionalMembers = Math.max(additionalMembers, memberCount);

        const { count: profileCount, error: profileErr } = await supabase
          .from('user_profiles').select('*', { count: 'exact', head: true });
        if (!profileErr && typeof profileCount === 'number') additionalMembers = Math.max(additionalMembers, profileCount);

        let localFunds = 0;
        try {
          const stored = localStorage.getItem('climps_admin_members_v1');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              additionalMembers = Math.max(additionalMembers, parsed.length);
              localFunds = parsed.reduce((sum: number, m: any) =>
                sum + (Number(m.total_savings) || 0) + (Number(m.total_contributions) || 0) + (Number(m.investment_portfolio_value) || 0), 0);
            }
          }
        } catch {}

        const totalMembers = BASELINE_MEMBERS + additionalMembers;
        let liveFundAdditions = localFunds;

        const { data: savings } = await supabase.from('savings_accounts').select('balance');
        if (savings?.length) liveFundAdditions = Math.max(liveFundAdditions, savings.reduce((a, r) => a + (Number(r.balance) || 0), 0));

        const { data: contributions } = await supabase.from('contributions').select('amount');
        if (contributions?.length) liveFundAdditions += contributions.reduce((a, r) => a + (Number(r.amount) || 0), 0);

        const { data: investments } = await supabase.from('investments').select('amount');
        if (investments?.length) liveFundAdditions += investments.reduce((a, r) => a + (Number(r.amount) || 0), 0);

        setStats([
          { value: `${totalMembers.toLocaleString()}+`, label: 'ACTIVE MEMBERS', color: 'text-white' },
          { value: formatFundStat(BASELINE_FUNDS + liveFundAdditions), label: 'MANAGED FUNDS', color: 'text-[#00E599]' },
          { value: '9–25%', label: 'RETURNS P.A.', color: 'text-emerald-400' },
          { value: '24hrs', label: 'EXPRESS LOANS', color: 'text-rose-400' },
        ]);
      } catch {}
    }

    loadLiveStats();

    const channel = supabase.channel('public-hero-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, loadLiveStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, loadLiveStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, loadLiveStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investments' }, loadLiveStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_accounts' }, loadLiveStats)
      .subscribe();

    const onStorageChange = (e: StorageEvent) => {
      if (e.key === 'climps_admin_members_v1') loadLiveStats();
    };
    window.addEventListener('storage', onStorageChange);
    return () => { supabase.removeChannel(channel); window.removeEventListener('storage', onStorageChange); };
  }, []);

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-[#050B17] text-white pt-32 pb-16 lg:pt-40 lg:pb-28">

        {/* Dynamic mesh grid background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Rich Ambient Lighting & Glowing Orbs matching Figma */}
        <div className="absolute top-10 right-[-100px] w-[650px] h-[650px] rounded-full bg-emerald-500/15 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-[-150px] w-[550px] h-[550px] rounded-full bg-blue-600/15 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-1/3 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none" />

        {/* Content: 2-Column Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Hero Text and Actions */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">

              {/* Pill Badge */}
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 transition-all duration-700 shadow-lg shadow-emerald-500/5"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                  transitionDelay: '100ms',
                }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </span>
                <span>Changing Lives Multipurpose Ventures</span>
              </div>

              {/* Headline matching Figma */}
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-black text-white tracking-tight leading-[1.04] mb-6 transition-all duration-700"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                  transitionDelay: '200ms',
                }}
              >
                Save. Grow.<br />
                <span className="text-[#00E599] drop-shadow-[0_0_35px_rgba(0,229,153,0.3)]">
                  Prosper together.
                </span>
              </h1>

              {/* Sub-copy */}
              <p
                className="text-slate-300 text-base sm:text-xl lg:text-2xl max-w-xl mb-8 leading-relaxed transition-all duration-700 font-normal"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: '350ms',
                }}
              >
                A structured wealth-building platform for Nigerians — disciplined thrift savings, Wealth Circle opportunities, and express 24-hour loans.
              </p>

              {/* CTAs */}
              <div
                className="flex flex-wrap items-center gap-4 mb-6 transition-all duration-700"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: '500ms',
                }}
              >
                {user ? (
                  <Link
                  href={
                    ['super_admin', 'admin', 'manager', 'staff'].includes(userRole)
                      ? '/admin-dashboard'
                      : userRole === 'accountant'
                      ? '/accountant-dashboard'
                      : '/member-dashboard'
                  }
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#00D084] hover:bg-[#00BA76] text-slate-950 font-black text-base tracking-wide transition-all duration-200 active:scale-95 shadow-xl shadow-emerald-500/25"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#00D084] hover:bg-[#00BA76] text-slate-950 font-black text-base tracking-wide transition-all duration-200 active:scale-95 shadow-xl shadow-emerald-500/25"
                  >
                    <span>Start Saving Now</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                )}

                <Link
                  href="#services"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base transition-all duration-200 active:scale-95 backdrop-blur-md"
                >
                  What We Offer
                </Link>
              </div>

              {/* Loan badge link */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Need quick credit?</span>
                <Link
                  href="/loan-application"
                  className="text-rose-400 hover:text-rose-300 font-bold underline underline-offset-4 decoration-rose-500/50"
                >
                  Apply for 24h Express Loan →
                </Link>
              </div>
            </div>

            {/* Right Column: Floating Glass Dashboard Preview Card (As seen in Figma) */}
            <div
              className="lg:col-span-5 w-full flex justify-center lg:justify-end transition-all duration-700"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(32px)',
                transitionDelay: '300ms',
              }}
            >
              <div className="relative w-full max-w-lg">
                {/* Glow aura behind card */}
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/30 via-blue-500/20 to-emerald-400/30 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

                {/* Main Glass Card */}
                <div className="relative rounded-3xl bg-[#0D182E]/90 border border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden">
                  {/* Subtle top reflection line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                  {/* Card Header: Total Balance */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Total Portfolio
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-tabular">
                        ₦14,850,200<span className="text-xl text-slate-400 font-semibold">.00</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+18.4%</span>
                    </div>
                  </div>

                  {/* Inner Split Cards: Thrift Savings + Wealth Circle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                    {/* Thrift Savings Box */}
                    <div className="rounded-2xl bg-[#08202E]/90 border border-emerald-500/25 p-4 hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <PiggyBank className="w-3.5 h-3.5" />
                          Thrift Savings
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">Active</span>
                      </div>
                      <div className="text-xl font-black text-white font-tabular mb-2">₦250,000<span className="text-xs text-slate-400 font-medium">/mo</span></div>
                      {/* Progress indicator */}
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-[#00D084] rounded-full w-[84%]" />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                          <span>Target Met</span>
                          <span className="text-emerald-400 font-bold">84%</span>
                        </div>
                      </div>
                    </div>

                    {/* Wealth Circle Box */}
                    <div className="rounded-2xl bg-[#131F3B]/90 border border-white/10 p-4 hover:border-white/20 transition-colors">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          Wealth Circle
                        </span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">Wealth Circle</span>
                      </div>
                      <div className="text-xl font-black text-white font-tabular mb-2">15.5% P.A.</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Returns in <strong className="text-white">12 days</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Strip: Active Savers & Verification */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-2 overflow-hidden">
                        <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0D182E] bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">JL</div>
                        <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0D182E] bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">RL</div>
                        <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0D182E] bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">MK</div>
                      </div>
                      <div className="text-xs text-slate-300 font-medium">
                        <strong className="text-white font-bold">4,200+ members</strong> saving
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Coop Registered</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#030712] border-y border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                delay={200 + i * 150}
                colorClass={(stat as any).color}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
