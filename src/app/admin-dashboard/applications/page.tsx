'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, XCircle, Eye, Search, RefreshCw, Clock, AlertCircle, ChevronDown, X, FileText, User, CreditCard, TrendingUp, PiggyBank, SlidersHorizontal, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
type ProductType = 'savings' | 'loan' | 'investment';

interface Application {
  id: string;
  memberId: string | null;
  userId: string | null;
  productType: ProductType;
  productId: string;
  productName: string;
  amount: number;
  durationMonths: number;
  eligibilityScore: number;
  isEligible: boolean;
  applicationStatus: ApplicationStatus;
  notes: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  // joined
  memberName?: string;
  memberNumber?: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  under_review: { label: 'Under Review', color: 'text-blue-600', bg: 'bg-blue-50', icon: Eye },
  approved: { label: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bg: 'bg-muted', icon: X },
};

const PRODUCT_TYPE_CONFIG: Record<ProductType, { label: string; color: string; icon: React.ElementType }> = {
  savings: { label: 'Savings', color: 'bg-purple-100 text-purple-700', icon: PiggyBank },
  loan: { label: 'Loan', color: 'bg-orange-100 text-orange-700', icon: CreditCard },
  investment: { label: 'Investment', color: 'bg-teal-100 text-teal-700', icon: TrendingUp },
};

const PAGE_SIZE = 15;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ─── Detail Modal ────────────────────────────────────────────────────────────
interface DetailModalProps {
  application: Application;
  onClose: () => void;
  onStatusUpdate: (id: string, status: ApplicationStatus, reviewNotes: string) => Promise<void>;
}

