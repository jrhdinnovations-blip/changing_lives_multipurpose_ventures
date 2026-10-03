'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FileText, Download, Shield, Clock, CheckCircle, XCircle, AlertCircle, Search, ChevronDown, FileCheck, FileBadge, FileSignature, Receipt, Folder, RefreshCw, Calendar, User, Lock } from 'lucide-react';

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
  is_current_version: boolean;
  is_terms_document: boolean;
  terms_version: string | null;
  terms_agreed_at: string | null;
  doc_status: string;
  download_count: number;
  application_type: string;
  loan_application_id: string | null;
  investment_application_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AuditEntry {
  id: string;
  document_id: string;
  action: string;
  action_detail: string | null;
  created_at: string;
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

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  application_form: FileText,
  terms_acknowledgement: FileCheck,
  letter_of_agreement: FileSignature,
  supporting_document: Folder,
  guarantor_document: User,
  collateral_document: Shield,
  payment_receipt: Receipt,
  approval_record: FileBadge,
  identity_document: Lock,
  bank_statement: FileText,
  other: FileText,
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function DocumentsPage() {
  const { user, profile } = useAuth();
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
  const [showAudit, setShowAudit] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('climps_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (fetchErr) throw fetchErr;
      setDocuments(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

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

  const handleViewDoc = async (doc: ClimpsDocument) => {
    setSelectedDoc(doc);
    setShowAudit(false);
    await fetchAuditTrail(doc.id);
    // Record view in audit trail
    await supabase.from('document_audit_trail').insert({
      document_id: doc.id,
      user_id: user?.id,
      action: 'viewed',
      action_detail: 'Document viewed by member',
    });
  };

  const handleDownload = async (doc: ClimpsDocument) => {
    if (!doc.public_url) return;
    // Record download
    await supabase.from('document_audit_trail').insert({
      document_id: doc.id,
      user_id: user?.id,
      action: 'downloaded',
      action_detail: 'Document downloaded by member',
    });
    await supabase
      .from('climps_documents')
      .update({ download_count: (doc.download_count || 0) + 1 })
      .eq('id', doc.id);
    window.open(doc.public_url, '_blank');
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
    verified: documents.filter(d => d.doc_status === 'verified').length,
    pending: documents.filter(d => d.doc_status === 'pending' || d.doc_status === 'uploaded').length,
    loan: documents.filter(d => d.application_type === 'loan').length,
    investment: documents.filter(d => d.application_type === 'investment').length,
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">My Documents</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Agreements, terms, and supporting documents for your applications
              </p>
            </div>
            <button
              onClick={fetchDocuments}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total Documents', value: stats.total, color: 'text-primary' },
              { label: 'Verified', value: stats.verified, color: 'text-green-600' },
              { label: 'Pending Review', value: stats.pending, color: 'text-amber-600' },
              { label: 'Loan Docs', value: stats.loan, color: 'text-blue-600' },
              { label: 'Wealth Circle Docs', value: stats.investment, color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
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
              <div className="relative">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Types</option>
                  <option value="loan">Loan</option>
                  <option value="investment">Wealth Circle</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex gap-6">
            {/* Document list */}
            <div className={`flex-1 space-y-3 ${selectedDoc ? 'hidden md:block' : ''}`}>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <FileText size={40} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium text-foreground">No documents found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Documents will appear here once your applications are processed
                  </p>
                </div>
              ) : (
                filtered.map(doc => {
                  const CatIcon = CATEGORY_ICONS[doc.document_category] || FileText;
                  const status = STATUS_CONFIG[doc.doc_status] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleViewDoc(doc)}
                      className={`bg-card border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm ${
                        isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          doc.application_type === 'loan' ? 'bg-blue-50' : 'bg-purple-50'
                        }`}>
                          <CatIcon size={18} className={
                            doc.application_type === 'loan' ? 'text-blue-600' : 'text-purple-600'
                          } />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground truncate">{doc.document_name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {CATEGORY_LABELS[doc.document_category]} · {doc.version_label}
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${status.color}`}>
                              <StatusIcon size={10} />
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              doc.application_type === 'loan' ?'bg-blue-100 text-blue-700' :'bg-purple-100 text-purple-700'
                            }`}>
                              {doc.application_type === 'loan' ? 'Loan' : 'Investment'}
                            </span>
                            {doc.file_size_bytes && (
                              <span className="text-xs text-muted-foreground">{formatBytes(doc.file_size_bytes)}</span>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(doc.created_at)}
                            </span>
                            {doc.download_count > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Download size={10} />
                                {doc.download_count}×
                              </span>
                            )}
                          </div>
                        </div>
                        {doc.public_url && (
                          <button
                            onClick={e => { e.stopPropagation(); handleDownload(doc); }}
                            className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors shrink-0"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Document detail panel */}
            {selectedDoc && (
              <div className="w-full md:w-[380px] shrink-0">
                <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-6">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                    <p className="text-sm font-semibold text-foreground">Document Details</p>
                    <button
                      onClick={() => setSelectedDoc(null)}
                      className="text-muted-foreground hover:text-foreground text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Doc info */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {(() => {
                          const CatIcon = CATEGORY_ICONS[selectedDoc.document_category] || FileText;
                          return <CatIcon size={20} className="text-primary" />;
                        })()}
                        <p className="font-semibold text-foreground text-sm">{selectedDoc.document_name}</p>
                      </div>
                      {selectedDoc.document_description && (
                        <p className="text-xs text-muted-foreground mb-3">{selectedDoc.document_description}</p>
                      )}
                      <div className="space-y-2">
                        {[
                          { label: 'Category', value: CATEGORY_LABELS[selectedDoc.document_category] },
                          { label: 'Application Type', value: selectedDoc.application_type === 'loan' ? 'Loan' : 'Investment' },
                          { label: 'Version', value: selectedDoc.version_label },
                          { label: 'Status', value: STATUS_CONFIG[selectedDoc.doc_status]?.label || selectedDoc.doc_status },
                          { label: 'File Size', value: formatBytes(selectedDoc.file_size_bytes) },
                          { label: 'Uploaded', value: formatDateTime(selectedDoc.created_at) },
                          { label: 'Downloads', value: String(selectedDoc.download_count) },
                        ].map(row => (
                          <div key={row.label} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-medium text-foreground">{row.value}</span>
                          </div>
                        ))}
                        {selectedDoc.is_terms_document && selectedDoc.terms_agreed_at && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Terms Agreed</span>
                            <span className="font-medium text-green-600">{formatDateTime(selectedDoc.terms_agreed_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {selectedDoc.public_url ? (
                        <button
                          onClick={() => handleDownload(selectedDoc)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          <Download size={14} />
                          Download Document
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground rounded-lg text-sm">
                          <Lock size={14} />
                          Document not yet available
                        </div>
                      )}
                      <button
                        onClick={() => setShowAudit(v => !v)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <Shield size={14} />
                        {showAudit ? 'Hide' : 'View'} Audit Trail
                      </button>
                    </div>

                    {/* Audit trail */}
                    {showAudit && (
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                          <Shield size={12} className="text-primary" />
                          Audit Trail
                        </p>
                        {auditLoading ? (
                          <div className="space-y-2">
                            {[1, 2].map(i => (
                              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                            ))}
                          </div>
                        ) : auditTrail.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-3">No audit entries yet</p>
                        ) : (
                          <div className="space-y-2">
                            {auditTrail.map(entry => (
                              <div key={entry.id} className="flex gap-2 text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <div>
                                  <p className="font-medium text-foreground capitalize">{entry.action.replace('_', ' ')}</p>
                                  {entry.action_detail && (
                                    <p className="text-muted-foreground">{entry.action_detail}</p>
                                  )}
                                  <p className="text-muted-foreground">{formatDateTime(entry.created_at)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
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
    </AppLayout>
  );
}
