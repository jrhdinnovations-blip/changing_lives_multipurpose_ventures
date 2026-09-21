'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Search, Eye, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Users, AlertCircle, FileText, CreditCard, User, Calendar, Banknote, Shield, RefreshCw, ArrowUpRight, Activity } from 'lucide-react';
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
  draft:                        { label: 'Draft',                    color: 'text-gray-600',    bg: 'bg-gray-100' },
  submitted:                    { label: 'Submitted',                color: 'text-blue-700',    bg: 'bg-blue-100' },
  under_review:                 { label: 'Under Review',             color: 'text-yellow-700',  bg: 'bg-yellow-100' },
  awaiting_payment:             { label: 'Awaiting Payment',         color: 'text-orange-700',  bg: 'bg-orange-100' },
  payment_verification:         { label: 'Payment Verification',     color: 'text-purple-700',  bg: 'bg-purple-100' },
  approved:                     { label: 'Approved',                 color: 'text-emerald-700', bg: 'bg-emerald-100' },
  agreement_pending:            { label: 'Agreement Pending',        color: 'text-indigo-700',  bg: 'bg-indigo-100' },
  active:                       { label: 'Active',                   color: 'text-green-700',   bg: 'bg-green-100' },
  matured:                      { label: 'Matured',                  color: 'text-teal-700',    bg: 'bg-teal-100' },
  early_liquidation_requested:  { label: 'Liquidation Requested',    color: 'text-amber-700',   bg: 'bg-amber-100' },
  early_liquidation_approved:   { label: 'Liquidation Approved',     color: 'text-cyan-700',    bg: 'bg-cyan-100' },
  early_liquidation_rejected:   { label: 'Liquidation Rejected',     color: 'text-red-700',     bg: 'bg-red-100' },
  completed:                    { label: 'Completed',                color: 'text-gray-600',    bg: 'bg-gray-100' },
  cancelled:                    { label: 'Cancelled',                color: 'text-gray-500',    bg: 'bg-gray-100' },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-100' };
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

type DetailTab = 'investor' | 'investment' | 'nok' | 'bank' | 'terms' | 'audit';

