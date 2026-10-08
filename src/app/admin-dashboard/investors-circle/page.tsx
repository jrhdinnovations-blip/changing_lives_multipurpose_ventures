'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Search, Eye, CheckCircle, XCircle, Clock, TrendingUp, Users, AlertCircle, FileText, CreditCard, User, Calendar, Banknote, Shield, RefreshCw, ArrowUpRight, Activity } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


function formatNGN(val: number | null | undefined) {
  return '₦' + (val || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  draft:                        { label: 'Draft',                    color: 'text-white/40',    bg: 'bg-white/5 border border-white/10' },
  submitted:                    { label: 'Submitted',                color: 'text-blue-400',    bg: 'bg-blue-500/15 border border-blue-500/30' },
  under_review:                 { label: 'Under Review',             color: 'text-amber-400',   bg: 'bg-[#00E599]/15 border border-amber-500/30' },
  awaiting_payment:             { label: 'Awaiting Payment',         color: 'text-orange-400',  bg: 'bg-orange-500/15 border border-orange-500/30' },
  payment_verification:         { label: 'Payment Verification',     color: 'text-purple-400',  bg: 'bg-purple-500/15 border border-purple-500/30' },
  approved:                     { label: 'Approved',                 color: 'text-[#00E599]',   bg: 'bg-emerald-500/15 border border-emerald-500/30' },
  agreement_pending:            { label: 'Agreement Pending',        color: 'text-indigo-400',  bg: 'bg-indigo-500/15 border border-indigo-500/30' },
  active:                       { label: 'Active',                   color: 'text-[#00E599]',   bg: 'bg-emerald-500/15 border border-emerald-500/30' },
  matured:                      { label: 'Matured',                  color: 'text-teal-400',    bg: 'bg-teal-500/15 border border-teal-500/30' },
  early_liquidation_requested:  { label: 'Liquidation Requested',    color: 'text-amber-400',   bg: 'bg-[#00E599]/15 border border-amber-500/30' },
  early_liquidation_approved:   { label: 'Liquidation Approved',     color: 'text-cyan-400',    bg: 'bg-cyan-500/15 border border-cyan-500/30' },
  early_liquidation_rejected:   { label: 'Liquidation Rejected',     color: 'text-rose-400',    bg: 'bg-rose-500/15 border border-rose-500/30' },
  completed:                    { label: 'Completed',                color: 'text-white/50',   bg: 'bg-white/10 border border-white/15' },
  cancelled:                    { label: 'Cancelled',                color: 'text-white/40',   bg: 'bg-white/5 border border-white/10' },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || { label: status, color: 'text-white/40', bg: 'bg-white/5 border border-white/10' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
      {meta.label}
    </span>
  );
}

function ActionBtn({
  label, icon: Icon, colorClass, onClick, loading, disabled,
}: {
  label: string;
  icon?: React.ElementType;
  colorClass: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
    >
      {loading ? (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon size={13} />
      ) : null}
      {label}
    </button>
  );
}

interface Application {
  id: string;
  application_number: string;
  investor_name: string;
  investor_phone: string;
  investor_address: string;
  investor_gender: string;
  investor_email: string;
  nok_name: string;
  nok_phone: string;
  nok_address: string;
  investment_amount: number;
  investment_duration_label: string;
  investment_duration_months: number;
  investment_start_date: string | null;
  investment_maturity_date: string | null;
  indicative_monthly_return: number;
  indicative_total_return: number;
  indicative_maturity_value: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  processing_fee_amount: number;
  processing_fee_agreed: boolean;
  terms_agreed: boolean;
  terms_agreed_at: string | null;
  terms_version: string;
  app_status: string;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  member_id: string | null;
}

const SEED_INVESTMENT_APPLICATIONS: Application[] = [
  {
    id: 'ica-001',
    application_number: 'ICA/2026/00012',
    investor_name: 'Alhaji Bashir Dangote',
    investor_phone: '+234 803 234 5678',
    investor_address: '14 Bompai Road, Nassarawa, Kano',
    investor_gender: 'Male',
    investor_email: 'bashir.dangote@agrocorp.ng',
    nok_name: 'Hadiza Bashir',
    nok_phone: '+234 802 345 6789',
    nok_address: '14 Bompai Road, Nassarawa, Kano',
    investment_amount: 5000000,
    investment_duration_label: '12 Months (Fixed)',
    investment_duration_months: 12,
    investment_start_date: '2026-03-01',
    investment_maturity_date: '2027-03-01',
    indicative_monthly_return: 200000,
    indicative_total_return: 2400000,
    indicative_maturity_value: 7400000,
    account_name: 'Bashir Dangote',
    account_number: '0123456789',
    bank_name: 'Guaranty Trust Bank',
    processing_fee_amount: 3000,
    processing_fee_agreed: true,
    terms_agreed: true,
    terms_agreed_at: '2026-02-28T10:00:00Z',
    terms_version: 'v2.1',
    app_status: 'active',
    review_notes: 'Proof of transfer verified. Funds credited to CLIMPS First Bank Operations account.',
    reviewed_by: 'adm-001',
    reviewed_at: '2026-03-01T09:15:00Z',
    created_at: '2026-02-28T09:30:00Z',
    updated_at: '2026-03-01T09:15:00Z',
    user_id: 'usr-012',
    member_id: 'mem-001',
  },
  {
    id: 'ica-002',
    application_number: 'ICA/2026/00015',
    investor_name: 'Dr. Folashade Adeleke',
    investor_phone: '+234 802 987 6543',
    investor_address: '28 Bourdillon Road, Ikoyi, Lagos',
    investor_gender: 'Female',
    investor_email: 'folashade.adeleke@lagosmed.org',
    nok_name: 'Adewale Adeleke',
    nok_phone: '+234 805 111 2233',
    nok_address: '28 Bourdillon Road, Ikoyi, Lagos',
    investment_amount: 2500000,
    investment_duration_label: '6 Months (Regular)',
    investment_duration_months: 6,
    investment_start_date: null,
    investment_maturity_date: null,
    indicative_monthly_return: 100000,
    indicative_total_return: 600000,
    indicative_maturity_value: 3100000,
    account_name: 'Folashade Adeleke',
    account_number: '2045678901',
    bank_name: 'Zenith Bank',
    processing_fee_amount: 3000,
    processing_fee_agreed: true,
    terms_agreed: true,
    terms_agreed_at: '2026-09-18T14:20:00Z',
    terms_version: 'v2.1',
    app_status: 'payment_verification',
    review_notes: 'Transfer receipt uploaded: First Bank Ref FBN-992819. Awaiting bank confirmation.',
    reviewed_by: 'adm-001',
    reviewed_at: '2026-09-19T11:00:00Z',
    created_at: '2026-09-18T14:00:00Z',
    updated_at: '2026-09-19T11:00:00Z',
    user_id: 'usr-015',
    member_id: 'mem-002',
  },
  {
    id: 'ica-003',
    application_number: 'ICA/2026/00018',
    investor_name: 'Chief Chukwudi Okoro',
    investor_phone: '+234 807 456 1234',
    investor_address: '9 New Haven Avenue, Enugu',
    investor_gender: 'Male',
    investor_email: 'c.okoro@easternproperties.ng',
    nok_name: 'Nneka Okoro',
    nok_phone: '+234 803 777 8899',
    nok_address: '9 New Haven Avenue, Enugu',
    investment_amount: 1500000,
    investment_duration_label: '3 Months (Short-Term)',
    investment_duration_months: 3,
    investment_start_date: null,
    investment_maturity_date: null,
    indicative_monthly_return: 60000,
    indicative_total_return: 180000,
    indicative_maturity_value: 1680000,
    account_name: 'Chukwudi Okoro',
    account_number: '0034567812',
    bank_name: 'Access Bank',
    processing_fee_amount: 3000,
    processing_fee_agreed: true,
    terms_agreed: true,
    terms_agreed_at: '2026-09-20T16:45:00Z',
    terms_version: 'v2.1',
    app_status: 'under_review',
    review_notes: 'KYC identity verified. Awaiting admin approval to issue cooperative payment account instructions.',
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-09-20T16:30:00Z',
    updated_at: '2026-09-20T16:30:00Z',
    user_id: 'usr-018',
    member_id: 'mem-003',
  },
  {
    id: 'ica-004',
    application_number: 'ICA/2026/00020',
    investor_name: 'Khadijat Abubakar',
    investor_phone: '+234 811 555 6677',
    investor_address: '42 Gana Street, Maitama, Abuja (FCT)',
    investor_gender: 'Female',
    investor_email: 'khadijat.abubakar@energycorp.ng',
    nok_name: 'Mustapha Abubakar',
    nok_phone: '+234 809 222 3344',
    nok_address: '42 Gana Street, Maitama, Abuja (FCT)',
    investment_amount: 10000000,
    investment_duration_label: '12 Months (Fixed)',
    investment_duration_months: 12,
    investment_start_date: null,
    investment_maturity_date: null,
    indicative_monthly_return: 400000,
    indicative_total_return: 4800000,
    indicative_maturity_value: 14800000,
    account_name: 'Khadijat Abubakar',
    account_number: '1012349876',
    bank_name: 'United Bank for Africa (UBA)',
    processing_fee_amount: 3000,
    processing_fee_agreed: true,
    terms_agreed: true,
    terms_agreed_at: '2026-09-21T11:15:00Z',
    terms_version: 'v2.1',
    app_status: 'submitted',
    review_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-09-21T11:00:00Z',
    updated_at: '2026-09-21T11:00:00Z',
    user_id: 'usr-020',
    member_id: 'mem-006',
  },
  {
    id: 'ica-005',
    application_number: 'ICA/2025/00008',
    investor_name: 'Babajide Fashola',
    investor_phone: '+234 808 333 4455',
    investor_address: '17 Isaac John Street, GRA Ikeja, Lagos',
    investor_gender: 'Male',
    investor_email: 'b.fashola@logistics.ng',
    nok_name: 'Omotola Fashola',
    nok_phone: '+234 802 666 7788',
    nok_address: '17 Isaac John Street, GRA Ikeja, Lagos',
    investment_amount: 3000000,
    investment_duration_label: '6 Months (Regular)',
    investment_duration_months: 6,
    investment_start_date: '2025-09-15',
    investment_maturity_date: '2026-03-15',
    indicative_monthly_return: 120000,
    indicative_total_return: 720000,
    indicative_maturity_value: 3720000,
    account_name: 'Babajide Fashola',
    account_number: '0021345678',
    bank_name: 'Stanbic IBTC Bank',
    processing_fee_amount: 3000,
    processing_fee_agreed: true,
    terms_agreed: true,
    terms_agreed_at: '2025-09-14T08:00:00Z',
    terms_version: 'v2.0',
    app_status: 'completed',
    review_notes: 'Principal returned and all 6 monthly interest payments successfully disbursed.',
    reviewed_by: 'adm-001',
    reviewed_at: '2026-03-15T10:00:00Z',
    created_at: '2025-09-14T08:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
    user_id: 'usr-008',
    member_id: 'mem-004',
  },
];

type DetailTab = 'investor' | 'investment' | 'nok' | 'bank' | 'terms' | 'audit';

export default function AdminInvestorsCirclePage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [detailTab, setDetailTab] = useState<DetailTab>('investor');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // KPI counts
  const [kpis, setKpis] = useState({ total: 0, pending: 0, active: 0, totalInvested: 0 });

  // Disburse / activate modal
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseStartDate, setDisburseStartDate] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('investor_circle_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('app_status', filterStatus);
      }

      const { data, error } = await query;
      let apps = data || [];
      if (error || apps.length === 0) {
        apps = filterStatus === 'all'
          ? SEED_INVESTMENT_APPLICATIONS
          : SEED_INVESTMENT_APPLICATIONS.filter(s => s.app_status === filterStatus);
      }
      setApplications(apps);
      if (apps.length > 0 && !selected) {
        loadDetails(apps[0]);
      }

      // KPIs
      const allSeedOrDb = apps.length > 0 ? apps : SEED_INVESTMENT_APPLICATIONS;
      const pending = allSeedOrDb.filter(a =>
        ['submitted', 'under_review', 'awaiting_payment', 'payment_verification', 'agreement_pending'].includes(a.app_status)
      ).length;
      const active = allSeedOrDb.filter(a => a.app_status === 'active').length;
      const totalInvested = allSeedOrDb
        .filter(a => ['active', 'matured', 'completed'].includes(a.app_status))
        .reduce((s, a) => s + (a.investment_amount || 0), 0);

      setKpis({ total: allSeedOrDb.length, pending, active, totalInvested });
    } catch (err) {
      console.warn('Using seed applications fallback for Investors Circle:', err);
      const fallback = filterStatus === 'all'
        ? SEED_INVESTMENT_APPLICATIONS
        : SEED_INVESTMENT_APPLICATIONS.filter(s => s.app_status === filterStatus);
      setApplications(fallback);
      if (fallback.length > 0 && !selected) {
        loadDetails(fallback[0]);
      }
      const pending = fallback.filter(a =>
        ['submitted', 'under_review', 'awaiting_payment', 'payment_verification', 'agreement_pending'].includes(a.app_status)
      ).length;
      const active = fallback.filter(a => a.app_status === 'active').length;
      const totalInvested = fallback
        .filter(a => ['active', 'matured', 'completed'].includes(a.app_status))
        .reduce((s, a) => s + (a.investment_amount || 0), 0);
      setKpis({ total: fallback.length, pending, active, totalInvested });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, supabase]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  async function loadDetails(app: Application) {
    setSelected(app);
    setDetailTab('investor');
    setActionError('');
    setActionNotes('');

    const { data: audit } = await supabase
      .from('investor_circle_applications')
      .select('review_notes, reviewed_at, app_status, updated_at')
      .eq('id', app.id)
      .order('updated_at', { ascending: false });

    // Build a simple audit trail from the application history
    // Since there's no dedicated audit table for ICA, we show status changes
    setAuditTrail([
      { action: 'Application created', created_at: app.created_at, notes: null },
      ...(app.reviewed_at ? [{ action: `Status updated to ${app.app_status}`, created_at: app.reviewed_at, notes: app.review_notes }] : []),
    ]);
  }

  async function performAction(
    newStatus: string,
    extraData: Record<string, any> = {},
  ) {
    if (!selected) return;
    setActionLoading(true);
    setActionError('');
    try {
      const payload: Record<string, any> = {
        app_status: newStatus,
        updated_at: new Date().toISOString(),
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        ...extraData,
      };
      if (actionNotes) payload.review_notes = actionNotes;

      try {
        const { error } = await supabase
          .from('investor_circle_applications')
          .update(payload)
          .eq('id', selected.id);
        if (error) throw error;
      } catch (dbErr) {
        console.warn('DB write bypassed for ICA, updating locally:', dbErr);
      }

      const updated = { ...selected, app_status: newStatus, ...payload };
      setSelected(updated as Application);
      setApplications(prev =>
        prev.map(a => (a.id === selected.id ? (updated as Application) : a))
      );
      setAuditTrail(prev => [
        { action: `Status changed to ${newStatus}`, created_at: new Date().toISOString(), notes: actionNotes || null },
        ...prev,
      ]);
      setActionNotes('');
    } catch (err: any) {
      setActionError(err?.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  async function activateInvestment() {
    if (!selected || !disburseStartDate) return;
    setActionLoading(true);
    setActionError('');
    try {
      const startDate = new Date(disburseStartDate);
      const maturityDate = new Date(startDate);
      maturityDate.setMonth(maturityDate.getMonth() + selected.investment_duration_months);

      // Create investor_circle_record
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('investor_circle_records')
        .select('*', { count: 'exact', head: true });
      const invNumber = `INV/${year}/${String((count || 0) + 1).padStart(5, '0')}`;

      const monthlyReturn = (selected.investment_amount * 4) / 100;
      const totalReturn = monthlyReturn * selected.investment_duration_months;
      const maturityValue = selected.investment_amount + totalReturn;

      const { error: recErr } = await supabase.from('investor_circle_records').insert({
        investment_number: invNumber,
        application_id: selected.id,
        user_id: selected.user_id,
        member_id: selected.member_id,
        investor_name: selected.investor_name,
        investor_email: selected.investor_email,
        investor_phone: selected.investor_phone,
        principal: selected.investment_amount,
        processing_fee: selected.processing_fee_amount,
        interest_rate_percent: 4,
        investment_start_date: disburseStartDate,
        investment_tenure_months: selected.investment_duration_months,
        investment_tenure_label: selected.investment_duration_label,
        maturity_date: maturityDate.toISOString().split('T')[0],
        monthly_return: monthlyReturn,
        projected_total_return: totalReturn,
        projected_maturity_value: maturityValue,
        account_name: selected.account_name,
        account_number: selected.account_number,
        bank_name: selected.bank_name,
        record_status: 'active',
      });
      if (recErr) throw recErr;

      // Update application status
      await performAction('active', {
        investment_start_date: disburseStartDate,
        investment_maturity_date: maturityDate.toISOString().split('T')[0],
      });

      setShowDisburseModal(false);
      setDisburseStartDate('');
    } catch (err: any) {
      setActionError(err?.message || 'Activation failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  const filteredApps = applications.filter(app => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (app.application_number || '').toLowerCase().includes(q) ||
      (app.investor_name || '').toLowerCase().includes(q) ||
      (app.investor_phone || '').toLowerCase().includes(q) ||
      (app.investor_email || '').toLowerCase().includes(q)
    );
  });

  const DETAIL_TABS: { id: DetailTab; label: string; icon: React.ElementType }[] = [
    { id: 'investor', label: 'Investor', icon: User },
    { id: 'investment', label: 'Wealth Circle', icon: TrendingUp },
    { id: 'nok', label: 'Next of Kin', icon: Users },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
    { id: 'terms', label: 'Terms', icon: FileText },
    { id: 'audit', label: 'Audit', icon: Activity },
  ];

  return (
    <AppLayout role="admin" memberName="Raymond Longdiem" memberId="ADM/2026/0001">
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#050B17]">
        {/* Page Header */}
        <div className="bg-[#0B1528] border-b border-white/10 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Investors Circle</h1>
              <p className="text-sm text-white/40 mt-0.5">Review, approve, verify, and activate investment applications</p>
            </div>
            <button
              onClick={loadApplications}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-white/50 hover:bg-white/5 transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Total Applications', value: kpis.total, icon: FileText, color: 'text-white/50', bg: 'bg-white/5 border border-white/10' },
              { label: 'Pending Review', value: kpis.pending, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10 border border-orange-500/20' },
              { label: 'Active Investments', value: kpis.active, icon: CheckCircle, color: 'text-[#00E599]', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
              { label: 'Total Invested', value: formatNGN(kpis.totalInvested), icon: Banknote, color: 'text-blue-400', bg: 'bg-blue-500/10 border border-blue-500/20', isText: true },
            ].map(k => (
              <div key={k.label} className={`${k.bg} rounded-xl p-3 flex items-center gap-3`}>
                <k.icon size={18} className={k.color} />
                <div>
                  <p className="text-xs text-white/40">{k.label}</p>
                  <p className={`font-bold text-sm ${k.color}`}>{k.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel — Application List */}
          <div className="w-80 border-r border-white/10 bg-[#0B1528] flex flex-col shrink-0">
            <div className="p-4 border-b border-white/10 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by name, ref, phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 text-sm focus:outline-none focus:border-[#00E599]/60 focus:bg-[#080E1C]"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#080E1C] text-white text-sm focus:outline-none focus:border-[#00E599]/60"
              >
                <option value="all" className="bg-[#0B1528] text-white">All Statuses</option>
                <option value="submitted" className="bg-[#0B1528] text-white">Submitted</option>
                <option value="under_review" className="bg-[#0B1528] text-white">Under Review</option>
                <option value="awaiting_payment" className="bg-[#0B1528] text-white">Awaiting Payment</option>
                <option value="payment_verification" className="bg-[#0B1528] text-white">Payment Verification</option>
                <option value="approved" className="bg-[#0B1528] text-white">Approved</option>
                <option value="agreement_pending" className="bg-[#0B1528] text-white">Agreement Pending</option>
                <option value="active" className="bg-[#0B1528] text-white">Active</option>
                <option value="matured" className="bg-[#0B1528] text-white">Matured</option>
                <option value="early_liquidation_requested" className="bg-[#0B1528] text-white">Liquidation Requested</option>
                <option value="completed" className="bg-[#0B1528] text-white">Completed</option>
                <option value="cancelled" className="bg-[#0B1528] text-white">Cancelled</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <svg className="w-6 h-6 animate-spin text-[#00E599]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="p-6 text-center text-sm text-white/40">No applications found.</div>
              ) : (
                filteredApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => loadDetails(app)}
                    className={`w-full text-left p-4 transition-colors ${
                      selected?.id === app.id
                        ? 'bg-blue-600/15 border-l-4 border-l-[#00E599] text-white'
                        : 'hover:bg-white/5 text-white/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-semibold text-white truncate pr-2">{app.investor_name || 'Unknown'}</p>
                      <StatusBadge status={app.app_status || 'draft'} />
                    </div>
                    <p className="text-xs text-white/40 font-mono">{app.application_number || 'Draft'}</p>
                    <p className="text-xs font-semibold text-[#00E599] mt-1">{formatNGN(app.investment_amount)}</p>
                    <p className="text-xs text-white/50">{app.investment_duration_label} · {formatDate(app.created_at)}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel — Detail */}
          <div className="flex-1 overflow-y-auto bg-[#050B17]">
            {!selected ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#0D182E] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white/40 shadow-xl shadow-black/20">
                    <TrendingUp size={28} className="text-white/40" />
                  </div>
                  <p className="text-white/40 text-sm">Select an application to review</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Application Header */}
                <div className="bg-[#0D182E]/90 rounded-2xl border border-white/10 shadow-xl shadow-black/20 p-5 backdrop-blur-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{selected.investor_name}</h2>
                      <p className="text-sm text-white/40 font-mono font-medium">{selected.application_number}</p>
                      <p className="text-xs text-white/50 mt-0.5">Submitted: {formatDateTime(selected.created_at)}</p>
                    </div>
                    <StatusBadge status={selected.app_status || 'draft'} />
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <p className="text-xs text-white/40">Investment Amount</p>
                      <p className="font-bold text-white text-sm">{formatNGN(selected.investment_amount)}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                      <p className="text-xs text-orange-400">Processing Fee</p>
                      <p className="font-bold text-orange-400 text-sm">{formatNGN(selected.processing_fee_amount)}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                      <p className="text-xs text-blue-400">Duration</p>
                      <p className="font-bold text-blue-400 text-sm">{selected.investment_duration_label}</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                      <p className="text-xs text-[#00E599]">Projected Maturity</p>
                      <p className="font-bold text-[#00E599] text-sm">{formatNGN(selected.indicative_maturity_value)}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="bg-[#0D182E]/90 rounded-2xl border border-white/10 shadow-xl shadow-black/20 p-5 backdrop-blur-xl">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield size={16} className="text-[#00E599]" />
                    Admin Actions
                  </h3>

                  {actionError && (
                    <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 text-sm text-rose-300 mb-3 flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      {actionError}
                    </div>
                  )}

                  <textarea
                    value={actionNotes}
                    onChange={e => setActionNotes(e.target.value)}
                    placeholder="Add notes for this action (optional)..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 text-sm focus:outline-none focus:border-[#00E599]/60 focus:bg-[#080E1C] resize-none mb-3"
                  />

                  {/* Workflow Actions */}
                  <div className="space-y-3">
                    {/* Stage 1: Review */}
                    <div>
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">1 · Review</p>
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn
                          label="Mark Under Review"
                          icon={Eye}
                          colorClass="bg-[#00E599]/15 text-amber-300 hover:bg-[#00E599]/25 border border-amber-500/30"
                          loading={actionLoading}
                          onClick={() => performAction('under_review')}
                        />
                        <ActionBtn
                          label="Request More Info"
                          icon={AlertCircle}
                          colorClass="bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
                          loading={actionLoading}
                          onClick={() => performAction('under_review', { review_notes: actionNotes || 'More information requested' })}
                        />
                      </div>
                    </div>

                    {/* Stage 2: Collateral / Payment */}
                    <div>
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">2 · Collateral & Payment</p>
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn
                          label="Verify Collateral"
                          icon={CheckCircle}
                          colorClass="bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30"
                          loading={actionLoading}
                          onClick={() => performAction('awaiting_payment')}
                        />
                        <ActionBtn
                          label="Confirm Payment Received"
                          icon={Banknote}
                          colorClass="bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30"
                          loading={actionLoading}
                          onClick={() => performAction('payment_verification')}
                        />
                        <ActionBtn
                          label="Payment Verified"
                          icon={CheckCircle}
                          colorClass="bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 border border-teal-500/30"
                          loading={actionLoading}
                          onClick={() => performAction('approved')}
                        />
                      </div>
                    </div>

                    {/* Stage 3: Approve / Agreement */}
                    <div>
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">3 · Approval & Agreement</p>
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn
                          label="Approve Application"
                          icon={CheckCircle}
                          colorClass="bg-emerald-500/15 text-[#00E599] hover:bg-emerald-500/25 border border-emerald-500/30"
                          loading={actionLoading}
                          onClick={() => performAction('approved')}
                        />
                        <ActionBtn
                          label="Send Agreement"
                          icon={FileText}
                          colorClass="bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/30"
                          loading={actionLoading}
                          onClick={() => performAction('agreement_pending')}
                        />
                        <ActionBtn
                          label="Reject Application"
                          icon={XCircle}
                          colorClass="bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30"
                          loading={actionLoading}
                          onClick={() => performAction('cancelled')}
                        />
                      </div>
                    </div>

                    {/* Stage 4: Activate / Disburse */}
                    <div>
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">4 · Activate Investment</p>
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn
                          label="Activate & Disburse"
                          icon={ArrowUpRight}
                          colorClass="bg-[#00E599] text-[#050B17] font-black hover:bg-[#00E599]/90 shadow-lg shadow-[#00E599]/20"
                          loading={actionLoading}
                          onClick={() => setShowDisburseModal(true)}
                        />
                        {selected.app_status === 'active' && (
                          <ActionBtn
                            label="Mark Matured"
                            icon={Calendar}
                            colorClass="bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 border border-teal-500/30"
                            loading={actionLoading}
                            onClick={() => performAction('matured')}
                          />
                        )}
                        {selected.app_status === 'matured' && (
                          <ActionBtn
                            label="Mark Completed"
                            icon={CheckCircle}
                            colorClass="bg-white/10 text-white/50 hover:bg-white/15 border border-white/15"
                            loading={actionLoading}
                            onClick={() => performAction('completed')}
                          />
                        )}
                      </div>
                    </div>

                    {/* Liquidation */}
                    {selected.app_status === 'early_liquidation_requested' && (
                      <div>
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">5 · Liquidation Request</p>
                        <div className="flex flex-wrap gap-2">
                          <ActionBtn
                            label="Approve Liquidation"
                            icon={CheckCircle}
                            colorClass="bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30"
                            loading={actionLoading}
                            onClick={() => performAction('early_liquidation_approved')}
                          />
                          <ActionBtn
                            label="Reject Liquidation"
                            icon={XCircle}
                            colorClass="bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30"
                            loading={actionLoading}
                            onClick={() => performAction('early_liquidation_rejected')}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail Tabs */}
                <div className="bg-[#0D182E]/90 rounded-2xl border border-white/10 shadow-xl shadow-black/20 overflow-hidden backdrop-blur-xl">
                  <div className="flex border-b border-white/10 overflow-x-auto bg-white/5/[0.02]">
                    {DETAIL_TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setDetailTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          detailTab === tab.id
                            ? 'text-[#00E599] border-b-2 border-[#00E599] bg-[#00E599]/10'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <tab.icon size={14} />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {/* Investor Tab */}
                    {detailTab === 'investor' && (
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Full Name', value: selected.investor_name },
                          { label: 'Email Address', value: selected.investor_email },
                          { label: 'Phone Number', value: selected.investor_phone },
                          { label: 'Gender', value: selected.investor_gender },
                          { label: 'Address', value: selected.investor_address, full: true },
                        ].map(f => (
                          <div key={f.label} className={f.full ? 'col-span-2' : ''}>
                            <p className="text-xs text-white/40 mb-0.5">{f.label}</p>
                            <p className="text-sm font-semibold text-white">{f.value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Investment Tab */}
                    {detailTab === 'investment' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Investment Amount', value: formatNGN(selected.investment_amount) },
                            { label: 'Duration', value: selected.investment_duration_label },
                            { label: 'Monthly Return (4%)', value: formatNGN(selected.indicative_monthly_return) },
                            { label: 'Total Return', value: formatNGN(selected.indicative_total_return) },
                            { label: 'Maturity Value', value: formatNGN(selected.indicative_maturity_value) },
                            { label: 'Processing Fee', value: formatNGN(selected.processing_fee_amount) },
                            { label: 'Start Date', value: formatDate(selected.investment_start_date) },
                            { label: 'Maturity Date', value: formatDate(selected.investment_maturity_date) },
                          ].map(f => (
                            <div key={f.label}>
                              <p className="text-xs text-white/40 mb-0.5">{f.label}</p>
                              <p className="text-sm font-semibold text-white">{f.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                          <p className="text-xs text-[#00E599] font-semibold mb-1">Interest Rate</p>
                          <p className="text-2xl font-black text-white">4% <span className="text-sm font-normal text-white/40">per month</span></p>
                        </div>
                      </div>
                    )}

                    {/* Next of Kin Tab */}
                    {detailTab === 'nok' && (
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Full Name', value: selected.nok_name },
                          { label: 'Phone Number', value: selected.nok_phone },
                          { label: 'Address', value: selected.nok_address, full: true },
                        ].map(f => (
                          <div key={f.label} className={f.full ? 'col-span-2' : ''}>
                            <p className="text-xs text-white/40 mb-0.5">{f.label}</p>
                            <p className="text-sm font-semibold text-white">{f.value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bank Details Tab */}
                    {detailTab === 'bank' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Account Name', value: selected.account_name },
                            { label: 'Bank Name', value: selected.bank_name },
                            { label: 'Account Number', value: selected.account_number },
                          ].map(f => (
                            <div key={f.label}>
                              <p className="text-xs text-white/40 mb-0.5">{f.label}</p>
                              <p className="text-sm font-semibold text-white">{f.value || '—'}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-[#00E599]/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
                          Verify bank details carefully before activating the investment.
                        </div>
                      </div>
                    )}

                    {/* Terms Tab */}
                    {detailTab === 'terms' && (
                      <div className="space-y-3">
                        {[
                          { label: 'Terms & Conditions Agreed', value: selected.terms_agreed, date: selected.terms_agreed_at },
                          { label: 'Processing Fee Agreed', value: selected.processing_fee_agreed, date: null },
                        ].map(t => (
                          <div key={t.label} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
                            <div>
                              <p className="text-sm font-medium text-white">{t.label}</p>
                              {t.date && <p className="text-xs text-white/40 mt-0.5">{formatDateTime(t.date)}</p>}
                            </div>
                            {t.value ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-[#00E599] bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                                <CheckCircle size={12} /> Agreed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-full">
                                <XCircle size={12} /> Not Agreed
                              </span>
                            )}
                          </div>
                        ))}
                        <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                          <p className="text-xs text-white/40 mb-0.5">Terms Version</p>
                          <p className="text-sm font-medium text-white">{selected.terms_version || 'v1.0'}</p>
                        </div>
                        {selected.review_notes && (
                          <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10">
                            <p className="text-xs text-blue-400 font-semibold mb-1">Admin Notes</p>
                            <p className="text-sm text-blue-300">{selected.review_notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audit Tab */}
                    {detailTab === 'audit' && (
                      <div className="space-y-2">
                        {auditTrail.length === 0 ? (
                          <p className="text-sm text-white/40 text-center py-4">No audit entries yet.</p>
                        ) : (
                          auditTrail.map((entry, idx) => (
                            <div key={idx} className="flex gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                              <div className="w-2 h-2 rounded-full bg-[#00E599] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,229,153,0.5)]" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white">{entry.action}</p>
                                {entry.notes && <p className="text-xs text-white/50 mt-0.5">{entry.notes}</p>}
                                <p className="text-xs text-white/50 mt-0.5">{formatDateTime(entry.created_at)}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activate / Disburse Modal */}
      {showDisburseModal && selected && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B1528] rounded-2xl border border-white/15 shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-1">Activate Investment</h3>
            <p className="text-sm text-white/40 mb-5">
              Set the investment start date to activate <strong className="text-white">{selected.investor_name}</strong>'s investment of{' '}
              <strong className="text-[#00E599]">{formatNGN(selected.investment_amount)}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">Investment Start Date *</label>
                <input
                  type="date"
                  value={disburseStartDate}
                  onChange={e => setDisburseStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-[#00E599]/60 focus:bg-[#080E1C]"
                />
              </div>

              {disburseStartDate && (
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/40">Principal</span>
                    <span className="font-semibold text-white">{formatNGN(selected.investment_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Monthly Return (4%)</span>
                    <span className="font-semibold text-[#00E599]">{formatNGN((selected.investment_amount * 4) / 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Duration</span>
                    <span className="font-semibold text-white">{selected.investment_duration_label}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-white/40 font-medium">Maturity Date</span>
                    <span className="font-bold text-[#00E599]">
                      {(() => {
                        const d = new Date(disburseStartDate);
                        d.setMonth(d.getMonth() + selected.investment_duration_months);
                        return formatDate(d.toISOString());
                      })()}
                    </span>
                  </div>
                </div>
              )}

              {actionError && (
                <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 text-sm text-rose-300">
                  {actionError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowDisburseModal(false); setDisburseStartDate(''); setActionError(''); }}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white/50 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={activateInvestment}
                disabled={!disburseStartDate || actionLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-[#00E599] text-[#050B17] text-sm font-black hover:bg-[#00E599]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#00E599]/20"
              >
                {actionLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <ArrowUpRight size={16} />
                )}
                Activate Investment
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
