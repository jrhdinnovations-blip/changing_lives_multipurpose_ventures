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

function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
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
      className={`flex flex-col items-center justify-center py-10 px-6 text-center transition-all duration-700 ${
        triggered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="text-4xl sm:text-5xl font-black text-[#0d1b2e] tracking-tight leading-none mb-2">
        {count}
      </div>
      <div className="text-xs font-bold tracking-[0.15em] text-gray-500 uppercase mt-2">{label}</div>
    </div>
  );
}

const DEFAULT_STATS = [
  { value: '500+', label: 'MEMBERS' },
  { value: '₦500M', label: 'MANAGED' },
  { value: '9–25%', label: 'RETURNS P.A.' },
  { value: '24hrs', label: 'LOAN APPROVAL' },
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
          { value: `${totalMembers.toLocaleString()}+`, label: 'MEMBERS' },
          { value: formatFundStat(BASELINE_FUNDS + liveFundAdditions), label: 'MANAGED' },
          { value: '9–25%', label: 'RETURNS P.A.' },
          { value: '24hrs', label: 'LOAN APPROVAL' },
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
      <section className="relative min-h-[88vh] flex flex-col justify-end overflow-hidden bg-[#0a0f1e] text-white">

        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'gridMove 20s linear infinite',
          }}
        />

        {/* Animated glowing orbs */}
        <div className="absolute top-[-80px] right-[-80px] w-[700px] h-[700px] rounded-full bg-teal-500/10 blur-[160px] pointer-events-none animate-pulse-slow" />
        <div className="absolute top-1/3 right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-400/8 blur-[130px] pointer-events-none"
          style={{ animation: 'floatOrb 8s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-[-100px] w-[500px] h-[500px] rounded-full bg-blue-500/6 blur-[140px] pointer-events-none"
          style={{ animation: 'floatOrb 12s ease-in-out infinite reverse' }} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-400/40 pointer-events-none"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `floatParticle ${4 + i * 1.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-40 pb-20 w-full">

          {/* Badge — fade in */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-bold uppercase tracking-widest mb-8 transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transitionDelay: '100ms',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            Welcome to CLIMPS • Cooperative Multipurpose Society
          </div>

          {/* Headline — staggered lines */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-[82px] font-black text-white tracking-tight leading-[1.03] mb-8 max-w-4xl transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: '200ms',
            }}
          >
            Save. Grow.<br />
            <span className="text-emerald-400" style={{ display: 'inline-block', animation: 'shimmer 3s ease-in-out infinite' }}>
              Prosper together.
            </span>
          </h1>

          {/* Sub-copy */}
          <p
            className="text-white/70 text-xl sm:text-2xl max-w-xl mb-10 leading-relaxed transition-all duration-700 font-semibold"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: '350ms',
            }}
          >
            A structured wealth-building cooperative for Nigerians — savings, investments, and loans, all in one place.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center gap-3 transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: '500ms',
            }}
          >
            {user ? (
              <Link
                href={['super_admin', 'admin', 'manager', 'staff'].includes(userRole) ? '/admin-dashboard' : '/member-dashboard'}
                className="relative inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base tracking-wide transition-all duration-200 active:scale-95 group overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                Go to Dashboard
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="relative inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/30 group overflow-hidden"
                style={{ animation: 'btnPulse 3s ease-in-out infinite' }}
              >
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                Sign In
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <Link
              href="#products"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-transparent border border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-white font-bold text-base transition-all duration-200 active:scale-95"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#f5f6f8] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} delay={300 + i * 150} />
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
          0%, 100% { text-shadow: 0 0 20px rgba(52,211,153,0.3); }
          50% { text-shadow: 0 0 40px rgba(52,211,153,0.6), 0 0 60px rgba(52,211,153,0.2); }
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4), 0 10px 30px rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(16,185,129,0), 0 10px 30px rgba(16,185,129,0.5); }
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}