export default function AdminInvestorsCirclePage() {
  const { user, isAdmin } = useAuth();
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
      if (error) throw error;
      const apps = data || [];
      setApplications(apps);

      // KPIs
      const pending = apps.filter(a =>
        ['submitted', 'under_review', 'awaiting_payment', 'payment_verification', 'agreement_pending'].includes(a.app_status)
      ).length;
      const active = apps.filter(a => a.app_status === 'active').length;
      const totalInvested = apps
        .filter(a => ['active', 'matured', 'completed'].includes(a.app_status))
        .reduce((s, a) => s + (a.investment_amount || 0), 0);

      setKpis({ total: apps.length, pending, active, totalInvested });
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, supabase]);

  useEffect(() => {
    if (!isAdmin) return;
    loadApplications();
  }, [isAdmin, loadApplications]);

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

      const { error } = await supabase
        .from('investor_circle_applications')
        .update(payload)
        .eq('id', selected.id);
      if (error) throw error;

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
    { id: 'investment', label: 'Investment', icon: TrendingUp },
    { id: 'nok', label: 'Next of Kin', icon: Users },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
    { id: 'terms', label: 'Terms', icon: FileText },
    { id: 'audit', label: 'Audit', icon: Activity },
  ];

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Access denied. Admin privileges required.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Investors Circle</h1>
              <p className="text-sm text-gray-500 mt-0.5">Review, approve, verify, and activate investment applications</p>
            </div>
            <button
              onClick={loadApplications}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Total Applications', value: kpis.total, icon: FileText, color: 'text-gray-700', bg: 'bg-gray-50' },
              { label: 'Pending Review', value: kpis.pending, icon: Clock, color: 'text-orange-700', bg: 'bg-orange-50' },
              { label: 'Active Investments', value: kpis.active, icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50' },
              { label: 'Total Invested', value: formatNGN(kpis.totalInvested), icon: Banknote, color: 'text-blue-700', bg: 'bg-blue-50', isText: true },
            ].map(k => (
              <div key={k.label} className={`${k.bg} rounded-xl p-3 flex items-center gap-3`}>
                <k.icon size={18} className={k.color} />
                <div>
                  <p className="text-xs text-gray-500">{k.label}</p>
                  <p className={`font-bold text-sm ${k.color}`}>{k.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel — Application List */}
          <div className="w-80 border-r border-gray-100 bg-white flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ref, phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="payment_verification">Payment Verification</option>
                <option value="approved">Approved</option>
                <option value="agreement_pending">Agreement Pending</option>
                <option value="active">Active</option>
                <option value="matured">Matured</option>
                <option value="early_liquidation_requested">Liquidation Requested</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <svg className="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No applications found.</div>
              ) : (
                filteredApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => loadDetails(app)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selected?.id === app.id ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate pr-2">{app.investor_name || 'Unknown'}</p>
                      <StatusBadge status={app.app_status || 'draft'} />
                    </div>
                    <p className="text-xs text-gray-400">{app.application_number || 'Draft'}</p>
                    <p className="text-xs font-semibold text-emerald-700 mt-1">{formatNGN(app.investment_amount)}</p>
                    <p className="text-xs text-gray-400">{app.investment_duration_label} · {formatDate(app.created_at)}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel — Detail */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {!selected ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Select an application to review</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Application Header */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selected.investor_name}</h2>
                      <p className="text-sm text-gray-500">{selected.application_number}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Submitted: {formatDateTime(selected.created_at)}</p>
                    </div>
                    <StatusBadge status={selected.app_status || 'draft'} />
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Investment Amount</p>
                      <p className="font-bold text-gray-900 text-sm">{formatNGN(selected.investment_amount)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Processing Fee</p>
                      <p className="font-bold text-orange-700 text-sm">{formatNGN(selected.processing_fee_amount)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-bold text-blue-700 text-sm">{selected.investment_duration_label}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Projected Maturity</p>
                      <p className="font-bold text-emerald-700 text-sm">{formatNGN(selected.indicative_maturity_value)}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield size={16} className="text-emerald-600" />
                    Admin Actions
                  </h3>

                  {actionError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-3 flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      {actionError}
                    </div>
                  )}

                  <textarea
                    value={actionNotes}
                    onChange={e => setActionNotes(e.target.value)}
                    placeholder="Add notes for this action (optional)..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none mb-3"
                  />

                  {/* Workflow Actions */}
                  <div className="space-y-3">
                    {/* Stage 1: Review */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">1 · Review</p>
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn
                          label="Mark Under Review"
                          icon={Eye}
                          colorClass="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          loading={actionLoading}
                          onClick={() => performAction('under_review')}
                        />
                        <ActionBtn
                          label="Request More Info"
                          icon={AlertCircle}
                          colorClass="bg-gray-100 text-gray-700 hover:bg-gray-200"
                          loading={actionLoading}
                          onClick={() => performAction('under_review', { review_notes: actionNotes || 'More information requested' })}
                        />
                      </div>
                    </div>

                    {/* Stage 2: Collateral / Payment */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">2 · Collateral & Payment</p>
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn
                          label="Verify Collateral"
                          icon={CheckCircle}
                          colorClass="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                          loading={actionLoading}
                          onClick={() => performAction('awaiting_payment')}
                        />
                        <ActionBtn
                          label="Confirm Payment Received"
                          icon={DollarSign}
                          colorClass="bg-purple-100 text-purple-800 hover:bg-purple-200"
                          loading={actionLoading}
                          onClick={() => performAction('payment_verification')}
                        />
                        <ActionBtn
                          label="Payment Verified"
                          icon={CheckCircle}
                          colorClass="bg-teal-100 text-teal-800 hover:bg-teal-200"
                          loading={actionLoading}
                          onClick={() => performAction('approved')}
                        />
                      </div>
                    </div>

                    {/* Stage 3: Approve / Agreement */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">3 · Approval & Agreement</p>
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn
                          label="Approve Application"
                          icon={CheckCircle}
                          colorClass="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          loading={actionLoading}
                          onClick={() => performAction('approved')}
                        />
                        <ActionBtn
                          label="Send Agreement"
                          icon={FileText}
                          colorClass="bg-blue-100 text-blue-800 hover:bg-blue-200"
                          loading={actionLoading}
                          onClick={() => performAction('agreement_pending')}
                        />
                        <ActionBtn
                          label="Reject Application"
                          icon={XCircle}
                          colorClass="bg-red-100 text-red-800 hover:bg-red-200"
                          loading={actionLoading}
                          onClick={() => performAction('cancelled')}
                        />
                      </div>
                    </div>

                    {/* Stage 4: Activate / Disburse */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">4 · Activate Investment</p>
                      <div className="flex flex-wrap gap-2">
                        <ActionBtn
                          label="Activate & Disburse"
                          icon={ArrowUpRight}
                          colorClass="bg-emerald-600 text-white hover:bg-emerald-700"
                          loading={actionLoading}
                          onClick={() => setShowDisburseModal(true)}
                        />
                        {selected.app_status === 'active' && (
                          <ActionBtn
                            label="Mark Matured"
                            icon={Calendar}
                            colorClass="bg-teal-100 text-teal-800 hover:bg-teal-200"
                            loading={actionLoading}
                            onClick={() => performAction('matured')}
                          />
                        )}
                        {selected.app_status === 'matured' && (
                          <ActionBtn
                            label="Mark Completed"
                            icon={CheckCircle}
                            colorClass="bg-gray-100 text-gray-700 hover:bg-gray-200"
                            loading={actionLoading}
                            onClick={() => performAction('completed')}
                          />
                        )}
                      </div>
                    </div>

                    {/* Liquidation */}
                    {selected.app_status === 'early_liquidation_requested' && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">5 · Liquidation Request</p>
                        <div className="flex flex-wrap gap-2">
                          <ActionBtn
                            label="Approve Liquidation"
                            icon={CheckCircle}
                            colorClass="bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
                            loading={actionLoading}
                            onClick={() => performAction('early_liquidation_approved')}
                          />
                          <ActionBtn
                            label="Reject Liquidation"
                            icon={XCircle}
                            colorClass="bg-red-100 text-red-800 hover:bg-red-200"
                            loading={actionLoading}
                            onClick={() => performAction('early_liquidation_rejected')}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail Tabs */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex border-b border-gray-100 overflow-x-auto">
                    {DETAIL_TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setDetailTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                          detailTab === tab.id
                            ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50' :'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
                            <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                            <p className="text-sm font-medium text-gray-900">{f.value || '—'}</p>
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
                              <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                              <p className="text-sm font-semibold text-gray-900">{f.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                          <p className="text-xs text-emerald-700 font-semibold mb-1">Interest Rate</p>
                          <p className="text-2xl font-bold text-emerald-800">4% <span className="text-sm font-normal text-emerald-600">per month</span></p>
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
                            <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                            <p className="text-sm font-medium text-gray-900">{f.value || '—'}</p>
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
                              <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                              <p className="text-sm font-semibold text-gray-900">{f.value || '—'}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
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
                          <div key={t.label} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{t.label}</p>
                              {t.date && <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(t.date)}</p>}
                            </div>
                            {t.value ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                                <CheckCircle size={12} /> Agreed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                                <XCircle size={12} /> Not Agreed
                              </span>
                            )}
                          </div>
                        ))}
                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                          <p className="text-xs text-gray-400 mb-0.5">Terms Version</p>
                          <p className="text-sm font-medium text-gray-900">{selected.terms_version || 'v1.0'}</p>
                        </div>
                        {selected.review_notes && (
                          <div className="p-3 rounded-xl border border-blue-100 bg-blue-50">
                            <p className="text-xs text-blue-600 font-semibold mb-1">Admin Notes</p>
                            <p className="text-sm text-blue-800">{selected.review_notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audit Tab */}
                    {detailTab === 'audit' && (
                      <div className="space-y-2">
                        {auditTrail.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No audit entries yet.</p>
                        ) : (
                          auditTrail.map((entry, idx) => (
                            <div key={idx} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                                {entry.notes && <p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p>}
                                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(entry.created_at)}</p>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Activate Investment</h3>
            <p className="text-sm text-gray-500 mb-5">
              Set the investment start date to activate <strong>{selected.investor_name}</strong>'s investment of{' '}
              <strong>{formatNGN(selected.investment_amount)}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Investment Start Date *</label>
                <input
                  type="date"
                  value={disburseStartDate}
                  onChange={e => setDisburseStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {disburseStartDate && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Principal</span>
                    <span className="font-semibold">{formatNGN(selected.investment_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Return (4%)</span>
                    <span className="font-semibold text-emerald-700">{formatNGN((selected.investment_amount * 4) / 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold">{selected.investment_duration_label}</span>
                  </div>
                  <div className="flex justify-between border-t border-emerald-200 pt-2">
                    <span className="text-gray-600 font-medium">Maturity Date</span>
                    <span className="font-bold text-emerald-800">
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
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowDisburseModal(false); setDisburseStartDate(''); setActionError(''); }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={activateInvestment}
                disabled={!disburseStartDate || actionLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
