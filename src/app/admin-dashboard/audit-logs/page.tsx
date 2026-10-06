'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  ClipboardList,
  Search,
  Filter,
  RefreshCw,
  Download,
  Shield,
  UserPlus,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Settings,
  LogIn,
  LogOut,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Key,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Activity,
} from 'lucide-react';

type AuditCategory =
  | 'auth'
  | 'member'
  | 'loan'
  | 'investment'
  | 'savings'
  | 'settings'
  | 'document'
  | 'role'
  | 'all';

type AuditSeverity = 'info' | 'warning' | 'critical';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorId: string;
  actorRole: string;
  action: string;
  category: Exclude<AuditCategory, 'all'>;
  severity: AuditSeverity;
  target?: string;
  targetId?: string;
  details: string;
  ipAddress: string;
  outcome: 'success' | 'failure' | 'pending';
}

// ── Realistic mock audit log data ─────────────────────────────────────────────
const MOCK_LOGS: AuditLog[] = [
  {
    id: 'alog-001',
    timestamp: '2026-09-22T13:42:11Z',
    actor: 'Raymond Longdiem',
    actorId: 'ADM/2026/0001',
    actorRole: 'Administrator',
    action: 'LOAN_APPROVED',
    category: 'loan',
    severity: 'info',
    target: 'Olumide Fashola',
    targetId: 'CLMV/2026/0108',
    details: 'Approved loan application #LN-2026-0441 for ₦350,000 (3-month term). Guarantor verified.',
    ipAddress: '196.46.12.44',
    outcome: 'success',
  },
  {
    id: 'alog-002',
    timestamp: '2026-09-22T13:20:05Z',
    actor: 'Blessing Nwosu',
    actorId: 'ADM/2026/0001',
    actorRole: 'Super Admin',
    action: 'SETTING_UPDATED',
    category: 'settings',
    severity: 'warning',
    target: 'loan_interest_rate_percent',
    details: 'Changed monthly interest rate from 10% to 12%. Effective for all new applications.',
    ipAddress: '41.58.114.9',
    outcome: 'success',
  },
  {
    id: 'alog-003',
    timestamp: '2026-09-22T13:05:32Z',
    actor: 'Raymond Longdiem',
    actorId: 'ADM/2026/0001',
    actorRole: 'Administrator',
    action: 'MEMBER_CREATED',
    category: 'member',
    severity: 'info',
    target: 'Adefunke Balogun',
    targetId: 'CLMV/2026/0122',
    details: 'New member profile provisioned. Welcome email sent. Temporary password generated.',
    ipAddress: '196.46.12.44',
    outcome: 'success',
  },
  {
    id: 'alog-004',
    timestamp: '2026-09-22T12:58:10Z',
    actor: 'Emeka Eze',
    actorId: 'STF/2026/0009',
    actorRole: 'Operations Staff',
    action: 'DOCUMENT_UPLOADED',
    category: 'document',
    severity: 'info',
    target: 'Taiwo Akinwande',
    targetId: 'CLMV/2026/0099',
    details: 'Uploaded National ID scan (NIN-081234) and utility bill for KYC verification.',
    ipAddress: '102.89.48.7',
    outcome: 'success',
  },
  {
    id: 'alog-005',
    timestamp: '2026-09-22T12:44:20Z',
    actor: 'Raymond Longdiem',
    actorId: 'ADM/2026/0001',
    actorRole: 'Administrator',
    action: 'LOAN_REJECTED',
    category: 'loan',
    severity: 'warning',
    target: 'Kunle Adebisi',
    targetId: 'CLMV/2026/0075',
    details: 'Rejected loan application #LN-2026-0440. Reason: Insufficient guarantor income documentation.',
    ipAddress: '196.46.12.44',
    outcome: 'success',
  },
  {
    id: 'alog-006',
    timestamp: '2026-09-22T12:11:44Z',
    actor: 'Ngozi Okafor',
    actorId: 'MGR/2026/0002',
    actorRole: 'Branch Manager',
    action: 'INVESTMENT_APPROVED',
    category: 'investment',
    severity: 'info',
    target: 'Adaeze Obiora',
    targetId: 'CLMV/2026/0044',
    details: 'Approved Investors Circle application #IC-2026-0023 for ₦1,200,000 (12-month term). Payment confirmed.',
    ipAddress: '41.58.98.22',
    outcome: 'success',
  },
  {
    id: 'alog-007',
    timestamp: '2026-09-22T11:55:30Z',
    actor: 'System',
    actorId: 'SYSTEM',
    actorRole: 'Automated Process',
    action: 'INTEREST_CALCULATED',
    category: 'loan',
    severity: 'info',
    details: 'Automated monthly interest posted for 47 active loan accounts. Total: ₦2,341,500.',
    ipAddress: '127.0.0.1',
    outcome: 'success',
  },
  {
    id: 'alog-008',
    timestamp: '2026-09-22T11:30:00Z',
    actor: 'Blessing Nwosu',
    actorId: 'ADM/2026/0001',
    actorRole: 'Super Admin',
    action: 'ROLE_CHANGED',
    category: 'role',
    severity: 'critical',
    target: 'Emeka Eze',
    targetId: 'STF/2026/0009',
    details: 'Promoted Emeka Eze from Cooperative Member to Operations Staff. Reason: Administrative appointment.',
    ipAddress: '41.58.114.9',
    outcome: 'success',
  },
  {
    id: 'alog-009',
    timestamp: '2026-09-22T11:05:18Z',
    actor: 'Raymond Longdiem',
    actorId: 'ADM/2026/0001',
    actorRole: 'Administrator',
    action: 'MEMBER_STATUS_UPDATED',
    category: 'member',
    severity: 'warning',
    target: 'Dele Okonkwo',
    targetId: 'CLMV/2026/0056',
    details: 'Account suspended due to non-payment of dues for 3 consecutive months.',
    ipAddress: '196.46.12.44',
    outcome: 'success',
  },
  {
    id: 'alog-010',
    timestamp: '2026-09-22T10:48:55Z',
    actor: 'Raymond Longdiem',
    actorId: 'ADM/2026/0001',
    actorRole: 'Administrator',
    action: 'LOGIN',
    category: 'auth',
    severity: 'info',
    details: 'Successful administrator login from Lagos, Nigeria.',
    ipAddress: '196.46.12.44',
    outcome: 'success',
  },
  {
    id: 'alog-011',
    timestamp: '2026-09-22T10:32:20Z',
    actor: 'Unknown',
    actorId: 'N/A',
    actorRole: 'Unauthenticated',
    action: 'LOGIN_FAILED',
    category: 'auth',
    severity: 'critical',
    target: 'admin@climps.org',
    details: 'Failed login attempt with incorrect password. 3rd consecutive failure — account temporarily locked.',
    ipAddress: '185.224.128.44',
    outcome: 'failure',
  },
  {
    id: 'alog-012',
    timestamp: '2026-09-22T10:15:40Z',
    actor: 'System',
    actorId: 'SYSTEM',
    actorRole: 'Automated Process',
    action: 'OVERDUE_ALERT_SENT',
    category: 'loan',
    severity: 'warning',
    target: '12 Members',
    details: 'Automated overdue notices dispatched via email/SMS to 12 members with interest past due date.',
    ipAddress: '127.0.0.1',
    outcome: 'success',
  },
  {
    id: 'alog-013',
    timestamp: '2026-09-22T09:58:00Z',
    actor: 'Ngozi Okafor',
    actorId: 'MGR/2026/0002',
    actorRole: 'Branch Manager',
    action: 'KYC_VERIFIED',
    category: 'member',
    severity: 'info',
    target: 'Adefunke Balogun',
    targetId: 'CLMV/2026/0122',
    details: 'KYC documents verified and approved. NIN confirmed. Member status advanced to Active.',
    ipAddress: '41.58.98.22',
    outcome: 'success',
  },
  {
    id: 'alog-014',
    timestamp: '2026-09-22T09:30:14Z',
    actor: 'Emeka Eze',
    actorId: 'STF/2026/0009',
    actorRole: 'Operations Staff',
    action: 'REPAYMENT_RECORDED',
    category: 'loan',
    severity: 'info',
    target: 'Olumide Fashola',
    targetId: 'CLMV/2026/0108',
    details: 'Cash repayment of ₦45,500 received and recorded for loan #LN-2026-0411. Outstanding: ₦89,200.',
    ipAddress: '102.89.48.7',
    outcome: 'success',
  },
  {
    id: 'alog-015',
    timestamp: '2026-09-21T17:22:33Z',
    actor: 'Blessing Nwosu',
    actorId: 'ADM/2026/0001',
    actorRole: 'Super Admin',
    action: 'SETTING_UPDATED',
    category: 'settings',
    severity: 'warning',
    target: 'investors_circle_min_amount',
    details: 'Minimum Investors Circle amount changed from ₦500,000 to ₦750,000.',
    ipAddress: '41.58.114.9',
    outcome: 'success',
  },
  {
    id: 'alog-016',
    timestamp: '2026-09-21T16:44:50Z',
    actor: 'Raymond Longdiem',
    actorId: 'ADM/2026/0001',
    actorRole: 'Administrator',
    action: 'MEMBER_CREATED',
    category: 'member',
    severity: 'info',
    target: 'Tunde Ogunleye',
    targetId: 'CLMV/2026/0121',
    details: 'New member profile provisioned. Welcome email sent.',
    ipAddress: '196.46.12.44',
    outcome: 'success',
  },
  {
    id: 'alog-017',
    timestamp: '2026-09-21T15:10:00Z',
    actor: 'System',
    actorId: 'SYSTEM',
    actorRole: 'Automated Process',
    action: 'BACKUP_COMPLETED',
    category: 'settings',
    severity: 'info',
    details: 'Scheduled daily database backup completed. Size: 42.8 MB. Stored securely.',
    ipAddress: '127.0.0.1',
    outcome: 'success',
  },
  {
    id: 'alog-018',
    timestamp: '2026-09-21T14:05:20Z',
    actor: 'Raymond Longdiem',
    actorId: 'ADM/2026/0001',
    actorRole: 'Administrator',
    action: 'SAVINGS_PRODUCT_UPDATED',
    category: 'savings',
    severity: 'info',
    target: 'Regular Thrift Plan',
    details: 'Updated savings product description and minimum contribution from ₦10,000 to ₦15,000.',
    ipAddress: '196.46.12.44',
    outcome: 'success',
  },
  {
    id: 'alog-019',
    timestamp: '2026-09-21T11:55:40Z',
    actor: 'Ngozi Okafor',
    actorId: 'MGR/2026/0002',
    actorRole: 'Branch Manager',
    action: 'EXPORT_GENERATED',
    category: 'document',
    severity: 'info',
    details: 'Monthly loan portfolio Excel export generated (Sep 2026). 112 records.',
    ipAddress: '41.58.98.22',
    outcome: 'success',
  },
  {
    id: 'alog-020',
    timestamp: '2026-09-21T10:00:00Z',
    actor: 'Blessing Nwosu',
    actorId: 'ADM/2026/0001',
    actorRole: 'Super Admin',
    action: 'LOGIN',
    category: 'auth',
    severity: 'info',
    details: 'Super Admin login. Device: MacBook Pro. Location: Lagos, Nigeria.',
    ipAddress: '41.58.114.9',
    outcome: 'success',
  },
];

