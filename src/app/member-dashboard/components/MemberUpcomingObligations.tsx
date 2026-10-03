'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, AlertTriangle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MemberUpcomingObligationsProps {
  member?: any;
}

interface ObligationItem {
  id: string;
  type: 'contribution' | 'loan' | 'investment' | 'goal';
  title: string;
  amount: string;
  dueDate: string;
  daysUntil: number;
  urgency: 'overdue' | 'soon' | 'upcoming' | 'done';
}

const urgencyConfig = {
  overdue: { color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle, border: 'border-red-500/20' },
  soon: { color: 'text-warning', bg: 'bg-warning/10', icon: Clock, border: 'border-warning/20' },
  upcoming: { color: 'text-white/50', bg: 'bg-white/[0.06]', icon: Calendar, border: 'border-white/10' },
  done: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2, border: 'border-emerald-500/20' },
};

const typeLabel: Record<string, string> = {
  contribution: 'Contribution',
  loan: 'Loan Repayment',
  investment: 'Investment Maturity',
  goal: 'Savings Goal',
};

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MemberUpcomingObligations({ member: memberProp }: MemberUpcomingObligationsProps) {
  const [obligations, setObligations] = useState<ObligationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    loadObligations();
  }, [user, memberProp]);

  async function loadObligations() {
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

      const items: ObligationItem[] = [];
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // 1. Check Monthly Contribution dues
      const monthlyAmount = Number(member.monthly_contribution_amount || member.monthly_contribution || 0);
      if (monthlyAmount > 0) {
        const { data: currentContrib } = await supabase
          .from('contributions')
          .select('*')
          .eq('member_id', member.id)
          .eq('contribution_month', now.getMonth() + 1)
          .eq('contribution_year', now.getFullYear())
          .maybeSingle();

        if (!currentContrib || currentContrib.contribution_status !== 'paid') {
          // Due on 5th of month or next month
          const dueDate = new Date(now.getFullYear(), now.getMonth(), 5);
          if (now.getDate() > 5) {
            dueDate.setDate(dueDate.getDate() + 25); // Next cycle
          }
          const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const monthName = now.toLocaleString('default', { month: 'short' });

          items.push({
            id: 'obl-contribution-current',
            type: 'contribution',
            title: `${monthName} ${now.getFullYear()} Contribution`,
            amount: fmt(currentContrib?.outstanding_amount ? Number(currentContrib.outstanding_amount) : monthlyAmount),
            dueDate: dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            daysUntil: diffDays,
            urgency: diffDays < 0 ? 'overdue' : diffDays <= 5 ? 'soon' : 'upcoming',
          });
        }
      }

      // 2. Check Active Loan instalments
      const { data: activeLoan } = await supabase
        .from('loans')
        .select('*')
        .eq('member_id', member.id)
        .in('loan_status', ['active', 'disbursed', 'overdue'])
        .limit(1)
        .maybeSingle();

      if (activeLoan && activeLoan.next_repayment_date && Number(activeLoan.repayment_amount) > 0) {
        const dueDate = new Date(activeLoan.next_repayment_date);
        dueDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        items.push({
          id: `obl-loan-${activeLoan.id}`,
          type: 'loan',
          title: `Loan Repayment (${activeLoan.loan_number || 'Active'})`,
          amount: fmt(Number(activeLoan.repayment_amount)),
          dueDate: dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          daysUntil: diffDays,
          urgency: diffDays < 0 ? 'overdue' : diffDays <= 5 ? 'soon' : 'upcoming',
        });
      }

      // 3. Check Maturing Investments
      const { data: maturingInvestments } = await supabase
        .from('investments')
        .select('*, product:investment_products(*)')
        .eq('member_id', member.id)
        .eq('investment_status', 'active')
        .not('maturity_date', 'is', null)
        .order('maturity_date', { ascending: true })
        .limit(2);

      if (maturingInvestments && maturingInvestments.length > 0) {
        for (const inv of maturingInvestments) {
          if (!inv.maturity_date) continue;
          const matDate = new Date(inv.maturity_date);
          matDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((matDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays >= 0) {
            items.push({
              id: `obl-inv-${inv.id}`,
              type: 'investment',
              title: `${inv.product?.name || inv.investment_number || 'Investment'} Maturity`,
              amount: fmt(Number(inv.projected_return || inv.amount_invested)),
              dueDate: matDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              daysUntil: diffDays,
              urgency: diffDays <= 7 ? 'soon' : 'upcoming',
            });
          }
        }
      }

      setObligations(items);
    } catch (e) {
      console.error('Error loading upcoming obligations:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-base">
      <h2 className="section-header mb-4">Upcoming Obligations</h2>

      {loading ? (
        <div className="space-y-2.5">
          <div className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />
          <div className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />
        </div>
      ) : obligations.length === 0 ? (
        <div className="py-7 text-center flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2.5">
            <CheckCircle2 size={18} />
          </div>
          <p className="text-sm font-bold text-white">All Caught Up!</p>
          <p className="text-xs text-white/50 max-w-xs mt-1">
            You have no pending dues, overdue amounts, or urgent upcoming obligations.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {obligations.map(obl => {
            const cfg = urgencyConfig[obl.urgency];
            const Icon = cfg.icon;
            return (
              <div
                key={obl.id}
                className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.border} ${obl.urgency === 'soon' ? 'bg-warning/5' : 'bg-white/[0.02]'}`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${cfg.bg}`}>
                  <Icon size={14} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-white truncate">{obl.title}</p>
                    <p className="text-xs font-bold text-white font-tabular shrink-0">{obl.amount}</p>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-2xs text-white/50">{typeLabel[obl.type]} · {obl.dueDate}</p>
                    <p className={`text-2xs font-semibold ${cfg.color}`}>
                      {obl.daysUntil < 0
                        ? `${Math.abs(obl.daysUntil)}d overdue`
                        : obl.daysUntil === 0
                        ? 'Due today'
                        : obl.daysUntil <= 7
                        ? `${obl.daysUntil}d left`
                        : `in ${obl.daysUntil}d`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}