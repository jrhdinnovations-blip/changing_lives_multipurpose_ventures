'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';

function formatNGN(val: number) {
  return '₦' + (val || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-white/10 text-white/70 border border-white/15',
  submitted: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  under_review: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  guarantor_verification: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
  collateral_verification: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
  approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/25',
  awaiting_processing_fee: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  ready_for_disbursement: 'bg-teal-500/15 text-teal-400 border border-teal-500/25',
  disbursed: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
  active: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  interest_due: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  interest_overdue: 'bg-red-500/20 text-red-400 border border-red-500/30',
  principal_due: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  default: 'bg-red-950/80 text-red-300 border border-red-500/40',
  completed: 'bg-white/10 text-white/70 border border-white/15',
  cancelled: 'bg-white/5 text-white/50 border border-white/10',
  pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || 'bg-white/10 text-white/70 border border-white/15';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

export default function LoanDashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [repaymentSchedule, setRepaymentSchedule] = useState<any[]>([]);
  const [interestRecords, setInterestRecords] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'receipts' | 'applications'>('overview');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      // Get member
      const { data: memberData } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user?.id)
        .single();
      const memberId = memberData?.id;

      if (memberId) {
        // Load loan applications
        const { data: apps } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('member_id', memberId)
          .order('created_at', { ascending: false });
        setApplications(apps || []);

        // Load active loans
        const { data: loans } = await supabase
          .from('loans')
          .select('*')
          .eq('member_id', memberId)
          .in('loan_status', ['active', 'disbursed', 'overdue'])
          .order('created_at', { ascending: false });
        setActiveLoans(loans || []);

        if (loans && loans.length > 0) {
          const loan = loans[0];
          setSelectedLoan(loan);

          // Load repayment schedule
          const { data: schedule } = await supabase
            .from('loan_repayment_schedules')
            .select('*')
            .eq('loan_id', loan.id)
            .order('instalment_number', { ascending: true });
          setRepaymentSchedule(schedule || []);

          // Load interest records
          const { data: interest } = await supabase
            .from('loan_interest_records')
            .select('*')
            .eq('loan_id', loan.id)
            .order('period_number', { ascending: true });
          setInterestRecords(interest || []);

          // Load receipts
          const { data: rec } = await supabase
            .from('loan_receipts')
            .select('*')
            .eq('loan_id', loan.id)
            .order('created_at', { ascending: false });
          setReceipts(rec || []);
        }
      }
    } catch (err) {
      console.error('Error loading loan data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-white/60">Loading loan data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const loan = selectedLoan;
  const progressPercent = loan
    ? Math.min(100, ((loan.amount_repaid || 0) / (loan.total_repayable || 1)) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Credit Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Loans</h1>
            <p className="text-sm text-white/60 mt-1">Track your active credit facilities, interest obligations, and schedules</p>
          </div>
          <Link
            href="/loan-application"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Apply for Loan
          </Link>
        </div>

        {/* No loans state */}
        {applications.length === 0 && activeLoans.length === 0 && (
          <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-12 text-center shadow-xl">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Loans</h3>
            <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
              You do not have any active loans or submitted applications. Personal loans are available at 10% monthly interest.
            </p>
            <Link
              href="/loan-application"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
            >
              Start Loan Application
            </Link>
          </div>
        )}

        {/* Active Loan Hero Card */}
        {loan && (
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 text-white bg-gradient-to-br from-[#0d1e38] via-[#0d1527] to-[#0a2327] border border-emerald-500/30 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active Facility
                    </span>
                    <span className="text-xs text-white/50 font-mono">{loan.loan_number}</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white tracking-tight">{formatNGN(loan.principal)}</p>
                  <p className="text-xs text-white/60 mt-0.5">Personal Loan · 10% monthly interest</p>
                </div>
                <div>
                  <StatusBadge status={loan.loan_status} />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 bg-white/[0.04] p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs text-white/80 mb-2">
                  <span className="font-medium">Repayment Progress</span>
                  <span className="font-bold text-emerald-400">{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-2 border-t border-white/10">
                <div>
                  <p className="text-white/50 text-xs">Amount Repaid</p>
                  <p className="font-bold text-emerald-400 text-base mt-0.5">{formatNGN(loan.amount_repaid || 0)}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">Outstanding Balance</p>
                  <p className="font-bold text-amber-400 text-base mt-0.5">{formatNGN(loan.outstanding_balance || 0)}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">Next Repayment</p>
                  <p className="font-bold text-white text-base mt-0.5">{formatDate(loan.next_repayment_date)}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">Maturity Date</p>
                  <p className="font-bold text-white text-base mt-0.5">{formatDate(loan.maturity_date)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loan KPI Cards */}
        {loan && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Principal', value: formatNGN(loan.principal), color: 'text-white' },
              { label: 'Monthly Rate', value: '10% / month', color: 'text-emerald-400' },
              { label: 'Total Interest', value: formatNGN(loan.interest_amount), color: 'text-amber-400' },
              { label: 'Total Repayable', value: formatNGN(loan.total_repayable), color: 'text-white' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-[#0d1527] rounded-xl border border-white/10 p-4">
                <p className="text-xs text-white/50 mb-1">{kpi.label}</p>
                <p className={`text-base sm:text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        {(loan || applications.length > 0) && (
          <div>
            <div className="flex gap-2 bg-[#0d1527] rounded-xl p-1.5 border border-white/10 mb-5 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'schedule', label: 'Schedule' },
                { id: 'receipts', label: 'Receipts' },
                { id: 'applications', label: 'Applications' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && loan && (
              <div className="space-y-4">
                {/* Interest Records */}
                {interestRecords.length > 0 && (
                  <div className="bg-[#0d1527] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                    <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base">Monthly Interest Tracking</h3>
                        <p className="text-xs text-white/60 mt-0.5">Transparent schedule of all 10% monthly interest obligations</p>
                      </div>
                      <span className="text-2xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        10% Monthly
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white/[0.03] border-b border-white/10 text-white/60">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold">Period</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold">Due Date</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold">Interest Due</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold">Paid</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold">Outstanding</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold">Default Charge</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {interestRecords.map(rec => (
                            <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3 font-semibold text-white">Month {rec.period_number}</td>
                              <td className="px-4 py-3 text-right text-white/70">{formatDate(rec.due_date)}</td>
                              <td className="px-4 py-3 text-right text-white font-medium">{formatNGN(rec.interest_due)}</td>
                              <td className="px-4 py-3 text-right text-emerald-400 font-medium">{formatNGN(rec.interest_paid)}</td>
                              <td className="px-4 py-3 text-right text-amber-400 font-medium">{formatNGN(rec.interest_outstanding)}</td>
                              <td className="px-4 py-3 text-right text-red-400 font-medium">{rec.default_charge > 0 ? formatNGN(rec.default_charge) : '—'}</td>
                              <td className="px-4 py-3 text-center"><StatusBadge status={rec.record_status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {interestRecords.length === 0 && (
                  <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-8 text-center">
                    <p className="text-sm text-white/50">Interest tracking will appear once the loan is disbursed.</p>
                  </div>
                )}
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="bg-[#0d1527] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                <div className="px-5 py-4 border-b border-white/10">
                  <h3 className="font-bold text-white text-base">Repayment Schedule</h3>
                  <p className="text-xs text-white/60 mt-0.5">Detailed breakdown of expected instalments and payments</p>
                </div>
                {repaymentSchedule.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/[0.03] border-b border-white/10 text-white/60">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold">#</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold">Due Date</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold">Expected</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold">Paid</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold">Payment Date</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {repaymentSchedule.map(row => (
                          <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 font-semibold text-white">{row.instalment_number}</td>
                            <td className="px-4 py-3 text-right text-white/70">{formatDate(row.due_date)}</td>
                            <td className="px-4 py-3 text-right text-white font-medium">{formatNGN(row.expected_amount)}</td>
                            <td className="px-4 py-3 text-right text-emerald-400 font-medium">{formatNGN(row.amount_paid)}</td>
                            <td className="px-4 py-3 text-right text-white/50">{formatDate(row.payment_date)}</td>
                            <td className="px-4 py-3 text-center"><StatusBadge status={row.schedule_status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-white/50">
                    Repayment schedule will appear once the loan is disbursed.
                  </div>
                )}
              </div>
            )}

            {/* Receipts Tab */}
            {activeTab === 'receipts' && (
              <div className="space-y-3">
                {receipts.length > 0 ? receipts.map(receipt => (
                  <div key={receipt.id} className="bg-[#0d1527] rounded-2xl border border-white/10 p-5 shadow-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white text-base">{receipt.receipt_number}</p>
                        <p className="text-xs text-white/50">{formatDate(receipt.payment_date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400 text-lg">{formatNGN(receipt.amount)}</p>
                        {receipt.is_verified && (
                          <span className="text-xs text-emerald-400 font-medium">✓ Verified</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div>
                        <p className="text-white/40">Interest Allocation</p>
                        <p className="font-semibold text-white mt-0.5">{formatNGN(receipt.interest_allocation)}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Principal Allocation</p>
                        <p className="font-semibold text-white mt-0.5">{formatNGN(receipt.principal_allocation)}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Balance After</p>
                        <p className="font-semibold text-emerald-400 mt-0.5">{formatNGN(receipt.outstanding_balance)}</p>
                      </div>
                    </div>
                    {receipt.payment_method && (
                      <p className="text-xs text-white/50 mt-2">Payment Method: {receipt.payment_method}</p>
                    )}
                    {receipt.transaction_reference && (
                      <p className="text-xs text-white/40">Reference: {receipt.transaction_reference}</p>
                    )}
                  </div>
                )) : (
                  <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-8 text-center text-sm text-white/50">
                    No payment receipts yet.
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="bg-[#0d1527] rounded-2xl border border-white/10 p-5 shadow-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white text-base">{app.application_number || 'Draft Application'}</p>
                        <p className="text-xs text-white/50">{formatDate(app.created_at)}</p>
                      </div>
                      <StatusBadge status={app.app_status || app.application_status || 'draft'} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div>
                        <p className="text-white/40">Amount</p>
                        <p className="font-bold text-white mt-0.5">{formatNGN(app.requested_amount)}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Tenure</p>
                        <p className="font-bold text-white mt-0.5">{app.duration_months} month{app.duration_months > 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Purpose</p>
                        <p className="font-semibold text-white/80 mt-0.5">{app.loan_purpose || '—'}</p>
                      </div>
                    </div>
                    {app.processing_fee_amount > 0 && (
                      <div className="mt-3 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2 text-xs text-orange-300">
                        Processing Fee: {formatNGN(app.processing_fee_amount)} (1% mandatory fee)
                      </div>
                    )}
                    {app.review_notes && (
                      <div className="mt-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70">
                        <span className="text-emerald-400 font-semibold">Admin note: </span>{app.review_notes}
                      </div>
                    )}
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-8 text-center text-sm text-white/50">
                    No loan applications found.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