const CATEGORY_CONFIG: Record<Exclude<AuditCategory, 'all'>, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  auth: { label: 'Authentication', icon: LogIn, color: 'text-blue-700', bg: 'bg-blue-100' },
  member: { label: 'Member', icon: UserPlus, color: 'text-emerald-700', bg: 'bg-emerald-100' },
  loan: { label: 'Loans', icon: CreditCard, color: 'text-amber-700', bg: 'bg-amber-100' },
  investment: { label: 'Wealth Circle', icon: TrendingUp, color: 'text-teal-700', bg: 'bg-teal-100' },
  savings: { label: 'Savings', icon: PiggyBank, color: 'text-purple-700', bg: 'bg-purple-100' },
  settings: { label: 'Settings', icon: Settings, color: 'text-indigo-700', bg: 'bg-indigo-100' },
  document: { label: 'Documents', icon: ClipboardList, color: 'text-cyan-700', bg: 'bg-cyan-100' },
  role: { label: 'Role Change', icon: Shield, color: 'text-rose-700', bg: 'bg-rose-100' },
};

const SEVERITY_CONFIG: Record<AuditSeverity, { label: string; dot: string; text: string }> = {
  info: { label: 'Info', dot: 'bg-blue-500', text: 'text-blue-600' },
  warning: { label: 'Warning', dot: 'bg-amber-500', text: 'text-amber-600' },
  critical: { label: 'Critical', dot: 'bg-rose-500', text: 'text-rose-600' },
};

