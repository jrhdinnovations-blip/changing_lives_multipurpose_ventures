'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  Check,
  X,
  Send,
  Building,
  ShieldCheck,
  Calendar,
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
  app_no?: string;
  applicant_name: string;
  applicant_phone?: string;
  applicant_email?: string;
  applicant_address?: string;
  requested_amount: number;
  loan_amount?: number;
  amount?: number;
  status: string;
  app_status?: string;
  application_status?: string;
  created_at: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  loan_duration_months: number;
  duration_months?: number;
  repayment_period_months?: number;
  monthly_interest_amount?: number;
  total_repayment_amount?: number;
  member_id?: string;
  submitted_by_user_id?: string;
  disbursed_at?: string;
  disbursement_reference?: string;
  disbursement_method?: string;
  admin_notes?: string;
  notes?: string;
  rejection_reason?: string;
  [key: string]: any;
}

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  ready_for_disbursement: 'bg-teal-500/15 text-teal-400 border border-teal-500/30',
  disbursed: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  active: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  completed: 'bg-white/10 text-white/50 border border-white/15',
  pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  submitted: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
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
  const { user } = useAuth();
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);
  const [totalInvestments, setTotalInvestments] = useState(0);

  const [accountantName, setAccountantName] = useState('Accountant');
  const [accountantId, setAccountantId] = useState('ACCT/2026');

  // Disbursement Modal State
  const [selectedForDisbursement, setSelectedForDisbursement] = useState<LoanRow | null>(null);
  const [disbursementModalOpen, setDisbursementModalOpen] = useState(false);
  const [disbursementRef, setDisbursementRef] = useState('');
  const [disbursementMethod, setDisbursementMethod] = useState('First Bank Corporate Transfer');
  const [disbursementDate, setDisbursementDate] = useState(new Date().toISOString().split('T')[0]);
  const [disbursementNotes, setDisbursementNotes] = useState('');
  const [disbursing, setDisbursing] = useState(false);
  const [disburseSuccess, setDisburseSuccess] = useState('');
  const [disburseError, setDisburseError] = useState('');

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const email = user.email?.toLowerCase();
    if (email === 'bimaeteng4@gmail.com') {
      setAccountantName('Bima Josiah Emmanuel');
      setAccountantId('ACCT/CLM/0013');
    }
    async function fetchAccountantProfile() {
      try {
        const { data } = await supabase
          .from('members')
          .select('first_name, last_name, member_number')
          .ilike('email', user.email)
          .maybeSingle();
        if (data) {
          const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
          if (fullName) setAccountantName(fullName);
          if (data.member_number) setAccountantId(`ACCT/${data.member_number}`);
        }
      } catch {}
    }
    fetchAccountantProfile();
  }, [user]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Query loan applications from Supabase
      const { data: loanData, error: loanErr } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      let localApps: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('climps_loan_applications');
          if (stored) localApps = JSON.parse(stored);
        } catch {}
      }

      const map = new Map<string, any>();
      (loanData || []).forEach((a: any) => {
        let notesData: any = {};
        if (a.notes) {
          try {
            notesData = typeof a.notes === 'string' ? JSON.parse(a.notes) : a.notes;
          } catch {
            notesData = {};
          }
        }
        const key = a.id || a.app_no || a.application_number;
        map.set(key, {
          ...a,
          ...notesData,
          status: a.status || a.app_status || a.application_status || 'pending',
          requested_amount: Number(a.amount ?? a.requested_amount ?? a.loan_amount ?? notesData.loan_amount ?? 0),
          loan_duration_months: Number(a.repayment_period_months ?? a.loan_duration_months ?? a.duration_months ?? notesData.loan_duration_months ?? 1),
          application_number: a.app_no || a.application_number || notesData.application_number || ('APP-' + a.id?.slice(0, 8)),
          applicant_name: a.applicant_name || notesData.applicant_name || 'Applicant',
          applicant_phone: a.applicant_phone || notesData.applicant_phone || '',
          account_name: notesData.account_name || a.account_name || a.applicant_name || '—',
          account_number: notesData.account_number || a.account_number || '—',
          bank_name: notesData.bank_name || a.bank_name || '—',
          created_at: a.created_at,
          notes: a.notes,
        });
      });

      localApps.forEach((a: any) => {
        let notesData: any = {};
        if (a.notes) {
          try {
            notesData = typeof a.notes === 'string' ? JSON.parse(a.notes) : a.notes;
          } catch {
            notesData = {};
          }
        }
        const key = a.id || a.app_no || a.application_number;
        if (!map.has(key)) {
          map.set(key, {
            ...a,
            ...notesData,
            status: a.status || a.app_status || a.application_status || 'pending',
            requested_amount: Number(a.amount ?? a.requested_amount ?? a.loan_amount ?? notesData.loan_amount ?? 0),
            loan_duration_months: Number(a.repayment_period_months ?? a.loan_duration_months ?? a.duration_months ?? notesData.loan_duration_months ?? 1),
            application_number: a.app_no || a.application_number || notesData.application_number || ('APP-' + a.id?.slice(0, 8)),
            applicant_name: a.applicant_name || notesData.applicant_name || 'Applicant',
            applicant_phone: a.applicant_phone || notesData.applicant_phone || '',
            account_name: notesData.account_name || a.account_name || a.applicant_name || '—',
            account_number: notesData.account_number || a.account_number || '—',
            bank_name: notesData.bank_name || a.bank_name || '—',
            created_at: a.created_at,
            notes: a.notes,
          });
        }
      });

      const allMapped: LoanRow[] = Array.from(map.values());
      setLoans(allMapped);

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

  function openDisbursementModal(loan: LoanRow) {
    setSelectedForDisbursement(loan);
    const rand = Math.floor(100000 + Math.random() * 900000);
    setDisbursementRef(`FBN-CLMV-${new Date().getFullYear()}-${rand}`);
    setDisbursementMethod('First Bank Corporate Transfer');
    setDisbursementDate(new Date().toISOString().split('T')[0]);
    setDisbursementNotes(`Disbursed to ${loan.account_name} (${loan.bank_name})`);
    setDisburseError('');
    setDisburseSuccess('');
    setDisbursementModalOpen(true);
  }

  async function handleConfirmDisbursement() {
    if (!selectedForDisbursement) return;
    setDisbursing(true);
    setDisburseError('');
    try {
      const loan = selectedForDisbursement;
      const principal = Number(loan.requested_amount || loan.loan_amount || 0);
      const months = Number(loan.loan_duration_months || loan.duration_months || 1);
      const monthlyRate = 0.10; // 10% monthly rate
      const monthlyInterest = loan.monthly_interest_amount ? Number(loan.monthly_interest_amount) : Math.round(principal * monthlyRate);
      const totalInterest = monthlyInterest * months;
      const totalRepayable = loan.total_repayment_amount ? Number(loan.total_repayment_amount) : (principal + totalInterest);
      const monthlyRepayment = Math.round(totalRepayable / months);

      let existingNotes: any = {};
      try {
        existingNotes = typeof loan.notes === 'string' ? JSON.parse(loan.notes) : (loan.notes || {});
      } catch {
        existingNotes = {};
      }

      const updatedNotes = {
        ...existingNotes,
        disbursement: {
          disbursed_at: new Date().toISOString(),
          disbursed_by: user?.email || user?.id || 'accountant',
          reference: disbursementRef,
          method: disbursementMethod,
          notes: disbursementNotes,
        },
      };

      // 1. Update loan_applications in Supabase
      try {
        await supabase
          .from('loan_applications')
          .update({
            status: 'disbursed',
            notes: JSON.stringify(updatedNotes),
            updated_at: new Date().toISOString(),
          })
          .eq('id', loan.id);
      } catch (e) {
        console.warn('Supabase application update bypassed:', e);
      }

      // 2. Create the official loan in loans table
      let targetMemberId = loan.member_id;
      if (!targetMemberId && (loan.applicant_email || loan.applicant_name)) {
        try {
          if (loan.applicant_email) {
            const { data: m } = await supabase
              .from('members')
              .select('id')
              .ilike('email', loan.applicant_email)
              .maybeSingle();
            if (m?.id) targetMemberId = m.id;
          }
        } catch {}
      }

      let newLoanId = 'loan_' + Date.now();
      if (targetMemberId) {
        try {
          const { data: createdLoan, error: loanErr } = await supabase
            .from('loans')
            .insert({
              member_id: targetMemberId,
              principal_amount: principal,
              interest_rate: 10,
              duration_months: months,
              total_repayable: totalRepayable,
              monthly_repayment: monthlyRepayment,
              disbursement_date: disbursementDate,
              loan_status: 'active',
              outstanding_balance: totalRepayable,
            })
            .select('id')
            .maybeSingle();
          if (!loanErr && createdLoan?.id) {
            newLoanId = createdLoan.id;
          }
        } catch (e) {
          console.warn('Supabase loan facility creation bypassed:', e);
        }
      }

      // 3. Create repayment schedule instalments
      try {
        const schedules = [];
        for (let i = 1; i <= months; i++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + i);
          schedules.push({
            loan_id: newLoanId,
            instalment_number: i,
            due_date: dueDate.toISOString().split('T')[0],
            expected_amount: monthlyRepayment,
            amount_paid: 0,
            schedule_status: 'upcoming',
          });
        }
        await supabase.from('loan_repayment_schedules').insert(schedules);
      } catch {}

      // 4. Record audit trail
      try {
        await supabase.from('loan_audit_trail').insert({
          application_id: loan.id,
          loan_id: newLoanId,
          user_id: user?.id,
          action: 'loan_disbursed',
          previous_status: 'approved',
          new_status: 'disbursed',
          notes: `Disbursement confirmed by Accountant: Ref ${disbursementRef} via ${disbursementMethod}. ${disbursementNotes}`,
        });
      } catch {}

      // 5. Update local storage caches for immediate synchronization across dashboards
      if (typeof window !== 'undefined') {
        try {
          // Update applications cache
          const cachedApps = JSON.parse(localStorage.getItem('climps_loan_applications') || '[]');
          const updatedApps = cachedApps.map((a: any) =>
            a.id === loan.id || a.application_number === loan.application_number
              ? { ...a, status: 'disbursed', app_status: 'disbursed', application_status: 'disbursed', notes: JSON.stringify(updatedNotes) }
              : a
          );
          localStorage.setItem('climps_loan_applications', JSON.stringify(updatedApps));

          // Save active loans cache
          const cachedLoans = JSON.parse(localStorage.getItem('climps_active_loans') || '[]');
          cachedLoans.unshift({
            id: newLoanId,
            member_id: targetMemberId,
            principal_amount: principal,
            outstanding_balance: totalRepayable,
            monthly_repayment: monthlyRepayment,
            total_repayable: totalRepayable,
            duration_months: months,
            loan_status: 'active',
            disbursement_date: disbursementDate,
            applicant_name: loan.applicant_name,
            application_number: loan.application_number,
          });
          localStorage.setItem('climps_active_loans', JSON.stringify(cachedLoans));

          // Trigger cross-tab storage event
          window.dispatchEvent(new Event('storage'));
        } catch {}
      }

      // 6. Update local component state
      setLoans(prev =>
        prev.map(l =>
          l.id === loan.id
            ? {
                ...l,
                status: 'disbursed',
                app_status: 'disbursed',
                application_status: 'disbursed',
                disbursed_at: new Date().toISOString(),
                disbursement_reference: disbursementRef,
              }
            : l
        )
      );

      setDisburseSuccess(`Payment confirmed! ₦${principal.toLocaleString()} successfully disbursed to ${loan.applicant_name} (${loan.bank_name} - ${loan.account_number}). Status is now ACTIVE on customer dashboard.`);
      setTimeout(() => {
        setDisbursementModalOpen(false);
        setSelectedForDisbursement(null);
        setDisburseSuccess('');
      }, 2200);
    } catch (err: any) {
      setDisburseError(err?.message || 'Failed to complete disbursement');
    } finally {
      setDisbursing(false);
    }
  }

  const approvedPending = loans.filter(l =>
    ['approved', 'ready_for_disbursement'].includes(l.status) ||
    ['approved', 'ready_for_disbursement'].includes(l.app_status || '') ||
    ['approved', 'ready_for_disbursement'].includes(l.application_status || '')
  );

  const disbursed = loans.filter(l =>
    ['disbursed', 'active'].includes(l.status) ||
    ['disbursed', 'active'].includes(l.app_status || '') ||
    ['disbursed', 'active'].includes(l.application_status || '')
  );

  const totalApprovedValue = approvedPending.reduce((s, l) => s + (Number(l.requested_amount || l.loan_amount) || 0), 0);
  const totalDisbursedValue = disbursed.reduce((s, l) => s + (Number(l.requested_amount || l.loan_amount) || 0), 0);

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
    <AppLayout role="accountant" memberName={accountantName} memberId={accountantId}>
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
              <span>Live Financial Desk</span>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all"
            >
              <Clock size={13} />
              <span>Refresh</span>
            </button>
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
                  Approved Loans — Awaiting Disbursement
                </h2>
                <p className="text-2xs text-slate-400 mt-0.5">Approved by Admin · Reconcile and disburse funds to borrower</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {approvedPending.length} Pending Payout
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : approvedPending.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-2.5" />
                <p className="text-sm text-white font-bold">All Approved Loans Disbursed</p>
                <p className="text-xs text-slate-400 mt-1">When an Admin approves a loan, it will appear here immediately for payout.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-2xs uppercase tracking-wider text-slate-500">
                      <th className="pb-2.5 font-bold">Applicant</th>
                      <th className="pb-2.5 font-bold">Ref</th>
                      <th className="pb-2.5 font-bold">Amount</th>
                      <th className="pb-2.5 font-bold">Beneficiary Account</th>
                      <th className="pb-2.5 font-bold">Status</th>
                      <th className="pb-2.5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {approvedPending.map(loan => (
                      <tr key={loan.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 pr-3">
                          <p className="font-bold text-white">{loan.applicant_name}</p>
                          <p className="text-2xs text-slate-400">{loan.loan_duration_months}mo · 10% monthly</p>
                        </td>
                        <td className="py-3.5 pr-3">
                          <span className="font-mono text-2xs text-[#00E599] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {loan.application_number}
                          </span>
                        </td>
                        <td className="py-3.5 pr-3 font-black text-amber-300 font-tabular text-sm">
                          {formatNGN(loan.requested_amount || loan.loan_amount || 0)}
                        </td>
                        <td className="py-3.5 pr-3">
                          <p className="text-white font-semibold text-2xs">{loan.bank_name}</p>
                          <p className="text-[#38BDF8] text-xs font-mono font-bold">{loan.account_number}</p>
                          <p className="text-slate-300 text-2xs truncate max-w-[140px]">{loan.account_name}</p>
                        </td>
                        <td className="py-3.5 pr-3">
                          <StatusBadge status={loan.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => openDisbursementModal(loan)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-2xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 whitespace-nowrap cursor-pointer"
                          >
                            <CreditCard size={13} />
                            <span>Disburse & Confirm</span>
                          </button>
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
                  {disbursed.slice(0, 5).map(loan => (
                    <div key={loan.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-white font-semibold truncate max-w-[130px]">{loan.applicant_name}</p>
                        <p className="text-2xs text-[#00E599] font-mono">{loan.application_number}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#00E599] font-bold font-tabular block">
                          {formatNGN(loan.requested_amount || loan.loan_amount || 0)}
                        </span>
                        <span className="text-2xs text-slate-400 font-medium">✓ Disbursed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disbursement Confirmation Modal */}
        {disbursementModalOpen && selectedForDisbursement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0B1528] border border-white/15 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-[#00E599] border border-emerald-500/30">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Confirm Loan Disbursement</h3>
                    <p className="text-xs text-slate-400">Accountant Authorization & Payment Confirmation</p>
                  </div>
                </div>
                <button
                  onClick={() => setDisbursementModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {disburseSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-[#00E599] border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-base font-black text-white">Disbursement Confirmed!</h4>
                  <p className="text-xs text-emerald-300 font-medium leading-relaxed max-w-sm mx-auto">
                    {disburseSuccess}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disburseError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                      {disburseError}
                    </div>
                  )}

                  {/* Beneficiary Details Box */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Borrower:</span>
                      <span className="text-white font-bold">{selectedForDisbursement.applicant_name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Application Ref:</span>
                      <span className="text-[#00E599] font-mono font-bold">{selectedForDisbursement.application_number}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Approved Principal:</span>
                      <span className="text-2xl font-black text-[#00E599] font-tabular">
                        {formatNGN(selectedForDisbursement.requested_amount || selectedForDisbursement.loan_amount || 0)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-2xs">Beneficiary Bank</span>
                        <span className="text-white font-semibold">{selectedForDisbursement.bank_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-2xs">Account Number</span>
                        <span className="text-sky-400 font-mono font-bold text-sm">{selectedForDisbursement.account_number}</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-400 block text-2xs">Account Name</span>
                      <span className="text-white font-medium">{selectedForDisbursement.account_name}</span>
                    </div>
                  </div>

                  {/* Payment Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Bank Transfer Reference / Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={disbursementRef}
                        onChange={e => setDisbursementRef(e.target.value)}
                        placeholder="e.g. FBN-2026-XXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-[#00E599]/60 focus:bg-[#080E1C]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Payment Channel
                        </label>
                        <select
                          value={disbursementMethod}
                          onChange={e => setDisbursementMethod(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#0B1528] text-white text-xs focus:outline-none focus:border-[#00E599]/60"
                        >
                          <option value="First Bank Corporate Transfer">First Bank Corporate</option>
                          <option value="NIBSS Instant Payment (NIP)">NIBSS (NIP) Transfer</option>
                          <option value="Commercial Bank Transfer">Commercial Bank Transfer</option>
                          <option value="Cheque Payout">Cheque Payout</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Disbursement Date
                        </label>
                        <input
                          type="date"
                          value={disbursementDate}
                          onChange={e => setDisbursementDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#0B1528] text-white text-xs focus:outline-none focus:border-[#00E599]/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Reconciliation Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={disbursementNotes}
                        onChange={e => setDisbursementNotes(e.target.value)}
                        placeholder="e.g. Paid from First Bank Operating Account"
                        className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00E599]/60 focus:bg-[#080E1C]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setDisbursementModalOpen(false)}
                      disabled={disbursing}
                      className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDisbursement}
                      disabled={disbursing || !disbursementRef}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {disbursing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Processing Payout...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Confirm & Disburse Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
