'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AppLayout from '@/components/AppLayout';
import type { Contribution, ContributionStatus } from '@/lib/types/climps';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_CONFIG: Record<ContributionStatus, { label: string; classes: string }> = {
  paid: { label: 'Paid', classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  partially_paid: { label: 'Partial', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  unpaid: { label: 'Unpaid', classes: 'bg-white/10 text-white/60 border-white/15' },
  overdue: { label: 'Overdue', classes: 'bg-red-500/15 text-red-400 border-red-500/25' },
};

// Extended demo data including multiple members
type ContributionRow = Contribution & { memberName: string; memberNumber: string };

const DEMO_ROWS: ContributionRow[] = [
  { id: '1', memberId: 'm1', memberName: 'Adaeze Okonkwo', memberNumber: 'CLMV/2026/0001', contributionMonth: 9, contributionYear: 2026, expectedAmount: 10000, amountPaid: 10000, outstandingAmount: 0, paymentDate: '2026-09-05', paymentMethod: 'Bank Transfer', transactionReference: 'TXN-001', contributionStatus: 'paid', createdAt: '', updatedAt: '' },
  { id: '2', memberId: 'm2', memberName: 'Emeka Nwosu', memberNumber: 'CLMV/2026/0002', contributionMonth: 9, contributionYear: 2026, expectedAmount: 15000, amountPaid: 10000, outstandingAmount: 5000, paymentDate: '2026-09-10', paymentMethod: 'Cash', transactionReference: 'TXN-002', contributionStatus: 'partially_paid', createdAt: '', updatedAt: '' },
  { id: '3', memberId: 'm3', memberName: 'Ngozi Eze', memberNumber: 'CLMV/2026/0003', contributionMonth: 9, contributionYear: 2026, expectedAmount: 10000, amountPaid: 0, outstandingAmount: 10000, paymentDate: undefined, paymentMethod: undefined, transactionReference: undefined, contributionStatus: 'overdue', createdAt: '', updatedAt: '' },
  { id: '4', memberId: 'm4', memberName: 'Chukwudi Obi', memberNumber: 'CLMV/2026/0004', contributionMonth: 9, contributionYear: 2026, expectedAmount: 20000, amountPaid: 20000, outstandingAmount: 0, paymentDate: '2026-09-03', paymentMethod: 'Bank Transfer', transactionReference: 'TXN-004', contributionStatus: 'paid', createdAt: '', updatedAt: '' },
  { id: '5', memberId: 'm5', memberName: 'Yetunde Alabi', memberNumber: 'CLMV/2026/0005', contributionMonth: 9, contributionYear: 2026, expectedAmount: 10000, amountPaid: 0, outstandingAmount: 10000, paymentDate: undefined, paymentMethod: undefined, transactionReference: undefined, contributionStatus: 'unpaid', createdAt: '', updatedAt: '' },
  { id: '6', memberId: 'm6', memberName: 'Tunde Fashola', memberNumber: 'CLMV/2026/0006', contributionMonth: 9, contributionYear: 2026, expectedAmount: 10000, amountPaid: 10000, outstandingAmount: 0, paymentDate: '2026-09-07', paymentMethod: 'POS', transactionReference: 'TXN-006', contributionStatus: 'paid', createdAt: '', updatedAt: '' },
];

type SelectedMonth = { month: number; year: number };

export default function AdminContributionsPage() {
  const [rows, setRows] = useState<ContributionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContributionStatus | 'all'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedMonth>({ month: 9, year: 2026 });
  const [memberName, setMemberName] = useState('Administrator');
  const [memberId, setMemberId] = useState('');
  const [recordModal, setRecordModal] = useState<ContributionRow | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer');
  const [payRef, setPayRef] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        setMemberName(meta?.full_name || 'Administrator');
        setMemberId(meta?.member_number || '');
      }
    });
    setTimeout(() => { setRows(DEMO_ROWS); setLoading(false); }, 500);
  }, []);

  const filtered = rows.filter((r) => {
    const matchSearch = search === '' ||
      r.memberName.toLowerCase().includes(search.toLowerCase()) ||
      r.memberNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.contributionStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalExpected = filtered.reduce((s, r) => s + r.expectedAmount, 0);
  const totalCollected = filtered.reduce((s, r) => s + r.amountPaid, 0);
  const totalOutstanding = filtered.reduce((s, r) => s + r.outstandingAmount, 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const handleRecordPayment = async () => {
    if (!recordModal) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    const paid = parseFloat(payAmount) || 0;
    setRows((prev) => prev.map((r) => {
      if (r.id !== recordModal.id) return r;
      const newPaid = Math.min(r.amountPaid + paid, r.expectedAmount);
      const outstanding = r.expectedAmount - newPaid;
      return {
        ...r,
        amountPaid: newPaid,
        outstandingAmount: outstanding,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: payMethod,
        transactionReference: payRef || `TXN-${Date.now()}`,
        contributionStatus: outstanding <= 0 ? 'paid' : 'partially_paid',
      };
    }));
    setSaving(false);
    setRecordModal(null);
    setPayAmount('');
    setPayRef('');
  };

  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, label: MONTH_NAMES[i] }));

  return (
    <AppLayout role="admin" memberName={memberName} memberId={memberId}>
      {/* Record Payment Modal */}
      {recordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#0d1527] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="font-bold text-white text-sm">Record Payment</h2>
              <button onClick={() => setRecordModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-white/[0.06]/50 rounded-xl px-4 py-3">
                <p className="text-xs text-white/50">Member</p>
                <p className="font-bold text-white text-sm">{recordModal.memberName}</p>
                <p className="text-xs text-white/50">{recordModal.memberNumber}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <div><span className="text-white/50">Expected: </span><strong>{fmt(recordModal.expectedAmount)}</strong></div>
                  <div><span className="text-white/50">Outstanding: </span><strong className="text-red-600">{fmt(recordModal.outstandingAmount)}</strong></div>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-white block mb-1.5">Amount to Record (₦)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  max={recordModal.outstandingAmount}
                  placeholder={`Max: ${fmt(recordModal.outstandingAmount)}`}
                  className="w-full border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-white block mb-1.5">Payment Method</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary bg-background">
                  {['Bank Transfer', 'Cash', 'POS', 'Mobile Money', 'Cheque'].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-white block mb-1.5">Transaction Reference (optional)</label>
                <input type="text" value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="e.g. TXN-2026..." className="w-full border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setRecordModal(null)} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
                <button
                  onClick={handleRecordPayment}
                  disabled={!payAmount || saving}
                  className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Saving…</> : 'Record Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 xl:p-8 2xl:p-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
            <Link href="/admin-dashboard" className="hover:text-white">Admin</Link>
            <span>/</span>
            <span className="text-white font-medium">Contributions Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Member Contributions</h1>
          <p className="text-white/50 text-sm mt-1">Track, record, and manage monthly cooperative contributions for all members.</p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-sm font-semibold text-white">Period:</span>
          <select
            value={selectedPeriod.month}
            onChange={(e) => setSelectedPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
            className="border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#0d1527] focus:outline-none focus:border-primary"
          >
            {months.map((m) => <option key={m.month} value={m.month}>{m.label}</option>)}
          </select>
          <select
            value={selectedPeriod.year}
            onChange={(e) => setSelectedPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
            className="border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#0d1527] focus:outline-none focus:border-primary"
          >
            {[2025, 2026, 2027].map((y) => <option key={y}>{y}</option>)}
          </select>
          <button className="btn-outline px-4 py-2 text-sm">Generate Records for Period</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
          {[
            { label: 'Total Expected', value: fmt(totalExpected), color: 'text-white' },
            { label: 'Total Collected', value: fmt(totalCollected), color: 'text-emerald-600' },
            { label: 'Outstanding', value: fmt(totalOutstanding), color: 'text-red-600' },
            { label: 'Collection Rate', value: `${collectionRate}%`, color: collectionRate >= 80 ? 'text-emerald-600' : 'text-amber-600' },
          ].map((c) => (
            <div key={c.label} className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm">
              <p className="text-xs text-white/50 mb-0.5">{c.label}</p>
              <p className={`text-lg font-extrabold font-tabular ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Collection rate bar */}
        <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">Collection Progress</span>
            <span className="text-sm font-bold text-emerald-400">{collectionRate}%</span>
          </div>
          <div className="h-3 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${collectionRate >= 80 ? 'bg-emerald-500' : collectionRate >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or member number…"
              className="w-full border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-[#0d1527]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'paid', 'partially_paid', 'unpaid', 'overdue'] as (ContributionStatus | 'all')[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${statusFilter === f ? 'bg-emerald-500 text-white border-primary shadow-sm' : 'bg-white/[0.06] text-white/50 border-white/10 hover:border-primary/40'}`}
              >
                {f === 'all' ? 'All' : f === 'partially_paid' ? 'Partial' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0d1527] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {MONTH_NAMES[selectedPeriod.month - 1]} {selectedPeriod.year} — {filtered.length} member{filtered.length !== 1 ? 's' : ''}
            </h3>
            <button className="btn-outline text-xs px-4 py-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-7 h-7 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.06]/50 border-b border-white/10">
                    {['Member', 'Member No.', 'Expected', 'Paid', 'Outstanding', 'Progress', 'Status', 'Payment Date', 'Method', 'Action'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/50 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((r, i) => {
                    const pct = r.expectedAmount > 0 ? Math.round((r.amountPaid / r.expectedAmount) * 100) : 0;
                    const cfg = STATUS_CONFIG[r.contributionStatus];
                    return (
                      <tr key={r.id} className={`hover:bg-white/[0.06]/30 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.06]/10'}`}>
                        <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{r.memberName}</td>
                        <td className="px-4 py-3 text-xs text-white/50 font-mono">{r.memberNumber}</td>
                        <td className="px-4 py-3 font-tabular text-white/50">{fmt(r.expectedAmount)}</td>
                        <td className="px-4 py-3 font-tabular text-emerald-600 font-semibold">{fmt(r.amountPaid)}</td>
                        <td className="px-4 py-3 font-tabular text-red-600 font-semibold">{fmt(r.outstandingAmount)}</td>
                        <td className="px-4 py-3 w-24">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-400' : 'bg-white/[0.06]-foreground/20'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-white/50 font-tabular">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/50 whitespace-nowrap">
                          {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-white/50">{r.paymentMethod || '—'}</td>
                        <td className="px-4 py-3">
                          {r.contributionStatus !== 'paid' && (
                            <button
                              onClick={() => { setRecordModal(r); setPayAmount(String(r.outstandingAmount)); }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
