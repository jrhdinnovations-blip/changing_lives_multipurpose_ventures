'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Investment, InvestmentStatus } from '@/lib/types/climps';
import { formatNaira, formatNairaCompact } from '@/lib/investmentsData';
import {
  TrendingUp,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  PlusCircle,
  PieChart,

  Download,
} from 'lucide-react';

interface PortfolioHolding {
  id: string;
  investmentNumber: string;
  name: string;
  category: string;
  amountInvested: number;
  projectedReturnRate: number;
  projectedReturn: number;
  actualReturn: number;
  currentValue: number;
  investmentDate: string;
  maturityDate: string;
  status: InvestmentStatus;
  tenureMonths: number;
}

const DEMO_HOLDINGS: PortfolioHolding[] = [
  {
    id: 'inv-1',
    investmentNumber: 'INV/2026/00012',
    name: 'Cooperative Equity Shares',
    category: 'Equity & Shares',
    amountInvested: 250000,
    projectedReturnRate: 16.5,
    projectedReturn: 41250,
    actualReturn: 41250,
    currentValue: 291250,
    investmentDate: '2025-12-15',
    maturityDate: '2026-12-15',
    status: 'active',
    tenureMonths: 12,
  },
  {
    id: 'inv-2',
    investmentNumber: 'INV/2026/00034',
    name: 'Fixed Income Investment Plan',
    category: 'Fixed Income',
    amountInvested: 500000,
    projectedReturnRate: 15.0,
    projectedReturn: 75000,
    actualReturn: 37500,
    currentValue: 537500,
    investmentDate: '2026-03-01',
    maturityDate: '2027-03-01',
    status: 'active',
    tenureMonths: 12,
  },
  {
    id: 'inv-3',
    investmentNumber: 'INV/2026/00089',
    name: 'Real Estate Growth Fund',
    category: 'Real Estate',
    amountInvested: 1000000,
    projectedReturnRate: 20.0,
    projectedReturn: 400000,
    actualReturn: 100000,
    currentValue: 1100000,
    investmentDate: '2026-01-10',
    maturityDate: '2028-01-10',
    status: 'active',
    tenureMonths: 24,
  },
  {
    id: 'inv-4',
    investmentNumber: 'INV/2026/00145',
    name: 'Agro-Ventures Cycle Note',
    category: 'Agriculture',
    amountInvested: 150000,
    projectedReturnRate: 22.0,
    projectedReturn: 33000,
    actualReturn: 33000,
    currentValue: 183000,
    investmentDate: '2025-06-01',
    maturityDate: '2026-03-01',
    status: 'matured',
    tenureMonths: 9,
  },
  {
    id: 'inv-5',
    investmentNumber: 'INV/2026/00201',
    name: 'Sovereign Treasury Notes',
    category: 'Government Securities',
    amountInvested: 200000,
    projectedReturnRate: 14.5,
    projectedReturn: 29000,
    actualReturn: 0,
    currentValue: 200000,
    investmentDate: '2026-09-18',
    maturityDate: '2027-09-18',
    status: 'pending',
    tenureMonths: 12,
  },
];

