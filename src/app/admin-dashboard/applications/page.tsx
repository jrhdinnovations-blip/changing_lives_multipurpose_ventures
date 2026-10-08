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
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-[#00E599]/15', icon: Clock },
  under_review: { label: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-500/15', icon: Eye },
  approved: { label: 'Approved', color: 'text-[#00E599]', bg: 'bg-emerald-500/15', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-rose-400', bg: 'bg-rose-500/15', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'text-white/40', bg: 'bg-white/5', icon: X },
};

const MEMBER_STATUS_CONFIG: Record<MembershipStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-[#00E599]/15', icon: Clock },
  under_review: { label: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-500/15', icon: Eye },
  approved: { label: 'Approved', color: 'text-[#00E599]', bg: 'bg-emerald-500/15', icon: CheckCircle2 },
  active: { label: 'Active', color: 'text-teal-400', bg: 'bg-teal-500/15', icon: ShieldCheck },
  suspended: { label: 'Suspended', color: 'text-rose-400', bg: 'bg-rose-500/15', icon: XCircle },
};

const PRODUCT_TYPE_CONFIG: Record<ProductType, { label: string; color: string; icon: React.ElementType }> = {
  savings: { label: 'Savings', color: 'bg-purple-500/15 text-purple-300 border border-purple-500/30', icon: PiggyBank },
  loan: { label: 'Loan', color: 'bg-orange-500/15 text-orange-300 border border-orange-500/30', icon: CreditCard },
  investment: { label: 'Wealth Circle', color: 'bg-teal-500/15 text-teal-300 border border-teal-500/30', icon: TrendingUp },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#0B1528] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center overflow-hidden shrink-0">
              {member.profilePhotoUrl ? (
                <img src={member.profilePhotoUrl} alt="Applicant" className="w-full h-full object-cover" />
              ) : (
                <User size={22} className="text-[#00E599]" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                {[member.firstName, member.middleName, member.lastName].filter(Boolean).join(' ')}
              </h2>
              <p className="text-xs text-white/40 font-mono">
                {member.memberNumber || `Provisional ID: CLMV/2026/PENDING-${member.id.slice(0, 4).toUpperCase()}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${cfg.bg} ${cfg.color} border border-current/20`}>
              <StatusIcon size={14} />
              Status: {cfg.label}
            </div>
            <span className="text-xs text-white/40">
              Submitted: {formatDate(member.createdAt)}
            </span>
          </div>

          {/* Contact & Personal */}
          <div className="grid grid-cols-2 gap-3 bg-white/5 rounded-2xl p-4 border border-white/10 text-xs">
            <div>
              <span className="text-white/40 block mb-0.5">Email</span>
              <span className="font-medium text-white">{member.email || '—'}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-0.5">Phone</span>
              <span className="font-medium text-white">{member.phone || '—'}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-0.5">Gender / DOB</span>
              <span className="font-medium text-white">{member.gender || '—'} · {member.dateOfBirth || '—'}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-0.5">Location</span>
              <span className="font-medium text-white">{member.state ? `${member.state}${member.lga ? `, ${member.lga}` : ''}` : '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-white/40 block mb-0.5">Residential Address</span>
              <span className="font-medium text-white">{member.address || '—'}</span>
            </div>
          </div>

          {/* Employment & Identity */}
          <div className="grid grid-cols-2 gap-3 bg-white/5 rounded-2xl p-4 border border-white/10 text-xs">
            <div>
              <span className="text-white/40 block mb-0.5">Occupation</span>
              <span className="font-medium text-white">{member.occupation || '—'}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-0.5">Employer / Business</span>
              <span className="font-medium text-white">{member.employer || '—'}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-0.5">ID Type</span>
              <span className="font-medium text-white">{member.idType || '—'}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-0.5">ID Number</span>
              <span className="font-mono font-medium text-white">{member.idNumber || '—'}</span>
            </div>
          </div>

          {/* Next of Kin */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-xs">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
              <Users size={13} className="text-[#00E599]" />
              Next of Kin Information
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-white/40 block mb-0.5">Name</span>
                <span className="font-medium text-white">{member.nokName || '—'}</span>
              </div>
              <div>
                <span className="text-white/40 block mb-0.5">Relationship</span>
                <span className="font-medium text-white">{member.nokRelationship || '—'}</span>
              </div>
              <div>
                <span className="text-white/40 block mb-0.5">Phone</span>
                <span className="font-medium text-white">{member.nokPhone || '—'}</span>
              </div>
              <div>
                <span className="text-white/40 block mb-0.5">Address</span>
                <span className="font-medium text-white">{member.nokAddress || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 p-6 border-t border-white/10 bg-white/5">
          {member.membershipStatus !== 'under_review' && member.membershipStatus !== 'active' && member.membershipStatus !== 'approved' && (
            <button
              onClick={() => handleAction('under_review')}
              disabled={saving !== null}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              {saving === 'under_review' ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
              Mark Under Review
            </button>
          )}

          {member.membershipStatus !== 'approved' && member.membershipStatus !== 'active' && (
            <button
              onClick={() => handleAction('approved', !member.memberNumber)}
              disabled={saving !== null}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {saving === 'approved' ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />}
              Approve & Assign Number
            </button>
          )}

          {member.membershipStatus !== 'active' && (
            <button
              onClick={() => handleAction('active', !member.memberNumber)}
              disabled={saving !== null}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold hover:bg-teal-500/30 transition-colors disabled:opacity-50"
            >
              {saving === 'active' ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
              Activate Member
            </button>
          )}

          {member.membershipStatus !== 'suspended' && (
            <button
              onClick={() => handleAction('suspended')}
              disabled={saving !== null}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-colors disabled:opacity-50"
            >
              {saving === 'suspended' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              Suspend
            </button>
          )}

          <button onClick={onClose} className="btn-outline ml-auto px-4 py-2 text-xs font-semibold">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#0B1528] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${PRODUCT_TYPE_CONFIG[application.productType].color}`}>
              <ProductIcon size={18} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Application Review</h2>
              <p className="text-xs text-white/40 font-mono">{application.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border border-current/20 ${STATUS_CONFIG[application.applicationStatus].bg} ${STATUS_CONFIG[application.applicationStatus].color}`}>
            <StatusIcon size={14} />
            {STATUS_CONFIG[application.applicationStatus].label}
          </div>

          {/* Applicant info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/40 mb-1">Applicant</p>
              <p className="font-semibold text-white text-sm">{application.memberName || 'Unknown Member'}</p>
              {application.memberNumber && (
                <p className="text-xs text-white/40 font-mono mt-0.5">{application.memberNumber}</p>
              )}
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/40 mb-1">Product</p>
              <p className="font-semibold text-white text-sm">{application.productName}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg mt-1 inline-block ${PRODUCT_TYPE_CONFIG[application.productType].color}`}>
                {PRODUCT_TYPE_CONFIG[application.productType].label}
              </span>
            </div>
          </div>

          {/* Financial details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <p className="text-xs text-white/40 mb-1">Amount</p>
              <p className="font-bold text-white text-sm font-tabular">{formatCurrency(application.amount)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <p className="text-xs text-white/40 mb-1">Duration</p>
              <p className="font-bold text-white text-sm">{application.durationMonths} months</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <p className="text-xs text-white/40 mb-1">Submitted</p>
              <p className="font-bold text-white text-sm">{formatDate(application.submittedAt)}</p>
            </div>
          </div>

          {/* Eligibility */}
          <div className={`rounded-xl p-4 border ${application.isEligible ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-white">Eligibility Check</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${application.isEligible ? 'bg-emerald-500/20 text-[#00E599]' : 'bg-rose-500/20 text-rose-300'}`}>
                {application.isEligible ? 'Eligible' : 'Not Eligible'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${application.eligibilityScore >= 70 ? 'bg-[#00E599]' : application.eligibilityScore >= 40 ? 'bg-amber-400' : 'bg-rose-500'}`}
                  style={{ width: `${application.eligibilityScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-white tabular-nums">{application.eligibilityScore}%</span>
            </div>
          </div>

          {/* Applicant notes */}
          {application.notes && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/40 mb-1.5">Applicant Notes</p>
              <p className="text-sm text-white/50">{application.notes}</p>
            </div>
          )}

          {/* Admin review notes */}
          <div>
            <label className="text-sm font-semibold text-white block mb-2">
              Admin Review Notes / Eligibility Notes
            </label>
            <textarea
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Add eligibility notes, conditions, or reasons for decision..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/60 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 border-t border-white/10 bg-white/5">
          {application.applicationStatus !== 'under_review' && (
            <button
              onClick={() => handleAction('review')}
              disabled={saving !== null}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-sm font-semibold hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              {saving === 'review' ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
              Mark Under Review
            </button>
          )}
          <button
            onClick={() => handleAction('approve')}
            disabled={saving !== null || application.applicationStatus === 'approved'}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {saving === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Approve
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={saving !== null || application.applicationStatus === 'rejected'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-sm font-semibold hover:bg-rose-500/30 transition-colors disabled:opacity-50"
          >
            {saving === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Reject
          </button>
          <button onClick={onClose} className="btn-outline ml-auto px-4 py-2.5 text-sm font-semibold">
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
            <h1 className="text-2xl font-bold text-white">Applications & Approvals</h1>
            <p className="text-sm text-white/40 mt-0.5">
              Review member registrations, KYC submissions, and product applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => activeTab === 'members' ? fetchMembers() : fetchApplications()}
              disabled={loadingMembers || loadingApps}
              className="btn-outline flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw size={14} className={(loadingMembers || loadingApps) ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Primary View Switcher: Member Applications vs Product Applications */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white/5 rounded-2xl w-fit border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'members'
                ? 'bg-white/15 text-white shadow-xs border border-white/10'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Users size={16} />
            <span>Member Registrations</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-2xs bg-emerald-500/20 text-[#00E599] font-bold border border-emerald-500/30">
              Workflow
            </span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-white/15 text-white shadow-xs border border-white/10'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <FileText size={16} />
            <span>Product Applications</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-2xs bg-white/5 text-white/50 font-medium border border-white/10">
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
                    className={`p-4 rounded-xl border text-left transition-all hover:shadow-xs backdrop-blur-xl ${
                      memberStatusFilter === st
                        ? `${cfg.bg} border-current ${cfg.color} shadow-xs ring-1 ring-current/20`
                        : 'bg-[#0D182E]/90 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${memberStatusFilter === st ? cfg.color : 'text-white/40'}`}>
                      <Icon size={14} />
                      <span className="text-xs font-semibold">{cfg.label}</span>
                    </div>
                    <p className={`text-xl font-bold font-tabular ${memberStatusFilter === st ? cfg.color : 'text-white'}`}>
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
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search applicant by name, email, phone, state, or member ID..."
                    value={membersSearchQuery}
                    onChange={e => { setMembersSearchQuery(e.target.value); setMembersPage(0); }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-emerald-500/50 focus:bg-[#0B1528]"
                  />
                </div>

                <div className="relative">
                  <select
                    value={memberStatusFilter}
                    onChange={e => { setMemberStatusFilter(e.target.value as MembershipStatus | 'all'); setMembersPage(0); }}
                    className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#0B1528] text-sm text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value="all" className="bg-[#0B1528] text-white">All Statuses</option>
                    <option value="pending" className="bg-[#0B1528] text-white">Pending</option>
                    <option value="under_review" className="bg-[#0B1528] text-white">Under Review</option>
                    <option value="approved" className="bg-[#0B1528] text-white">Approved</option>
                    <option value="active" className="bg-[#0B1528] text-white">Active</option>
                    <option value="suspended" className="bg-[#0B1528] text-white">Suspended</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>

                {(memberStatusFilter !== 'all' || membersSearchQuery) && (
                  <button
                    onClick={() => { setMemberStatusFilter('all'); setMembersSearchQuery(''); setMembersPage(0); }}
                    className="btn-outline flex items-center gap-1.5 px-3 py-2.5 text-sm"
                  >
                    <X size={13} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Member Table */}
            <div className="card-base overflow-hidden p-0">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Applicant Queue</h2>
                  {!loadingMembers && (
                    <span className="bg-white/5 text-white/50 text-2xs font-bold px-2 py-0.5 rounded-full border border-white/10">
                      {members.length} shown
                    </span>
                  )}
                </div>
              </div>

              {loadingMembers ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-[#00E599]" />
                  <span className="ml-3 text-sm text-white/40">Loading member registrations...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users size={32} className="text-white/60 mb-3" />
                  <p className="text-sm font-semibold text-white mb-1">No member applicants found</p>
                  <p className="text-xs text-white/40">New online registrations will appear here for review.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Applicant</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Next of Kin</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Member Number</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Registered</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {members.map(m => {
                        const cfg = MEMBER_STATUS_CONFIG[m.membershipStatus] || MEMBER_STATUS_CONFIG.pending;
                        const StatusIcon = cfg.icon;

                        return (
                          <tr key={m.id} className="hover:bg-white/5 transition-colors">
                            {/* Applicant */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                                  {m.profilePhotoUrl ? (
                                    <img src={m.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={13} className="text-[#00E599]" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-white">
                                    {[m.firstName, m.lastName].filter(Boolean).join(' ') || 'Applicant'}
                                  </p>
                                  <p className="text-2xs text-white/40">{m.occupation || 'Member'}</p>
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-white font-medium">{m.phone || '—'}</p>
                              <p className="text-2xs text-white/40">{m.email || '—'}</p>
                            </td>

                            {/* Location */}
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-white/50">{m.state || '—'}</p>
                              <p className="text-2xs text-white/40">{m.lga || ''}</p>
                            </td>

                            {/* Next of Kin */}
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-white/50 font-medium">{m.nokName || '—'}</p>
                              <p className="text-2xs text-white/40">{m.nokRelationship || ''}</p>
                            </td>

                            {/* Member Number */}
                            <td className="px-4 py-3.5">
                              {m.memberNumber ? (
                                <span className="font-mono text-xs font-bold text-[#00E599] px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                                  {m.memberNumber}
                                </span>
                              ) : (
                                <span className="text-2xs text-white/50 italic">
                                  Unassigned
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border border-current/20 ${cfg.bg} ${cfg.color}`}>
                                <StatusIcon size={12} />
                                {cfg.label}
                              </div>
                            </td>

                            {/* Registered */}
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-white/50">{formatDate(m.createdAt)}</p>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedMember(m)}
                                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white"
                                  title="View full application"
                                >
                                  <Eye size={14} />
                                </button>

                                {m.membershipStatus === 'pending' && (
                                  <button
                                    onClick={() => handleMemberStatusUpdate(m.id, 'under_review')}
                                    className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
                                    title="Mark Under Review"
                                  >
                                    Review
                                  </button>
                                )}

                                {(m.membershipStatus === 'pending' || m.membershipStatus === 'under_review') && (
                                  <button
                                    onClick={() => handleMemberStatusUpdate(m.id, 'approved', !m.memberNumber)}
                                    className="btn-primary px-2.5 py-1 text-xs font-semibold flex items-center gap-1"
                                    title="Approve and assign member number"
                                  >
                                    <Award size={12} />
                                    Approve
                                  </button>
                                )}

                                {m.membershipStatus === 'approved' && (
                                  <button
                                    onClick={() => handleMemberStatusUpdate(m.id, 'active')}
                                    className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
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
                    className={`p-4 rounded-xl border text-left transition-all hover:shadow-xs backdrop-blur-xl ${
                      statusFilter === status
                        ? `${cfg.bg} border-current ${cfg.color} shadow-xs ring-1 ring-current/20`
                        : 'bg-[#0D182E]/90 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${statusFilter === status ? cfg.color : 'text-white/40'}`}>
                      <Icon size={14} />
                      <span className="text-xs font-semibold">{cfg.label}</span>
                    </div>
                    <p className={`text-xl font-bold font-tabular ${statusFilter === status ? cfg.color : 'text-white'}`}>—</p>
                  </button>
                );
              })}
            </div>

            {/* Filters */}
            <div className="card-base">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by member name, ID, or product..."
                    value={appsSearchQuery}
                    onChange={e => { setAppsSearchQuery(e.target.value); setAppsPage(0); }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-emerald-500/50 focus:bg-[#0B1528]"
                  />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value as ApplicationStatus | 'all'); setAppsPage(0); }}
                    className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#0B1528] text-sm text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value="all" className="bg-[#0B1528] text-white">All Statuses</option>
                    {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(([s, cfg]) => (
                      <option key={s} value={s} className="bg-[#0B1528] text-white">{cfg.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={e => { setTypeFilter(e.target.value as ProductType | 'all'); setAppsPage(0); }}
                    className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#0B1528] text-sm text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value="all" className="bg-[#0B1528] text-white">All Types</option>
                    {(Object.entries(PRODUCT_TYPE_CONFIG) as [ProductType, typeof PRODUCT_TYPE_CONFIG[ProductType]][]).map(([t, cfg]) => (
                      <option key={t} value={t} className="bg-[#0B1528] text-white">{cfg.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>

                {(statusFilter !== 'all' || typeFilter !== 'all' || appsSearchQuery) && (
                  <button
                    onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setAppsSearchQuery(''); setAppsPage(0); }}
                    className="btn-outline flex items-center gap-1.5 px-3 py-2.5 text-sm"
                  >
                    <X size={13} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Applications Table */}
            <div className="card-base overflow-hidden p-0">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Product Applications</h2>
                  {!loadingApps && (
                    <span className="bg-white/5 text-white/50 text-2xs font-bold px-2 py-0.5 rounded-full border border-white/10">
                      {applications.length} shown
                    </span>
                  )}
                </div>
              </div>

              {loadingApps ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-[#00E599]" />
                  <span className="ml-3 text-sm text-white/40">Loading applications...</span>
                </div>
              ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText size={32} className="text-white/60 mb-3" />
                  <p className="text-sm font-semibold text-white mb-1">No applications found</p>
                  <p className="text-xs text-white/40">Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Applicant</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Eligibility</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Submitted</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {applications.map(app => {
                        const StatusIcon = STATUS_CONFIG[app.applicationStatus].icon;
                        const ProductIcon = PRODUCT_TYPE_CONFIG[app.productType].icon;

                        return (
                          <tr key={app.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                  <User size={12} className="text-[#00E599]" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-white">{app.memberName || 'Unknown'}</p>
                                  {app.memberNumber && (
                                    <p className="text-2xs text-white/40 font-mono">{app.memberNumber}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="text-xs font-medium text-white max-w-[140px] truncate">{app.productName}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${PRODUCT_TYPE_CONFIG[app.productType].color}`}>
                                <ProductIcon size={11} />
                                {PRODUCT_TYPE_CONFIG[app.productType].label}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs font-semibold text-white font-tabular">{formatCurrency(app.amount)}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs text-white/50">{app.durationMonths}mo</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-white/5 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-1.5 rounded-full ${app.eligibilityScore >= 70 ? 'bg-[#00E599]' : app.eligibilityScore >= 40 ? 'bg-amber-400' : 'bg-rose-500'}`}
                                    style={{ width: `${app.eligibilityScore}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-bold tabular-nums ${app.isEligible ? 'text-[#00E599]' : 'text-rose-400'}`}>
                                  {app.eligibilityScore}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border border-current/20 ${STATUS_CONFIG[app.applicationStatus].bg} ${STATUS_CONFIG[app.applicationStatus].color}`}>
                                <StatusIcon size={11} />
                                {STATUS_CONFIG[app.applicationStatus].label}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="text-xs text-white/50">{formatDate(app.submittedAt)}</p>
                              <p className="text-2xs text-white/40">{formatTime(app.submittedAt)}</p>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setSelectedApp(app)}
                                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white"
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
