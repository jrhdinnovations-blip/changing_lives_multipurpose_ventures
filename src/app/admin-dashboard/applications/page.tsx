'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import {
  CheckCircle2, XCircle, Eye, Search, RefreshCw, Clock, AlertCircle,
  ChevronDown, X, FileText, User, CreditCard, TrendingUp, PiggyBank,
  SlidersHorizontal, ChevronRight, ChevronLeft, Loader2, Users, ShieldCheck,
  Phone, Mail, MapPin, Briefcase, Calendar, Award
} from 'lucide-react';

type MainTab = 'members' | 'products';
type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
type MembershipStatus = 'pending' | 'under_review' | 'approved' | 'active' | 'suspended';
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
  memberName?: string;
  memberNumber?: string;
}

interface MemberApplicant {
  id: string;
  userId: string;
  memberNumber: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  phone: string;
  email: string;
  address?: string | null;
  state?: string | null;
  lga?: string | null;
  occupation?: string | null;
  employer?: string | null;
  nokName?: string | null;
  nokRelationship?: string | null;
  nokPhone?: string | null;
  nokAddress?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  profilePhotoUrl?: string | null;
  supportingDocs?: any[];
  membershipStatus: MembershipStatus;
  kycCompleted: boolean;
  kycCompletedAt?: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  under_review: { label: 'Under Review', color: 'text-blue-700', bg: 'bg-blue-50', icon: Eye },
  approved: { label: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-100', icon: X },
};

const MEMBER_STATUS_CONFIG: Record<MembershipStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  under_review: { label: 'Under Review', color: 'text-blue-700', bg: 'bg-blue-50', icon: Eye },
  approved: { label: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
  active: { label: 'Active', color: 'text-teal-700', bg: 'bg-teal-50', icon: ShieldCheck },
  suspended: { label: 'Suspended', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
};

const PRODUCT_TYPE_CONFIG: Record<ProductType, { label: string; color: string; icon: React.ElementType }> = {
  savings: { label: 'Savings', color: 'bg-purple-100 text-purple-700', icon: PiggyBank },
  loan: { label: 'Loan', color: 'bg-orange-100 text-orange-700', icon: CreditCard },
  investment: { label: 'Wealth Circle', color: 'bg-teal-100 text-teal-700', icon: TrendingUp },
};

const PAGE_SIZE = 15;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dateStr?: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ─── Generate Unique Member Number ───────────────────────────────────────────
async function generateNextMemberNumber(supabase: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `CLMV/${currentYear}/`;

  try {
    const { data } = await supabase
      .from('members')
      .select('member_number')
      .like('member_number', `${prefix}%`)
      .order('member_number', { ascending: false })
      .limit(1);

    let nextSeq = 1;
    if (data && data.length > 0 && data[0].member_number) {
      const parts = data[0].member_number.split('/');
      if (parts.length >= 3) {
        const lastNum = parseInt(parts[2], 10);
        if (!isNaN(lastNum)) {
          nextSeq = lastNum + 1;
        }
      }
    }
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  } catch (err) {
    console.error('Error calculating member number:', err);
    return `${prefix}0001`;
  }
}

// ─── Member Detail Modal ─────────────────────────────────────────────────────
interface MemberDetailModalProps {
  member: MemberApplicant;
  onClose: () => void;
  onStatusUpdate: (id: string, status: MembershipStatus, generateNumber?: boolean) => Promise<void>;
}

function MemberDetailModal({ member, onClose, onStatusUpdate }: MemberDetailModalProps) {
  const [saving, setSaving] = useState<string | null>(null);

  const handleAction = async (status: MembershipStatus, generateNumber = false) => {
    setSaving(status);
    await onStatusUpdate(member.id, status, generateNumber);
    setSaving(null);
    onClose();
  };

  const StatusIcon = MEMBER_STATUS_CONFIG[member.membershipStatus]?.icon || Clock;
  const cfg = MEMBER_STATUS_CONFIG[member.membershipStatus] || MEMBER_STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
              {member.profilePhotoUrl ? (
                <img src={member.profilePhotoUrl} alt="Applicant" className="w-full h-full object-cover" />
              ) : (
                <User size={22} className="text-emerald-600" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                {[member.firstName, member.middleName, member.lastName].filter(Boolean).join(' ')}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {member.memberNumber || `Provisional ID: CLMV/2026/PENDING-${member.id.slice(0, 4).toUpperCase()}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
              <StatusIcon size={14} />
              Status: {cfg.label}
            </div>
            <span className="text-xs text-slate-500">
              Submitted: {formatDate(member.createdAt)}
            </span>
          </div>

          {/* Contact & Personal */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Email</span>
              <span className="font-medium text-slate-800">{member.email || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Phone</span>
              <span className="font-medium text-slate-800">{member.phone || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Gender / DOB</span>
              <span className="font-medium text-slate-800">{member.gender || '—'} · {member.dateOfBirth || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Location</span>
              <span className="font-medium text-slate-800">{member.state ? `${member.state}${member.lga ? `, ${member.lga}` : ''}` : '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block mb-0.5">Residential Address</span>
              <span className="font-medium text-slate-800">{member.address || '—'}</span>
            </div>
          </div>

          {/* Employment & Identity */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Occupation</span>
              <span className="font-medium text-slate-800">{member.occupation || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Employer / Business</span>
              <span className="font-medium text-slate-800">{member.employer || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">ID Type</span>
              <span className="font-medium text-slate-800">{member.idType || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">ID Number</span>
              <span className="font-mono font-medium text-slate-800">{member.idNumber || '—'}</span>
            </div>
          </div>

          {/* Next of Kin */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
              <Users size={13} className="text-emerald-600" />
              Next of Kin Information
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block mb-0.5">Name</span>
                <span className="font-medium text-slate-800">{member.nokName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Relationship</span>
                <span className="font-medium text-slate-800">{member.nokRelationship || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Phone</span>
                <span className="font-medium text-slate-800">{member.nokPhone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Address</span>
                <span className="font-medium text-slate-800">{member.nokAddress || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 p-6 border-t border-slate-100 bg-slate-50/50">
          {member.membershipStatus !== 'under_review' && member.membershipStatus !== 'active' && member.membershipStatus !== 'approved' && (
            <button
              onClick={() => handleAction('under_review')}
              disabled={saving !== null}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving === 'under_review' ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
              Mark Under Review
            </button>
          )}

          {member.membershipStatus !== 'approved' && member.membershipStatus !== 'active' && (
            <button
              onClick={() => handleAction('approved', !member.memberNumber)}
              disabled={saving !== null}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {saving === 'approved' ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />}
              Approve & Assign Number
            </button>
          )}

          {member.membershipStatus !== 'active' && (
            <button
              onClick={() => handleAction('active', !member.memberNumber)}
              disabled={saving !== null}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {saving === 'active' ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
              Activate Member
            </button>
          )}

          {member.membershipStatus !== 'suspended' && (
            <button
              onClick={() => handleAction('suspended')}
              disabled={saving !== null}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving === 'suspended' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              Suspend
            </button>
          )}

          <button onClick={onClose} className="ml-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Application Detail Modal ────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${PRODUCT_TYPE_CONFIG[application.productType].color}`}>
              <ProductIcon size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Application Review</h2>
              <p className="text-xs text-slate-500 font-mono">{application.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
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
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Applicant</p>
              <p className="font-semibold text-slate-900 text-sm">{application.memberName || 'Unknown Member'}</p>
              {application.memberNumber && (
                <p className="text-xs text-slate-500 font-mono mt-0.5">{application.memberNumber}</p>
              )}
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Product</p>
              <p className="font-semibold text-slate-900 text-sm">{application.productName}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg mt-1 inline-block ${PRODUCT_TYPE_CONFIG[application.productType].color}`}>
                {PRODUCT_TYPE_CONFIG[application.productType].label}
              </span>
            </div>
          </div>

          {/* Financial details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Amount</p>
              <p className="font-bold text-slate-900 text-sm font-tabular">{formatCurrency(application.amount)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Duration</p>
              <p className="font-bold text-slate-900 text-sm">{application.durationMonths} months</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Submitted</p>
              <p className="font-bold text-slate-900 text-sm">{formatDate(application.submittedAt)}</p>
            </div>
          </div>

          {/* Eligibility */}
          <div className={`rounded-xl p-4 border ${application.isEligible ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-900">Eligibility Check</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${application.isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {application.isEligible ? 'Eligible' : 'Not Eligible'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${application.eligibilityScore >= 70 ? 'bg-emerald-500' : application.eligibilityScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${application.eligibilityScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-900 tabular-nums">{application.eligibilityScore}%</span>
            </div>
          </div>

          {/* Applicant notes */}
          {application.notes && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1.5">Applicant Notes</p>
              <p className="text-sm text-slate-700">{application.notes}</p>
            </div>
          )}

          {/* Admin review notes */}
          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-2">
              Admin Review Notes / Eligibility Notes
            </label>
            <textarea
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Add eligibility notes, conditions, or reasons for decision..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {saving === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Reject
          </button>
          <button onClick={onClose} className="ml-auto px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminApplicationsPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('members');

  // Product Applications State
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [totalAppsCount, setTotalAppsCount] = useState(0);
  const [appsPage, setAppsPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all');
  const [appsSearchQuery, setAppsSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Member Applications State
  const [members, setMembers] = useState<MemberApplicant[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [totalMembersCount, setTotalMembersCount] = useState(0);
  const [membersPage, setMembersPage] = useState(0);
  const [memberStatusFilter, setMemberStatusFilter] = useState<MembershipStatus | 'all'>('all');
  const [membersSearchQuery, setMembersSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberApplicant | null>(null);

  // Shared state
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch Member Applicants ───────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('members')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (memberStatusFilter !== 'all') {
        query = query.eq('membership_status', memberStatusFilter);
      }

      query = query.range(membersPage * PAGE_SIZE, (membersPage + 1) * PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      const mapped: MemberApplicant[] = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        memberNumber: row.member_number,
        firstName: row.first_name || '',
        middleName: row.middle_name,
        lastName: row.last_name || '',
        gender: row.gender,
        dateOfBirth: row.date_of_birth,
        phone: row.phone || '',
        email: row.email || '',
        address: row.address,
        state: row.state,
        lga: row.lga,
        occupation: row.occupation,
        employer: row.employer,
        nokName: row.nok_name,
        nokRelationship: row.nok_relationship,
        nokPhone: row.nok_phone,
        nokAddress: row.nok_address,
        idType: row.id_type,
        idNumber: row.id_number,
        profilePhotoUrl: row.profile_photo_url,
        supportingDocs: row.supporting_docs,
        membershipStatus: (row.membership_status as MembershipStatus) || 'pending',
        kycCompleted: Boolean(row.kyc_completed),
        kycCompletedAt: row.kyc_completed_at,
        createdAt: row.created_at,
      }));

      const filtered = membersSearchQuery.trim()
        ? mapped.filter(m => {
            const term = membersSearchQuery.toLowerCase();
            const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
            return (
              fullName.includes(term) ||
              m.email.toLowerCase().includes(term) ||
              m.phone.includes(term) ||
              (m.memberNumber && m.memberNumber.toLowerCase().includes(term)) ||
              (m.state && m.state.toLowerCase().includes(term))
            );
          })
        : mapped;

      setMembers(filtered);
      setTotalMembersCount(count || 0);
    } catch (err: any) {
      console.error('Failed to load members:', err);
      showToast(err.message || 'Failed to load member applicants', 'error');
    } finally {
      setLoadingMembers(false);
    }
  }, [memberStatusFilter, membersPage, membersSearchQuery]);

  // ── Fetch Product Applications ────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
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
        .range(appsPage * PAGE_SIZE, (appsPage + 1) * PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

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
        memberName: row.members ? `${row.members.first_name} ${row.members.last_name}` : undefined,
        memberNumber: row.members?.member_number,
      }));

      const filtered = appsSearchQuery.trim()
        ? mapped.filter(a =>
            a.memberName?.toLowerCase().includes(appsSearchQuery.toLowerCase()) ||
            a.memberNumber?.toLowerCase().includes(appsSearchQuery.toLowerCase()) ||
            a.productName.toLowerCase().includes(appsSearchQuery.toLowerCase()) ||
            a.id.toLowerCase().includes(appsSearchQuery.toLowerCase())
          )
        : mapped;

      setApplications(filtered);
      setTotalAppsCount(count || 0);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoadingApps(false);
    }
  }, [statusFilter, typeFilter, appsPage, appsSearchQuery]);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    } else {
      fetchApplications();
    }
  }, [activeTab, fetchMembers, fetchApplications]);

  // ── Handle Member Status Updates ──────────────────────────────────────────
  const handleMemberStatusUpdate = async (id: string, status: MembershipStatus, generateNumber = false) => {
    try {
      const supabase = createClient();
      const updateData: any = {
        membership_status: status,
        updated_at: new Date().toISOString(),
      };

      if (generateNumber) {
        const nextNumber = await generateNextMemberNumber(supabase);
        updateData.member_number = nextNumber;
        updateData.membership_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      showToast(
        status === 'approved'
          ? `Member approved with number ${updateData.member_number || ''}`
          : status === 'active'
          ? 'Member activated successfully'
          : `Status changed to ${status}`,
        'success'
      );
      fetchMembers();
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  // ── Handle Product Status Updates ─────────────────────────────────────────
  const handleAppStatusUpdate = async (id: string, status: ApplicationStatus, reviewNotes: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('applications')
        .update({
          application_status: status,
          review_notes: reviewNotes || null,
          reviewed_by: user?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      showToast(
        status === 'approved' ? 'Application approved successfully' :
        status === 'rejected' ? 'Application rejected' : 'Status updated to Under Review',
        status === 'rejected' ? 'error' : 'success'
      );
      fetchApplications();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  return (
    <AppLayout role="admin" memberName="Raymond Longdiem" memberId="ADM/2026/0001">
      <div className="p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-destructive text-red-400-foreground'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </div>
        )}

        {/* Header & Main Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Applications & Approvals</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Review member registrations, KYC submissions, and product applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => activeTab === 'members' ? fetchMembers() : fetchApplications()}
              disabled={loadingMembers || loadingApps}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 bg-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={(loadingMembers || loadingApps) ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Primary View Switcher: Member Applications vs Product Applications */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'members'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={16} />
            <span>Member Registrations</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-2xs bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
              Workflow
            </span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={16} />
            <span>Product Applications</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-2xs bg-slate-200/80 text-slate-600 font-medium">
              Savings · Loans · Inv
            </span>
          </button>
        </div>

        {/* ════════════════════ TAB 1: MEMBER REGISTRATIONS ════════════════════ */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Status overview cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(['pending', 'under_review', 'approved', 'active', 'suspended'] as MembershipStatus[]).map(st => {
                const cfg = MEMBER_STATUS_CONFIG[st];
                const Icon = cfg.icon;
                const count = members.filter(m => m.membershipStatus === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => { setMemberStatusFilter(st); setMembersPage(0); }}
                    className={`p-4 rounded-xl border text-left transition-all hover:shadow-xs ${
                      memberStatusFilter === st
                        ? `${cfg.bg} border-current ${cfg.color} shadow-xs ring-1 ring-current/20`
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${memberStatusFilter === st ? cfg.color : 'text-slate-500'}`}>
                      <Icon size={14} />
                      <span className="text-xs font-semibold">{cfg.label}</span>
                    </div>
                    <p className={`text-xl font-bold ${memberStatusFilter === st ? cfg.color : 'text-slate-900'}`}>
                      {count}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Member Filters */}
            <div className="card-base">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search applicant by name, email, phone, state, or member ID..."
                    value={membersSearchQuery}
                    onChange={e => { setMembersSearchQuery(e.target.value); setMembersPage(0); }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="relative">
                  <select
                    value={memberStatusFilter}
                    onChange={e => { setMemberStatusFilter(e.target.value as MembershipStatus | 'all'); setMembersPage(0); }}
                    className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {(memberStatusFilter !== 'all' || membersSearchQuery) && (
                  <button
                    onClick={() => { setMemberStatusFilter('all'); setMembersSearchQuery(''); setMembersPage(0); }}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <X size={13} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Member Table */}
            <div className="card-base overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Applicant Queue</h2>
                  {!loadingMembers && (
                    <span className="bg-slate-100 text-slate-600 text-2xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                      {members.length} shown
                    </span>
                  )}
                </div>
              </div>

              {loadingMembers ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                  <span className="ml-3 text-sm text-slate-500">Loading member registrations...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users size={32} className="text-slate-400 mb-3" />
                  <p className="text-sm font-semibold text-slate-900 mb-1">No member applicants found</p>
                  <p className="text-xs text-slate-500">New online registrations will appear here for review.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Next of Kin</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Number</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map(m => {
                        const cfg = MEMBER_STATUS_CONFIG[m.membershipStatus] || MEMBER_STATUS_CONFIG.pending;
                        const StatusIcon = cfg.icon;

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Applicant */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 overflow-hidden">
                                  {m.profilePhotoUrl ? (
                                    <img src={m.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={13} className="text-emerald-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-900">
                                    {[m.firstName, m.lastName].filter(Boolean).join(' ') || 'Applicant'}
                                  </p>
                                  <p className="text-2xs text-slate-500">{m.occupation || 'Member'}</p>
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-slate-900 font-medium">{m.phone || '—'}</p>
                              <p className="text-2xs text-slate-500">{m.email || '—'}</p>
                            </td>

                            {/* Location */}
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-slate-800">{m.state || '—'}</p>
                              <p className="text-2xs text-slate-500">{m.lga || ''}</p>
                            </td>

                            {/* Next of Kin */}
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-slate-800 font-medium">{m.nokName || '—'}</p>
                              <p className="text-2xs text-slate-500">{m.nokRelationship || ''}</p>
                            </td>

                            {/* Member Number */}
                            <td className="px-4 py-3.5">
                              {m.memberNumber ? (
                                <span className="font-mono text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100">
                                  {m.memberNumber}
                                </span>
                              ) : (
                                <span className="text-2xs text-slate-400 italic">
                                  Unassigned
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                                <StatusIcon size={12} />
                                {cfg.label}
                              </div>
                            </td>

                            {/* Registered */}
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-slate-700">{formatDate(m.createdAt)}</p>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedMember(m)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
                                  title="View full application"
                                >
                                  <Eye size={14} />
                                </button>

                                {m.membershipStatus === 'pending' && (
                                  <button
                                    onClick={() => handleMemberStatusUpdate(m.id, 'under_review')}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                                    title="Mark Under Review"
                                  >
                                    Review
                                  </button>
                                )}

                                {(m.membershipStatus === 'pending' || m.membershipStatus === 'under_review') && (
                                  <button
                                    onClick={() => handleMemberStatusUpdate(m.id, 'approved', !m.memberNumber)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                                    title="Approve and assign member number"
                                  >
                                    <Award size={12} />
                                    Approve
                                  </button>
                                )}

                                {m.membershipStatus === 'approved' && (
                                  <button
                                    onClick={() => handleMemberStatusUpdate(m.id, 'active')}
                                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                                    title="Activate Membership"
                                  >
                                    <ShieldCheck size={12} />
                                    Activate
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
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 2: PRODUCT APPLICATIONS ════════════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Status summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(([status, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setAppsPage(0); }}
                    className={`p-4 rounded-xl border text-left transition-all hover:shadow-xs ${
                      statusFilter === status
                        ? `${cfg.bg} border-current ${cfg.color} shadow-xs ring-1 ring-current/20`
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${statusFilter === status ? cfg.color : 'text-slate-500'}`}>
                      <Icon size={14} />
                      <span className="text-xs font-semibold">{cfg.label}</span>
                    </div>
                    <p className={`text-xl font-bold ${statusFilter === status ? cfg.color : 'text-slate-900'}`}>—</p>
                  </button>
                );
              })}
            </div>

            {/* Filters */}
            <div className="card-base">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by member name, ID, or product..."
                    value={appsSearchQuery}
                    onChange={e => { setAppsSearchQuery(e.target.value); setAppsPage(0); }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value as ApplicationStatus | 'all'); setAppsPage(0); }}
                    className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(([s, cfg]) => (
                      <option key={s} value={s}>{cfg.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={e => { setTypeFilter(e.target.value as ProductType | 'all'); setAppsPage(0); }}
                    className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    {(Object.entries(PRODUCT_TYPE_CONFIG) as [ProductType, typeof PRODUCT_TYPE_CONFIG[ProductType]][]).map(([t, cfg]) => (
                      <option key={t} value={t}>{cfg.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {(statusFilter !== 'all' || typeFilter !== 'all' || appsSearchQuery) && (
                  <button
                    onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setAppsSearchQuery(''); setAppsPage(0); }}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <X size={13} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Applications Table */}
            <div className="card-base overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Product Applications</h2>
                  {!loadingApps && (
                    <span className="bg-slate-100 text-slate-600 text-2xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                      {applications.length} shown
                    </span>
                  )}
                </div>
              </div>

              {loadingApps ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                  <span className="ml-3 text-sm text-slate-500">Loading applications...</span>
                </div>
              ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText size={32} className="text-slate-400 mb-3" />
                  <p className="text-sm font-semibold text-slate-900 mb-1">No applications found</p>
                  <p className="text-xs text-slate-500">Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Eligibility</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.map(app => {
                        const StatusIcon = STATUS_CONFIG[app.applicationStatus].icon;
                        const ProductIcon = PRODUCT_TYPE_CONFIG[app.productType].icon;

                        return (
                          <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                  <User size={12} className="text-emerald-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-900">{app.memberName || 'Unknown'}</p>
                                  {app.memberNumber && (
                                    <p className="text-2xs text-slate-500 font-mono">{app.memberNumber}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="text-xs font-medium text-slate-900 max-w-[140px] truncate">{app.productName}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${PRODUCT_TYPE_CONFIG[app.productType].color}`}>
                                <ProductIcon size={11} />
                                {PRODUCT_TYPE_CONFIG[app.productType].label}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs font-semibold text-slate-900 font-tabular">{formatCurrency(app.amount)}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs text-slate-600">{app.durationMonths}mo</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${app.eligibilityScore >= 70 ? 'bg-emerald-500' : app.eligibilityScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ width: `${app.eligibilityScore}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-bold tabular-nums ${app.isEligible ? 'text-emerald-700' : 'text-red-700'}`}>
                                  {app.eligibilityScore}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${STATUS_CONFIG[app.applicationStatus].bg} ${STATUS_CONFIG[app.applicationStatus].color}`}>
                                <StatusIcon size={11} />
                                {STATUS_CONFIG[app.applicationStatus].label}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-slate-700">{formatDate(app.submittedAt)}</p>
                              <p className="text-2xs text-slate-400">{formatTime(app.submittedAt)}</p>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setSelectedApp(app)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
                                  title="View details & review"
                                >
                                  <Eye size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Product App Detail Modal */}
      {selectedApp && (
        <DetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusUpdate={handleAppStatusUpdate}
        />
      )}

      {/* Member Applicant Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onStatusUpdate={handleMemberStatusUpdate}
        />
      )}
    </AppLayout>
  );
}