const STATUS_CONFIG: Record<InvestmentStatus, { label: string; classes: string }> = {
  active: { label: 'Active', classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  pending: { label: 'Pending Verification', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  matured: { label: 'Matured', classes: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  cancelled: { label: 'Cancelled', classes: 'bg-white/10 text-white/50 border-white/15' },
};

export default function MemberInvestmentPortfolioPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | InvestmentStatus>('all');
  const [memberName, setMemberName] = useState('Adaeze Okonkwo');
  const [memberId, setMemberId] = useState('CLMV/2026/0047');
  const [role, setRole] = useState<'member' | 'admin' | 'staff' | 'manager'>('member');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        setMemberName(meta?.full_name || 'Member');
        setMemberId(meta?.member_number || 'CLMV/2026/0047');
        setRole((meta?.role as any) || 'member');
      }
    });

    // In production, fetch from Supabase `investments` table for current member
    setTimeout(() => {
      setHoldings(DEMO_HOLDINGS);
      setLoading(false);
    }, 400);
  }, []);

  const totalInvested = holdings.reduce((s, h) => s + h.amountInvested, 0);
  const totalCurrentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalProjectedReturns = holdings.reduce((s, h) => s + h.projectedReturn, 0);
  const totalActualReturns = holdings.reduce((s, h) => s + h.actualReturn, 0);

  const activeCount = holdings.filter((h) => h.status === 'active').length;
  const maturedCount = holdings.filter((h) => h.status === 'matured').length;
  const pendingCount = holdings.filter((h) => h.status === 'pending').length;

  const activeHoldings = holdings.filter((h) => h.status === 'active');
  const upcomingMaturity = activeHoldings.sort(
    (a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime()
  )[0];

  const filteredHoldings = filter === 'all' ? holdings : holdings.filter((h) => h.status === filter);

  return (
    <AppLayout role={role} memberName={memberName} memberId={memberId}>
      <div className="p-6 xl:p-8 2xl:p-10 max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1.5">
              <Link href="/member-dashboard" className="hover:text-white">Dashboard</Link>
              <span>/</span>
              <span className="text-white font-medium">Investment Portfolio</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">My Investment Portfolio</h1>
            <p className="text-xs text-white/50 mt-0.5">
              Track portfolio valuation, projected vs. realized yields, and maturity schedules.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/invest/calculator"
              className="btn-outline text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              Calculator
            </Link>
            <Link
              href="/invest/now"
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Investment
            </Link>
          </div>
        </div>

        {/* Top Summary Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm">
            <div className="text-xs text-white/50 mb-1">Total Capital Invested</div>
            <div className="text-xl font-extrabold text-white font-tabular">
              {formatNaira(totalInvested)}
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">Across {holdings.length} subscriptions</div>
          </div>

          <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm">
            <div className="text-xs text-white/50 mb-1">Current Portfolio Value</div>
            <div className="text-xl font-extrabold text-emerald-400 font-tabular">
              {formatNaira(totalCurrentValue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              +{formatNaira(totalCurrentValue - totalInvested)} unrealized gain
            </div>
          </div>

          <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm">
            <div className="text-xs text-white/50 mb-1">Realized Cash Returns</div>
            <div className="text-xl font-extrabold text-emerald-600 font-tabular">
              {formatNaira(totalActualReturns)}
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">Paid into savings wallet</div>
          </div>

          <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm">
            <div className="text-xs text-white/50 mb-1">Next Upcoming Maturity</div>
            <div className="text-base font-extrabold text-white">
              {upcomingMaturity ? new Date(upcomingMaturity.maturityDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
              {upcomingMaturity ? upcomingMaturity.name : 'No active maturity'}
            </div>
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
          <div className="bg-white/[0.06]/40 rounded-xl p-3 border border-white/10/60 text-center">
            <span className="text-[11px] text-white/50 block">Active Plans</span>
            <span className="text-lg font-bold text-emerald-600 font-tabular">{activeCount}</span>
          </div>
          <div className="bg-white/[0.06]/40 rounded-xl p-3 border border-white/10/60 text-center">
            <span className="text-[11px] text-white/50 block">Matured Plans</span>
            <span className="text-lg font-bold text-blue-600 font-tabular">{maturedCount}</span>
          </div>
          <div className="bg-white/[0.06]/40 rounded-xl p-3 border border-white/10/60 text-center">
            <span className="text-[11px] text-white/50 block">Pending Verification</span>
            <span className="text-lg font-bold text-amber-600 font-tabular">{pendingCount}</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'active', 'pending', 'matured'] as ('all' | InvestmentStatus)[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-white border-primary shadow-xs'
                  : 'bg-white/[0.06]/50 text-white/50 border-white/10 hover:border-primary/40'
              }`}
            >
              {f === 'all' ? 'All Holdings' : STATUS_CONFIG[f]?.label || f}
              <span className="ml-1.5 text-[10px] opacity-75 font-tabular">
                ({f === 'all' ? holdings.length : holdings.filter((h) => h.status === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Holdings Table */}
        <div className="bg-[#0d1527] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.06]/60 border-b border-white/10 text-white/50 font-semibold">
                <tr>
                  <th className="px-4 py-3">Investment Plan</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Projected Rate</th>
                  <th className="px-4 py-3">Current Valuation</th>
                  <th className="px-4 py-3">Investment Date</th>
                  <th className="px-4 py-3">Maturity Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredHoldings.map((h) => {
                  const cfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.active;
                  return (
                    <tr key={h.id} className="hover:bg-white/[0.06]/30 transition-colors font-tabular">
                      <td className="px-4 py-3.5 font-sans">
                        <div className="font-bold text-white text-sm leading-snug">{h.name}</div>
                        <div className="text-[11px] text-white/50 font-mono">{h.investmentNumber} · {h.category}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        {formatNaira(h.amountInvested)}
                      </td>
                      <td className="px-4 py-3.5 text-emerald-600 font-semibold">
                        {h.projectedReturnRate}% p.a.
                        <div className="text-[10px] text-white/50">+{formatNaira(h.projectedReturn)}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400">
                        {formatNaira(h.currentValue)}
                      </td>
                      <td className="px-4 py-3.5 text-white/50">
                        {new Date(h.investmentDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 text-white/50">
                        {new Date(h.maturityDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 font-sans">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Download Certificate"
                            onClick={() => alert(`Certificate downloaded for ${h.investmentNumber}`)}
                            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {h.status === 'matured' && (
                            <Link
                              href={`/invest/now?product=fixed-investment&amount=${h.currentValue}`}
                              className="btn-accent text-[11px] px-2.5 py-1"
                            >
                              Reinvest
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk & Performance Notice */}
        <div className="bg-white/[0.06]/30 border border-white/10 rounded-2xl p-4 text-xs text-white/50 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Current valuations are updated in accordance with quarterly audited accounts and declared AGM surplus dividends. 
            Returns marked as projected are subject to business cycle returns. Need an official signed portfolio statement for visa or banking purposes? Contact the operations desk.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