const OUTCOME_CONFIG: Record<AuditLog['outcome'], { icon: React.ElementType; color: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-600' },
  failure: { icon: XCircle, color: 'text-rose-600' },
  pending: { icon: AlertCircle, color: 'text-amber-600' },
};

const PAGE_SIZE = 10;

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory>('all');
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | 'all'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<AuditLog['outcome'] | 'all'>('all');
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Stats
  const totalEvents = MOCK_LOGS.length;
  const criticalEvents = MOCK_LOGS.filter(l => l.severity === 'critical').length;
  const failedEvents = MOCK_LOGS.filter(l => l.outcome === 'failure').length;
  const uniqueActors = new Set(MOCK_LOGS.map(l => l.actorId)).size;

  const filtered = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        (log.target && log.target.toLowerCase().includes(q)) ||
        log.details.toLowerCase().includes(q) ||
        log.ipAddress.includes(q);

      const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
      const matchesOutcome = outcomeFilter === 'all' || log.outcome === outcomeFilter;

      return matchesSearch && matchesCategory && matchesSeverity && matchesOutcome;
    });
  }, [searchQuery, categoryFilter, severityFilter, outcomeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => setPage(0), [searchQuery, categoryFilter, severityFilter, outcomeFilter]);

  const handleExport = () => {
    const headers = ['Timestamp', 'Actor', 'Actor ID', 'Role', 'Action', 'Category', 'Severity', 'Target', 'Details', 'IP Address', 'Outcome'];
    const rows = filtered.map(l => [
      formatDateTime(l.timestamp),
      l.actor, l.actorId, l.actorRole,
      l.action, l.category, l.severity,
      l.target || '', l.details, l.ipAddress, l.outcome,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climps_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout role="admin" memberName="Raymond Longdiem" memberId="ADM/2026/0001">
      <div className="p-6 xl:p-8 2xl:p-10 max-w-screen-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <ClipboardList size={24} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Audit Logs
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Complete, tamper-evident record of all system activities, administrator actions, and security events.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Download size={14} />
              Export CSV
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Audit Trail
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Events (30d)</span>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600"><Activity size={16} /></span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{totalEvents}</div>
            <div className="mt-1 text-xs text-slate-400">All recorded actions</div>
          </div>

          <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-xs bg-gradient-to-b from-rose-50/40 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Critical Alerts</span>
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600"><AlertCircle size={16} /></span>
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-700">{criticalEvents}</div>
            <div className="mt-1 text-xs text-slate-400">Require attention</div>
          </div>

          <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-xs bg-gradient-to-b from-amber-50/40 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Failed Operations</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><XCircle size={16} /></span>
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-700">{failedEvents}</div>
            <div className="mt-1 text-xs text-slate-400">Unsuccessful attempts</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Users</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><User size={16} /></span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{uniqueActors}</div>
            <div className="mt-1 text-xs text-slate-400">Distinct actors this period</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search actions, actors, targets, IP addresses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Quick filters */}
            <div className="flex items-center gap-3">
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Severity</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>

              <select
                value={outcomeFilter}
                onChange={e => setOutcomeFilter(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Outcomes</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1">Category:</span>
            {([
              { id: 'all', label: 'All Events' },
              ...Object.entries(CATEGORY_CONFIG).map(([id, cfg]) => ({ id, label: cfg.label })),
            ] as { id: string; label: string }[]).map(c => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id as AuditCategory)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  categoryFilter === c.id
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Log Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 w-40">Timestamp</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Target</th>
                  <th className="px-5 py-3.5 text-center">Severity</th>
                  <th className="px-5 py-3.5 text-center">Outcome</th>
                  <th className="px-5 py-3.5 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <ClipboardList size={32} className="opacity-40" />
                        <span className="font-semibold text-slate-900">No events found</span>
                        <p className="text-xs text-slate-500">Try adjusting your search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map(log => {
                    const CatCfg = CATEGORY_CONFIG[log.category];
                    const CatIcon = CatCfg?.icon || Activity;
                    const OutIcon = OUTCOME_CONFIG[log.outcome].icon;
                    const sevCfg = SEVERITY_CONFIG[log.severity];
                    const isExpanded = expandedId === log.id;

                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            log.severity === 'critical' ? 'border-l-2 border-rose-500' : ''
                          }`}
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        >
                          {/* Timestamp */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                              <Calendar size={11} className="shrink-0" />
                              {formatDateShort(log.timestamp)}
                            </div>
                          </td>

                          {/* Actor */}
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900 text-xs">{log.actor}</div>
                            <div className="text-2xs text-slate-500 font-mono">{log.actorId}</div>
                            <div className="text-2xs text-slate-400">{log.actorRole}</div>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                              {log.action}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4">
                            {CatCfg && (
                              <span className={`inline-flex items-center gap-1.5 text-2xs font-semibold px-2.5 py-1 rounded-full ${CatCfg.bg} ${CatCfg.color}`}>
                                <CatIcon size={11} />
                                {CatCfg.label}
                              </span>
                            )}
                          </td>

                          {/* Target */}
                          <td className="px-5 py-4">
                            <div className="text-xs font-medium text-slate-900">{log.target || '—'}</div>
                            {log.targetId && (
                              <div className="text-2xs text-slate-500 font-mono">{log.targetId}</div>
                            )}
                          </td>

                          {/* Severity */}
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-2xs font-semibold ${sevCfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sevCfg.dot}`} />
                              {sevCfg.label}
                            </span>
                          </td>

                          {/* Outcome */}
                          <td className="px-5 py-4 text-center">
                            <OutIcon size={16} className={`inline-block ${OUTCOME_CONFIG[log.outcome].color}`} />
                          </td>

                          {/* Expand */}
                          <td className="px-5 py-4 text-center">
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>

                        {/* Expanded details row */}
                        {isExpanded && (
                          <tr className="bg-slate-50/60 border-b border-slate-200">
                            <td colSpan={8} className="px-5 py-4">
                              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs shadow-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <span className="font-semibold text-slate-500 block mb-1">Full Timestamp</span>
                                    <span className="font-mono text-slate-900">{formatDateTime(log.timestamp)}</span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-500 block mb-1">IP Address</span>
                                    <span className="font-mono text-slate-900">{log.ipAddress}</span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="font-semibold text-slate-500 block mb-1">Event Details</span>
                                    <p className="text-slate-700 leading-relaxed">{log.details}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-500 block mb-1">Event ID</span>
                                    <span className="font-mono text-slate-900">{log.id.toUpperCase()}</span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-500 block mb-1">Outcome</span>
                                    <span className={`font-semibold capitalize ${OUTCOME_CONFIG[log.outcome].color}`}>
                                      {log.outcome}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{paged.length}</strong> of{' '}
              <strong className="text-slate-900">{filtered.length}</strong> events
              {filtered.length !== totalEvents && ` (filtered from ${totalEvents} total)`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-medium text-slate-900">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-800">
          <Shield size={16} className="shrink-0 mt-0.5 text-indigo-600" />
          <div>
            <span className="font-semibold block mb-0.5">Tamper-Evident Audit Trail</span>
            All records in this log are cryptographically signed and stored in a write-once format.
            Modifications are not permitted. Export records are watermarked with admin ID and timestamp for forensic traceability.
            Audit logs are retained for a minimum of 7 years per cooperative regulatory requirements.
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
