'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AppLayout from '@/components/AppLayout';
import type { Contribution, ContributionStatus } from '@/lib/types/climps';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowDownLeft,
  CreditCard,
  Building2,
  FileText,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Download,
  Info,
  ChevronRight,
  Wallet,
} from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = new Date().getFullYear();

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_CONFIG: Record<ContributionStatus, { label: string; classes: string }> = {
  paid: { label: 'Paid', classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  partially_paid: { label: 'Partial', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  unpaid: { label: 'Unpaid', classes: 'bg-white/10 text-white/60 border-white/15' },
  overdue: { label: 'Overdue', classes: 'bg-red-500/15 text-red-400 border-red-500/25' },
};

/** Build a clean 12-month schedule with no payment data for the current year */
function buildEmptyYearSchedule(memberId: string, commitment: number): Contribution[] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const isPast = month < currentMonth;
    return {
      id: `gen-${month}`,
      memberId,
      contributionMonth: month,
      contributionYear: CURRENT_YEAR,
      expectedAmount: commitment,
      amountPaid: 0,
      outstandingAmount: commitment,
      contributionStatus: isPast ? 'overdue' : 'unpaid',
      createdAt: `${CURRENT_YEAR}-${String(month).padStart(2, '0')}-01`,
      updatedAt: `${CURRENT_YEAR}-${String(month).padStart(2, '0')}-01`,
    } as Contribution;
  });
}

type StatusFilter = 'all' | ContributionStatus;

