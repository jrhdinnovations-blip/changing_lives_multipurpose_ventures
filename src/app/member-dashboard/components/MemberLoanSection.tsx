'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { CreditCard, Calendar, ChevronRight, CheckCircle2, PlusCircle, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MemberLoanSectionProps {
  member?: any;
}

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MemberLoanSection({ member: memberProp }: MemberLoanSectionProps) {
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [recentRepayments, setRecentRepayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    loadLoanData();
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

      if (!member) {
        setLoading(false);
        return;
      }

      // Fetch active loan
      const { data: loans } = await supabase
        .from('loans')
        .select('*, product:loan_products(*)')
        .eq('member_id', member.id)
        .in('loan_status', ['active', 'disbursed', 'overdue'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (loans && loans.length > 0) {
        const loan = loans[0];
        setActiveLoan(loan);

        // Fetch recent repayments from repayment schedule or transactions
        const { data: schedules } = await supabase
          .from('loan_repayment_schedules')
          .select('*')
          .eq('loan_id', loan.id)
          .eq('schedule_status', 'paid')
          .order('instalment_number', { ascending: false })
          .limit(4);

        if (schedules && schedules.length > 0) {
          setRecentRepayments(schedules);
        } else {
          // Fallback to transactions
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
        setActiveLoan(null);
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
        <div className="h-6 w-32 bg-white/[0.06] rounded-lg" />
        <div className="h-40 bg-white/[0.06] rounded-2xl" />
      </div>
    );
  }

  // If member has no active loan, show clean empty state
  if (!activeLoan) {
    return (
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-header">Active Loan</h2>
          <Link
            href="/loan-application"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-400/80 transition-colors flex items-center gap-1"
          >
            Apply for Loan <ChevronRight size={13} />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-emerald-400 mx-auto mb-3">
            <CreditCard size={22} />
          </div>
          <h3 className="text-base font-bold text-white">No Active Loan</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto mt-1 mb-5">
            You currently have no active or outstanding loans. Cooperative members can access flexible loan financing up to 2.5× their savings balance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/loan-application"
              className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2 rounded-xl"
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

  // Active loan view
  const principal = Number(activeLoan.principal) || 0;
  const totalRepayable = Number(activeLoan.total_repayable) || principal;
  const amountRepaid = Number(activeLoan.amount_repaid) || 0;
  const outstanding = Number(activeLoan.outstanding_balance) || (totalRepayable - amountRepaid);
  const repaymentPct = totalRepayable > 0 ? Math.min(100, Math.round((amountRepaid / totalRepayable) * 100)) : 0;
  const monthlyInstalment = Number(activeLoan.repayment_amount) || 0;
  const productName = activeLoan.product?.name || 'Cooperative Loan';
  const loanRef = activeLoan.loan_number || 'LN-REF';

  const nextDueDate = activeLoan.next_repayment_date
    ? new Date(activeLoan.next_repayment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Pending schedule';

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header">Active Loan</h2>
        <Link
          href="/loan-dashboard"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-400/80 transition-colors flex items-center gap-1"
        >
          Loan Details <ChevronRight size={13} />
        </Link>
      </div>

      <div className="bg-white/[0.04]/40 rounded-2xl p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={16} className="text-emerald-400" />
              <p className="text-sm font-bold text-white">{productName}</p>
              <Badge variant="disbursed">Active</Badge>
            </div>
            <p className="text-xs text-white/50 font-mono">{loanRef}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50">Outstanding Balance</p>
            <p className="text-xl font-bold text-white font-tabular">{fmt(outstanding)}</p>
          </div>
        </div>

        {/* Repayment progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-white/50">Repayment Progress</p>
            <p className="text-xs font-bold text-emerald-400">{repaymentPct}% paid</p>
          </div>
          <div className="progress-bar-bg h-2.5">
            <div
              className="bg-accent h-full rounded-full transition-all duration-700"
              style={{ width: `${repaymentPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-white/50">{fmt(amountRepaid)} repaid</p>
            <p className="text-xs text-white/50">{fmt(totalRepayable)} total</p>
          </div>
        </div>

        {/* Key details row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10/60">
          <div>
            <p className="text-2xs text-white/50">Principal Borrowed</p>
            <p className="text-xs font-semibold text-white mt-0.5 font-tabular">{fmt(principal)}</p>
          </div>
          <div>
            <p className="text-2xs text-white/50">Monthly Instalment</p>
            <p className="text-xs font-semibold text-white mt-0.5 font-tabular">{fmt(monthlyInstalment)}</p>
          </div>
          <div>
            <p className="text-2xs text-white/50">Next Due Date</p>
            <p className="text-xs font-semibold text-white mt-0.5">{nextDueDate}</p>
          </div>
        </div>
      </div>

      {/* Next due alert */}
      {monthlyInstalment > 0 && (
        <div className="flex items-center gap-3 p-3 bg-warning/8 border border-warning/20 rounded-xl mb-4">
          <div className="p-1.5 bg-warning/10 rounded-lg shrink-0">
            <Calendar size={14} className="text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white">Next Repayment Due</p>
            <p className="text-xs text-white/50">
              Instalment of <span className="font-semibold text-white font-tabular">{fmt(monthlyInstalment)}</span> due on <span className="font-semibold">{nextDueDate}</span>
            </p>
          </div>
          <Link
            href="/loan-dashboard?tab=repay"
            className="btn-primary text-xs px-3 py-1.5 shrink-0"
          >
            Pay Now
          </Link>
        </div>
      )}

      {/* Recent repayments */}
      {recentRepayments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Recent Repayments</p>
          <div className="space-y-1.5">
            {recentRepayments.map((rep, idx) => (
              <div
                key={rep.id || idx}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <span className="text-2xs font-bold text-blue-400">
                      {rep.instalment_number || idx + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">
                      Instalment #{rep.instalment_number || idx + 1}
                    </p>
                    <p className="text-2xs text-white/50">
                      {rep.payment_date || rep.created_at ? new Date(rep.payment_date || rep.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white font-tabular">
                    {fmt(Number(rep.amount_paid || rep.amount) || 0)}
                  </p>
                  <Badge variant="paid">Paid</Badge>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/loan-dashboard"
            className="block w-full mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-400/80 transition-colors py-2 text-center"
          >
            View Full Repayment Schedule →
          </Link>
        </div>
      )}
    </div>
  );
}