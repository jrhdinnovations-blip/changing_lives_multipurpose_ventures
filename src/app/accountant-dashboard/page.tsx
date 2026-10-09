'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart2,
  CreditCard,
  PiggyBank,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Users,
  Wallet,
  Activity,
} from 'lucide-react';

function formatNGN(val: number) {
  return '₦' + (val || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface LoanRow {
  id: string;
  application_number: string;
  applicant_name: string;
  requested_amount: number;
  status: string;
  created_at: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  loan_duration_months: number;
}

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  ready_for_disbursement: 'bg-teal-500/15 text-teal-400 border border-teal-500/30',
  disbursed: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  active: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  completed: 'bg-white/10 text-white/50 border border-white/15',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || 'bg-white/5 text-white/40 border border-white/10';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

export default function AccountantDashboardPage() {
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);
  const [totalInvestments, setTotalInvestments] = useState(0);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        const { data: loanData } = await supabase
          .from('loan_applications')
          .select('id, application_number, applicant_name, requested_amount, status, created_at, account_name, account_number, bank_name, loan_duration_months')
          .in('status', ['approved', 'ready_for_disbursement', 'disbursed', 'active', 'completed'])
          .order('created_at', { ascending: false })
          .limit(50);

        if (loanData) setLoans(loanData);

        const { count: mc } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true });
        if (typeof mc === 'number') setMemberCount(mc);

        const { data: contribs } = await supabase.from('contributions').select('amount');
        if (contribs) setTotalContributions(contribs.reduce((s, r) => s + (Number(r.amount) || 0), 0));

        const { data: invs } = await supabase.from('investments').select('amount');
        if (invs) setTotalInvestments(invs.reduce((s, r) => s + (Number(r.amount) || 0), 0));
      } catch (err) {
        console.warn('Accountant dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const approvedPending = loans.filter(l => ['approved', 'ready_for_disbursement'].includes(l.status));
  const disbursed = loans.filter(l => ['disbursed', 'active'].includes(l.status));
  const totalApprovedValue = approvedPending.reduce((s, l) => s + (Number(l.requested_amount) || 0), 0);
  const totalDisbursedValue = disbursed.reduce((s, l) => s + (Number(l.requested_amount) || 0), 0);

  const kpiCards = [
    {
      label: 'Pending Disbursement',
      value: formatNGN(totalApprovedValue),
      sub: `${approvedPending.length} loan${approvedPending.length !== 1 ? 's' : ''} awaiting payout`,
      icon: <Wallet size={16} />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      valueColor: 'text-amber-300',
    },
    {
      label: 'Total Disbursed',
      value: formatNGN(totalDisbursedValue),
      sub: `${disbursed.length} active loan facilities`,
      icon: <CreditCard size={16} />,
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
      valueColor: 'text-cyan-300',
    },
    {
      label: 'Total Contributions',
      value: formatNGN(totalContributions),
      sub: `Across ${memberCount} registered members`,
      icon: <PiggyBank size={16} />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-[#00E599]',
      valueColor: 'text-[#00E599]',
    },
    {
      label: 'Wealth Circle Pool',
      value: formatNGN(totalInvestments),
      sub: 'Active investment capital',
      icon: <TrendingUp size={16} />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      valueColor: 'text-blue-300',
    },
  ];

  const quickLinks = [
    { href: '/admin-dashboard/loans', label: 'Review All Loans', icon: <CreditCard size={15} />, accent: 'rose' },
    { href: '/financial-statements', label: 'Financial Statements', icon: <FileText size={15} />, accent: 'emerald' },
    { href: '/save/admin/contributions', label: 'Member Contributions', icon: <PiggyBank size={15} />, accent: 'blue' },
    { href: '/admin-dashboard/members', label: 'Members Directory', icon: <Users size={15} />, accent: 'purple' },
    { href: '/investment-products', label: 'Wealth Circle', icon: <TrendingUp size={15} />, accent: 'teal' },
    { href: '/admin-dashboard/audit-logs', label: 'Audit Logs', icon: <Activity size={15} />, accent: 'slate' },
  ];

  const accentHover: Record<string, string> = {
    rose: 'hover:bg-rose-500/10 hover:border-rose-500/40',
    emerald: 'hover:bg-emerald-500/10 hover:border-emerald-500/40',
    blue: 'hover:bg-blue-500/10 hover:border-blue-500/40',
    purple: 'hover:bg-purple-500/10 hover:border-purple-500/40',
    teal: 'hover:bg-teal-500/10 hover:border-teal-500/40',
    slate: 'hover:bg-white/5 hover:border-white/25',
  };
  const accentIcon: Record<string, string> = {
    rose: 'text-rose-400', emerald: 'text-[#00E599]', blue: 'text-blue-400',
    purple: 'text-purple-400', teal: 'text-teal-400', slate: 'text-slate-400',
  };

  return (
    <AppLayout role="accountant" memberName="Accountant" memberId="ACCT/2026">
      <div className="p-6 xl:p-8 max-w-7xl mx-auto space-y-6">

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-amber-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-teal-600/5 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white tracking-tight">Accountant Portal</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Finance Desk
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Disbursements · Reconciliation · Financial Oversight · {today}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00E599] bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
              <span>Live Financial Data</span>
            </div>
            <Link
              href="/admin-dashboard/loans"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm active:scale-95"
            >
              <CreditCard size={14} />
              <span>Approved Loans</span>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              className={`${kpi.bg} border ${kpi.border} rounded-2xl p-5 backdrop-blur-xl transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.iconBg} ${kpi.iconColor}`}>{kpi.icon}</div>
              </div>
              <p className={`text-2xl font-black font-tabular ${kpi.valueColor}`}>{kpi.value}</p>
              <p className="text-2xs text-slate-400 mt-1 font-medium">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Approved loans pending disbursement */}
          <div className="lg:col-span-2 bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle size={15} className="text-amber-400" />
                  Approved — Awaiting Disbursement
                </h2>
                <p className="text-2xs text-slate-400 mt-0.5">Loans approved by admin, ready for account payout</p>
              </div>
              <Link href="/admin-dashboard/loans" className="text-xs font-bold text-[#00E599] hover:text-emerald-300 flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="py-10 flex justify-center">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : approvedPending.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No pending disbursements</p>
                <p className="text-2xs text-slate-500 mt-1">All approved loans have been processed</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-2xs uppercase tracking-wider text-slate-500">
                      <th className="pb-2.5 font-bold">Applicant</th>
                      <th className="pb-2.5 font-bold">Ref</th>
                      <th className="pb-2.5 font-bold">Amount</th>
                      <th className="pb-2.5 font-bold">Bank Details</th>
                      <th className="pb-2.5 font-bold">Status</th>
                      <th className="pb-2.5 font-bold text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {approvedPending.map(loan => (
                      <tr key={loan.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-3">
                          <p className="font-bold text-white">{loan.applicant_name}</p>
                          <p className="text-2xs text-slate-400">{loan.loan_duration_months}mo tenure</p>
                        </td>
                        <td className="py-3 pr-3">
                          <span className="font-mono text-2xs text-[#00E599] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {loan.application_number}
                          </span>
                        </td>
                        <td className="py-3 pr-3 font-black text-amber-300 font-tabular">
                          {formatNGN(loan.requested_amount)}
                        </td>
                        <td className="py-3 pr-3">
                          <p className="text-white font-semibold text-2xs">{loan.bank_name}</p>
                          <p className="text-slate-400 text-2xs font-mono">{loan.account_number}</p>
                          <p className="text-slate-300 text-2xs">{loan.account_name}</p>
                        </td>
                        <td className="py-3 pr-3">
                          <StatusBadge status={loan.status} />
                        </td>
                        <td className="py-3 text-right text-2xs text-slate-400 font-medium">
                          {formatDate(loan.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Quick Links */}
            <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <BarChart2 size={15} className="text-blue-400" />
                Finance Quick Links
              </h2>
              <div className="space-y-2">
                {quickLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 transition-all text-xs font-bold text-slate-200 group ${accentHover[link.accent]}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={accentIcon[link.accent]}>{link.icon}</span>
                      <span>{link.label}</span>
                    </div>
                    <ArrowRight size={13} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Disbursement Summary */}
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-xs font-bold text-white">Disbursement Summary</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Facilities</span>
                  <span className="text-white font-bold font-tabular">{disbursed.length}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capital Deployed</span>
                  <span className="text-teal-300 font-bold font-tabular">{formatNGN(totalDisbursedValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pending Payout</span>
                  <span className="text-amber-300 font-bold font-tabular">{formatNGN(totalApprovedValue)}</span>
                </div>
              </div>
            </div>

            {/* Recently disbursed */}
            {disbursed.length > 0 && (
              <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-white">Recently Disbursed</span>
                </div>
                <div className="space-y-2.5">
                  {disbursed.slice(0, 4).map(loan => (
                    <div key={loan.id} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-white font-semibold truncate max-w-[130px]">{loan.applicant_name}</p>
                        <p className="text-2xs text-slate-400 font-mono">{loan.application_number}</p>
                      </div>
                      <span className="text-[#00E599] font-bold font-tabular">
                        {formatNGN(loan.requested_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
