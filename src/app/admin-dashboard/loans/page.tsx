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
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  guarantor_verification: 'bg-purple-100 text-purple-700',
  collateral_verification: 'bg-indigo-100 text-indigo-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  awaiting_processing_fee: 'bg-orange-100 text-orange-700',
  ready_for_disbursement: 'bg-teal-100 text-teal-700',
  disbursed: 'bg-cyan-100 text-cyan-700',
  active: 'bg-green-100 text-green-700',
  interest_due: 'bg-amber-100 text-amber-700',
  interest_overdue: 'bg-red-100 text-red-700',
  default: 'bg-red-200 text-red-800',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-500',
  pending: 'bg-yellow-100 text-yellow-700',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
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
  const { user, isAdmin } = useAuth();
  const supabase = createClient();

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
    if (!isAdmin) return;
    loadApplications();
  }, [isAdmin, filterStatus]);

  async function loadApplications() {
    setLoading(true);
    try {
      let query = supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('app_status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplicationDetails(app: LoanApplication) {
    setSelected(app);
    setDetailTab('details');
    setActionError('');
    setActionNotes('');

    // Load collateral
    const { data: col } = await supabase
      .from('loan_collaterals')
      .select('*')
      .eq('application_id', app.id)
      .single();
    setCollateral(col);

    // Load guarantor
    const { data: guar } = await supabase
      .from('loan_guarantors')
      .select('*')
      .eq('application_id', app.id)
      .single();
    setGuarantor(guar);

    // Load audit trail
    const { data: audit } = await supabase
      .from('loan_audit_trail')
      .select('*')
      .eq('application_id', app.id)
      .order('created_at', { ascending: false });
    setAuditTrail(audit || []);

    // Load repayment schedule if loan exists
    const { data: loans } = await supabase
      .from('loans')
      .select('id')
      .eq('application_id', app.id)
      .single();

    if (loans) {
      const { data: schedule } = await supabase
        .from('loan_repayment_schedules')
        .select('*')
        .eq('loan_id', loans.id)
        .order('instalment_number');
      setRepaymentSchedule(schedule || []);

      const { data: rec } = await supabase
        .from('loan_receipts')
        .select('*')
        .eq('loan_id', loans.id)
        .order('created_at', { ascending: false });
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

      const { error } = await supabase
        .from('loan_applications')
        .update(updatePayload)
        .eq('id', selected.id);
      if (error) throw error;

      // Audit trail
      await supabase.from('loan_audit_trail').insert({
        application_id: selected.id,
        user_id: user?.id,
        action,
        previous_status: selected.app_status,
        new_status: newStatus,
        notes: actionNotes || null,
      });

      await loadApplications();
      const updated = { ...selected, app_status: newStatus, ...updatePayload };
      setSelected(updated as LoanApplication);

      // Reload audit trail
      const { data: audit } = await supabase
        .from('loan_audit_trail')
        .select('*')
        .eq('application_id', selected.id)
        .order('created_at', { ascending: false });
      setAuditTrail(audit || []);
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
      // Get loan
      const { data: loanData } = await supabase
        .from('loans')
        .select('id, outstanding_balance, amount_repaid')
        .eq('application_id', selected.id)
        .single();

      if (!loanData) throw new Error('No active loan found for this application.');

      const amount = parseFloat(paymentAmount);
      const interest = parseFloat(paymentInterest) || 0;
      const principal = parseFloat(paymentPrincipal) || 0;
      const year = new Date().getFullYear();
      const { count } = await supabase.from('loan_receipts').select('*', { count: 'exact', head: true });
      const receiptNum = `RCP/${year}/${String((count || 0) + 1).padStart(5, '0')}`;

      // Insert receipt
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

      // Update loan
      await supabase.from('loans').update({
        amount_repaid: (loanData.amount_repaid || 0) + amount,
        outstanding_balance: (loanData.outstanding_balance || 0) - principal,
        updated_at: new Date().toISOString(),
      }).eq('id', loanData.id);

      // Audit
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

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Access denied. Admin privileges required.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Left Panel — Application List */}
        <div className="w-80 border-r border-gray-100 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3">Loan Applications</h2>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="guarantor_verification">Guarantor Verification</option>
              <option value="collateral_verification">Collateral Verification</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="awaiting_processing_fee">Awaiting Processing Fee</option>
              <option value="disbursed">Disbursed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
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
                  onClick={() => loadApplicationDetails(app)}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selected?.id === app.id ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.applicant_name || 'Unknown'}</p>
                    <StatusBadge status={app.app_status || app.application_status || 'draft'} />
                  </div>
                  <p className="text-xs text-gray-500">{app.application_number || 'Draft'}</p>
                  <p className="text-xs font-medium text-emerald-700 mt-1">{formatNGN(app.requested_amount)}</p>
                  <p className="text-xs text-gray-400">{formatDate(app.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Application Detail */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
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
                    <h2 className="text-xl font-bold text-gray-900">{selected.applicant_name}</h2>
                    <p className="text-sm text-gray-500">{selected.application_number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Submitted: {formatDateTime(selected.created_at)}</p>
                  </div>
                  <StatusBadge status={selected.app_status || selected.application_status || 'draft'} />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Loan Amount</p>
                    <p className="font-bold text-gray-900">{formatNGN(selected.requested_amount)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Processing Fee</p>
                    <p className="font-bold text-orange-700">{formatNGN(selected.processing_fee_amount)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-bold text-blue-700">{selected.duration_months} month{selected.duration_months > 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Total Repayable</p>
                    <p className="font-bold text-emerald-700">{formatNGN(selected.total_repayment_amount)}</p>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Admin Actions</h3>
                {actionError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-3">
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
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    label="Mark Under Review"
                    color="yellow"
                    loading={actionLoading}
                    onClick={() => performAction('marked_under_review', 'under_review')}
                  />
                  <ActionButton
                    label="Verify Guarantor"
                    color="purple"
                    loading={actionLoading}
                    onClick={() => performAction('guarantor_verified', 'guarantor_verification', { guarantor_verified: true, guarantor_verified_at: new Date().toISOString() })}
                  />
                  <ActionButton
                    label="Verify Collateral"
                    color="indigo"
                    loading={actionLoading}
                    onClick={() => performAction('collateral_verified', 'collateral_verification', { collateral_verified: true, collateral_verified_at: new Date().toISOString() })}
                  />
                  <ActionButton
                    label="Approve"
                    color="emerald"
                    loading={actionLoading}
                    onClick={() => performAction('loan_approved', 'approved', { approved_amount: selected.requested_amount, approved_at: new Date().toISOString() })}
                  />
                  <ActionButton
                    label="Reject"
                    color="red"
                    loading={actionLoading}
                    onClick={() => performAction('loan_rejected', 'rejected', { rejected_at: new Date().toISOString(), rejection_reason: actionNotes })}
                  />
                  <ActionButton
                    label="Processing Fee Paid"
                    color="orange"
                    loading={actionLoading}
                    onClick={() => performAction('processing_fee_paid', 'awaiting_processing_fee', { processing_fee_paid: true, processing_fee_paid_at: new Date().toISOString() })}
                  />
                  <ActionButton
                    label="Disburse"
                    color="teal"
                    loading={actionLoading}
                    onClick={() => performAction('loan_disbursed', 'disbursed', { disbursed_at: new Date().toISOString() })}
                  />
                  <ActionButton
                    label="Record Repayment"
                    color="blue"
                    loading={actionLoading}
                    onClick={() => setShowPaymentModal(true)}
                  />
                  <ActionButton
                    label="Mark Completed"
                    color="gray"
                    loading={actionLoading}
                    onClick={() => performAction('loan_completed', 'completed')}
                  />
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex gap-0 border-b border-gray-100 overflow-x-auto">
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
                          ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' :'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* Applicant Details */}
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

                  {/* Collateral */}
                  {detailTab === 'collateral' && (
                    <div className="space-y-3">
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
                        <p className="text-sm text-gray-500">No collateral information found.</p>
                      )}
                    </div>
                  )}

                  {/* Guarantor */}
                  {detailTab === 'guarantor' && (
                    <div className="space-y-3">
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
                        <p className="text-sm text-gray-500">No guarantor information found.</p>
                      )}
                    </div>
                  )}

                  {/* Bank Details */}
                  {detailTab === 'bank' && (
                    <div className="grid grid-cols-2 gap-4">
                      <DetailRow label="Account Name" value={selected.account_name} />
                      <DetailRow label="Account Number" value={selected.account_number} />
                      <DetailRow label="Bank Name" value={selected.bank_name} />
                    </div>
                  )}

                  {/* Terms */}
                  {detailTab === 'terms' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Loan Terms Agreed" value={selected.terms_agreed ? '✓ Yes' : '✗ No'} />
                        <DetailRow label="Interest Acknowledgement" value={selected.interest_ack_agreed ? '✓ Yes' : '✗ No'} />
                        <DetailRow label="Full Terms Agreed" value={selected.full_terms_agreed ? '✓ Yes' : '✗ No'} />
                        <DetailRow label="Collateral Terms Agreed" value={selected.collateral_terms_agreed ? '✓ Yes' : '✗ No'} />
                        <DetailRow label="Agreement Version" value={selected.agreement_version || 'v1.0'} />
                        <DetailRow label="Full Terms Date" value={formatDateTime(selected.full_terms_agreed_at)} />
                      </div>
                    </div>
                  )}

                  {/* Payments */}
                  {detailTab === 'payments' && (
                    <div className="space-y-4">
                      {repaymentSchedule.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Repayment Schedule</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left px-3 py-2 font-semibold text-gray-500">#</th>
                                  <th className="text-right px-3 py-2 font-semibold text-gray-500">Due Date</th>
                                  <th className="text-right px-3 py-2 font-semibold text-gray-500">Expected</th>
                                  <th className="text-right px-3 py-2 font-semibold text-gray-500">Paid</th>
                                  <th className="text-center px-3 py-2 font-semibold text-gray-500">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {repaymentSchedule.map(row => (
                                  <tr key={row.id}>
                                    <td className="px-3 py-2">{row.instalment_number}</td>
                                    <td className="px-3 py-2 text-right">{formatDate(row.due_date)}</td>
                                    <td className="px-3 py-2 text-right">{formatNGN(row.expected_amount)}</td>
                                    <td className="px-3 py-2 text-right text-emerald-600">{formatNGN(row.amount_paid)}</td>
                                    <td className="px-3 py-2 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.schedule_status] || 'bg-gray-100 text-gray-600'}`}>
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
                          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Payment Receipts</h4>
                          <div className="space-y-2">
                            {receipts.map(r => (
                              <div key={r.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{r.receipt_number}</p>
                                  <p className="text-xs text-gray-500">{formatDateTime(r.payment_date)} · {r.payment_method}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-emerald-700">{formatNGN(r.amount)}</p>
                                  {r.is_verified && <p className="text-xs text-emerald-600">✓ Verified</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {repaymentSchedule.length === 0 && receipts.length === 0 && (
                        <p className="text-sm text-gray-500">No payment records found.</p>
                      )}
                    </div>
                  )}

                  {/* Audit Trail */}
                  {detailTab === 'audit' && (
                    <div className="space-y-2">
                      {auditTrail.length > 0 ? auditTrail.map(entry => (
                        <div key={entry.id} className="flex gap-3 items-start">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 shrink-0" />
                          <div className="flex-1 bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {entry.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </p>
                              <p className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</p>
                            </div>
                            {(entry.previous_status || entry.new_status) && (
                              <p className="text-xs text-gray-500">
                                {entry.previous_status && `${entry.previous_status} → `}{entry.new_status}
                              </p>
                            )}
                            {entry.notes && <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>}
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500">No audit trail entries.</p>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Record Repayment</h3>
            {actionError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-3">{actionError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Amount (₦) *</label>
                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Interest Portion (₦)</label>
                  <input type="number" value={paymentInterest} onChange={e => setPaymentInterest(e.target.value)} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Principal Portion (₦)</label>
                  <input type="number" value={paymentPrincipal} onChange={e => setPaymentPrincipal(e.target.value)} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="pos">POS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Transaction Reference</label>
                <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Optional reference" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={recordPayment} disabled={actionLoading || !paymentAmount} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
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
    yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    red: 'bg-red-100 text-red-700 hover:bg-red-200',
    orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    teal: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
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
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
  );
}
