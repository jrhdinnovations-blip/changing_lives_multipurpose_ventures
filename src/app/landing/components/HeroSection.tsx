'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
      className={`flex flex-col items-center justify-center py-4 sm:py-8 px-2 sm:px-6 text-center transition-all duration-700 ${
        triggered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none mb-1 ${colorClass || 'text-emerald-600'}`}>
        {count}
      </div>
      <div className="text-[10px] sm:text-xs font-bold tracking-[0.12em] text-slate-500 uppercase mt-1">{label}</div>
    </div>
  );
}

const DEFAULT_STATS = [
  { value: '500+', label: 'ACTIVE MEMBERS', color: 'text-blue-600' },
  { value: '₦500M', label: 'MANAGED FUNDS', color: 'text-emerald-600' },
  { value: '9–25%', label: 'RETURNS P.A.', color: 'text-emerald-600' },
  { value: '24hrs', label: 'EXPRESS LOANS', color: 'text-red-600' },
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
          { value: `${totalMembers.toLocaleString()}+`, label: 'ACTIVE MEMBERS', color: 'text-blue-600' },
          { value: formatFundStat(BASELINE_FUNDS + liveFundAdditions), label: 'MANAGED FUNDS', color: 'text-emerald-600' },
          { value: '9–25%', label: 'RETURNS P.A.', color: 'text-emerald-600' },
          { value: '24hrs', label: 'EXPRESS LOANS', color: 'text-red-600' },
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
      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex flex-col justify-end overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/25 text-slate-900">

        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(37,99,235,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'gridMove 20s linear infinite',
          }}
        />

        {/* Subtle glowing ambient orbs */}
        <div className="absolute top-[-80px] right-[-80px] w-[600px] h-[600px] rounded-full bg-emerald-200/40 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 right-[10%] w-[400px] h-[400px] rounded-full bg-blue-200/35 blur-[110px] pointer-events-none"
          style={{ animation: 'floatOrb 8s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-[-100px] w-[500px] h-[500px] rounded-full bg-red-100/35 blur-[120px] pointer-events-none"
          style={{ animation: 'floatOrb 12s ease-in-out infinite reverse' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-28 pb-10 sm:pt-36 sm:pb-16 w-full">

          {/* Badge — 4-Color Brand Ribbon: Red, Green, Blue, White */}
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 sm:mb-6 transition-all duration-700 shadow-sm"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transitionDelay: '100ms',
            }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-xs" title="Red" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-xs" title="Green" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs" title="Blue" />
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 shadow-xs" title="White" />
            </span>
            <span>CLIMPS • Changing Lives Multipurpose Cooperative</span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-[80px] font-black text-slate-900 tracking-tight leading-[1.05] mb-4 sm:mb-6 max-w-4xl transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: '200ms',
            }}
          >
            Save. Grow.<br />
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Prosper together.
            </span>
          </h1>

          {/* Sub-copy */}
          <p
            className="text-slate-600 text-base sm:text-xl lg:text-2xl max-w-xl mb-6 sm:mb-8 leading-relaxed transition-all duration-700 font-semibold"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: '350ms',
            }}
          >
            A structured wealth-building cooperative for Nigerians — disciplined thrift savings, high-yield wealth opportunities, and express 24-hour loans.
          </p>

          {/* CTAs showcasing Red, Green, Blue, White */}
          <div
            className="flex flex-wrap items-center gap-3.5 transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: '500ms',
            }}
          >
            {user ? (
              <Link
                href={['super_admin', 'admin', 'manager', 'staff'].includes(userRole) ? '/admin-dashboard' : '/member-dashboard'}
                className="relative inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-600/25"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="relative inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-600/25"
              >
                <span>Join CLIMPS Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="#products"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all duration-200 active:scale-95 shadow-lg shadow-blue-600/25"
            >
              Explore Products
            </Link>

            <Link
              href="/loan-application"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white border-2 border-red-500 hover:bg-red-50 text-red-600 font-bold text-base transition-all duration-200 active:scale-95 shadow-sm"
            >
              Apply for 24h Loan
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-y border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {stats.map((stat, i) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                delay={300 + i * 150}
                colorClass={(stat as any).color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Keyframe styles */}
      <style jsx global>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          33% { transform: translateY(-20px) translateX(8px); opacity: 0.8; }
          66% { transform: translateY(-10px) translateX(-6px); opacity: 0.5; }
        }
        @keyframes shimmer {
          0%, 100% { text-shadow: 0 0 20px rgba(16,185,129,0.4); }
          50% { text-shadow: 0 0 50px rgba(16,185,129,0.7), 0 0 80px rgba(16,185,129,0.3); }
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5), 0 10px 40px rgba(52,211,153,0.35); }
          50% { box-shadow: 0 0 0 12px rgba(52,211,153,0), 0 10px 40px rgba(52,211,153,0.6); }
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}
