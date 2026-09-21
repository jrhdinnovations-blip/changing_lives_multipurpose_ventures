'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FileText, Upload, CheckCircle, XCircle, Clock, Search, ChevronDown, Shield, Download, AlertCircle, RefreshCw, User, Receipt, Folder, ExternalLink, TrendingUp, CreditCard } from 'lucide-react';

interface ClimpsDocument {
  id: string;
  document_name: string;
  document_category: string;
  document_description: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  public_url: string | null;
  version_label: string;
  version_number: number;
  is_current_version: boolean;
  is_terms_document: boolean;
  terms_version: string | null;
  terms_agreed_at: string | null;
  doc_status: string;
  download_count: number;
  application_type: string;
  loan_application_id: string | null;
  investment_application_id: string | null;
  user_id: string | null;
  uploaded_by: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface AuditEntry {
  id: string;
  document_id: string;
  user_id: string | null;
  action: string;
  action_detail: string | null;
  ip_address: string | null;
  created_at: string;
}

interface UploadForm {
  document_name: string;
  document_category: string;
  document_description: string;
  application_type: string;
  loan_application_id: string;
  investment_application_id: string;
  user_id: string;
  version_label: string;
  is_terms_document: boolean;
  terms_version: string;
  public_url: string;
  file_name: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  application_form: 'Application Form',
  terms_acknowledgement: 'Terms Acknowledgement',
  letter_of_agreement: 'Letter of Agreement',
  supporting_document: 'Supporting Document',
  guarantor_document: 'Guarantor Document',
  collateral_document: 'Collateral Document',
  payment_receipt: 'Payment Receipt',
  approval_record: 'Approval Record',
  identity_document: 'Identity Document',
  bank_statement: 'Bank Statement',
  other: 'Other',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  uploaded: { label: 'Uploaded', color: 'bg-blue-100 text-blue-700', icon: FileText },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  superseded: { label: 'Superseded', color: 'bg-gray-100 text-gray-500', icon: RefreshCw },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-500', icon: Folder },
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const EMPTY_FORM: UploadForm = {
  document_name: '',
  document_category: 'letter_of_agreement',
  document_description: '',
  application_type: 'loan',
  loan_application_id: '',
  investment_application_id: '',
  user_id: '',
  version_label: 'v1',
  is_terms_document: false,
  terms_version: 'v1.0',
  public_url: '',
  file_name: '',
};

export default function AdminDocumentsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [documents, setDocuments] = useState<ClimpsDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<ClimpsDocument | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadForm>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('climps_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchErr) throw fetchErr;
      setDocuments(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const fetchAuditTrail = async (docId: string) => {
    setAuditLoading(true);
    try {
      const { data } = await supabase
        .from('document_audit_trail')
        .select('*')
        .eq('document_id', docId)
        .order('created_at', { ascending: false });
      setAuditTrail(data || []);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSelectDoc = async (doc: ClimpsDocument) => {
    setSelectedDoc(doc);
    setShowRejectInput(false);
    await fetchAuditTrail(doc.id);
  };

  const handleStatusChange = async (docId: string, newStatus: string, extra?: Record<string, unknown>) => {
    setActionLoading(docId + newStatus);
    try {
      const updateData: Record<string, unknown> = { doc_status: newStatus, ...extra };
      if (newStatus === 'verified') {
        updateData.verified_by = user?.id;
        updateData.verified_at = new Date().toISOString();
      }
      const { error: updateErr } = await supabase
        .from('climps_documents')
        .update(updateData)
        .eq('id', docId);
      if (updateErr) throw updateErr;
      await supabase.from('document_audit_trail').insert({
        document_id: docId,
        user_id: user?.id,
        action: newStatus === 'verified' ? 'verified' : newStatus === 'rejected' ? 'rejected' : 'status_changed',
        action_detail: extra?.rejection_reason
          ? `Rejected: ${extra.rejection_reason}`
          : `Status changed to ${newStatus}`,
      });
      await fetchDocuments();
      if (selectedDoc?.id === docId) {
        await fetchAuditTrail(docId);
        setSelectedDoc(prev => prev ? { ...prev, doc_status: newStatus, ...extra as Partial<ClimpsDocument> } : null);
      }
      setShowRejectInput(false);
      setRejectReason('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.document_name || !uploadForm.application_type) {
      setUploadError('Document name and application type are required');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const payload: Record<string, unknown> = {
        document_name: uploadForm.document_name,
        document_category: uploadForm.document_category,
        document_description: uploadForm.document_description || null,
        application_type: uploadForm.application_type,
        version_label: uploadForm.version_label || 'v1',
        is_terms_document: uploadForm.is_terms_document,
        terms_version: uploadForm.is_terms_document ? uploadForm.terms_version : null,
        public_url: uploadForm.public_url || null,
        file_name: uploadForm.file_name || null,
        doc_status: 'uploaded',
        uploaded_by: user?.id,
        user_id: uploadForm.user_id || null,
      };
      if (uploadForm.application_type === 'loan' && uploadForm.loan_application_id) {
        payload.loan_application_id = uploadForm.loan_application_id;
      }
      if (uploadForm.application_type === 'investment' && uploadForm.investment_application_id) {
        payload.investment_application_id = uploadForm.investment_application_id;
      }
      const { error: insertErr } = await supabase.from('climps_documents').insert(payload);
      if (insertErr) throw insertErr;
      setShowUploadModal(false);
      setUploadForm(EMPTY_FORM);
      await fetchDocuments();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filtered = documents.filter(doc => {
    const matchSearch = !search ||
      doc.document_name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.document_description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || doc.document_category === filterCategory;
    const matchType = filterType === 'all' || doc.application_type === filterType;
    const matchStatus = filterStatus === 'all' || doc.doc_status === filterStatus;
    return matchSearch && matchCat && matchType && matchStatus;
  });

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.doc_status === 'pending' || d.doc_status === 'uploaded').length,
    verified: documents.filter(d => d.doc_status === 'verified').length,
    rejected: documents.filter(d => d.doc_status === 'rejected').length,
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Document Management</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage agreements, executed documents, and audit trails for all applications
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchDocuments}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              <button
                onClick={() => { setShowUploadModal(true); setUploadError(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Upload size={14} />
                Upload Document
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Documents', value: stats.total, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Awaiting Review', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Verified', value: stats.verified, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border border-border rounded-xl p-4`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {[
                { value: filterType, onChange: setFilterType, options: [['all', 'All Types'], ['loan', 'Loan'], ['investment', 'Investment']] },
                { value: filterCategory, onChange: setFilterCategory, options: [['all', 'All Categories'], ...Object.entries(CATEGORY_LABELS)] },
                { value: filterStatus, onChange: setFilterStatus, options: [['all', 'All Statuses'], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])] },
              ].map((sel, i) => (
                <div key={i} className="relative">
                  <select
                    value={sel.value}
                    onChange={e => sel.onChange(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {sel.options.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Main content */}
          <div className="flex gap-6">
            {/* Document list */}
            <div className={`flex-1 space-y-2 ${selectedDoc ? 'hidden lg:block' : ''}`}>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <FileText size={40} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium text-foreground">No documents found</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload a document to get started</p>
                </div>
              ) : (
                filtered.map(doc => {
                  const status = STATUS_CONFIG[doc.doc_status] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc)}
                      className={`bg-card border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm ${
                        isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          doc.application_type === 'loan' ? 'bg-blue-50' : 'bg-purple-50'
                        }`}>
                          {doc.application_type === 'loan'
                            ? <CreditCard size={16} className="text-blue-600" />
                            : <TrendingUp size={16} className="text-purple-600" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{doc.document_name}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${status.color}`}>
                              <StatusIcon size={10} />
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[doc.document_category]}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className={`text-xs font-medium ${doc.application_type === 'loan' ? 'text-blue-600' : 'text-purple-600'}`}>
                              {doc.application_type === 'loan' ? 'Loan' : 'Investment'}
                            </span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{doc.version_label}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(doc.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {doc.public_url && (
                            <a
                              href={doc.public_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                              title="Open"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Detail panel */}
            {selectedDoc && (
              <div className="w-full lg:w-[400px] shrink-0">
                <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-6">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                    <p className="text-sm font-semibold text-foreground">Document Details</p>
                    <button onClick={() => setSelectedDoc(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
                  </div>

                  <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Info */}
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground text-sm">{selectedDoc.document_name}</p>
                      {selectedDoc.document_description && (
                        <p className="text-xs text-muted-foreground">{selectedDoc.document_description}</p>
                      )}
                      {[
                        { label: 'Category', value: CATEGORY_LABELS[selectedDoc.document_category] },
                        { label: 'Type', value: selectedDoc.application_type === 'loan' ? 'Loan' : 'Investment' },
                        { label: 'Version', value: selectedDoc.version_label },
                        { label: 'Status', value: STATUS_CONFIG[selectedDoc.doc_status]?.label || selectedDoc.doc_status },
                        { label: 'File', value: selectedDoc.file_name || '—' },
                        { label: 'Size', value: formatBytes(selectedDoc.file_size_bytes) },
                        { label: 'Downloads', value: String(selectedDoc.download_count) },
                        { label: 'Uploaded', value: formatDateTime(selectedDoc.created_at) },
                        { label: 'Verified At', value: formatDateTime(selectedDoc.verified_at) },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-medium text-foreground">{row.value}</span>
                        </div>
                      ))}
                      {selectedDoc.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
                          <strong>Rejection reason:</strong> {selectedDoc.rejection_reason}
                        </div>
                      )}
                    </div>

                    {/* Admin actions */}
                    <div className="space-y-2 border-t border-border pt-3">
                      <p className="text-xs font-semibold text-foreground">Admin Actions</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedDoc.doc_status !== 'verified' && (
                          <button
                            onClick={() => handleStatusChange(selectedDoc.id, 'verified')}
                            disabled={actionLoading === selectedDoc.id + 'verified'}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={12} />
                            Verify
                          </button>
                        )}
                        {selectedDoc.doc_status !== 'rejected' && (
                          <button
                            onClick={() => setShowRejectInput(v => !v)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                        )}
                        {selectedDoc.doc_status !== 'archived' && (
                          <button
                            onClick={() => handleStatusChange(selectedDoc.id, 'archived')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <Folder size={12} />
                            Archive
                          </button>
                        )}
                        {selectedDoc.public_url && (
                          <a
                            href={selectedDoc.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <Download size={12} />
                            Download
                          </a>
                        )}
                      </div>
                      {showRejectInput && (
                        <div className="space-y-2">
                          <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Rejection reason (required)"
                            rows={2}
                            className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                          />
                          <button
                            onClick={() => {
                              if (!rejectReason.trim()) return;
                              handleStatusChange(selectedDoc.id, 'rejected', { rejection_reason: rejectReason });
                            }}
                            disabled={!rejectReason.trim() || actionLoading === selectedDoc.id + 'rejected'}
                            className="w-full px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Audit trail */}
                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <Shield size={12} className="text-primary" />
                        Audit Trail
                      </p>
                      {auditLoading ? (
                        <div className="space-y-2">
                          {[1, 2].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
                        </div>
                      ) : auditTrail.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">No audit entries</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {auditTrail.map(entry => (
                            <div key={entry.id} className="flex gap-2 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <div>
                                <p className="font-medium text-foreground capitalize">{entry.action.replace(/_/g, ' ')}</p>
                                {entry.action_detail && <p className="text-muted-foreground">{entry.action_detail}</p>}
                                <p className="text-muted-foreground">{formatDateTime(entry.created_at)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <p className="font-semibold text-foreground">Upload Document</p>
              <button onClick={() => setShowUploadModal(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {uploadError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">Document Name *</label>
                  <input
                    type="text"
                    value={uploadForm.document_name}
                    onChange={e => setUploadForm(f => ({ ...f, document_name: e.target.value }))}
                    placeholder="e.g. Letter of Agreement — John Doe"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Application Type *</label>
                  <select
                    value={uploadForm.application_type}
                    onChange={e => setUploadForm(f => ({ ...f, application_type: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="loan">Loan</option>
                    <option value="investment">Investment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Category</label>
                  <select
                    value={uploadForm.document_category}
                    onChange={e => setUploadForm(f => ({ ...f, document_category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Version Label</label>
                  <input
                    type="text"
                    value={uploadForm.version_label}
                    onChange={e => setUploadForm(f => ({ ...f, version_label: e.target.value }))}
                    placeholder="v1"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Member User ID</label>
                  <input
                    type="text"
                    value={uploadForm.user_id}
                    onChange={e => setUploadForm(f => ({ ...f, user_id: e.target.value }))}
                    placeholder="UUID of member"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {uploadForm.application_type === 'loan' ? (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1">Loan Application ID</label>
                    <input
                      type="text"
                      value={uploadForm.loan_application_id}
                      onChange={e => setUploadForm(f => ({ ...f, loan_application_id: e.target.value }))}
                      placeholder="UUID of loan application"
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                ) : (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1">Investment Application ID</label>
                    <input
                      type="text"
                      value={uploadForm.investment_application_id}
                      onChange={e => setUploadForm(f => ({ ...f, investment_application_id: e.target.value }))}
                      placeholder="UUID of investment application"
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">Document URL (public link)</label>
                  <input
                    type="url"
                    value={uploadForm.public_url}
                    onChange={e => setUploadForm(f => ({ ...f, public_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">File Name</label>
                  <input
                    type="text"
                    value={uploadForm.file_name}
                    onChange={e => setUploadForm(f => ({ ...f, file_name: e.target.value }))}
                    placeholder="agreement.pdf"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                  <textarea
                    value={uploadForm.document_description}
                    onChange={e => setUploadForm(f => ({ ...f, document_description: e.target.value }))}
                    placeholder="Brief description of this document..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_terms"
                    checked={uploadForm.is_terms_document}
                    onChange={e => setUploadForm(f => ({ ...f, is_terms_document: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="is_terms" className="text-xs text-foreground">This is a terms/agreement document</label>
                </div>
                {uploadForm.is_terms_document && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1">Terms Version</label>
                    <input
                      type="text"
                      value={uploadForm.terms_version}
                      onChange={e => setUploadForm(f => ({ ...f, terms_version: e.target.value }))}
                      placeholder="v1.0"
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
