'use client';
import React from 'react';
import Badge from '@/components/ui/Badge';
import { CreditCard, Calendar, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const activeLoan = {
  id: 'loan-ln-2026-00047',
  ref: 'LN/2026/00047',
  product: 'Personal Loan',
  principal: 550000,
  totalRepayable: 616000,
  amountRepaid: 203500,
  outstanding: 412500,
  disbursedDate: '18 Mar 2026',
  completionDate: '18 Mar 2028',
  monthlyInstalment: 45833,
  nextDueDate: '25 Sep 2026',
  nextDueAmount: 45833,
  instalmentsPaid: 6,
  totalInstalments: 24,
  status: 'disbursed' as const,
};

const recentRepayments = [
  { id: 'rep-006', instalment: 6, date: '25 Aug 2026', amount: 45833, status: 'paid' as const },
  { id: 'rep-005', instalment: 5, date: '25 Jul 2026', amount: 45833, status: 'paid' as const },
  { id: 'rep-004', instalment: 4, date: '25 Jun 2026', amount: 45833, status: 'paid' as const },
];

export default function MemberLoanSection() {
  const repaymentPct = Math.round((activeLoan.amountRepaid / activeLoan.totalRepayable) * 100);

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header">Active Loan</h2>
        <button
          onClick={() => toast.info('Apply for a new loan — coming soon')}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Apply for Loan <ChevronRight size={13} />
        </button>
      </div>

      <div className="bg-secondary/40 rounded-2xl p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={16} className="text-primary" />
              <p className="text-sm font-bold text-foreground">{activeLoan.product}</p>
              <Badge variant="disbursed">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">{activeLoan.ref}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Outstanding Balance</p>
            <p className="text-xl font-bold text-foreground font-tabular">₦{activeLoan.outstanding.toLocaleString()}</p>
          </div>
        </div>

        {/* Repayment progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-muted-foreground">Repayment Progress</p>
            <p className="text-xs font-bold text-primary">{repaymentPct}% paid</p>
          </div>
          <div className="progress-bar-bg h-2.5">
            <div
              className="bg-accent h-full rounded-full transition-all duration-700"
              style={{ width: `${repaymentPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">₦{activeLoan.amountRepaid.toLocaleString()} repaid</p>
            <p className="text-xs text-muted-foreground">₦{activeLoan.totalRepayable.toLocaleString()} total</p>
          </div>
        </div>

        {/* Key details row */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/60">
          {[
            { label: 'Instalments Paid', value: `${activeLoan.instalmentsPaid} / ${activeLoan.totalInstalments}` },
            { label: 'Monthly Instalment', value: `₦${activeLoan.monthlyInstalment.toLocaleString()}` },
            { label: 'Loan Completion', value: activeLoan.completionDate },
          ].map(item => (
            <div key={`loan-detail-${item.label}`}>
              <p className="text-2xs text-muted-foreground">{item.label}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5 font-tabular">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next due alert */}
      <div className="flex items-center gap-3 p-3 bg-warning/8 border border-warning/20 rounded-xl mb-4">
        <div className="p-1.5 bg-warning/10 rounded-lg shrink-0">
          <Calendar size={14} className="text-warning" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">Next Repayment Due</p>
          <p className="text-xs text-muted-foreground">
            Instalment #7 of <span className="font-semibold text-foreground font-tabular">₦{activeLoan.nextDueAmount.toLocaleString()}</span> due on <span className="font-semibold">{activeLoan.nextDueDate}</span>
          </p>
        </div>
        <button
          onClick={() => toast.info('Repayment portal — coming soon')}
          className="btn-primary text-xs px-3 py-1.5 shrink-0"
        >
          Pay Now
        </button>
      </div>

      {/* Recent repayments */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent Repayments</p>
        <div className="space-y-1.5">
          {recentRepayments.map(rep => (
            <div
              key={rep.id}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <span className="text-2xs font-bold text-accent">{rep.instalment}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Instalment #{rep.instalment}</p>
                  <p className="text-2xs text-muted-foreground">{rep.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-foreground font-tabular">₦{rep.amount.toLocaleString()}</p>
                <Badge variant="paid">Paid</Badge>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => toast.info('Full repayment schedule — coming soon')}
          className="w-full mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2 text-center"
        >
          View Full Repayment Schedule →
        </button>
      </div>
    </div>
  );
}