function DetailModal({ application, onClose, onStatusUpdate }: DetailModalProps) {
  const [reviewNotes, setReviewNotes] = useState(application.reviewNotes || '');
  const [saving, setSaving] = useState<'approve' | 'reject' | 'review' | null>(null);

  const handleAction = async (action: 'approve' | 'reject' | 'review') => {
    setSaving(action);
    const statusMap: Record<string, ApplicationStatus> = {
      approve: 'approved',
      reject: 'rejected',
      review: 'under_review',
    };
    await onStatusUpdate(application.id, statusMap[action], reviewNotes);
    setSaving(null);
    onClose();
  };

  const StatusIcon = STATUS_CONFIG[application.applicationStatus].icon;
  const ProductIcon = PRODUCT_TYPE_CONFIG[application.productType].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${PRODUCT_TYPE_CONFIG[application.productType].color}`}>
              <ProductIcon size={18} />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-base">Application Review</h2>
              <p className="text-xs text-muted-foreground font-mono">{application.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${STATUS_CONFIG[application.applicationStatus].bg} ${STATUS_CONFIG[application.applicationStatus].color}`}>
            <StatusIcon size={14} />
            {STATUS_CONFIG[application.applicationStatus].label}
          </div>

          {/* Applicant info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Applicant</p>
              <p className="font-semibold text-foreground text-sm">{application.memberName || 'Unknown Member'}</p>
              {application.memberNumber && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{application.memberNumber}</p>
              )}
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Product</p>
              <p className="font-semibold text-foreground text-sm">{application.productName}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg mt-1 inline-block ${PRODUCT_TYPE_CONFIG[application.productType].color}`}>
                {PRODUCT_TYPE_CONFIG[application.productType].label}
              </span>
            </div>
          </div>

          {/* Financial details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="font-bold text-foreground text-sm font-tabular">{formatCurrency(application.amount)}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Duration</p>
              <p className="font-bold text-foreground text-sm">{application.durationMonths} months</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Submitted</p>
              <p className="font-bold text-foreground text-sm">{formatDate(application.submittedAt)}</p>
            </div>
          </div>

          {/* Eligibility */}
          <div className={`rounded-xl p-4 border ${application.isEligible ? 'bg-emerald-50 border-emerald-200' : 'bg-destructive/5 border-destructive/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Eligibility Check</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${application.isEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
                {application.isEligible ? 'Eligible' : 'Not Eligible'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/60 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${application.eligibilityScore >= 70 ? 'bg-emerald-500' : application.eligibilityScore >= 40 ? 'bg-amber-500' : 'bg-destructive'}`}
                  style={{ width: `${application.eligibilityScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">{application.eligibilityScore}%</span>
            </div>
          </div>

          {/* Applicant notes */}
          {application.notes && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1.5">Applicant Notes</p>
              <p className="text-sm text-foreground">{application.notes}</p>
            </div>
          )}

          {/* Admin review notes */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Admin Review Notes / Eligibility Notes
            </label>
            <textarea
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Add eligibility notes, conditions, or reasons for decision..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Previous review notes */}
          {application.reviewNotes && application.reviewNotes !== reviewNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-semibold mb-1">Previous Review Notes</p>
              <p className="text-xs text-blue-700">{application.reviewNotes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 border-t border-border bg-muted/30">
          {application.applicationStatus !== 'under_review' && (
            <button
              onClick={() => handleAction('review')}
              disabled={saving !== null}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving === 'review' ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
              Mark Under Review
            </button>
          )}
          <button
            onClick={() => handleAction('approve')}
            disabled={saving !== null || application.applicationStatus === 'approved'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {saving === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Approve
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={saving !== null || application.applicationStatus === 'rejected'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {saving === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Reject
          </button>
          <button onClick={onClose} className="ml-auto px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all');

  // UI state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      let query = supabase
        .from('applications')
        .select(`
          *,
          members!applications_member_id_fkey(first_name, last_name, member_number)
        `, { count: 'exact' });

      if (statusFilter !== 'all') {
        query = query.eq('application_status', statusFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('product_type', typeFilter);
      }

      query = query
        .order('submitted_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      const mapped: Application[] = (data || []).map((row: any) => ({
        id: row.id,
        memberId: row.member_id,
        userId: row.user_id,
        productType: row.product_type as ProductType,
        productId: row.product_id,
        productName: row.product_name,
        amount: Number(row.amount),
        durationMonths: row.duration_months,
        eligibilityScore: row.eligibility_score,
        isEligible: row.is_eligible,
        applicationStatus: row.application_status as ApplicationStatus,
        notes: row.notes,
        reviewedBy: row.reviewed_by,
        reviewNotes: row.review_notes,
        submittedAt: row.submitted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        memberName: row.members
          ? `${row.members.first_name} ${row.members.last_name}`
          : undefined,
        memberNumber: row.members?.member_number,
      }));

      // Client-side search filter
      const filtered = searchQuery.trim()
        ? mapped.filter(a =>
            a.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.memberNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.id.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : mapped;

      setApplications(filtered);
      setTotalCount(count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page, searchQuery]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusUpdate = async (id: string, status: ApplicationStatus, reviewNotes: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from('applications')
        .update({
          application_status: status,
          review_notes: reviewNotes || null,
          reviewed_by: user?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        showToast(`Update failed: ${updateError.message}`, 'error');
        return;
      }

      showToast(
        status === 'approved' ? 'Application approved successfully' :
        status === 'rejected'? 'Application rejected' : 'Status updated to Under Review',
        status === 'rejected' ? 'error' : 'success'
      );
      fetchApplications();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const handleQuickAction = async (app: Application, action: 'approve' | 'reject' | 'review') => {
    setActionProcessing(`${action}-${app.id}`);
    const statusMap: Record<string, ApplicationStatus> = {
      approve: 'approved',
      reject: 'rejected',
      review: 'under_review',
    };
    await handleStatusUpdate(app.id, statusMap[action], app.reviewNotes || '');
    setActionProcessing(null);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Status counts for filter tabs
  const statusCounts: Record<string, number> = {
    all: totalCount,
  };

  return (
    <AppLayout role="admin" memberName="Chukwuemeka Adeyemi" memberId="ADM/2026/0003">
      <div className="p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-destructive text-destructive-foreground'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Application Review</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review and process submitted savings, loan, and investment applications
            </p>
          </div>
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(([status, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(0); }}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                  statusFilter === status
                    ? `${cfg.bg} border-current ${cfg.color} shadow-sm`
                    : 'bg-card border-border hover:border-primary/30'
                }`}
              >
                <div className={`flex items-center gap-2 mb-2 ${statusFilter === status ? cfg.color : 'text-muted-foreground'}`}>
                  <Icon size={14} />
                  <span className="text-xs font-semibold">{cfg.label}</span>
                </div>
                <p className={`text-xl font-bold ${statusFilter === status ? cfg.color : 'text-foreground'}`}>—</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="card-base">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by member name, ID, or product..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value as ApplicationStatus | 'all'); setPage(0); }}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(([s, cfg]) => (
                  <option key={s} value={s}>{cfg.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {/* Product type filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value as ProductType | 'all'); setPage(0); }}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="all">All Types</option>
                {(Object.entries(PRODUCT_TYPE_CONFIG) as [ProductType, typeof PRODUCT_TYPE_CONFIG[ProductType]][]).map(([t, cfg]) => (
                  <option key={t} value={t}>{cfg.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {/* Clear filters */}
            {(statusFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearchQuery(''); setPage(0); }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card-base overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="section-header">Applications</h2>
              {!loading && (
                <span className="bg-muted text-muted-foreground text-2xs font-bold px-2 py-0.5 rounded-full">
                  {applications.length} shown
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {/* Product type tabs */}
              {(['all', 'savings', 'loan', 'investment'] as const).map(t => {
                const cfg = t === 'all' ? null : PRODUCT_TYPE_CONFIG[t];
                return (
                  <button
                    key={t}
                    onClick={() => { setTypeFilter(t); setPage(0); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      typeFilter === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cfg && <cfg.icon size={11} />}
                    <span className="capitalize">{t === 'all' ? 'All' : cfg?.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Loading applications...</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle size={32} className="text-destructive mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">Failed to load applications</p>
              <p className="text-xs text-muted-foreground mb-4">{error}</p>
              <button onClick={fetchApplications} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && applications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={32} className="text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">No applications found</p>
              <p className="text-xs text-muted-foreground">
                {statusFilter !== 'all' || typeFilter !== 'all' || searchQuery ?'Try adjusting your filters' :'No applications have been submitted yet'}
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && applications.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="table-header">Applicant</th>
                    <th className="table-header">Product</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Duration</th>
                    <th className="table-header">Eligibility</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Submitted</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => {
                    const StatusIcon = STATUS_CONFIG[app.applicationStatus].icon;
                    const ProductIcon = PRODUCT_TYPE_CONFIG[app.productType].icon;
                    const isProcessing = actionProcessing?.endsWith(app.id);

                    return (
                      <tr key={app.id} className="border-b border-border/60 table-row-hover">
                        {/* Applicant */}
                        <td className="table-cell">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User size={12} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                {app.memberName || 'Unknown'}
                              </p>
                              {app.memberNumber && (
                                <p className="text-2xs text-muted-foreground font-mono">{app.memberNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Product */}
                        <td className="table-cell">
                          <p className="text-xs font-medium text-foreground max-w-[140px] truncate">{app.productName}</p>
                        </td>

                        {/* Type */}
                        <td className="table-cell">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${PRODUCT_TYPE_CONFIG[app.productType].color}`}>
                            <ProductIcon size={11} />
                            {PRODUCT_TYPE_CONFIG[app.productType].label}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="table-cell">
                          <span className="text-xs font-semibold text-foreground font-tabular">{formatCurrency(app.amount)}</span>
                        </td>

                        {/* Duration */}
                        <td className="table-cell">
                          <span className="text-xs text-muted-foreground">{app.durationMonths}mo</span>
                        </td>

                        {/* Eligibility */}
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${app.eligibilityScore >= 70 ? 'bg-emerald-500' : app.eligibilityScore >= 40 ? 'bg-amber-500' : 'bg-destructive'}`}
                                style={{ width: `${app.eligibilityScore}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold tabular-nums ${app.isEligible ? 'text-emerald-600' : 'text-destructive'}`}>
                              {app.eligibilityScore}%
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="table-cell">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${STATUS_CONFIG[app.applicationStatus].bg} ${STATUS_CONFIG[app.applicationStatus].color}`}>
                            <StatusIcon size={11} />
                            {STATUS_CONFIG[app.applicationStatus].label}
                          </div>
                        </td>

                        {/* Submitted */}
                        <td className="table-cell">
                          <p className="text-xs text-foreground">{formatDate(app.submittedAt)}</p>
                          <p className="text-2xs text-muted-foreground">{formatTime(app.submittedAt)}</p>
                        </td>

                        {/* Actions */}
                        <td className="table-cell">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              title="View details & review"
                            >
                              <Eye size={13} />
                            </button>
                            {app.applicationStatus !== 'under_review' && app.applicationStatus !== 'approved' && app.applicationStatus !== 'rejected' && (
                              <button
                                onClick={() => handleQuickAction(app, 'review')}
                                disabled={isProcessing}
                                className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-muted-foreground hover:text-blue-600 disabled:opacity-50"
                                title="Mark under review"
                              >
                                {actionProcessing === `review-${app.id}` ? <Loader2 size={13} className="animate-spin" /> : <SlidersHorizontal size={13} />}
                              </button>
                            )}
                            {app.applicationStatus !== 'approved' && (
                              <button
                                onClick={() => handleQuickAction(app, 'approve')}
                                disabled={isProcessing}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors text-muted-foreground hover:text-emerald-600 disabled:opacity-50"
                                title="Approve application"
                              >
                                {actionProcessing === `approve-${app.id}` ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                              </button>
                            )}
                            {app.applicationStatus !== 'rejected' && (
                              <button
                                onClick={() => handleQuickAction(app, 'reject')}
                                disabled={isProcessing}
                                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50"
                                title="Reject application"
                              >
                                {actionProcessing === `reject-${app.id}` ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages} · {totalCount} total
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <DetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </AppLayout>
  );
}
