'use client';
import React, { useState, useEffect } from 'react';
import {
  PiggyBank, CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Wallet,
  ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';


interface KPICard {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  subLabel?: string;
  trend?: { direction: 'up' | 'down' | 'neutral'; value: string; label: string };
  icon: React.ElementType;
  variant: 'default' | 'savings' | 'loan' | 'invest' | 'alert' | 'success';
  span?: 'normal' | 'wide';
  badge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  tooltip?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-[#0d1527] border-white/10',
  savings: 'gradient-card-savings border-blue-100',
  loan: 'gradient-card-loan border-orange-100',
  invest: 'gradient-card-invest border-green-100',
  alert: 'gradient-card-alert border-red-100',
  success: 'bg-[#0d1527] border-white/10',
};

const iconBg: Record<string, string> = {
  default: 'bg-white/[0.06] text-white/50',
  savings: 'bg-blue-100 text-blue-600',
  loan: 'bg-orange-100 text-orange-600',
  invest: 'bg-blue-500/10 text-blue-400',
  alert: 'bg-red-500/10 text-red-400',
  success: 'bg-blue-500/10 text-blue-400',
};

const badgeStyle: Record<string, string> = {
  success: 'bg-blue-500/10 text-blue-400',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-red-500/10 text-red-400',
  info: 'bg-blue-50 text-blue-700',
};

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MemberKPIBento() {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [kpiCards, setKpiCards] = useState<KPICard[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    loadKPIs();
  }, [user]);

  async function loadKPIs() {
    setLoading(true);
    try {
      // Get member record
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!member) {
        setLoading(false);
        return;
      }

      // Get current month contribution
      const now = new Date();
      const { data: currentContrib } = await supabase
        .from('contributions')
        .select('*')
        .eq('member_id', member.id)
        .eq('contribution_month', now.getMonth() + 1)
        .eq('contribution_year', now.getFullYear())
        .maybeSingle();

      // Get outstanding contributions
      const { data: overdueContribs } = await supabase
        .from('contributions')
        .select('outstanding_amount')
        .eq('member_id', member.id)
        .in('contribution_status', ['unpaid', 'overdue', 'partially_paid']);

      const totalOutstanding = overdueContribs?.reduce((sum, c) => sum + (c.outstanding_amount || 0), 0) || 0;

      // Get active loan
      const { data: activeLoan } = await supabase
        .from('loans')
        .select('*')
        .eq('member_id', member.id)
        .eq('loan_status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get investments
      const { data: investments } = await supabase
        .from('investments')
        .select('amount_invested, actual_return, investment_status')
        .eq('member_id', member.id);

      const totalInvested = investments?.filter(i => i.investment_status === 'active').reduce((s, i) => s + i.amount_invested, 0) || 0;
      const totalReturns = investments?.reduce((s, i) => s + (i.actual_return || 0), 0) || 0;

      const contribStatus = currentContrib?.contribution_status || 'unpaid';
      const contribBadge = contribStatus === 'paid'
        ? { text: 'PAID', type: 'success' as const }
        : contribStatus === 'partially_paid'
        ? { text: 'PARTIAL', type: 'warning' as const }
        : { text: 'UNPAID', type: 'danger' as const };

      const cards: KPICard[] = [
        {
          id: 'kpi-total-savings',
          label: 'Total Savings Balance',
          value: fmt(member.total_savings || 0),
          subValue: fmt(member.monthly_contribution_amount || 0),
          subLabel: 'Monthly contribution',
          trend: { direction: 'up', value: '+₦42,500', label: 'this quarter' },
          icon: PiggyBank,
          variant: 'savings',
          span: 'wide',
          tooltip: 'Sum of all savings accounts and cooperative contributions',
        },
        {
          id: 'kpi-contribution',
          label: `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()} Contribution`,
          value: fmt(member.monthly_contribution_amount || 0),
          badge: contribBadge,
          subLabel: currentContrib?.payment_date
            ? `Paid on ${new Date(currentContrib.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
            : 'Not yet paid',
          icon: CheckCircle2,
          variant: contribStatus === 'paid' ? 'success' : 'alert',
          tooltip: 'Your monthly cooperative contribution status',
        },
        {
          id: 'kpi-outstanding',
          label: 'Outstanding Contributions',
          value: fmt(totalOutstanding),
          subLabel: totalOutstanding === 0 ? 'No arrears — great standing!' : 'Please clear outstanding balance',
          icon: AlertTriangle,
          variant: totalOutstanding > 0 ? 'alert' : 'default',
          trend: { direction: 'neutral', value: totalOutstanding > 0 ? 'Overdue' : '0 months', label: 'overdue' },
          tooltip: 'Total unpaid or overdue contributions',
        },
        {
          id: 'kpi-loan',
          label: 'Active Loan Balance',
          value: fmt(activeLoan?.outstanding_balance || member.active_loan_balance || 0),
          subValue: activeLoan ? fmt(activeLoan.repayment_amount) : undefined,
          subLabel: activeLoan?.next_repayment_date
            ? `Next instalment due ${new Date(activeLoan.next_repayment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
            : 'No active loan',
          trend: activeLoan ? { direction: 'down', value: fmt(activeLoan.repayment_amount), label: 'last payment' } : undefined,
          icon: CreditCard,
          variant: 'loan',
          badge: activeLoan ? { text: 'ON TRACK', type: 'info' } : undefined,
          tooltip: 'Outstanding principal on your active loan',
        },
        {
          id: 'kpi-investment',
          label: 'Investment Portfolio',
          value: fmt(totalInvested || member.investment_portfolio_value || 0),
          subLabel: 'Active investments',
          trend: { direction: 'up', value: '+11.5%', label: 'projected return' },
          icon: TrendingUp,
          variant: 'invest',
          tooltip: 'Total current value of active investments',
        },
        {
          id: 'kpi-returns',
          label: 'Total Returns Earned',
          value: fmt(totalReturns),
          subLabel: `Across ${investments?.filter(i => i.investment_status === 'matured').length || 0} matured investments`,
          trend: { direction: 'up', value: '+₦18,200', label: 'this year' },
          icon: Wallet,
          variant: 'success',
          tooltip: 'Actual returns received from matured investments',
        },
      ];

      setKpiCards(cards);
    } catch (err) {
      console.error('KPI load error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className={`card-base border rounded-2xl bg-white/[0.06] animate-pulse h-32 ${i === 1 ? 'sm:col-span-2' : ''}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {kpiCards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`card-base border rounded-2xl ${variantStyles[card.variant]} ${
              card.span === 'wide' ? 'sm:col-span-2 lg:col-span-2' : ''
            } relative transition-all duration-150 hover:card-shadow-md`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="metric-label">{card.label}</p>
                {card.tooltip && (
                  <button
                    onMouseEnter={() => setTooltip(card.id)}
                    onMouseLeave={() => setTooltip(null)}
                    className="text-white/50 hover:text-white transition-colors"
                    aria-label="More info"
                  >
                    <Info size={12} />
                  </button>
                )}
              </div>
              <div className={`p-2 rounded-xl ${iconBg[card.variant]}`}>
                <Icon size={16} />
              </div>
            </div>

            {tooltip === card.id && card.tooltip && (
              <div className="absolute top-12 left-4 z-10 bg-foreground text-background text-xs rounded-xl px-3 py-2 max-w-[200px] card-shadow-lg scale-enter">
                {card.tooltip}
              </div>
            )}

            <div className="flex items-end justify-between">
              <div>
                <p className="metric-value text-2xl">{card.value}</p>
                {card.badge && (
                  <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-2xs font-bold tracking-wide ${badgeStyle[card.badge.type]}`}>
                    {card.badge.text}
                  </span>
                )}
                {card.subLabel && !card.badge && (
                  <p className="text-xs text-white/50 mt-1">{card.subLabel}</p>
                )}
                {card.badge && card.subLabel && (
                  <p className="text-xs text-white/50 mt-1">{card.subLabel}</p>
                )}
              </div>
              {card.subValue && (
                <div className="text-right">
                  <p className="text-xs font-semibold text-white font-tabular">{card.subValue}</p>
                  <p className="text-2xs text-white/50">{card.subLabel}</p>
                </div>
              )}
            </div>

            {card.trend && (
              <div className={`flex items-center gap-1 mt-2.5 pt-2.5 border-t border-white/10/60 ${
                card.trend.direction === 'up' ? 'stat-card-positive' :
                card.trend.direction === 'down' ? 'stat-card-negative' : 'text-xs font-semibold text-white/50'
              }`}>
                {card.trend.direction === 'up' && <ArrowUpRight size={13} />}
                {card.trend.direction === 'down' && <ArrowDownRight size={13} />}
                <span>{card.trend.value}</span>
                <span className="font-normal text-white/50">{card.trend.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}