'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function formatFundStat(amount: number): string {
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return `₦${billions % 1 === 0 ? billions.toFixed(0) : billions.toFixed(1)}B`;
  }
  const millions = amount / 1_000_000;
  return `₦${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
}

const DEFAULT_STATS = [
  { value: '500+', label: 'MEMBERS' },
  { value: '₦500M', label: 'MANAGED' },
  { value: '9–25%', label: 'RETURNS P.A.' },
  { value: '48hrs', label: 'LOAN APPROVAL' },
];

export default function HeroSection() {
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    const supabase = createClient();
    const BASELINE_MEMBERS = 500;
    const BASELINE_FUNDS = 500_000_000; // 500 Million

    async function loadLiveStats() {
      try {
        // 1. Calculate automated member count
        let additionalMembers = 0;

        // Check Supabase members table
        const { count: memberCount, error: memberErr } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true });

        if (!memberErr && typeof memberCount === 'number') {
          additionalMembers = Math.max(additionalMembers, memberCount);
        }

        // Check user_profiles table
        const { count: profileCount, error: profileErr } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        if (!profileErr && typeof profileCount === 'number') {
          additionalMembers = Math.max(additionalMembers, profileCount);
        }

        // Also inspect locally provisioned members (localStorage fallback)
        let localFunds = 0;
        try {
          const stored = localStorage.getItem('climps_admin_members_v1');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              additionalMembers = Math.max(additionalMembers, parsed.length);
              localFunds = parsed.reduce(
                (sum: number, m: any) =>
                  sum +
                  (Number(m.total_savings) || 0) +
                  (Number(m.total_contributions) || 0) +
                  (Number(m.investment_portfolio_value) || 0),
                0
              );
            }
          }
        } catch {}

        const totalMembers = BASELINE_MEMBERS + additionalMembers;

        // 2. Calculate automated managed fund total
        let liveFundAdditions = localFunds;

        // Fetch savings accounts balances
        const { data: savings } = await supabase
          .from('savings_accounts')
          .select('balance');
        if (savings && savings.length > 0) {
          const sumSavings = savings.reduce((acc, row) => acc + (Number(row.balance) || 0), 0);
          liveFundAdditions = Math.max(liveFundAdditions, sumSavings);
        }

        // Fetch savings contributions
        const { data: contributions } = await supabase
          .from('contributions')
          .select('amount');
        if (contributions && contributions.length > 0) {
          const sumContributions = contributions.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
          liveFundAdditions += sumContributions;
        }

        // Fetch investments
        const { data: investments } = await supabase
          .from('investments')
          .select('amount');
        if (investments && investments.length > 0) {
          const sumInvestments = investments.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
          liveFundAdditions += sumInvestments;
        }

        const totalFunds = BASELINE_FUNDS + liveFundAdditions;

        setStats([
          { value: `${totalMembers.toLocaleString()}+`, label: 'MEMBERS' },
          { value: formatFundStat(totalFunds), label: 'MANAGED' },
          { value: '9–25%', label: 'RETURNS P.A.' },
          { value: '48hrs', label: 'LOAN APPROVAL' },
        ]);
      } catch (err) {
        console.warn('Live stats fallback to baseline 500 / ₦500M:', err);
      }
    }

    loadLiveStats();

    // Real-time listener: re-calculate when new members or funds are added
    const channel = supabase
      .channel('public-hero-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => loadLiveStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => loadLiveStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, () => loadLiveStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investments' }, () => loadLiveStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_accounts' }, () => loadLiveStats())
      .subscribe();

    // Listen for storage events (e.g. member added via admin panel in another tab)
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === 'climps_admin_members_v1') {
        loadLiveStats();
      }
    };
    window.addEventListener('storage', onStorageChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex flex-col justify-end overflow-hidden bg-[#0a0f1e] text-white">
        {/* Subtle teal glow top-right */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-emerald-400/8 blur-[120px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-40 pb-20 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 text-white/60 text-xs font-medium uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cooperative Multipurpose Society
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[82px] font-black text-white tracking-tight leading-[1.03] mb-8 max-w-4xl">
            Save. Grow.<br />
            <span className="text-emerald-400">Prosper together.</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-white/55 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
            A structured wealth-building cooperative for Nigerians — savings, investments, and loans, all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm tracking-wide transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-500/25 group"
            >
              Sign In
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#products"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-transparent border border-white/20 hover:border-white/40 text-white font-semibold text-sm transition-all duration-150 active:scale-95"
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
              <div key={stat.label} className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="text-4xl sm:text-5xl font-black text-[#0d1b2e] tracking-tight leading-none mb-2">
                  {stat.value}
                </div>
                <div className="text-xs font-bold tracking-[0.15em] text-gray-500 uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
