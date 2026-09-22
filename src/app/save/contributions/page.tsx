'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AppLayout from '@/components/AppLayout';
import type { Contribution, ContributionStatus } from '@/lib/types/climps';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_CONFIG: Record<ContributionStatus, { label: string; classes: string }> = {
  paid: { label: 'Paid', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  partially_paid: { label: 'Partial', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  unpaid: { label: 'Unpaid', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  overdue: { label: 'Overdue', classes: 'bg-red-100 text-red-700 border-red-200' },
};

// Demo data — in production this comes from Supabase `contributions` table
const DEMO_CONTRIBUTIONS: Contribution[] = [
  { id: '1', memberId: 'm1', contributionMonth: 9, contributionYear: 2026, expectedAmount: 10000, amountPaid: 10000, outstandingAmount: 0, paymentDate: '2026-09-05', paymentMethod: 'Bank Transfer', transactionReference: 'TXN-20260905-001', contributionStatus: 'paid', createdAt: '2026-09-01', updatedAt: '2026-09-05' },
  { id: '2', memberId: 'm1', contributionMonth: 8, contributionYear: 2026, expectedAmount: 10000, amountPaid: 7000, outstandingAmount: 3000, paymentDate: '2026-08-12', paymentMethod: 'Cash', transactionReference: 'TXN-20260812-002', contributionStatus: 'partially_paid', createdAt: '2026-08-01', updatedAt: '2026-08-12' },
  { id: '3', memberId: 'm1', contributionMonth: 7, contributionYear: 2026, expectedAmount: 10000, amountPaid: 10000, outstandingAmount: 0, paymentDate: '2026-07-03', paymentMethod: 'Bank Transfer', transactionReference: 'TXN-20260703-003', contributionStatus: 'paid', createdAt: '2026-07-01', updatedAt: '2026-07-03' },
  { id: '4', memberId: 'm1', contributionMonth: 6, contributionYear: 2026, expectedAmount: 10000, amountPaid: 0, outstandingAmount: 10000, paymentDate: undefined, paymentMethod: undefined, transactionReference: undefined, contributionStatus: 'overdue', createdAt: '2026-06-01', updatedAt: '2026-06-30' },
  { id: '5', memberId: 'm1', contributionMonth: 5, contributionYear: 2026, expectedAmount: 10000, amountPaid: 10000, outstandingAmount: 0, paymentDate: '2026-05-08', paymentMethod: 'POS', transactionReference: 'TXN-20260508-005', contributionStatus: 'paid', createdAt: '2026-05-01', updatedAt: '2026-05-08' },
  { id: '6', memberId: 'm1', contributionMonth: 4, contributionYear: 2026, expectedAmount: 10000, amountPaid: 10000, outstandingAmount: 0, paymentDate: '2026-04-04', paymentMethod: 'Bank Transfer', transactionReference: 'TXN-20260404-006', contributionStatus: 'paid', createdAt: '2026-04-01', updatedAt: '2026-04-04' },
  { id: '7', memberId: 'm1', contributionMonth: 3, contributionYear: 2026, expectedAmount: 10000, amountPaid: 10000, outstandingAmount: 0, paymentDate: '2026-03-06', paymentMethod: 'Bank Transfer', transactionReference: 'TXN-20260306-007', contributionStatus: 'paid', createdAt: '2026-03-01', updatedAt: '2026-03-06' },
  { id: '8', memberId: 'm1', contributionMonth: 2, contributionYear: 2026, expectedAmount: 10000, amountPaid: 5000, outstandingAmount: 5000, paymentDate: '2026-02-14', paymentMethod: 'Cash', transactionReference: 'TXN-20260214-008', contributionStatus: 'partially_paid', createdAt: '2026-02-01', updatedAt: '2026-02-14' },
];

type StatusFilter = 'all' | ContributionStatus;

export default function ContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [memberName, setMemberName] = useState('Member');
  const [memberId, setMemberId] = useState('');
  const [role, setRole] = useState<'member' | 'admin' | 'staff' | 'manager'>('member');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        setMemberName(meta?.full_name || meta?.name || 'Member');
        setMemberId(meta?.member_number || '');
        setRole((meta?.role as typeof role) || 'member');
      }
    });
    // In production: fetch from supabase contributions table filtered by member_id
    setTimeout(() => { setContributions(DEMO_CONTRIBUTIONS); setLoading(false); }, 600);
  }, []);

  const filtered = statusFilter === 'all' ? contributions : contributions.filter((c) => c.contributionStatus === statusFilter);

  const totalExpected = contributions.reduce((s, c) => s + c.expectedAmount, 0);
  const totalPaid = contributions.reduce((s, c) => s + c.amountPaid, 0);
  const totalOutstanding = contributions.reduce((s, c) => s + c.outstandingAmount, 0);
  const currentMonth = contributions[0];

  return (
    <AppLayout role={role} memberName={memberName} memberId={memberId}>
      <div className="p-6 xl:p-8 2xl:p-10 max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link href="/member-dashboard" className="hover:text-foreground">Dashboard</Link>
            <span>/</span>
            <span className="text-foreground font-medium">My Contributions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Monthly Contributions</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your cooperative contribution history and outstanding balances.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Expected', value: fmt(totalExpected), icon: '📅', color: 'text-foreground' },
            { label: 'Total Paid', value: fmt(totalPaid), icon: '✅', color: 'text-emerald-600' },
            { label: 'Outstanding', value: fmt(totalOutstanding), icon: '⚠️', color: 'text-red-600' },
            { label: 'This Month', value: currentMonth ? (STATUS_CONFIG[currentMonth.contributionStatus]?.label ?? '—') : '—', icon: '📌', color: 'text-primary' },
          ].map((card) => (
            <div key={card.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="text-xl mb-1.5">{card.icon}</div>
              <p className="text-xs text-muted-foreground mb-0.5">{card.label}</p>
              <p className={`text-base font-extrabold font-tabular ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {(['all', 'paid', 'partially_paid', 'unpaid', 'overdue'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === f ? 'bg-primary text-white border-primary shadow-sm' : 'bg-muted text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              {f === 'all' ? 'All' : f === 'partially_paid' ? 'Partial' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && <span className="ml-1.5 text-[10px] opacity-70">{contributions.length}</span>}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-7 h-7 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">No contributions found for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    {['Month', 'Expected', 'Paid', 'Outstanding', 'Progress', 'Status', 'Date', 'Method', 'Reference'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((c, i) => {
                    const pct = c.expectedAmount > 0 ? Math.round((c.amountPaid / c.expectedAmount) * 100) : 0;
                    const cfg = STATUS_CONFIG[c.contributionStatus];
                    return (
                      <tr key={c.id} className={`hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                          {MONTH_NAMES[c.contributionMonth - 1]} {c.contributionYear}
                        </td>
                        <td className="px-4 py-3 font-tabular text-muted-foreground">{fmt(c.expectedAmount)}</td>
                        <td className="px-4 py-3 font-tabular text-emerald-600 font-semibold">{fmt(c.amountPaid)}</td>
                        <td className="px-4 py-3 font-tabular text-red-600 font-semibold">{fmt(c.outstandingAmount)}</td>
                        <td className="px-4 py-3 w-28">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-400' : 'bg-muted-foreground/30'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-tabular w-7 text-right">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                          {c.paymentDate ? new Date(c.paymentDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{c.paymentMethod || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{c.transactionReference || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-800 leading-relaxed">
            Your monthly cooperative contribution is <strong>₦10,000</strong> due by the <strong>5th of each month</strong>. Contributions overdue by more than 30 days may attract a late penalty. Contact your branch to make payments or arrange a payment plan.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