export default function MonthlyContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [memberName, setMemberName] = useState('Member');
  const [memberId, setMemberId] = useState('');
  const [internalMemberId, setInternalMemberId] = useState('');
  const [monthlyCommitment, setMonthlyCommitment] = useState(10000);

  // Pay Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMonth, setPayMonth] = useState(new Date().getMonth() + 1);
  const [payAmount, setPayAmount] = useState('10000');
  const [payMethod, setPayMethod] = useState<'wallet' | 'card' | 'transfer'>('transfer');
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [lastRef, setLastRef] = useState('');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<Contribution | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const meta = user.user_metadata;

        // Fetch member record
        const { data: m } = await supabase
          .from('members')
          .select('id, first_name, last_name, member_number, monthly_contribution')
          .eq('user_id', user.id)
          .maybeSingle();

        let resolvedMemberId = '';
        let commitment = 10000;

        if (m) {
          const fullName = `${m.first_name} ${m.last_name}`;
          setMemberName(fullName);
          setMemberId(m.member_number || 'CLM-0000');
          setInternalMemberId(m.id);
          resolvedMemberId = m.id;
          if (m.monthly_contribution) commitment = Number(m.monthly_contribution);
        } else {
          setMemberName(meta?.full_name || 'Cooperative Member');
          setMemberId(meta?.member_number || 'CLM-0000');
        }
        setMonthlyCommitment(commitment);
        setPayAmount(String(commitment));

        // Fetch real contributions for the current year
        if (resolvedMemberId) {
          const { data: dbContribs, error } = await supabase
            .from('contributions')
            .select('*')
            .eq('member_id', resolvedMemberId)
            .eq('contribution_year', CURRENT_YEAR)
            .order('contribution_month', { ascending: true });

          if (!error && dbContribs && dbContribs.length > 0) {
            // Map DB columns to our Contribution type
            const mapped: Contribution[] = dbContribs.map((c: any) => ({
              id: c.id,
              memberId: c.member_id,
              contributionMonth: c.contribution_month,
              contributionYear: c.contribution_year,
              expectedAmount: Number(c.expected_amount) || commitment,
              amountPaid: Number(c.amount_paid) || 0,
              outstandingAmount: Number(c.outstanding_amount) || 0,
              paymentDate: c.payment_date || undefined,
              paymentMethod: c.payment_method || undefined,
              transactionReference: c.transaction_reference || undefined,
              contributionStatus: c.contribution_status || 'unpaid',
              createdAt: c.created_at,
              updatedAt: c.updated_at,
            }));
            setContributions(mapped);
          } else {
            // No DB records yet — show a clean unpaid schedule
            setContributions(buildEmptyYearSchedule(resolvedMemberId, commitment));
          }
        } else {
          setContributions(buildEmptyYearSchedule('', commitment));
        }
      } catch (e) {
        console.error('Error loading contributions:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalExpected = contributions.reduce((s, c) => s + c.expectedAmount, 0);
  const totalPaid = contributions.reduce((s, c) => s + c.amountPaid, 0);
  const totalOutstanding = contributions.reduce((s, c) => s + c.outstandingAmount, 0);
  const compliancePercentage = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;

  const filtered = statusFilter === 'all' ? contributions : contributions.filter((c) => c.contributionStatus === statusFilter);

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1200));

    const ref = `TXN-CTR-${Date.now().toString().slice(-8)}`;
    setLastRef(ref);

    const amountNum = parseFloat(payAmount.replace(/,/g, '')) || monthlyCommitment;

    setContributions((prev) =>
      prev.map((c) => {
        if (c.contributionMonth === payMonth && c.contributionYear === CURRENT_YEAR) {
          return {
            ...c,
            amountPaid: amountNum,
            outstandingAmount: Math.max(0, c.expectedAmount - amountNum),
            contributionStatus: amountNum >= c.expectedAmount ? 'paid' : 'partially_paid',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod:
              payMethod === 'wallet'
                ? 'Regular Savings Wallet'
                : payMethod === 'card'
                ? 'Debit Card'
                : 'Direct Bank Transfer',
            transactionReference: ref,
          };
        }
        return c;
      })
    );

    setPaying(false);
    setPaySuccess(true);
  };

  return (
    <AppLayout role="member" memberName={memberName} memberId={memberId}>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-white/50 mb-1">
              <Link href="/savings-products" className="hover:text-emerald-400 transition-colors">
                Savings Products
              </Link>
              <span>/</span>
              <span className="text-white font-medium">Monthly Contribution</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Monthly Cooperative Contribution</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                Mandatory • 9.0% p.a.
              </span>
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Core cooperative thrift. Due by the 5th of every month. Unlocks loan multiplier and annual dividends.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/save/regular"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0d1527] hover:bg-white/[0.06] text-white font-medium text-sm shadow-sm transition-all"
            >
              <Wallet className="w-4 h-4 text-teal-600" />
              <span>Regular Savings Wallet</span>
            </Link>

            <button
              onClick={() => {
                setPaySuccess(false);
                setShowPayModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Pay Contribution</span>
            </button>
          </div>
        </div>

        {/* Bento Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Paid */}
          <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-500/10 via-card to-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Total Contributed ({CURRENT_YEAR})</span>
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{fmt(totalPaid)}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10/50">
              <span>Expected: {fmt(totalExpected)}</span>
              <span className="text-emerald-600 font-semibold">{compliancePercentage}% Compliant</span>
            </div>
          </div>

          {/* Card 2: Monthly Commitment */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1527] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Monthly Commitment</span>
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{fmt(monthlyCommitment)}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10/50">
              <span>Due Day: 5th Monthly</span>
              <span className="text-indigo-600 font-medium">4.0% monthly (min. 1 yr)</span>
            </div>
          </div>

          {/* Card 3: Loan Multiplier Eligibility */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1527] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Credit Multiplier</span>
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">{fmt(totalPaid * 2.5)}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10/50">
              <span>2.5× Savings Multiplier</span>
              <Link href="/loan-application" className="text-emerald-600 font-semibold hover:underline">
                Apply Loan
              </Link>
            </div>
          </div>

          {/* Card 4: Outstanding & Next Due */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1527] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Pending Dues</span>
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{fmt(totalOutstanding)}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10/50">
              <span>Next Due: Oct 5, 2026</span>
              <span className="text-amber-600 font-medium">October Due</span>
            </div>
          </div>
        </div>

        {/* 12-Month Annual Contribution Calendar Grid */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1527] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Annual Schedule ({CURRENT_YEAR})</span>
              </h2>
              <p className="text-xs text-white/50">
                Year-to-date monthly contribution compliance status.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Paid
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending
              </span>
              <span className="flex items-center gap-1.5 text-red-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Overdue
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {contributions.map((c) => {
              const isPaid = c.contributionStatus === 'paid';
              const isPartial = c.contributionStatus === 'partially_paid';
              return (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isPaid
                      ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                      : isPartial
                      ? 'border-amber-200 bg-amber-50/40 text-amber-900'
                      : 'border-white/10 bg-[#0d1527] text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{MONTH_NAMES[c.contributionMonth - 1]}</span>
                    {isPaid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-white/50" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] block opacity-80">
                      Paid: <strong>{fmt(c.amountPaid)}</strong>
                    </span>
                    <span className="text-[10px] block opacity-70">
                      {isPaid ? c.paymentDate : 'Due on 5th'}
                    </span>
                  </div>
                  {!isPaid && (
                    <button
                      onClick={() => {
                        setPayMonth(c.contributionMonth);
                        setPayAmount(c.expectedAmount.toString());
                        setPaySuccess(false);
                        setShowPayModal(true);
                      }}
                      className="mt-3 w-full py-1 text-[11px] font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                  {isPaid && (
                    <button
                      onClick={() => setSelectedReceipt(c)}
                      className="mt-3 w-full py-1 text-[11px] font-medium rounded-lg border border-emerald-300 bg-emerald-100/60 text-emerald-800 hover:bg-emerald-200 transition-colors"
                    >
                      Receipt
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Records Ledger */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1527] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Contribution Ledger</h2>
              <p className="text-xs text-white/50">Historical records and verification references.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'paid', 'partially_paid', 'unpaid'] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    statusFilter === f
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white/[0.06] text-white/50 border-white/10 hover:border-blue-300'
                  }`}
                >
                  {f === 'all' ? 'All Records' : f === 'partially_paid' ? 'Partial' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/50 font-semibold">
                  <th className="pb-3 pr-4">Month</th>
                  <th className="pb-3 px-4">Expected</th>
                  <th className="pb-3 px-4">Amount Paid</th>
                  <th className="pb-3 px-4">Outstanding</th>
                  <th className="pb-3 px-4">Payment Date</th>
                  <th className="pb-3 px-4">Method</th>
                  <th className="pb-3 px-4">Reference</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10/60">
                {filtered.map((c) => {
                  const cfg = STATUS_CONFIG[c.contributionStatus];
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.06]/30 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-white whitespace-nowrap">
                        {MONTH_NAMES[c.contributionMonth - 1]} {c.contributionYear}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white/50">{fmt(c.expectedAmount)}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">{fmt(c.amountPaid)}</td>
                      <td className="py-3.5 px-4 font-bold text-red-600">{fmt(c.outstandingAmount)}</td>
                      <td className="py-3.5 px-4 text-white/50">{c.paymentDate || '—'}</td>
                      <td className="py-3.5 px-4 text-white/50">{c.paymentMethod || '—'}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-white/50">
                        {c.transactionReference || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        {c.contributionStatus === 'paid' ? (
                          <button
                            onClick={() => setSelectedReceipt(c)}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] underline"
                          >
                            Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setPayMonth(c.contributionMonth);
                              setPayAmount(c.expectedAmount.toString());
                              setPaySuccess(false);
                              setShowPayModal(true);
                            }}
                            className="text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                          >
                            Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODAL: PAY CONTRIBUTION ── */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0d1527] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-blue-600" />
              <span>Pay Monthly Contribution</span>
            </h3>
            <p className="text-xs text-white/50 mb-4">
              Clear your cooperative dues for {MONTH_NAMES[payMonth - 1]} {CURRENT_YEAR}.
            </p>

            {paySuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Payment Confirmed!</h4>
                  <p className="text-xs text-white/50 mt-1">
                    Your contribution of <strong>{fmt(parseFloat(payAmount) || 0)}</strong> for{' '}
                    <strong>{MONTH_NAMES[payMonth - 1]} {CURRENT_YEAR}</strong> has been credited.
                  </p>
                  <p className="text-[11px] font-mono text-white/50 mt-2">Ref: {lastRef}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePaySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Target Month</label>
                  <select
                    value={payMonth}
                    onChange={(e) => setPayMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 bg-background font-semibold"
                  >
                    {contributions.map((c) => (
                      <option key={c.id} value={c.contributionMonth}>
                        {MONTH_NAMES[c.contributionMonth - 1]} {CURRENT_YEAR} (
                        {c.contributionStatus === 'paid' ? 'Paid' : `Outstanding ${fmt(c.outstandingAmount)}`})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Amount to Pay (₦)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                  <span className="text-[11px] text-white/50 mt-1 block">
                    Standard monthly contribution is {fmt(monthlyCommitment)}.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-2">Payment Source</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'transfer', label: 'Bank Transfer', icon: Building2 },
                      { id: 'wallet', label: 'Savings Wallet', icon: Wallet },
                      { id: 'card', label: 'Debit Card', icon: CreditCard },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPayMethod(opt.id as any)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between text-xs transition-all ${
                          payMethod === opt.id
                            ? 'border-blue-600 bg-blue-50/50 text-blue-800 font-semibold'
                            : 'border-white/10 bg-[#0d1527] text-white/50 hover:text-white'
                        }`}
                      >
                        <opt.icon className="w-4 h-4 mb-2" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {payMethod === 'transfer' && (
                  <div className="p-3.5 rounded-xl bg-white/[0.06]/60 border border-white/10 text-xs space-y-1.5">
                    <span className="font-semibold text-white block">Direct Bank Transfer Details</span>
                    <div className="flex justify-between text-white/50">
                      <span>Bank:</span>
                      <span className="font-medium text-white">Wema Bank (Moniepoint)</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Account Number:</span>
                      <span className="font-mono font-bold text-white">9948201844</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Account Name:</span>
                      <span className="font-medium text-white">CLIMPS - {memberName}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-medium hover:bg-white/[0.06]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paying}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {paying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <span>Complete Payment</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: RECEIPT PREVIEW ── */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0d1527] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-scale-up">
            <div className="border-b border-white/10 pb-4 mb-4 text-center">
              <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Changing Lives Multipurpose Ventures</div>
              <h3 className="text-base font-extrabold text-white mt-1">Official Contribution Receipt</h3>
              <p className="text-[11px] text-white/50">Reference: {selectedReceipt.transactionReference}</p>
            </div>

            <div className="space-y-2.5 text-xs py-2">
              <div className="flex justify-between">
                <span className="text-white/50">Member:</span>
                <span className="font-semibold text-white">{memberName} ({memberId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Contribution Period:</span>
                <span className="font-semibold text-white">
                  {MONTH_NAMES[selectedReceipt.contributionMonth - 1]} {selectedReceipt.contributionYear}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Amount Paid:</span>
                <span className="font-bold text-emerald-600">{fmt(selectedReceipt.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Payment Date:</span>
                <span className="font-medium text-white">{selectedReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Payment Channel:</span>
                <span className="font-medium text-white">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Status:</span>
                <span className="font-semibold text-emerald-600 uppercase">Verified / Confirmed</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 text-xs rounded-xl border border-white/10 hover:bg-white/[0.06] font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 text-xs rounded-xl bg-emerald-500 hover:bg-emerald-500/90 text-white font-medium flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
