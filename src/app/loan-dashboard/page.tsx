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
  draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  submitted: 'bg-blue-50 text-blue-700 border border-blue-200',
  under_review: 'bg-amber-50 text-amber-700 border border-amber-200',
  guarantor_verification: 'bg-purple-50 text-purple-700 border border-purple-200',
  collateral_verification: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
  awaiting_processing_fee: 'bg-orange-50 text-orange-700 border border-orange-200',
  ready_for_disbursement: 'bg-teal-50 text-teal-700 border border-teal-200',
  disbursed: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold',
  interest_due: 'bg-amber-50 text-amber-700 border border-amber-300 font-bold',
  interest_overdue: 'bg-rose-50 text-rose-700 border border-rose-300 font-bold',
  principal_due: 'bg-orange-50 text-orange-700 border border-orange-300 font-bold',
  default: 'bg-rose-100 text-rose-800 border border-rose-300 font-bold',
  completed: 'bg-slate-100 text-slate-700 border border-slate-200',
  cancelled: 'bg-slate-100 text-slate-500 border border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 border border-slate-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

export default function LoanDashboardPage() {
  const { user, loading: authLoading } = useAuth();
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

    function onStorage() {
      loadData();
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      // Get member
      let memberId: string | null = null;
      try {
        const { data: memberData } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user?.id)
          .maybeSingle();
        memberId = memberData?.id || null;
      } catch {}

      // 1. Load loan applications from Supabase
      let fetchedApps: any[] = [];
      try {
        if (memberId) {
          const { data: appsByMem } = await supabase
            .from('loan_applications')
            .select('*')
            .eq('member_id', memberId)
            .order('created_at', { ascending: false });
          if (appsByMem) fetchedApps.push(...appsByMem);
        }
        if (user?.id) {
          const { data: appsByUsr } = await supabase
            .from('loan_applications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (appsByUsr) fetchedApps.push(...appsByUsr);
        }
      } catch (appErr) {
        console.warn('Error fetching apps:', appErr);
      }

      // Merge with localStorage applications
      let localApps: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('climps_loan_applications');
          if (stored) localApps = JSON.parse(stored);
        } catch {}
      }

      const appMap = new Map<string, any>();
      fetchedApps.forEach((a: any) => appMap.set(a.id || a.application_number, a));
      localApps.forEach((a: any) => {
        if ((user?.id && a.user_id === user.id) || (memberId && a.member_id === memberId)) {
          const key = a.id || a.application_number;
          if (!appMap.has(key)) appMap.set(key, a);
          else {
            // merge updated status if local is newer
            const existing = appMap.get(key);
            if (['disbursed', 'approved', 'rejected'].includes(a.app_status || a.application_status)) {
              appMap.set(key, { ...existing, ...a });
            }
          }
        }
      });

      const finalApps = Array.from(appMap.values()).sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setApplications(finalApps);

      // 2. Load active loans from Supabase
      let fetchedLoans: any[] = [];
      try {
        if (memberId) {
          const { data: loansByMem } = await supabase
            .from('loans')
            .select('*')
            .eq('member_id', memberId)
            .in('loan_status', ['active', 'disbursed', 'overdue'])
            .order('created_at', { ascending: false });
          if (loansByMem) fetchedLoans.push(...loansByMem);
        }
        if (user?.id) {
          const { data: loansByUsr } = await supabase
            .from('loans')
            .select('*')
            .eq('user_id', user.id)
            .in('loan_status', ['active', 'disbursed', 'overdue'])
            .order('created_at', { ascending: false });
          if (loansByUsr) fetchedLoans.push(...loansByUsr);
        }
      } catch (loanErr) {
        console.warn('Error fetching loans:', loanErr);
      }

      // Merge with localStorage active loans
      if (typeof window !== 'undefined') {
        try {
          const storedLoans = JSON.parse(localStorage.getItem('climps_active_loans') || '[]');
          storedLoans.forEach((l: any) => {
            if ((user?.id && l.user_id === user.id) || (memberId && l.member_id === memberId)) {
              fetchedLoans.push(l);
            }
          });
        } catch {}
      }

      // Also check if latest application was disbursed
      if (fetchedLoans.length === 0 && finalApps.length > 0) {
        const latest = finalApps[0];
        if (['disbursed', 'active'].includes(latest.app_status || latest.application_status)) {
          const principal = Number(latest.requested_amount || latest.loan_amount || 0);
          const months = Number(latest.loan_duration_months || latest.duration_months || 1);
          const totalRepayable = Number(latest.total_repayment_amount) || Math.round(principal + principal * 0.1 * months);
          fetchedLoans.push({
            id: 'loan_' + latest.id,
            loan_number: `CLMV/FACILITY/${new Date().getFullYear()}/${latest.application_number?.split('/')?.pop() || '0101'}`,
            principal,
            interest_amount: Math.round(principal * 0.1 * months),
            total_repayable: totalRepayable,
            amount_repaid: 0,
            outstanding_balance: totalRepayable,
            repayment_amount: Math.round(totalRepayable / months),
            loan_status: 'active',
            next_repayment_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            maturity_date: new Date(Date.now() + months * 30 * 86400000).toISOString().split('T')[0],
          });
        }
      }

      setActiveLoans(fetchedLoans);

      if (fetchedLoans.length > 0) {
        const loan = fetchedLoans[0];
        setSelectedLoan(loan);

        // Load repayment schedule
        try {
          const { data: schedule } = await supabase
            .from('loan_repayment_schedules')
            .select('*')
            .eq('loan_id', loan.id)
            .order('instalment_number', { ascending: true });
          setRepaymentSchedule(schedule || []);
        } catch {
          setRepaymentSchedule([]);
        }

        // Load interest records
        try {
          const { data: interest } = await supabase
            .from('loan_interest_records')
            .select('*')
            .eq('loan_id', loan.id)
            .order('period_number', { ascending: true });
          setInterestRecords(interest || []);
        } catch {
          setInterestRecords([]);
        }

        // Load receipts
        try {
          const { data: rec } = await supabase
            .from('loan_receipts')
            .select('*')
            .eq('loan_id', loan.id)
            .order('created_at', { ascending: false });
          setReceipts(rec || []);
        } catch {
          setReceipts([]);
        }
      } else {
        setSelectedLoan(null);
        if (finalApps.length > 0) {
          setActiveTab('applications');
        }
      }
    } catch (err) {
      console.error('Error loading loan data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In Required</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            You must be signed in with your cooperative account to view your loans and repayment schedule.
          </p>
          <div className="space-y-3">
            <Link
              href="/login?redirect=/loan-dashboard"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-600/20"
            >
              Sign In to Continue
            </Link>
            <Link
              href="/landing"
              className="block w-full py-2.5 px-4 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-slate-500">Loading loan data...</p>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              Credit & Loans Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Loans</h1>
            <p className="text-sm text-slate-500 mt-1">Track your active credit facilities, interest obligations, and schedules</p>
          </div>
          <Link
            href="/loan-application"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold text-sm hover:from-rose-500 hover:to-rose-600 transition-all shadow-md shadow-rose-600/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Apply for Loan
          </Link>
        </div>

        {/* No loans state */}
        {applications.length === 0 && activeLoans.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Loans</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              You do not have any active loans or submitted applications. Personal loans are available at 10% monthly interest.
            </p>
            <Link
              href="/loan-application"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all shadow-md shadow-rose-600/20"
            >
              Start Loan Application
            </Link>
          </div>
        )}

        {/* Pending / Approved Application Hero Banner */}
        {!loan && applications.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 text-slate-900 bg-white border border-amber-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold tracking-wider uppercase border ${
                    applications[0].app_status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {applications[0].app_status === 'approved' ? '✓ Approved — Payout Queued' : '⏳ Application Under Review'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{applications[0].application_number}</span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {formatNGN(applications[0].loan_amount || applications[0].requested_amount)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fast Express Loan · {applications[0].loan_duration_months || applications[0].duration_months} Months · 10% monthly interest
                </p>
              </div>
              <div>
                <StatusBadge status={applications[0].app_status || applications[0].application_status || 'pending'} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              {applications[0].app_status === 'approved' ? (
                <p className="text-emerald-800 font-medium">
                  🎉 <strong>Your loan was approved by Admin!</strong> The CLIMPS Finance Desk (Accountant) has been notified to disburse your funds to <strong>{applications[0].bank_name} ({applications[0].account_number})</strong>. It will show as Active once payment is confirmed.
                </p>
              ) : (
                <p>
                  Your application is currently <strong>Pending Admin Review</strong>. Once the credit team verifies your collateral, the Accountant will receive an approval notification to release your funds.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Active Loan Hero Card */}
        {loan && (
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 text-slate-900 bg-white border border-rose-200 shadow-xs">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-50/70 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200">
                      Active Facility
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{loan.loan_number}</span>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatNGN(loan.principal)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Personal Loan · 10% monthly interest</p>
                </div>
                <div>
                  <StatusBadge status={loan.loan_status} />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-700 mb-2">
                  <span className="font-semibold">Repayment Progress</span>
                  <span className="font-bold text-emerald-600">{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-4 border-t border-slate-100">
                <div>
                  <p className="text-slate-500 text-xs font-medium">Amount Repaid</p>
                  <p className="font-bold text-emerald-600 text-base mt-0.5">{formatNGN(loan.amount_repaid || 0)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium">Outstanding Balance</p>
                  <p className="font-bold text-rose-600 text-base mt-0.5">{formatNGN(loan.outstanding_balance || 0)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium">Next Repayment</p>
                  <p className="font-bold text-slate-900 text-base mt-0.5">{formatDate(loan.next_repayment_date)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium">Maturity Date</p>
                  <p className="font-bold text-slate-900 text-base mt-0.5">{formatDate(loan.maturity_date)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loan KPI Cards */}
        {loan && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Principal', value: formatNGN(loan.principal), color: 'text-slate-900' },
              { label: 'Monthly Rate', value: '10% / month', color: 'text-emerald-700' },
              { label: 'Total Interest', value: formatNGN(loan.interest_amount), color: 'text-rose-600' },
              { label: 'Total Repayable', value: formatNGN(loan.total_repayable), color: 'text-slate-900' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                <p className={`text-base sm:text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        {(loan || applications.length > 0) && (
          <div>
            <div className="flex gap-2 bg-slate-100/90 rounded-xl p-1.5 border border-slate-200 mb-5 overflow-x-auto">
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
                      ? 'bg-white text-blue-700 border border-blue-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent'
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
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">Monthly Interest Tracking</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Transparent schedule of all 10% monthly interest obligations</p>
                      </div>
                      <span className="text-2xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        10% Monthly
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
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
                        <tbody className="divide-y divide-slate-100">
                          {interestRecords.map(rec => (
                            <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-slate-900">Month {rec.period_number}</td>
                              <td className="px-4 py-3 text-right text-slate-600">{formatDate(rec.due_date)}</td>
                              <td className="px-4 py-3 text-right text-slate-900 font-medium">{formatNGN(rec.interest_due)}</td>
                              <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatNGN(rec.interest_paid)}</td>
                              <td className="px-4 py-3 text-right text-rose-600 font-medium">{formatNGN(rec.interest_outstanding)}</td>
                              <td className="px-4 py-3 text-right text-rose-600 font-medium">{rec.default_charge > 0 ? formatNGN(rec.default_charge) : '—'}</td>
                              <td className="px-4 py-3 text-center"><StatusBadge status={rec.record_status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {interestRecords.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
                    <p className="text-sm text-slate-500">Interest tracking will appear once the loan is disbursed.</p>
                  </div>
                )}
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-base">Repayment Schedule</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Detailed breakdown of expected instalments and payments</p>
                </div>
                {repaymentSchedule.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold">#</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold">Due Date</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold">Expected</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold">Paid</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold">Payment Date</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {repaymentSchedule.map(row => (
                          <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-900">{row.instalment_number}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{formatDate(row.due_date)}</td>
                            <td className="px-4 py-3 text-right text-slate-900 font-medium">{formatNGN(row.expected_amount)}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatNGN(row.amount_paid)}</td>
                            <td className="px-4 py-3 text-right text-slate-500">{formatDate(row.payment_date)}</td>
                            <td className="px-4 py-3 text-center"><StatusBadge status={row.schedule_status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Repayment schedule will appear once the loan is disbursed.
                  </div>
                )}
              </div>
            )}

            {/* Receipts Tab */}
            {activeTab === 'receipts' && (
              <div className="space-y-3">
                {receipts.length > 0 ? receipts.map(receipt => (
                  <div key={receipt.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-900 text-base">{receipt.receipt_number}</p>
                        <p className="text-xs text-slate-500">{formatDate(receipt.payment_date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 text-lg">{formatNGN(receipt.amount)}</p>
                        {receipt.is_verified && (
                          <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ Verified</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-slate-500">Interest Allocation</p>
                        <p className="font-semibold text-slate-900 mt-0.5">{formatNGN(receipt.interest_allocation)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Principal Allocation</p>
                        <p className="font-semibold text-slate-900 mt-0.5">{formatNGN(receipt.principal_allocation)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Balance After</p>
                        <p className="font-semibold text-emerald-600 mt-0.5">{formatNGN(receipt.outstanding_balance)}</p>
                      </div>
                    </div>
                    {receipt.payment_method && (
                      <p className="text-xs text-slate-500 mt-2">Payment Method: {receipt.payment_method}</p>
                    )}
                    {receipt.transaction_reference && (
                      <p className="text-xs text-slate-400">Reference: {receipt.transaction_reference}</p>
                    )}
                  </div>
                )) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 shadow-xs">
                    No payment receipts yet.
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-900 text-base">{app.application_number || 'Draft Application'}</p>
                        <p className="text-xs text-slate-500">{formatDate(app.created_at)}</p>
                      </div>
                      <StatusBadge status={app.app_status || app.application_status || 'draft'} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-slate-500">Amount</p>
                        <p className="font-bold text-slate-900 mt-0.5">{formatNGN(app.requested_amount || app.loan_amount)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Tenure</p>
                        <p className="font-bold text-slate-900 mt-0.5">
                          {app.duration_months || app.loan_duration_months} month{(app.duration_months || app.loan_duration_months) > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Purpose</p>
                        <p className="font-semibold text-slate-800 mt-0.5 truncate">{app.loan_purpose || 'Personal Loan'}</p>
                      </div>
                    </div>
                    {app.collateral_type && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
                        <span className="text-slate-500">
                          Collateral: <strong className="text-slate-700 capitalize">{(app.collateral_type || 'Cheque / Asset').replace(/_/g, ' ')}</strong>
                        </span>
                        {app.disbursement_reference && (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-2xs">
                            ✓ Payout Confirmed: {app.disbursement_reference}
                          </span>
                        )}
                      </div>
                    )}
                    {app.processing_fee_amount > 0 && (
                      <div className="mt-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-rose-700 font-medium">
                        Processing Fee: {formatNGN(app.processing_fee_amount)} (1% mandatory fee)
                      </div>
                    )}
                    {app.review_notes && (
                      <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700">
                        <span className="text-blue-700 font-semibold">Admin note: </span>{app.review_notes}
                      </div>
                    )}
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 shadow-xs">
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
