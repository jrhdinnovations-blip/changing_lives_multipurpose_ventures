'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      className={`group relative flex flex-col items-center justify-center py-6 sm:py-8 px-4 text-center transition-all duration-700 hover:bg-white/[0.03] cursor-default ${
        triggered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Subtle hover glow behind stat */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/0 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none mb-1.5 font-tabular transition-transform duration-300 group-hover:scale-105 ${colorClass || 'text-[#00E599]'}`}>
        {count}
      </div>
      <div className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-slate-400 uppercase mt-1 group-hover:text-slate-200 transition-colors">
        {label}
      </div>
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
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCardTilt({
      rotateX: -(y * 10),
      rotateY: x * 10,
    });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0 });
  };

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

        {/* Rich Ambient Lighting & Glowing Orbs with Motion */}
        <div className="absolute top-10 right-[-100px] w-[650px] h-[650px] rounded-full bg-emerald-500/15 blur-[140px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 left-[-150px] w-[550px] h-[550px] rounded-full bg-blue-600/15 blur-[130px] pointer-events-none animate-float" />
        <div className="absolute bottom-[-100px] right-1/3 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none animate-float-delayed" />

        {/* Content: 2-Column Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Hero Text and Actions */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">

              {/* Pill Badge */}
              <div
                className="shimmer-badge inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 transition-all duration-700 shadow-lg shadow-emerald-500/10 hover:border-emerald-400 cursor-default"
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
                <span className="font-extrabold tracking-wide">Changing Lives Multipurpose Ventures</span>
              </div>

              {/* Headline with dynamic iridescent shimmer */}
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-black text-white tracking-tight leading-[1.04] mb-6 transition-all duration-700"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                  transitionDelay: '200ms',
                }}
              >
                Save. Grow.<br />
                <span className="shimmer-text drop-shadow-[0_0_35px_rgba(0,229,153,0.35)]">
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
                    className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#00D084] hover:bg-[#00BA76] text-slate-950 font-black text-base tracking-wide transition-all duration-300 active:scale-95 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 overflow-hidden"
                  >
                    <span className="relative z-10">Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5] relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#00D084] hover:bg-[#00BA76] text-slate-950 font-black text-base tracking-wide transition-all duration-300 active:scale-95 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 overflow-hidden"
                  >
                    <span className="relative z-10">Start Saving Now</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5] relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                )}

                <Link
                  href="#services"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-emerald-500/40 text-white font-bold text-base transition-all duration-300 active:scale-95 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/5"
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
                  className="text-rose-400 hover:text-rose-300 font-bold underline underline-offset-4 decoration-rose-500/50 hover:decoration-rose-400 transition-colors"
                >
                  Apply for 24h Express Loan →
                </Link>
              </div>
            </div>

            {/* Right Column: High Definition Interactive 3D Showcase Card */}
            <div
              className="lg:col-span-5 w-full flex justify-center lg:justify-end transition-all duration-700"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(32px)',
                transitionDelay: '300ms',
              }}
            >
              <div 
                className="relative w-full max-w-xl group select-none"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                {/* Floating Micro-Widget 1: Top-Left Loan Verification */}
                <div className="absolute -top-6 -left-6 z-30 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#091224]/95 border border-emerald-500/40 shadow-2xl backdrop-blur-xl animate-float pointer-events-none">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00E599] shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">₦250,000 Loan Approved</div>
                    <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Disbursed in 1.4 hrs
                    </div>
                  </div>
                </div>

                {/* Floating Micro-Widget 2: Bottom-Right Compound Growth */}
                <div className="absolute -bottom-6 -right-4 z-30 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#091224]/95 border border-blue-500/40 shadow-2xl backdrop-blur-xl animate-float-delayed pointer-events-none">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Thrift Wealth Yield</div>
                    <div className="text-[10px] text-slate-300 font-medium">
                      <strong className="text-[#00E599] font-bold">48% P.A.</strong> compound return
                    </div>
                  </div>
                </div>

                {/* Multi-layered neon glow behind showcase frame */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-emerald-500/35 via-blue-600/25 to-[#00E599]/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute -bottom-6 -right-6 w-56 h-56 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

                {/* Outer Glass Card Container with 3D tilt */}
                <div 
                  className="relative rounded-3xl bg-[#0D182E]/90 border border-white/20 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl overflow-hidden ring-1 ring-white/10 transition-transform duration-200 ease-out"
                  style={{
                    transform: `perspective(1000px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                  }}
                >
                  {/* Subtle top glare reflection */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent z-10" />

                  {/* High Definition Image Container */}
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-[#060D1A]">
                    <Image
                      src="/assets/images/climps_hero_showcase.jpg"
                      alt="CLIMPS Digital Financial Ecosystem - Wealth Building & Savings"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060D1A]/90 via-transparent to-black/20 pointer-events-none" />

                    {/* Floating Top Pill Badge */}
                    <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D182E]/85 border border-white/20 backdrop-blur-md shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
                      <span className="text-xs font-bold text-white tracking-wide">Digital Multi-Purpose Banking</span>
                    </div>

                    {/* Floating Growth Badge */}
                    <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md text-[#00E599] text-xs font-black shadow-lg">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+18.4% APY Yield</span>
                    </div>

                    {/* Bottom In-Image Info Bar */}
                    <div className="absolute bottom-3 left-3 right-3 z-10 p-3.5 rounded-xl bg-[#0A1224]/85 border border-white/15 backdrop-blur-xl shadow-xl flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-white">
                          <Sparkles className="w-3.5 h-3.5 text-[#00E599]" />
                          <span>Smart Wealth Ecosystem</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
                          Multi-asset thrift savings, audited circle yield & express credit
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1 text-[11px] text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00E599]" />
                        <span>Insured & Regulated</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Trust Row */}
                  <div className="pt-3 px-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0D182E] bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">JL</div>
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0D182E] bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">RL</div>
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0D182E] bg-purple-600 text-white text-[9px] font-black flex items-center justify-center">MK</div>
                      </div>
                      <span className="text-slate-300 font-medium">
                        <strong className="text-white font-bold">4,200+ Active Members</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-pulse" />
                      <span>Instant 24/7 Portal Access</span>
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
