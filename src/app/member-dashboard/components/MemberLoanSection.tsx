'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { CreditCard, Calendar, ChevronRight, PlusCircle, Clock, AlertCircle, CheckCircle2, ShieldCheck, Banknote } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MemberLoanSectionProps {
  member?: any;
}

function fmt(n: number) {
  return '₦' + (n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MemberLoanSection({ member: memberProp }: MemberLoanSectionProps) {
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [latestApplication, setLatestApplication] = useState<any>(null);
  const [recentRepayments, setRecentRepayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    loadLoanData();

    function onStorage() {
      loadLoanData();
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user, memberProp]);

  async function loadLoanData() {
    setLoading(true);
    try {
      let member = memberProp;
      if (!member && user) {
        const { data } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        member = data;

        if (!member && user.email) {
          const { data: byEmail } = await supabase
            .from('members')
            .select('*')
            .ilike('email', user.email)
            .maybeSingle();
          member = byEmail;
        }
      }

      // Check active loan in Supabase
      let foundLoan: any = null;
      if (member?.id) {
        const { data: loans } = await supabase
          .from('loans')
          .select('*, product:loan_products(*)')
          .eq('member_id', member.id)
          .in('loan_status', ['active', 'disbursed', 'overdue'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (loans && loans.length > 0) {
          foundLoan = loans[0];
        }
      }

      // Fallback: check active loan by user_id
      if (!foundLoan && user?.id) {
        const { data: loansByUserId } = await supabase
          .from('loans')
          .select('*')
          .eq('user_id', user.id)
          .in('loan_status', ['active', 'disbursed', 'overdue'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (loansByUserId && loansByUserId.length > 0) {
          foundLoan = loansByUserId[0];
        }
      }

      // Fallback: check localStorage for active loan
      if (!foundLoan && typeof window !== 'undefined') {
        try {
          const storedLoans = JSON.parse(localStorage.getItem('climps_active_loans') || '[]');
          if (storedLoans.length > 0) {
            const match = storedLoans.find((l: any) =>
              (member?.id && l.member_id === member.id) ||
              (user?.id && l.user_id === user.id) ||
              (user?.email && l.applicant_email === user.email)
            );
            if (match) foundLoan = match;
          }
        } catch {}
      }

      // Fetch loan applications (for pending, approved, or recently disbursed state)
      let foundApp: any = null;
      const appQueries: any[] = [];

      if (member?.id) {
        const { data: appsByMember } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('member_id', member.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (appsByMember && appsByMember.length > 0) appQueries.push(appsByMember[0]);
      }

      if (user?.id) {
        const { data: appsByUser } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (appsByUser && appsByUser.length > 0) appQueries.push(appsByUser[0]);
      }

      // Also check localStorage applications
      if (typeof window !== 'undefined') {
        try {
          const storedApps = JSON.parse(localStorage.getItem('climps_loan_applications') || '[]');
          if (storedApps.length > 0) {
            const userApps = storedApps.filter((a: any) =>
              (user?.id && a.user_id === user.id) ||
              (member?.id && a.member_id === member.id)
            );
            if (userApps.length > 0) appQueries.push(userApps[0]);
          }
        } catch {}
      }

      if (appQueries.length > 0) {
        // Sort by created_at or take the most recent
        appQueries.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        foundApp = appQueries[0];
        setLatestApplication(foundApp);
      } else {
        setLatestApplication(null);
      }

      // If application is marked disbursed, but foundLoan was not in Supabase yet, synthesize active loan
      if (!foundLoan && foundApp && ['disbursed', 'active'].includes(foundApp.app_status || foundApp.application_status)) {
        const principal = Number(foundApp.requested_amount || foundApp.loan_amount || 0);
        const months = Number(foundApp.loan_duration_months || foundApp.duration_months || 1);
        const totalRepayable = Number(foundApp.total_repayment_amount) || Math.round(principal + principal * 0.1 * months);
        foundLoan = {
          id: 'loan_' + foundApp.id,
          loan_number: `CLMV/FACILITY/${new Date().getFullYear()}/${foundApp.application_number?.split('/')?.pop() || '0101'}`,
          principal,
          total_repayable: totalRepayable,
          amount_repaid: 0,
          outstanding_balance: totalRepayable,
          repayment_amount: Math.round(totalRepayable / months),
          loan_status: 'active',
          next_repayment_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          is_recently_disbursed: true,
        };
      }

      setActiveLoan(foundLoan);

      // Load repayments if active loan exists
      if (foundLoan && foundLoan.id && !foundLoan.is_recently_disbursed) {
        const { data: schedules } = await supabase
          .from('loan_repayment_schedules')
          .select('*')
          .eq('loan_id', foundLoan.id)
          .eq('schedule_status', 'paid')
          .order('instalment_number', { ascending: false })
          .limit(4);

        if (schedules && schedules.length > 0) {
          setRecentRepayments(schedules);
        } else if (member?.id) {
          const { data: txns } = await supabase
            .from('transactions')
            .select('*')
            .eq('member_id', member.id)
            .eq('transaction_type', 'loan_repayment')
            .order('created_at', { ascending: false })
            .limit(4);
          setRecentRepayments(txns || []);
        }
      } else {
        setRecentRepayments([]);
      }
    } catch (e) {
      console.error('Error loading loan section:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="card-base animate-pulse space-y-4">
        <div className="h-6 w-32 bg-white/10 rounded-lg" />
        <div className="h-40 bg-white/10 rounded-2xl" />
      </div>
    );
  }

  // CASE 1: Active or Disbursed Loan View
  if (activeLoan) {
    const principal = Number(activeLoan.principal) || 0;
    const totalRepayable = Number(activeLoan.total_repayable) || principal;
    const amountRepaid = Number(activeLoan.amount_repaid) || 0;
    const outstanding = Number(activeLoan.outstanding_balance) || (totalRepayable - amountRepaid);
    const repaymentPct = totalRepayable > 0 ? Math.min(100, Math.round((amountRepaid / totalRepayable) * 100)) : 0;
    const monthlyInstalment = Number(activeLoan.repayment_amount) || Math.round(totalRepayable / 6);
    const productName = activeLoan.product?.name || 'Fast Express Personal Loan';
    const loanRef = activeLoan.loan_number || 'LN-REF';

    const nextDueDate = activeLoan.next_repayment_date
      ? new Date(activeLoan.next_repayment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'In 30 days';

    return (
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Active Loan</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-500/15 text-[#00E599] border border-emerald-500/30">
              <CheckCircle2 size={11} />
              <span>Disbursed & Successful</span>
            </span>
          </div>
          <Link
            href="/loan-dashboard"
            className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
          >
            Loan Details <ChevronRight size={13} />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-[#0D182E] to-[#070D1E] border border-emerald-500/30 rounded-2xl p-4 mb-4 backdrop-blur-md">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={16} className="text-[#00E599]" />
                <p className="text-sm font-bold text-white">{productName}</p>
                <Badge variant="disbursed">Active</Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono font-semibold">{loanRef}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium">Outstanding Balance</p>
              <p className="text-xl font-black text-[#00E599] font-tabular">{fmt(outstanding)}</p>
            </div>
          </div>

          {/* Repayment progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-slate-400">Repayment Progress</p>
              <p className="text-xs font-bold text-[#00E599] font-tabular">{repaymentPct}% paid</p>
            </div>
            <div className="progress-bar-bg h-2.5">
              <div
                className="bg-[#00E599] h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${repaymentPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-400 font-medium">
              <span className="font-tabular">{fmt(amountRepaid)} repaid</span>
              <span className="font-tabular">{fmt(totalRepayable)} total</span>
            </div>
          </div>

          {/* Key details row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
            <div>
              <p className="text-2xs text-slate-400 font-semibold">Principal Borrowed</p>
              <p className="text-xs font-bold text-white mt-0.5 font-tabular">{fmt(principal)}</p>
            </div>
            <div>
              <p className="text-2xs text-slate-400 font-semibold">Monthly Instalment (10% rate)</p>
              <p className="text-xs font-bold text-white mt-0.5 font-tabular">{fmt(monthlyInstalment)}</p>
            </div>
            <div>
              <p className="text-2xs text-slate-400 font-semibold">Next Due Date</p>
              <p className="text-xs font-bold text-white mt-0.5">{nextDueDate}</p>
            </div>
          </div>
        </div>

        {/* Action Link */}
        <div className="flex justify-between items-center text-xs pt-1">
          <span className="text-slate-400">Disbursed directly to your verified bank account</span>
          <Link
            href="/loan-dashboard"
            className="text-xs font-bold text-[#00E599] hover:underline flex items-center gap-1"
          >
            View Full Schedule →
          </Link>
        </div>
      </div>
    );
  }

  // CASE 2: Loan Application Exists (Pending Review, Approved by Admin, or Rejected)
  if (latestApplication) {
    const appStatus = latestApplication.app_status || latestApplication.application_status || 'pending';
    const amount = Number(latestApplication.requested_amount || latestApplication.loan_amount || 0);
    const months = Number(latestApplication.loan_duration_months || latestApplication.duration_months || 1);
    const appNum = latestApplication.application_number || 'CLMV-APP';

    // 2A. APPROVED (Awaiting Accountant Payout)
    if (appStatus === 'approved') {
      return (
        <div className="card-base">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Loan Status</h2>
            <Link
              href="/loan-dashboard?tab=applications"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              Track Details <ChevronRight size={13} />
            </Link>
          </div>

          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-[#0D182E] to-[#070D1E] p-5 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00E599]">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">Loan Approved by Admin!</h3>
                    <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-500/20 text-[#00E599] border border-emerald-500/30">
                      Approved
                    </span>
                  </div>
                  <p className="text-2xs text-slate-400 font-mono">{appNum}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xs text-slate-400 block font-medium">Approved Principal</span>
                <span className="text-lg font-black text-[#00E599] font-tabular">{fmt(amount)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2 mb-3">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Current Stage:</span>
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Clock size={12} />
                  <span>Awaiting Accountant Disbursement</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Beneficiary Bank:</span>
                <span className="font-semibold text-white">
                  {latestApplication.bank_name} • {latestApplication.account_number}
                </span>
              </div>
              <p className="text-2xs text-slate-400 pt-1 border-t border-white/5">
                The CLIMPS Finance Desk has been notified of your approval. Your funds are being processed and will reflect as active immediately upon transfer confirmation.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xs text-slate-400">10% monthly interest rate applies</span>
              <Link
                href="/loan-dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E599] text-slate-950 font-black text-xs hover:bg-[#00E599]/90 transition-all"
              >
                <span>View Loan Portal</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // 2B. REJECTED
    if (appStatus === 'rejected') {
      return (
        <div className="card-base">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Loan Status</h2>
            <Link
              href="/loan-application"
              className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
            >
              Re-Apply <ChevronRight size={13} />
            </Link>
          </div>

          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Loan Application Declined</h3>
                  <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Declined
                  </span>
                </div>
                <p className="text-2xs text-slate-400 font-mono mt-0.5">{appNum}</p>
                <p className="text-xs text-slate-300 mt-2">
                  {latestApplication.rejection_reason || latestApplication.admin_notes || 'Your application did not satisfy collateral or verification requirements at this time.'}
                </p>
                <div className="mt-3">
                  <Link
                    href="/loan-application"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    Submit New Application
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2C. PENDING / SUBMITTED / UNDER REVIEW
    return (
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Loan Request</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
              <Clock size={11} />
              <span>Pending Review</span>
            </span>
          </div>
          <Link
            href="/loan-dashboard?tab=applications"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            View Details <ChevronRight size={13} />
          </Link>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#0D182E] to-[#070D1E] p-5 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Application Under Review</h3>
                <p className="text-2xs text-slate-400 font-mono">{appNum}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xs text-slate-400 block font-medium">Requested Amount</span>
              <span className="text-lg font-black text-amber-300 font-tabular">{fmt(amount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs mb-3">
            <div>
              <span className="text-2xs text-slate-400 block">Tenure</span>
              <span className="text-white font-semibold">{months} Month{months > 1 ? 's' : ''}</span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Monthly Rate</span>
              <span className="text-[#00E599] font-bold">10% / month</span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Collateral Type</span>
              <span className="text-slate-200 font-medium capitalize">
                {(latestApplication.collateral_type || 'Cheque / Asset').replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Your loan application has been submitted and is currently with the CLIMPS Admin team for review and collateral verification. You will be notified immediately upon approval.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-2xs text-slate-400">
              Submitted: {new Date(latestApplication.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <Link
              href="/loan-dashboard"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Track in Loan Portal →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CASE 3: No Active Loan and No Application (Clean Empty State)
  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">Active Loan</h2>
        <Link
          href="/loan-application"
          className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
        >
          Apply for Loan <ChevronRight size={13} />
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-3 shadow-md">
          <CreditCard size={22} />
        </div>
        <h3 className="text-base font-bold text-white">No Active Loan</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5 font-normal">
          You currently have no active or outstanding loans. Fast express loans are available at a transparent 10% monthly interest rate with flexible collateral options.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/loan-application"
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <PlusCircle size={14} />
            Apply for a Loan
          </Link>
          <Link
            href="/loan-dashboard"
            className="btn-outline text-xs flex items-center gap-1.5 px-4 py-2 rounded-xl"
          >
            Loan Portal
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}