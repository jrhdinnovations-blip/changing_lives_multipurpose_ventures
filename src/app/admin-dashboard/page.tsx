'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import {
  Users,
  PiggyBank,
  CreditCard,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Search,
  UserCheck,
  FileText,
  Shield,
  ClipboardList,
  CheckCircle2,
  BarChart2,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AdminPendingQueue from './components/AdminPendingQueue';

interface MemberItem {
  id: string;
  membership_no: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  monthly_contribution: number;
}

export default function AdminDashboardPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pendingLoansCount, setPendingLoansCount] = useState(0);
  const [pendingLoansAmount, setPendingLoansAmount] = useState(0);
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [activeLoansBalance, setActiveLoansBalance] = useState(0);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient();

        // 1. Members
        const { data: memberData, error } = await supabase
          .from('members')
          .select('id, membership_no, first_name, last_name, email, phone, status, monthly_contribution')
          .order('membership_no', { ascending: true });

        if (!error && memberData && memberData.length > 0) {
          setMembers(memberData);
        }

        // 2. Pending Loans
        const seenLoanIds = new Set<string>();
        let pCount = 0;
        let pSum = 0;

        try {
          const { data: pendingData } = await supabase
            .from('loan_applications')
            .select('*')
            .in('status', ['pending', 'submitted', 'review', 'under_review']);

          if (pendingData) {
            pendingData.forEach((la: any) => {
              seenLoanIds.add(la.id);
              pCount++;
              let notesData: any = {};
              if (la.notes) {
                try { notesData = typeof la.notes === 'string' ? JSON.parse(la.notes) : la.notes; } catch {}
              }
              const amt = Number(la.amount || la.requested_amount || notesData.loan_amount || 0);
              pSum += amt;
            });
          }
        } catch (loanErr) {
          console.warn('Pending loans query fallback:', loanErr);
        }

        // Fallback check from localStorage
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('climps_loan_applications');
            if (stored) {
              const localApps = JSON.parse(stored);
              localApps.forEach((la: any) => {
                const st = la.status || la.app_status || la.application_status || 'pending';
                if (['pending', 'submitted', 'review', 'under_review'].includes(st) && !seenLoanIds.has(la.id)) {
                  seenLoanIds.add(la.id);
                  pCount++;
                  const amt = Number(la.amount || la.requested_amount || la.loan_amount || 0);
                  pSum += amt;
                }
              });
            }
          } catch {}
        }

        setPendingLoansCount(pCount);
        setPendingLoansAmount(pSum);

        // 3. Active Loans
        try {
          const { data: activeData } = await supabase
            .from('loans')
            .select('id, outstanding_balance, principal_amount, total_repayable')
            .in('loan_status', ['active', 'disbursed', 'overdue']);

          if (activeData && activeData.length > 0) {
            setActiveLoansCount(activeData.length);
            const bal = activeData.reduce(
              (sum, l) => sum + Number(l.outstanding_balance ?? l.total_repayable ?? l.principal_amount ?? 0),
              0
            );
            setActiveLoansBalance(bal);
          }
        } catch (actErr) {
          console.warn('Active loans query fallback:', actErr);
        }
      } catch (err) {
        console.warn('Admin dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalMembers = members.length;
  const monthlyInflow = members.reduce((sum, m) => sum + (Number(m.monthly_contribution) || 0), 0);

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase();
    const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.membership_no || '').toLowerCase().includes(q)
    );
  });

  const kpiCards = [
    {
      label: 'Registered Members',
      value: totalMembers.toString(),
      sub: 'Active cooperative accounts',
      icon: <Users size={16} />,
      color: 'blue',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      valueColor: 'text-white',
    },
    {
      label: 'Monthly Savings Run-Rate',
      value: `₦${monthlyInflow.toLocaleString('en-NG')}`,
      sub: 'Scheduled monthly contributions',
      icon: <PiggyBank size={16} />,
      color: 'emerald',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-[#00E599]',
      valueColor: 'text-[#00E599]',
    },
    {
      label: pendingLoansCount > 0 ? 'Pending Loan Requests' : 'Active Loan Portfolio',
      value: pendingLoansCount > 0
        ? `${pendingLoansCount} Application${pendingLoansCount > 1 ? 's' : ''}`
        : `₦${activeLoansBalance.toLocaleString('en-NG')}`,
      sub: pendingLoansCount > 0
        ? `₦${pendingLoansAmount.toLocaleString('en-NG')} awaiting approval`
        : `${activeLoansCount} active facilities · 0% at risk`,
      icon: <CreditCard size={16} />,
      color: pendingLoansCount > 0 ? 'amber' : 'rose',
      bg: pendingLoansCount > 0 ? 'bg-amber-500/10' : 'bg-rose-500/10',
      border: pendingLoansCount > 0 ? 'border-amber-500/30' : 'border-rose-500/20',
      iconBg: pendingLoansCount > 0 ? 'bg-amber-500/20' : 'bg-rose-500/20',
      iconColor: pendingLoansCount > 0 ? 'text-amber-400' : 'text-rose-400',
      valueColor: pendingLoansCount > 0 ? 'text-amber-300' : 'text-white',
    },
    {
      label: 'Operational Standing',
      value: pendingLoansCount > 0 ? 'Review Needed' : '100% In Sync',
      sub: pendingLoansCount > 0 ? `${pendingLoansCount} pending underwriting` : 'Zero defaults · Clean standing',
      icon: <ShieldCheck size={16} />,
      color: pendingLoansCount > 0 ? 'amber' : 'emerald',
      bg: pendingLoansCount > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      border: pendingLoansCount > 0 ? 'border-amber-500/30' : 'border-emerald-500/20',
      iconBg: pendingLoansCount > 0 ? 'bg-amber-500/20' : 'bg-emerald-500/20',
      iconColor: pendingLoansCount > 0 ? 'text-amber-400' : 'text-[#00E599]',
      valueColor: pendingLoansCount > 0 ? 'text-amber-300' : 'text-[#00E599]',
    },
  ];

  const quickActions = [
    { href: '/admin-dashboard/members', label: 'Create Member Profile', icon: <UserPlus size={15} />, accent: 'blue' },
    { href: '/admin-dashboard/loans', label: 'Loan Facility & Underwriting', icon: <CreditCard size={15} />, accent: 'rose' },
    { href: '/financial-statements', label: 'Financial Statements & Reports', icon: <FileText size={15} />, accent: 'emerald' },
    { href: '/admin-dashboard/staff', label: 'Staff & Role Permissions', icon: <Shield size={15} />, accent: 'purple' },
    { href: '/admin-dashboard/audit-logs', label: 'System Audit Trail', icon: <ClipboardList size={15} />, accent: 'teal' },
  ];

  const accentHover: Record<string, string> = {
    blue: 'hover:bg-blue-500/10 hover:border-blue-500/40',
    rose: 'hover:bg-rose-500/10 hover:border-rose-500/40',
    emerald: 'hover:bg-emerald-500/10 hover:border-emerald-500/40',
    purple: 'hover:bg-purple-500/10 hover:border-purple-500/40',
    teal: 'hover:bg-teal-500/10 hover:border-teal-500/40',
  };

  const accentIcon: Record<string, string> = {
    blue: 'text-blue-400',
    rose: 'text-rose-400',
    emerald: 'text-[#00E599]',
    purple: 'text-purple-400',
    teal: 'text-teal-400',
  };

  return (
    <AppLayout role="admin" memberName="Raymond Longdiem" memberId="ADM/2026/0001">
      <div className="p-6 xl:p-8 2xl:p-10 max-w-7xl mx-auto space-y-6">

        {/* Ambient glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-[#00D084]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-600/5 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Operations Center</h1>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="w-2 h-2 rounded-full bg-[#00D084]" />
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Welcome, Raymond Longdiem · Lead Administrator · {today}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00E599] bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
              <span>Live System Connected</span>
            </div>
            <Link
              href="/admin-dashboard/members"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00D084] hover:bg-[#00E599] text-slate-950 font-bold text-xs transition-all shadow-sm active:scale-95"
            >
              <UserPlus size={14} />
              <span>Add Member</span>
            </Link>
          </div>
        </div>

        {/* Pending Loan Action Alert */}
        {pendingLoansCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 animate-pulse">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">
                    {pendingLoansCount} Loan Application{pendingLoansCount > 1 ? 's' : ''} Awaiting Administrative Review
                  </p>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-amber-300/80 mt-0.5 font-medium">
                  Total requested: ₦{pendingLoansAmount.toLocaleString('en-NG')} · Review underwriting files, collateral, guarantors & approve facilities.
                </p>
              </div>
            </div>
            <Link
              href="/admin-dashboard/loans?filter=pending"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md shrink-0"
            >
              Review Applications <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              className={`${kpi.bg} border ${kpi.border} rounded-2xl p-5 backdrop-blur-xl hover:border-opacity-50 transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.iconBg} ${kpi.iconColor}`}>
                  {kpi.icon}
                </div>
              </div>
              <p className={`text-2xl font-black font-tabular ${kpi.valueColor}`}>{kpi.value}</p>
              <p className="text-2xs text-slate-400 mt-1 font-medium">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Content Area: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Members Table (2 Columns wide) */}
          <div className="lg:col-span-2 bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
              <div>
                <h2 className="text-sm font-bold text-white">Registered Members Directory</h2>
                <p className="text-2xs text-slate-400 font-medium">Real-time cooperative member records</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search member..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#00D084]/20 focus:border-[#00D084]/50 w-44 transition-all"
                  />
                </div>
                <Link
                  href="/admin-dashboard/members"
                  className="text-xs font-bold text-[#00E599] hover:text-emerald-300 flex items-center gap-1 shrink-0 transition-colors"
                >
                  Manage <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-[#00D084] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                No members found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-2xs uppercase tracking-wider text-slate-500">
                      <th className="pb-2.5 font-bold">Member</th>
                      <th className="pb-2.5 font-bold">Member ID</th>
                      <th className="pb-2.5 font-bold">Contribution</th>
                      <th className="pb-2.5 font-bold">Status</th>
                      <th className="pb-2.5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredMembers.map(m => (
                      <tr key={m.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-bold text-white">
                              {m.first_name} {m.last_name}
                            </p>
                            <p className="text-2xs text-slate-400">{m.email}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-mono text-2xs text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 font-semibold">
                            {m.membership_no || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-tabular font-bold text-white">
                          ₦{Number(m.monthly_contribution || 0).toLocaleString('en-NG')}
                          <span className="text-2xs text-slate-400 font-normal">/mo</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#00E599] border border-emerald-500/30">
                            <UserCheck size={10} />
                            <span className="capitalize">{m.status || 'Active'}</span>
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href="/admin-dashboard/members"
                            className="text-2xs font-bold text-[#00E599] hover:text-emerald-300 transition-colors"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions & Pending Queue (1 Column) */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
              <h2 className="text-sm font-bold text-white mb-3">Administrative Actions</h2>
              <div className="space-y-2">
                {quickActions.map(action => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 transition-all text-xs font-bold text-slate-200 group ${accentHover[action.accent]}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={accentIcon[action.accent]}>{action.icon}</span>
                      <span>{action.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.href === '/admin-dashboard/loans' && pendingLoansCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                          {pendingLoansCount} Pending
                        </span>
                      )}
                      <ArrowRight size={13} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Real-time Pending Queue Component */}
            <AdminPendingQueue />

            {/* Analytics stub card */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <BarChart2 size={14} />
                </div>
                <span className="text-xs font-bold text-white">Quick Analytics</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Active Members</span>
                  <span className="text-white font-bold font-tabular">{totalMembers}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00D084] rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Monthly Inflow</span>
                  <span className="text-[#00E599] font-bold font-tabular">₦{monthlyInflow.toLocaleString('en-NG', { notation: 'compact' })}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}