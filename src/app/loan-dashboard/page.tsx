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
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  guarantor_verification: 'bg-purple-100 text-purple-700',
  collateral_verification: 'bg-indigo-100 text-indigo-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  awaiting_processing_fee: 'bg-orange-100 text-orange-700',
  ready_for_disbursement: 'bg-teal-100 text-teal-700',
  disbursed: 'bg-cyan-100 text-cyan-700',
  active: 'bg-green-100 text-green-700',
  interest_due: 'bg-amber-100 text-amber-700',
  interest_overdue: 'bg-red-100 text-red-700',
  principal_due: 'bg-orange-100 text-orange-700',
  default: 'bg-red-200 text-red-800',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-500',
  pending: 'bg-yellow-100 text-yellow-700',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

export default function LoanDashboardPage() {
  const { user, isAdmin } = useAuth();
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
        .eq('user_id', user.id)
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
            <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Loading loan data...</p>
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
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your loan status and repayments</p>
          </div>
          <Link
            href="/loan-application"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Apply for Loan
          </Link>
        </div>

        {/* No loans state */}
        {applications.length === 0 && activeLoans.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Loans Yet</h3>
            <p className="text-sm text-gray-500 mb-6">You have not applied for any loans. Start your application today.</p>
            <Link href="/loan-application" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors">
              Apply for Loan
            </Link>
          </div>
        )}

        {/* Active Loan Card */}
        {loan && (
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide">Active Loan</p>
                <p className="text-2xl font-bold mt-1">{formatNGN(loan.principal)}</p>
                <p className="text-emerald-200 text-sm">{loan.loan_number}</p>
              </div>
              <StatusBadge status={loan.loan_status} />
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-emerald-200 mb-1.5">
                <span>Repayment Progress</span>
                <span>{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-emerald-800/50 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-emerald-200 text-xs">Amount Repaid</p>
                <p className="font-semibold">{formatNGN(loan.amount_repaid || 0)}</p>
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Outstanding Balance</p>
                <p className="font-semibold">{formatNGN(loan.outstanding_balance || 0)}</p>
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Next Repayment</p>
                <p className="font-semibold">{formatDate(loan.next_repayment_date)}</p>
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Maturity Date</p>
                <p className="font-semibold">{formatDate(loan.maturity_date)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loan KPI Cards */}
        {loan && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Original Amount', value: formatNGN(loan.principal), color: 'text-gray-900' },
              { label: 'Interest Rate', value: '10% / month', color: 'text-emerald-700' },
              { label: 'Total Interest', value: formatNGN(loan.interest_amount), color: 'text-orange-600' },
              { label: 'Total Repayable', value: formatNGN(loan.total_repayable), color: 'text-gray-900' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                <p className={`text-base font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        {(loan || applications.length > 0) && (
          <div>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'schedule', label: 'Schedule' },
                { id: 'receipts', label: 'Receipts' },
                { id: 'applications', label: 'Applications' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
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
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Monthly Interest Tracking</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Transparent view of all interest obligations</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Period</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Due Date</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Interest Due</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Paid</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Outstanding</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Default Charge</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {interestRecords.map(rec => (
                            <tr key={rec.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 font-medium text-gray-900">Month {rec.period_number}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{formatDate(rec.due_date)}</td>
                              <td className="px-4 py-3 text-right text-gray-900">{formatNGN(rec.interest_due)}</td>
                              <td className="px-4 py-3 text-right text-emerald-600">{formatNGN(rec.interest_paid)}</td>
                              <td className="px-4 py-3 text-right text-orange-600">{formatNGN(rec.interest_outstanding)}</td>
                              <td className="px-4 py-3 text-right text-red-600">{rec.default_charge > 0 ? formatNGN(rec.default_charge) : '—'}</td>
                              <td className="px-4 py-3 text-center"><StatusBadge status={rec.record_status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {interestRecords.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <p className="text-sm text-gray-500">Interest tracking will appear once the loan is disbursed.</p>
                  </div>
                )}
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Repayment Schedule</h3>
                </div>
                {repaymentSchedule.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">#</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Due Date</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Expected</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Paid</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Payment Date</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {repaymentSchedule.map(row => (
                          <tr key={row.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-gray-900">{row.instalment_number}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{formatDate(row.due_date)}</td>
                            <td className="px-4 py-3 text-right text-gray-900">{formatNGN(row.expected_amount)}</td>
                            <td className="px-4 py-3 text-right text-emerald-600">{formatNGN(row.amount_paid)}</td>
                            <td className="px-4 py-3 text-right text-gray-500">{formatDate(row.payment_date)}</td>
                            <td className="px-4 py-3 text-center"><StatusBadge status={row.schedule_status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-gray-500">
                    Repayment schedule will appear once the loan is disbursed.
                  </div>
                )}
              </div>
            )}

            {/* Receipts Tab */}
            {activeTab === 'receipts' && (
              <div className="space-y-3">
                {receipts.length > 0 ? receipts.map(receipt => (
                  <div key={receipt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{receipt.receipt_number}</p>
                        <p className="text-xs text-gray-500">{formatDate(receipt.payment_date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700">{formatNGN(receipt.amount)}</p>
                        {receipt.is_verified && (
                          <span className="text-xs text-emerald-600 font-medium">✓ Verified</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400">Interest</p>
                        <p className="font-medium text-gray-700">{formatNGN(receipt.interest_allocation)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Principal</p>
                        <p className="font-medium text-gray-700">{formatNGN(receipt.principal_allocation)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Outstanding After</p>
                        <p className="font-medium text-gray-700">{formatNGN(receipt.outstanding_balance)}</p>
                      </div>
                    </div>
                    {receipt.payment_method && (
                      <p className="text-xs text-gray-400 mt-2">Method: {receipt.payment_method}</p>
                    )}
                    {receipt.transaction_reference && (
                      <p className="text-xs text-gray-400">Ref: {receipt.transaction_reference}</p>
                    )}
                  </div>
                )) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-500">
                    No payment receipts yet.
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{app.application_number || 'Draft'}</p>
                        <p className="text-xs text-gray-500">{formatDate(app.created_at)}</p>
                      </div>
                      <StatusBadge status={app.app_status || app.application_status || 'draft'} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400">Amount</p>
                        <p className="font-semibold text-gray-800">{formatNGN(app.requested_amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Duration</p>
                        <p className="font-semibold text-gray-800">{app.duration_months} month{app.duration_months > 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Purpose</p>
                        <p className="font-semibold text-gray-800">{app.loan_purpose || '—'}</p>
                      </div>
                    </div>
                    {app.processing_fee_amount > 0 && (
                      <div className="mt-3 bg-orange-50 rounded-lg px-3 py-2 text-xs text-orange-700">
                        Processing Fee: {formatNGN(app.processing_fee_amount)} (1% of loan amount)
                      </div>
                    )}
                    {app.review_notes && (
                      <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                        Admin note: {app.review_notes}
                      </div>
                    )}
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-500">
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
