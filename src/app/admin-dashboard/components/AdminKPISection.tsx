'use client';
import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, UserPlus, PiggyBank, CalendarCheck, AlertTriangle,
  CreditCard, Banknote, TrendingDown, TrendingUp, BarChart3, Landmark,
  RefreshCw, UserX, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';


interface AdminKPICard {
  id: string;
  label: string;
  value: string;
  subLabel?: string;
  trend?: { direction: 'up' | 'down' | 'neutral'; value: string };
  icon: React.ElementType;
  iconBg: string;
  alert?: boolean;
  highlight?: boolean;
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return '₦' + (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return '₦' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '₦' + (n / 1_000).toFixed(1) + 'K';
  return '₦' + n.toLocaleString('en-NG');
}

function KPICard({ card }: { card: AdminKPICard }) {
  const Icon = card.icon;
  return (
    <div className={`card-base rounded-2xl border transition-all duration-150 hover:card-shadow-md ${
      card.alert
        ? 'border-destructive/20 bg-destructive/3'
        : card.highlight
        ? 'border-primary/10 bg-secondary/30' : 'border-border bg-card'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <p className="metric-label leading-tight pr-2">{card.label}</p>
        <div className={`p-2 rounded-xl shrink-0 ${card.iconBg}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground font-tabular mb-1">{card.value}</p>
      {card.subLabel && (
        <p className="text-xs text-muted-foreground">{card.subLabel}</p>
      )}
      {card.trend && (
        <div className={`flex items-center gap-1 mt-2 pt-2 border-t border-border/50 text-xs font-semibold ${
          card.trend.direction === 'up' && card.alert ? 'text-destructive' :
          card.trend.direction === 'up' ? 'text-accent' :
          card.trend.direction === 'down' ? 'text-destructive' : 'text-muted-foreground'
        }`}>
          {card.trend.direction === 'up' && <ArrowUpRight size={12} />}
          {card.trend.direction === 'down' && <ArrowDownRight size={12} />}
          {card.trend.direction === 'neutral' && <Minus size={12} />}
          <span>{card.trend.value}</span>
        </div>
      )}
    </div>
  );
}

function KPIGroup({ title, cards, cols }: { title: string; cards: AdminKPICard[]; cols: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-${cols} xl:grid-cols-${cols} 2xl:grid-cols-${cols} gap-4`}>
        {cards.map(card => <KPICard key={card.id} card={card} />)}
      </div>
    </div>
  );
}

export default function AdminKPISection() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        totalMembersRes,
        activeMembersRes,
        newMembersRes,
        pendingApprovalsRes,
        savingsDataRes,
        contribDataRes,
        overdueContribsRes,
        activeLoansRes,
        loanDataRes,
        overdueLoansRes,
        repaymentDataRes,
        investDataRes,
        activeInvestmentsRes,
        maturedThisMonthRes,
      ] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('members').select('*', { count: 'exact', head: true }).eq('membership_status', 'active'),
        supabase.from('members').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
        supabase.from('members').select('*', { count: 'exact', head: true }).eq('membership_status', 'pending'),
        supabase.from('members').select('total_savings'),
        supabase.from('contributions').select('amount_paid').eq('contribution_month', now.getMonth() + 1).eq('contribution_year', now.getFullYear()),
        supabase.from('contributions').select('outstanding_amount').in('contribution_status', ['unpaid', 'overdue', 'partially_paid']),
        supabase.from('loans').select('*', { count: 'exact', head: true }).eq('loan_status', 'active'),
        supabase.from('loans').select('outstanding_balance, principal').gte('created_at', monthStart),
        supabase.from('loans').select('*', { count: 'exact', head: true }).eq('loan_status', 'overdue'),
        supabase.from('loan_repayment_schedules').select('amount_paid').eq('schedule_status', 'paid').gte('payment_date', monthStart),
        supabase.from('investments').select('amount_invested').eq('investment_status', 'active'),
        supabase.from('investments').select('*', { count: 'exact', head: true }).eq('investment_status', 'active'),
        supabase.from('investments').select('*', { count: 'exact', head: true }).eq('investment_status', 'matured').gte('updated_at', monthStart),
      ]);

      const totalMembers = totalMembersRes.count;
      const activeMembers = activeMembersRes.count;
      const newMembers = newMembersRes.count;
      const pendingApprovals = pendingApprovalsRes.count;
      const savingsData = savingsDataRes.data;
      const contribData = contribDataRes.data;
      const overdueContribs = overdueContribsRes.data;
      const activeLoans = activeLoansRes.count;
      const loanData = loanDataRes.data;
      const overdueLoans = overdueLoansRes.count;
      const repaymentData = repaymentDataRes.data;
      const investData = investDataRes.data;
      const activeInvestments = activeInvestmentsRes.count;
      const maturedThisMonth = maturedThisMonthRes.count;

      const totalSavings = savingsData?.reduce((s, m) => s + (m.total_savings || 0), 0) || 0;
      const monthlyContribs = contribData?.reduce((s, c) => s + (c.amount_paid || 0), 0) || 0;
      const outstandingContribs = overdueContribs?.reduce((s, c) => s + (c.outstanding_amount || 0), 0) || 0;
      const disbursedThisMonth = loanData?.reduce((s, l) => s + (l.principal || 0), 0) || 0;
      const outstandingLoanBalance = (await supabase.from('loans').select('outstanding_balance').eq('loan_status', 'active')).data?.reduce((s, l) => s + (l.outstanding_balance || 0), 0) || 0;
      const repaymentsThisMonth = repaymentData?.reduce((s, r) => s + (r.amount_paid || 0), 0) || 0;
      const totalInvested = investData?.reduce((s, i) => s + (i.amount_invested || 0), 0) || 0;

      setStats({
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        newMembers: newMembers || 0,
        pendingApprovals: pendingApprovals || 0,
        totalSavings,
        monthlyContribs,
        outstandingContribs,
        activeLoans: activeLoans || 0,
        disbursedThisMonth,
        outstandingLoanBalance,
        overdueLoans: overdueLoans || 0,
        repaymentsThisMonth,
        totalInvested,
        activeInvestments: activeInvestments || 0,
        maturedThisMonth: maturedThisMonth || 0,
      });
    } catch (err) {
      console.error('Admin KPI load error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(j => <div key={j} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ))}
      </div>
    );
  }

  const memberKPIs: AdminKPICard[] = [
    { id: 'admin-kpi-total-members', label: 'Total Members', value: stats.totalMembers.toLocaleString(), subLabel: 'All registered members', trend: { direction: 'up', value: `+${stats.newMembers} this month` }, icon: Users, iconBg: 'bg-blue-100 text-blue-600', highlight: true },
    { id: 'admin-kpi-active-members', label: 'Active Members', value: stats.activeMembers.toLocaleString(), subLabel: `${stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}% of total`, trend: { direction: 'up', value: `+${stats.newMembers} this month` }, icon: UserCheck, iconBg: 'bg-accent/10 text-accent' },
    { id: 'admin-kpi-new-members', label: 'New Registrations', value: stats.newMembers.toLocaleString(), subLabel: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), trend: { direction: 'up', value: 'This month' }, icon: UserPlus, iconBg: 'bg-purple-100 text-purple-600' },
    { id: 'admin-kpi-pending-members', label: 'Pending Approvals', value: stats.pendingApprovals.toLocaleString(), subLabel: 'Awaiting review', icon: UserX, iconBg: 'bg-warning/10 text-warning', alert: stats.pendingApprovals > 0 },
  ];

  const savingsKPIs: AdminKPICard[] = [
    { id: 'admin-kpi-total-savings', label: 'Total Savings Under Mgmt', value: fmt(stats.totalSavings), subLabel: 'All accounts combined', trend: { direction: 'up', value: 'All time' }, icon: PiggyBank, iconBg: 'bg-blue-100 text-blue-600', highlight: true },
    { id: 'admin-kpi-monthly-contributions', label: 'Monthly Contributions', value: fmt(stats.monthlyContribs), subLabel: `${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })} collected`, trend: { direction: 'up', value: 'This month' }, icon: CalendarCheck, iconBg: 'bg-accent/10 text-accent' },
    { id: 'admin-kpi-outstanding-contributions', label: 'Outstanding Contributions', value: fmt(stats.outstandingContribs), subLabel: 'Total arrears', trend: { direction: stats.outstandingContribs > 0 ? 'up' : 'neutral', value: stats.outstandingContribs > 0 ? 'Needs attention' : 'All clear' }, icon: AlertTriangle, iconBg: 'bg-warning/10 text-warning', alert: stats.outstandingContribs > 0 },
  ];

  const loanKPIs: AdminKPICard[] = [
    { id: 'admin-kpi-active-loans', label: 'Active Loans', value: stats.activeLoans.toLocaleString(), subLabel: 'Currently in repayment', trend: { direction: 'up', value: 'Active' }, icon: CreditCard, iconBg: 'bg-orange-100 text-orange-600', highlight: true },
    { id: 'admin-kpi-disbursed', label: 'Total Disbursed (This Month)', value: fmt(stats.disbursedThisMonth), subLabel: 'New loans this month', trend: { direction: 'up', value: 'This month' }, icon: Banknote, iconBg: 'bg-blue-100 text-blue-600' },
    { id: 'admin-kpi-outstanding-loans', label: 'Outstanding Loan Balance', value: fmt(stats.outstandingLoanBalance), subLabel: 'Total principal owed', trend: { direction: 'neutral', value: 'Current balance' }, icon: Landmark, iconBg: 'bg-primary/10 text-primary' },
    { id: 'admin-kpi-overdue-loans', label: 'Overdue Loans', value: stats.overdueLoans.toLocaleString(), subLabel: 'Require follow-up', trend: { direction: stats.overdueLoans > 0 ? 'up' : 'neutral', value: stats.overdueLoans > 0 ? 'Needs attention' : 'All clear' }, icon: TrendingDown, iconBg: 'bg-destructive/10 text-destructive', alert: stats.overdueLoans > 0 },
    { id: 'admin-kpi-repayments', label: 'Repayments Received', value: fmt(stats.repaymentsThisMonth), subLabel: 'This month', trend: { direction: 'up', value: 'This month' }, icon: RefreshCw, iconBg: 'bg-accent/10 text-accent' },
  ];

  const investmentKPIs: AdminKPICard[] = [
    { id: 'admin-kpi-total-investments', label: 'Total Investments', value: fmt(stats.totalInvested), subLabel: 'All active subscriptions', trend: { direction: 'up', value: 'Active portfolio' }, icon: TrendingUp, iconBg: 'bg-accent/10 text-accent', highlight: true },
    { id: 'admin-kpi-active-investments', label: 'Active Investments', value: stats.activeInvestments.toLocaleString(), subLabel: 'Currently active', trend: { direction: 'up', value: 'Active' }, icon: BarChart3, iconBg: 'bg-blue-100 text-blue-600' },
    { id: 'admin-kpi-matured', label: 'Matured (This Month)', value: stats.maturedThisMonth.toLocaleString(), subLabel: 'Completed this month', trend: { direction: 'neutral', value: 'On schedule' }, icon: CalendarCheck, iconBg: 'bg-purple-100 text-purple-600' },
    { id: 'admin-kpi-returns-processed', label: 'Returns Processed', value: '₦0', subLabel: 'Paid to investors', trend: { direction: 'neutral', value: 'This month' }, icon: Banknote, iconBg: 'bg-accent/10 text-accent' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KPIGroup title="Membership" cards={memberKPIs} cols="2" />
        <KPIGroup title="Savings & Contributions" cards={savingsKPIs} cols="3" />
      </div>
      <KPIGroup title="Loans & Repayments" cards={loanKPIs} cols="5" />
      <KPIGroup title="Investments" cards={investmentKPIs} cols="4" />
    </div>
  );
}