'use client';
import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Badge from '@/components/ui/Badge';
import { ChevronRight, Info, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';

const InvestmentRadialChart = dynamic(() => import('./InvestmentRadialChart'), { ssr: false });

const investments = [
  {
    id: 'inv-001',
    ref: 'INV/2026/00031',
    product: 'CLIMPS Investors Circle',
    category: 'Regular Investment',
    amount: 500000,
    projectedReturn: 600000,
    duration: '12 months',
    maturityDate: '15 Jan 2027',
    returnRate: '20% p.a.',
    status: 'active' as const,
    isComingSoon: false,
  },
  {
    id: 'inv-002',
    ref: 'INV/PIPE/AGR',
    product: 'Agro-Ventures Fund',
    category: 'Agriculture',
    amount: 100000,
    projectedReturn: 122000,
    duration: '9 months',
    maturityDate: 'Q4 2026',
    returnRate: '18%–22%',
    status: 'coming_soon' as const,
    isComingSoon: true,
  },
  {
    id: 'inv-003',
    ref: 'INV/PIPE/REF',
    product: 'Real Estate Growth Fund',
    category: 'Real Estate',
    amount: 500000,
    projectedReturn: 625000,
    duration: '24 months',
    maturityDate: 'Q1 2027',
    returnRate: '20%–28%',
    status: 'coming_soon' as const,
    isComingSoon: true,
  },
];

export default function MemberInvestmentSection() {
  const activeInvestments = investments.filter(i => i.status === 'active');
  const totalInvested = activeInvestments.reduce((s, i) => s + i.amount, 0);
  const totalProjected = activeInvestments.reduce((s, i) => s + i.projectedReturn, 0);

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-header">Investment Portfolio</h2>
          <p className="text-2xs text-white/50">Regular & upcoming cooperative offerings</p>
        </div>
        <Link
          href="/investors-circle"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-400/80 transition-colors flex items-center gap-1 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-emerald-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Join Investors Circle <ChevronRight size={13} />
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/[0.04]/40 rounded-xl p-3">
          <p className="text-2xs text-white/50">Total Invested</p>
          <p className="text-base font-bold text-emerald-400 font-tabular mt-0.5">₦{totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-blue-500/5 rounded-xl p-3">
          <p className="text-2xs text-white/50 flex items-center gap-1">
            Projected Value
            <Info size={10} className="text-white/50" />
          </p>
          <p className="text-base font-bold text-blue-400 font-tabular mt-0.5">₦{totalProjected.toLocaleString()}</p>
          <p className="text-2xs text-white/50">Not guaranteed</p>
        </div>
      </div>

      <InvestmentRadialChart />

      {/* Investment list */}
      <div className="space-y-2 mt-4">
        {investments.map(inv => (
          <div
            key={inv.id}
            onClick={() => {
              if (inv.isComingSoon) {
                toast.info(`${inv.product} is launching soon. Join the waitlist in Investment Opportunities.`);
              }
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer group ${
              inv.isComingSoon
                ? 'border-amber-200/80 bg-amber-50/20 hover:bg-amber-50/40'
                : 'border-white/10 hover:bg-white/[0.06]/40'
            }`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {inv.product}
                  </p>
                  {inv.category === 'Regular Investment' && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      Regular
                    </span>
                  )}
                </div>
                <p className="text-2xs text-white/50 font-mono">{inv.ref}</p>
              </div>
              <Badge variant={inv.status}>
                {inv.status === 'coming_soon' ? 'Coming Soon' : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-2xs text-white/50">
                  {inv.isComingSoon ? 'Est. Min' : 'Invested'}
                </p>
                <p className="text-xs font-semibold text-white font-tabular">
                  ₦{inv.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-2xs text-white/50">Return Rate</p>
                <p className={`text-xs font-semibold ${inv.isComingSoon ? 'text-amber-700' : 'text-blue-400'}`}>
                  {inv.returnRate}
                </p>
              </div>
              <div>
                <p className="text-2xs text-white/50">
                  {inv.isComingSoon ? 'Target Launch' : 'Matures'}
                </p>
                <p className="text-xs font-semibold text-white">{inv.maturityDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-2xs text-white/50 text-center mt-3 px-2">
        Projected returns are estimates based on product terms and are not guaranteed.
      </p>
    </div>
  );
}