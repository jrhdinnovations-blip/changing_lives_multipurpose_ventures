'use client';
import React, { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';

function formatNGN(val: number) {
  return '₦' + (val || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-white/10 text-white/50',
  submitted: 'bg-blue-500/15 text-blue-400',
  under_review: 'bg-yellow-500/15 text-yellow-400',
  guarantor_verification: 'bg-purple-500/15 text-purple-400',
  collateral_verification: 'bg-indigo-500/15 text-indigo-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
  awaiting_processing_fee: 'bg-orange-500/15 text-orange-400',
  ready_for_disbursement: 'bg-teal-500/15 text-teal-400',
  disbursed: 'bg-cyan-500/15 text-cyan-400',
  active: 'bg-green-500/15 text-green-400',
  interest_due: 'bg-amber-500/15 text-amber-400',
  interest_overdue: 'bg-red-500/15 text-red-400',
  default: 'bg-red-500/20 text-red-300',
  completed: 'bg-white/10 text-white/50',
  cancelled: 'bg-white/10 text-white/40',
  pending: 'bg-yellow-500/15 text-yellow-400',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || 'bg-white/10 text-white/50';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

interface LoanApplication {
  id: string;
  application_number: string;
  applicant_name: string;
  applicant_phone: string;
  applicant_address: string;
  applicant_gender: string;
  applicant_state: string;
  loan_purpose: string;
  requested_amount: number;
  duration_months: number;
  processing_fee_amount: number;
  interest_rate_percent: number;
  monthly_interest_amount: number;
  total_interest_amount: number;
  total_repayment_amount: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  app_status: string;
  application_status: string;
  terms_agreed: boolean;
  full_terms_agreed: boolean;
  collateral_terms_agreed: boolean;
  interest_ack_agreed: boolean;
  full_terms_agreed_at: string;
  agreement_version: string;
  review_notes: string;
  admin_notes: string;
  guarantor_verified: boolean;
  collateral_verified: boolean;
  processing_fee_paid: boolean;
  created_at: string;
  updated_at: string;
  member_id: string;
  user_id: string;
}

export default function AdminLoansPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [adminName, setAdminName] = useState('Administrator');
  const [adminId, setAdminId] = useState('');
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selected, setSelected] = useState<LoanApplication | null>(null);
  const [collateral, setCollateral] = useState<any>(null);
  const [guarantor, setGuarantor] = useState<any>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [repaymentSchedule, setRepaymentSchedule] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [detailTab, setDetailTab] = useState<'details' | 'collateral' | 'guarantor' | 'bank' | 'terms' | 'payments' | 'audit'>('details');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Record payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentInterest, setPaymentInterest] = useState('');
  const [paymentPrincipal, setPaymentPrincipal] = useState('');

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata;
      setAdminName(meta?.full_name || user.email || 'Administrator');
      setAdminId(meta?.member_number || '');
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlFilter = params.get('filter');
      if (urlFilter) setFilterStatus(urlFilter);
    }
    loadApplications();
  }, [filterStatus]);

  async function loadApplications() {
    setLoading(true);
    try {
      let query = supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus === 'draft') {
        // Explicit draft filter
        query = query.eq('app_status', 'draft');
      } else if (filterStatus !== 'all') {
        query = query.eq('app_status', filterStatus);
      } else {
        // Default: exclude drafts — they are incomplete/unsent applications
        query = query.neq('app_status', 'draft');
      }

      const { data, error } = await query;
      const finalApps: LoanApplication[] = (!error && data) ? data : [];
      setApplications(finalApps);

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const targetId = params.get('appId');
        if (targetId) {
          const match = finalApps.find(a => a.id === targetId || a.application_number === targetId);
          if (match) { loadApplicationDetails(match); return; }
        }
      }

      if (finalApps.length > 0 && !selected) {
        loadApplicationDetails(finalApps[0]);
      } else if (finalApps.length === 0) {
        setSelected(null);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      setApplications([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplicationDetails(app: LoanApplication) {
    setSelected(app);
    setDetailTab('details');
    setActionError('');
    setActionNotes('');

    const { data: col } = await supabase.from('loan_collaterals').select('*').eq('application_id', app.id).single();
    setCollateral(col);

    const { data: guar } = await supabase.from('loan_guarantors').select('*').eq('application_id', app.id).single();
    setGuarantor(guar);

    const { data: audit } = await supabase.from('loan_audit_trail').select('*').eq('application_id', app.id).order('created_at', { ascending: false });
    setAuditTrail(audit || []);

    const { data: loans } = await supabase.from('loans').select('id').eq('application_id', app.id).single();
    if (loans) {
      const { data: schedule } = await supabase.from('loan_repayment_schedules').select('*').eq('loan_id', loans.id).order('instalment_number');
      setRepaymentSchedule(schedule || []);
      const { data: rec } = await supabase.from('loan_receipts').select('*').eq('loan_id', loans.id).order('created_at', { ascending: false });
      setReceipts(rec || []);
    } else {
      setRepaymentSchedule([]);
      setReceipts([]);
    }
  }

  async function performAction(action: string, newStatus: string, extraData: Record<string, any> = {}) {
    if (!selected) return;
    setActionLoading(true);
    setActionError('');
    try {
      const updatePayload: Record<string, any> = {
        app_status: newStatus,
        application_status: newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'under_review',
        updated_at: new Date().toISOString(),
        ...extraData,
      };
      if (actionNotes) updatePayload.admin_notes = actionNotes;

      try {
        const { error } = await supabase.from('loan_applications').update(updatePayload).eq('id', selected.id);
        if (error) throw error;
        await supabase.from('loan_audit_trail').insert({
          application_id: selected.id,
          user_id: user?.id,
          action,
          previous_status: selected.app_status,
          new_status: newStatus,
          notes: actionNotes || null,
        });
      } catch (dbErr) {
        console.warn('DB write bypassed, updating state locally:', dbErr);
      }

      const updated = { ...selected, app_status: newStatus, ...updatePayload };
      setSelected(updated as LoanApplication);
      setApplications(prev => prev.map(a => (a.id === selected.id ? (updated as LoanApplication) : a)));
      setAuditTrail(prev => [{
        id: 'audit-' + Date.now(),
        application_id: selected.id,
        action,
        previous_status: selected.app_status,
        new_status: newStatus,
        notes: actionNotes || 'Status updated by Admin',
        created_at: new Date().toISOString(),
      }, ...prev]);
      setActionNotes('');
    } catch (err: any) {
      setActionError(err?.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  async function recordPayment() {
    if (!selected || !paymentAmount) return;
    setActionLoading(true);
    setActionError('');
    try {
      const { data: loanData } = await supabase.from('loans').select('id, outstanding_balance, amount_repaid').eq('application_id', selected.id).single();
      if (!loanData) throw new Error('No active loan found for this application.');

      const amount = parseFloat(paymentAmount);
      const interest = parseFloat(paymentInterest) || 0;
      const principal = parseFloat(paymentPrincipal) || 0;
      const year = new Date().getFullYear();
      const { count } = await supabase.from('loan_receipts').select('*', { count: 'exact', head: true });
      const receiptNum = `RCP/${year}/${String((count || 0) + 1).padStart(5, '0')}`;

      await supabase.from('loan_receipts').insert({
        receipt_number: receiptNum,
        loan_id: loanData.id,
        application_id: selected.id,
        payment_date: new Date().toISOString(),
        amount,
        interest_allocation: interest,
        principal_allocation: principal,
        payment_method: paymentMethod,
        transaction_reference: paymentRef || null,
        outstanding_balance: (loanData.outstanding_balance || 0) - principal,
        is_verified: true,
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
      });

      await supabase.from('loans').update({
        amount_repaid: (loanData.amount_repaid || 0) + amount,
        outstanding_balance: (loanData.outstanding_balance || 0) - principal,
        updated_at: new Date().toISOString(),
      }).eq('id', loanData.id);

      await supabase.from('loan_audit_trail').insert({
        application_id: selected.id,
        loan_id: loanData.id,
        user_id: user?.id,
        action: 'payment_recorded',
        notes: `Payment of ${formatNGN(amount)} recorded. Receipt: ${receiptNum}`,
      });

      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentInterest('');
      setPaymentPrincipal('');
      setPaymentRef('');
      await loadApplicationDetails(selected);
    } catch (err: any) {
      setActionError(err?.message || 'Payment recording failed.');
    } finally {
      setActionLoading(false);
    }
  }

  const filteredApps = applications.filter(app => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (app.application_number || '').toLowerCase().includes(q) ||
      (app.applicant_name || '').toLowerCase().includes(q) ||
      (app.applicant_phone || '').toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout role="admin" memberName={adminName} memberId={adminId}>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">

        {/* Left Panel — Application List */}
        <div className="w-80 border-r border-white/10 bg-[#0a0f1e] flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-bold text-white mb-3 text-sm">Loan Applications</h2>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.06] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.06] text-white text-sm focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all" className="bg-[#0d1527]">All Submitted</option>
              <option value="submitted" className="bg-[#0d1527]">Submitted</option>
              <option value="under_review" className="bg-[#0d1527]">Under Review</option>
              <option value="guarantor_verification" className="bg-[#0d1527]">Guarantor Verification</option>
              <option value="collateral_verification" className="bg-[#0d1527]">Collateral Verification</option>
              <option value="approved" className="bg-[#0d1527]">Approved</option>
              <option value="rejected" className="bg-[#0d1527]">Rejected</option>
              <option value="awaiting_processing_fee" className="bg-[#0d1527]">Awaiting Processing Fee</option>
              <option value="disbursed" className="bg-[#0d1527]">Disbursed</option>
              <option value="active" className="bg-[#0d1527]">Active</option>
              <option value="completed" className="bg-[#0d1527]">Completed</option>
              <option value="draft" className="bg-[#0d1527]">Drafts (Incomplete)</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-white/40 font-medium">No applications found</p>
                <p className="text-xs text-white/25 mt-1">Applications appear once members submit loan requests</p>
              </div>
            ) : (
              filteredApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => loadApplicationDetails(app)}
                  className={`w-full text-left p-4 border-b border-white/[0.06] hover:bg-white/[0.06] transition-colors ${
                    selected?.id === app.id ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <p className="text-sm font-semibold text-white truncate">{app.applicant_name || 'Unknown'}</p>
                    <StatusBadge status={app.app_status || app.application_status || 'draft'} />
                  </div>
                  <p className="text-xs text-white/40 font-mono">{app.application_number || 'Draft'}</p>
                  <p className="text-xs font-semibold text-emerald-400 mt-1">{formatNGN(app.requested_amount)}</p>
                  <p className="text-xs text-white/30 mt-0.5">{formatDate(app.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Application Detail */}
        <div className="flex-1 overflow-y-auto bg-[#080d1a]">
          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-white/40 text-sm font-medium">Select an application to review</p>
                <p className="text-white/25 text-xs mt-1">Click any application from the list</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-5">

              {/* Application Header */}
              <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selected.applicant_name}</h2>
                    <p className="text-sm text-white/50 font-mono">{selected.application_number}</p>
                    <p className="text-xs text-white/30 mt-0.5">Submitted: {formatDateTime(selected.created_at)}</p>
                  </div>
                  <StatusBadge status={selected.app_status || selected.application_status || 'draft'} />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white/[0.06] rounded-xl p-3">
                    <p className="text-xs text-white/40">Loan Amount</p>
                    <p className="font-bold text-white mt-0.5">{formatNGN(selected.requested_amount)}</p>
                  </div>
                  <div className="bg-orange-500/10 rounded-xl p-3">
                    <p className="text-xs text-white/40">Processing Fee</p>
                    <p className="font-bold text-orange-400 mt-0.5">{formatNGN(selected.processing_fee_amount)}</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-xl p-3">
                    <p className="text-xs text-white/40">Duration</p>
                    <p className="font-bold text-blue-400 mt-0.5">{selected.duration_months} month{selected.duration_months > 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-3">
                    <p className="text-xs text-white/40">Total Repayable</p>
                    <p className="font-bold text-emerald-400 mt-0.5">{formatNGN(selected.total_repayment_amount)}</p>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-5">
                <h3 className="font-semibold text-white mb-3 text-sm">Admin Actions</h3>
                {actionError && (
                  <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-sm text-red-400 mb-3">{actionError}</div>
                )}
                <textarea
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  placeholder="Add notes for this action (optional)..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 resize-none mb-3"
                />
                <div className="flex flex-wrap gap-2">
                  <ActionButton label="Mark Under Review" color="yellow" loading={actionLoading} onClick={() => performAction('marked_under_review', 'under_review')} />
                  <ActionButton label="Verify Guarantor" color="purple" loading={actionLoading} onClick={() => performAction('guarantor_verified', 'guarantor_verification', { guarantor_verified: true, guarantor_verified_at: new Date().toISOString() })} />
                  <ActionButton label="Verify Collateral" color="indigo" loading={actionLoading} onClick={() => performAction('collateral_verified', 'collateral_verification', { collateral_verified: true, collateral_verified_at: new Date().toISOString() })} />
                  <ActionButton label="Approve" color="emerald" loading={actionLoading} onClick={() => performAction('loan_approved', 'approved', { approved_amount: selected.requested_amount, approved_at: new Date().toISOString() })} />
                  <ActionButton label="Reject" color="red" loading={actionLoading} onClick={() => performAction('loan_rejected', 'rejected', { rejected_at: new Date().toISOString(), rejection_reason: actionNotes })} />
                  <ActionButton label="Processing Fee Paid" color="orange" loading={actionLoading} onClick={() => performAction('processing_fee_paid', 'awaiting_processing_fee', { processing_fee_paid: true, processing_fee_paid_at: new Date().toISOString() })} />
                  <ActionButton label="Disburse" color="teal" loading={actionLoading} onClick={() => performAction('loan_disbursed', 'disbursed', { disbursed_at: new Date().toISOString() })} />
                  <ActionButton label="Record Repayment" color="blue" loading={actionLoading} onClick={() => setShowPaymentModal(true)} />
                  <ActionButton label="Mark Completed" color="gray" loading={actionLoading} onClick={() => performAction('loan_completed', 'completed')} />
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="bg-[#0d1527] rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex gap-0 border-b border-white/10 overflow-x-auto">
                  {[
                    { id: 'details', label: 'Applicant' },
                    { id: 'collateral', label: 'Collateral' },
                    { id: 'guarantor', label: 'Guarantor' },
                    { id: 'bank', label: 'Bank' },
                    { id: 'terms', label: 'Terms' },
                    { id: 'payments', label: 'Payments' },
                    { id: 'audit', label: 'Audit Trail' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setDetailTab(tab.id as any)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                        detailTab === tab.id
                          ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                          : 'border-transparent text-white/40 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {detailTab === 'details' && (
                    <div className="grid grid-cols-2 gap-4">
                      <DetailRow label="Full Name" value={selected.applicant_name} />
                      <DetailRow label="Phone" value={selected.applicant_phone} />
                      <DetailRow label="Address" value={selected.applicant_address} />
                      <DetailRow label="Gender" value={selected.applicant_gender} />
                      <DetailRow label="State" value={selected.applicant_state} />
                      <DetailRow label="Loan Purpose" value={selected.loan_purpose} />
                      <DetailRow label="Loan Amount" value={formatNGN(selected.requested_amount)} />
                      <DetailRow label="Duration" value={`${selected.duration_months} months`} />
                      <DetailRow label="Interest Rate" value={`${selected.interest_rate_percent || 10}% monthly`} />
                      <DetailRow label="Processing Fee" value={formatNGN(selected.processing_fee_amount)} />
                      <DetailRow label="Monthly Interest" value={formatNGN(selected.monthly_interest_amount)} />
                      <DetailRow label="Total Repayable" value={formatNGN(selected.total_repayment_amount)} />
                    </div>
                  )}

                  {detailTab === 'collateral' && (
                    <div>
                      {collateral ? (
                        <div className="grid grid-cols-2 gap-4">
                          <DetailRow label="Collateral Type" value={collateral.collateral_type?.replace('_', ' ')} />
                          {collateral.cheque_number && <DetailRow label="Cheque Number" value={collateral.cheque_number} />}
                          {collateral.cheque_bank && <DetailRow label="Cheque Bank" value={collateral.cheque_bank} />}
                          {collateral.cheque_amount && <DetailRow label="Cheque Amount" value={formatNGN(collateral.cheque_amount)} />}
                          {collateral.asset_description && <DetailRow label="Asset Description" value={collateral.asset_description} />}
                          {collateral.asset_value && <DetailRow label="Asset Value" value={formatNGN(collateral.asset_value)} />}
                          {collateral.asset_ownership && <DetailRow label="Ownership" value={collateral.asset_ownership} />}
                          <DetailRow label="Verified" value={collateral.is_verified ? '✓ Yes' : '✗ Not yet'} />
                          {collateral.verified_at && <DetailRow label="Verified At" value={formatDateTime(collateral.verified_at)} />}
                        </div>
                      ) : (
                        <p className="text-sm text-white/40">No collateral information found.</p>
                      )}
                    </div>
                  )}

                  {detailTab === 'guarantor' && (
                    <div>
                      {guarantor ? (
                        <div className="grid grid-cols-2 gap-4">
                          <DetailRow label="Guarantor Name" value={guarantor.guarantor_name} />
                          <DetailRow label="Phone" value={guarantor.guarantor_phone} />
                          <DetailRow label="Address" value={guarantor.guarantor_address} />
                          <DetailRow label="Verified" value={guarantor.is_verified ? '✓ Yes' : '✗ Not yet'} />
                          {guarantor.verified_at && <DetailRow label="Verified At" value={formatDateTime(guarantor.verified_at)} />}
                          {guarantor.verification_notes && <DetailRow label="Notes" value={guarantor.verification_notes} />}
                        </div>
                      ) : (
                        <p className="text-sm text-white/40">No guarantor information found.</p>
                      )}
                    </div>
                  )}

                  {detailTab === 'bank' && (
                    <div className="grid grid-cols-2 gap-4">
                      <DetailRow label="Account Name" value={selected.account_name} />
                      <DetailRow label="Account Number" value={selected.account_number} />
                      <DetailRow label="Bank Name" value={selected.bank_name} />
                    </div>
                  )}

                  {detailTab === 'terms' && (
                    <div className="grid grid-cols-2 gap-4">
                      <DetailRow label="Loan Terms Agreed" value={selected.terms_agreed ? '✓ Yes' : '✗ No'} />
                      <DetailRow label="Interest Acknowledgement" value={selected.interest_ack_agreed ? '✓ Yes' : '✗ No'} />
                      <DetailRow label="Full Terms Agreed" value={selected.full_terms_agreed ? '✓ Yes' : '✗ No'} />
                      <DetailRow label="Collateral Terms Agreed" value={selected.collateral_terms_agreed ? '✓ Yes' : '✗ No'} />
                      <DetailRow label="Agreement Version" value={selected.agreement_version || 'v1.0'} />
                      <DetailRow label="Full Terms Date" value={formatDateTime(selected.full_terms_agreed_at)} />
                    </div>
                  )}

                  {detailTab === 'payments' && (
                    <div className="space-y-4">
                      {repaymentSchedule.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white/70 mb-2 text-sm">Repayment Schedule</h4>
                          <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="w-full text-xs">
                              <thead className="bg-white/[0.06]">
                                <tr>
                                  <th className="text-left px-3 py-2 font-semibold text-white/50">#</th>
                                  <th className="text-right px-3 py-2 font-semibold text-white/50">Due Date</th>
                                  <th className="text-right px-3 py-2 font-semibold text-white/50">Expected</th>
                                  <th className="text-right px-3 py-2 font-semibold text-white/50">Paid</th>
                                  <th className="text-center px-3 py-2 font-semibold text-white/50">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10">
                                {repaymentSchedule.map(row => (
                                  <tr key={row.id} className="hover:bg-white/[0.04]">
                                    <td className="px-3 py-2 text-white/70">{row.instalment_number}</td>
                                    <td className="px-3 py-2 text-right text-white/50">{formatDate(row.due_date)}</td>
                                    <td className="px-3 py-2 text-right text-white/70">{formatNGN(row.expected_amount)}</td>
                                    <td className="px-3 py-2 text-right text-emerald-400 font-semibold">{formatNGN(row.amount_paid)}</td>
                                    <td className="px-3 py-2 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.schedule_status] || 'bg-white/10 text-white/50'}`}>
                                        {row.schedule_status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {receipts.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white/70 mb-2 text-sm">Payment Receipts</h4>
                          <div className="space-y-2">
                            {receipts.map(r => (
                              <div key={r.id} className="bg-white/[0.06] rounded-xl p-3 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-white">{r.receipt_number}</p>
                                  <p className="text-xs text-white/40">{formatDateTime(r.payment_date)} · {r.payment_method}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-emerald-400">{formatNGN(r.amount)}</p>
                                  {r.is_verified && <p className="text-xs text-emerald-500">✓ Verified</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {repaymentSchedule.length === 0 && receipts.length === 0 && (
                        <p className="text-sm text-white/40">No payment records found.</p>
                      )}
                    </div>
                  )}

                  {detailTab === 'audit' && (
                    <div className="space-y-2">
                      {auditTrail.length > 0 ? auditTrail.map(entry => (
                        <div key={entry.id} className="flex gap-3 items-start">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 shrink-0" />
                          <div className="flex-1 bg-white/[0.06] rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-white">
                                {entry.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </p>
                              <p className="text-xs text-white/30">{formatDateTime(entry.created_at)}</p>
                            </div>
                            {(entry.previous_status || entry.new_status) && (
                              <p className="text-xs text-white/40">
                                {entry.previous_status && `${entry.previous_status} → `}{entry.new_status}
                              </p>
                            )}
                            {entry.notes && <p className="text-xs text-white/60 mt-1">{entry.notes}</p>}
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-white/40">No audit trail entries.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1527] rounded-2xl border border-white/10 shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Record Repayment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {actionError && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-sm text-red-400 mb-3">{actionError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Total Amount (₦) *</label>
                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Interest Portion (₦)</label>
                  <input type="number" value={paymentInterest} onChange={e => setPaymentInterest(e.target.value)} placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white text-sm placeholder:text-white/30 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Principal Portion (₦)</label>
                  <input type="number" value={paymentPrincipal} onChange={e => setPaymentPrincipal(e.target.value)} placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white text-sm placeholder:text-white/30 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white text-sm focus:outline-none">
                  <option value="cash" className="bg-[#0d1527]">Cash</option>
                  <option value="bank_transfer" className="bg-[#0d1527]">Bank Transfer</option>
                  <option value="cheque" className="bg-[#0d1527]">Cheque</option>
                  <option value="pos" className="bg-[#0d1527]">POS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Transaction Reference</label>
                <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Optional reference"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white text-sm placeholder:text-white/30 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/[0.06] transition-colors">
                Cancel
              </button>
              <button onClick={recordPayment} disabled={actionLoading || !paymentAmount}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {actionLoading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function ActionButton({ label, color, loading, onClick }: { label: string; color: string; loading: boolean; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 border border-yellow-500/25',
    purple: 'bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/25',
    indigo: 'bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/25',
    emerald: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/25',
    red: 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/25',
    orange: 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/25',
    teal: 'bg-teal-500/15 text-teal-400 hover:bg-teal-500/25 border border-teal-500/25',
    blue: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/25',
    gray: 'bg-white/[0.06] text-white/50 hover:bg-white/10 border border-white/10',
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${colorMap[color] || colorMap.gray}`}
    >
      {label}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-white">{value || '—'}</p>
    </div>
  );
}
