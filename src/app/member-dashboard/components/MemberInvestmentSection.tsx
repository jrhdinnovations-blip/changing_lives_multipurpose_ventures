'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import Badge from '@/components/ui/Badge';
import { ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';

const InvestmentRadialChart = dynamic(() => import('./InvestmentRadialChart'), { ssr: false });

const investments = [
  {
    id: 'inv-001',
    ref: 'INV/2026/00031',
    product: 'CLIMPS Growth Fund III',
    amount: 300000,
    projectedReturn: 345000,
    duration: '12 months',
    maturityDate: '15 Jan 2027',
    returnRate: '15% p.a.',
    status: 'active' as const,
  },
  {
    id: 'inv-002',
    ref: 'INV/2026/00052',
    product: 'Fixed Income Bond II',
    amount: 200000,
    projectedReturn: 222000,
    duration: '6 months',
    maturityDate: '30 Nov 2026',
    returnRate: '11% p.a.',
    status: 'active' as const,
  },
  {
    id: 'inv-003',
    ref: 'INV/2025/00089',
    product: 'CLIMPS Agro Fund I',
    amount: 150000,
    projectedReturn: 174000,
    duration: '12 months',
    maturityDate: '01 Aug 2026',
    returnRate: '16% p.a.',
    status: 'matured' as const,
  },
];

export default function MemberInvestmentSection() {
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalProjected = investments.filter(i => i.status === 'active').reduce((s, i) => s + i.projectedReturn, 0);

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header">Investment Portfolio</h2>
        <button
          onClick={() => toast.info('Invest Now — coming soon')}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Invest Now <ChevronRight size={13} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary/40 rounded-xl p-3">
          <p className="text-2xs text-muted-foreground">Total Invested</p>
          <p className="text-base font-bold text-primary font-tabular mt-0.5">₦{totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-accent/5 rounded-xl p-3">
          <p className="text-2xs text-muted-foreground flex items-center gap-1">
            Projected Value
            <Info size={10} className="text-muted-foreground" />
          </p>
          <p className="text-base font-bold text-accent font-tabular mt-0.5">₦{totalProjected.toLocaleString()}</p>
          <p className="text-2xs text-muted-foreground">Not guaranteed</p>
        </div>
      </div>

      <InvestmentRadialChart />

      {/* Investment list */}
      <div className="space-y-2 mt-4">
        {investments.map(inv => (
          <div
            key={inv.id}
            className="p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">{inv.product}</p>
                <p className="text-2xs text-muted-foreground font-mono">{inv.ref}</p>
              </div>
              <Badge variant={inv.status}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-2xs text-muted-foreground">Invested</p>
                <p className="text-xs font-semibold text-foreground font-tabular">₦{inv.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-2xs text-muted-foreground">Return Rate</p>
                <p className="text-xs font-semibold text-accent">{inv.returnRate}</p>
              </div>
              <div>
                <p className="text-2xs text-muted-foreground">Matures</p>
                <p className="text-xs font-semibold text-foreground">{inv.maturityDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-2xs text-muted-foreground text-center mt-3 px-2">
        Projected returns are estimates based on product terms and are not guaranteed.
      </p>
    </div>
  );
}