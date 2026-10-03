'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Key,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Banknote,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  Copy,
  Check,
  Edit2,
  Eye,
  Lock,
  ArrowUpDown,
  RefreshCw,
  X,
  CreditCard,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AdminMember,
  UserRole,
  MembershipStatus,
  CreateUserProfileInput,
  fetchAllMembers,
  createMemberProfile,
  updateMemberRole,
  updateMemberStatus,
  updateMemberDetails,
  generateNextMemberNumber,
  generateRandomPassword,
} from '@/lib/adminService';

const NIGERIAN_STATES = [
  'Abia', 'Abuja (FCT)', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const ROLE_CONFIG: Record<UserRole, { label: string; badge: string; desc: string }> = {
  super_admin: {
    label: 'Super Admin',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    desc: 'Complete administrative privilege, system configurations, and master overrides.',
  },
  admin: {
    label: 'Administrator',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    desc: 'Can create member profiles, approve loans, manage investments, and assign operational roles.',
  },
  accountant: {
    label: 'Accountant',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    desc: 'Manages cooperative finances, bookkeeping, monthly contribution tracking, and financial reports.',
  },
  financial_secretary: {
    label: 'Financial Secretary',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    desc: 'Records all financial transactions, issues receipts, manages dues collection, and prepares statements.',
  },
  auditor: {
    label: 'Auditor',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    desc: 'Independent financial oversight, audit trail review, compliance checks, and internal controls.',
  },
  manager: {
    label: 'Branch Manager',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    desc: 'Credit risk assessment, guarantor review, loan verification, and operational reporting.',
  },
  staff: {
    label: 'Operations Staff',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    desc: 'Application intake, document receipt verification, customer service, and inquiry support.',
  },
  member: {
    label: 'Cooperative Member',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    desc: 'Standard member eligible for monthly thrift, regular savings, loans, and investments.',
  },
  borrower: {
    label: 'Borrower',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    desc: 'Customer with active loan account under credit supervision.',
  },
};

const STATUS_CONFIG: Record<MembershipStatus, { label: string; badge: string }> = {
  active: { label: 'Active', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending KYC', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  under_review: { label: 'Under Review', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  approved: { label: 'Approved', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  suspended: { label: 'Suspended', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  inactive: { label: 'Inactive', badge: 'bg-gray-100 text-gray-600 border-gray-200' },
};

function formatNGN(val: number) {
  return '₦' + (val || 0).toLocaleString('en-NG');
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'savings' | 'loans'>('newest');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showCredentialsSlip, setShowCredentialsSlip] = useState<{
    member: AdminMember;
    password?: string;
  } | null>(null);

  // Role edit form state
  const [newRoleSelection, setNewRoleSelection] = useState<UserRole>('member');
  const [roleChangeReason, setRoleChangeReason] = useState('');
  const [submittingRole, setSubmittingRole] = useState(false);

  // New user form state (simplified: admin only enters personal info + role)
  const [creating, setCreating] = useState(false);
  const [copiedPwd, setCopiedPwd] = useState(false);
  const [formData, setFormData] = useState<CreateUserProfileInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'admin',
    temporaryPassword: generateRandomPassword(),
    memberNumber: '',
  });

  // Load members on mount
  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    try {
      const data = await fetchAllMembers();
      setMembers(data);
      // Auto-populate next member ID for create form
      const nextNum = generateNextMemberNumber(data);
      setFormData(prev => ({ ...prev, memberNumber: nextNum }));
    } catch (err) {
      console.error('Error fetching members:', err);
      toast.error('Failed to load members list');
    } finally {
      setLoading(false);
    }
  }

  // Filtered & sorted members
  const filteredMembers = useMemo(() => {
    return members
      .filter(m => {
        const full = `${m.first_name} ${m.middle_name || ''} ${m.last_name}`.toLowerCase();
        const matchesQuery =
          full.includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.member_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.phone.includes(searchQuery);

        const matchesRole = roleFilter === 'all' || m.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || m.membership_status === statusFilter;

        return matchesQuery && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.last_name.localeCompare(b.last_name);
        }
        if (sortBy === 'savings') {
          return (b.total_savings || 0) - (a.total_savings || 0);
        }
        if (sortBy === 'loans') {
          return (b.active_loan_balance || 0) - (a.active_loan_balance || 0);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [members, searchQuery, roleFilter, statusFilter, sortBy]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.membership_status === 'active').length;
    const staff = members.filter(m => ['super_admin', 'admin', 'manager', 'staff'].includes(m.role)).length;
    const totalSavings = members.reduce((sum, m) => sum + (m.total_savings || 0), 0);
    const totalMonthlyCommitment = members.reduce(
      (sum, m) => sum + (m.monthly_contribution_amount || 0),
      0
    );
    const totalLoans = members.reduce((sum, m) => sum + (m.active_loan_balance || 0), 0);

    return { total, active, staff, totalSavings, totalMonthlyCommitment, totalLoans };
  }, [members]);

  const handleOpenCreate = () => {
    const nextNum = generateNextMemberNumber(members);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'admin',
      temporaryPassword: generateRandomPassword(),
      memberNumber: nextNum,
    });
    setShowCreateModal(true);
  };


  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First and Last Name are required');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('A valid email address is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setCreating(true);
    try {
      const res = await createMemberProfile(formData);
      if (res.success) {
        toast.success(`Member profile created for ${res.member.first_name} ${res.member.last_name}!`);
        setShowCreateModal(false);
        // Show credentials slip
        setShowCredentialsSlip({
          member: res.member,
          password: formData.temporaryPassword,
        });
        await loadMembers();
      } else {
        toast.error(res.error || 'Failed to create member profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while creating profile');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenRoleModal = (member: AdminMember) => {
    setSelectedMember(member);
    setNewRoleSelection(member.role);
    setRoleChangeReason('');
    setShowRoleModal(true);
  };

  const handleRoleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setSubmittingRole(true);
    try {
      await updateMemberRole(selectedMember.id, newRoleSelection, roleChangeReason);
      toast.success(
        `Role updated to ${ROLE_CONFIG[newRoleSelection].label} for ${selectedMember.first_name} ${selectedMember.last_name}`
      );
      setShowRoleModal(false);
      await loadMembers();
    } catch (err) {
      toast.error('Failed to update role');
    } finally {
      setSubmittingRole(false);
    }
  };

  const handleToggleStatus = async (member: AdminMember) => {
    const nextStatus: MembershipStatus = member.membership_status === 'active' ? 'suspended' : 'active';
    try {
      await updateMemberStatus(member.id, nextStatus);
      toast.success(
        `Account status for ${member.first_name} changed to ${STATUS_CONFIG[nextStatus].label}`
      );
      await loadMembers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <AppLayout role="admin" memberName="Raymond Longdiem" memberId="ADM/2026/0001">
      <div className="p-6 xl:p-8 2xl:p-10 max-w-screen-2xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Users size={24} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Members & User Directory
              </h1>
            </div>
            <p className="text-sm text-white/50 mt-1">
              Authoritative administration portal: provision new user profiles, assign operational roles, and manage cooperative thrift accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadMembers}
              className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5"
              title="Refresh roster"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            <button
              onClick={handleOpenCreate}
              className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2 shadow-sm shadow-primary/20"
            >
              <UserPlus size={16} />
              <span>Create New User Profile</span>
            </button>
          </div>
        </div>

        {/* Operational KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0d1527] border border-white/10/60 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">Total Registered Users</span>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Users size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">{stats.total}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>{stats.active} Active Members</span>
            </div>
          </div>

          <div className="bg-[#0d1527] border border-white/10/60 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">Monthly Thrift Commitment</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Calendar size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {formatNGN(stats.totalMonthlyCommitment)}
            </div>
            <div className="mt-1 text-xs text-white/50">Monthly expected dues pool</div>
          </div>

          <div className="bg-[#0d1527] border border-white/10/60 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">Total Savings Vault</span>
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Banknote size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {formatNGN(stats.totalSavings)}
            </div>
            <div className="mt-1 text-xs text-white/50">Combined voluntary & thrift</div>
          </div>

          <div className="bg-[#0d1527] border border-white/10/60 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">Staff & Admin Officers</span>
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Shield size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">{stats.staff}</div>
            <div className="mt-1 text-xs text-white/50">Privileged system access</div>
          </div>
        </div>

        {/* Search, Filters & Controls */}
        <div className="bg-[#0d1527] border border-white/10/60 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                type="text"
                placeholder="Search by name, email, phone, or member ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {/* Sort & Quick Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <ArrowUpDown size={14} />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-background border border-input rounded-lg px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="newest">Recently Joined</option>
                  <option value="name">Full Name (A–Z)</option>
                  <option value="savings">Highest Savings</option>
                  <option value="loans">Highest Loan Balance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10/40">
            {/* Roles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-white/50 mr-1">Role:</span>
              {[
                { id: 'all', label: 'All Roles' },
                { id: 'member', label: 'Members' },
                { id: 'staff', label: 'Staff' },
                { id: 'manager', label: 'Managers' },
                { id: 'admin', label: 'Admins' },
                { id: 'super_admin', label: 'Super Admins' },
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoleFilter(r.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    roleFilter === r.id
                      ? 'bg-emerald-500 text-emerald-400-foreground font-semibold shadow-xs'
                      : 'bg-white/[0.06]/60 text-white/50 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-white/50 mr-1">Status:</span>
              {[
                { id: 'all', label: 'All Status' },
                { id: 'active', label: 'Active' },
                { id: 'pending', label: 'Pending KYC' },
                { id: 'suspended', label: 'Suspended' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    statusFilter === s.id
                      ? 'bg-white/[0.04] text-emerald-400 font-semibold border border-primary/20'
                      : 'bg-white/[0.06]/60 text-white/50 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Member Table */}
        <div className="bg-[#0d1527] border border-white/10/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.06]/50 border-b border-white/10 text-xs font-semibold text-white/50 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Member & Account</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">System Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Monthly Dues</th>
                  <th className="px-5 py-3.5 text-right">Savings Vault</th>
                  <th className="px-5 py-3.5 text-right">Active Loan</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-white/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-emerald-400" />
                        <span>Loading members directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-white/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users size={32} className="text-white/50/50" />
                        <span className="font-semibold text-white">No members found</span>
                        <p className="text-xs">
                          {searchQuery
                            ? `No records matching "${searchQuery}"`
                            : 'No members registered under current filters.'}
                        </p>
                        <button
                          onClick={handleOpenCreate}
                          className="btn-primary text-xs mt-2 px-3 py-1.5"
                        >
                          Create First Member
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map(m => {
                    const initials = `${m.first_name[0] || ''}${m.last_name[0] || ''}`.toUpperCase();
                    const roleCfg = ROLE_CONFIG[m.role] || ROLE_CONFIG.member;
                    const statusCfg = STATUS_CONFIG[m.membership_status] || STATUS_CONFIG.active;

                    return (
                      <tr key={m.id} className="hover:bg-white/[0.06]/20 transition-colors">
                        {/* Member & Account */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>
                                  {m.first_name} {m.middle_name ? `${m.middle_name} ` : ''}
                                  {m.last_name}
                                </span>
                              </div>
                              <div className="text-2xs font-mono font-medium text-emerald-400/80 bg-emerald-500/5 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                {m.member_number}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Details */}
                        <td className="px-5 py-4">
                          <div className="text-xs text-white font-medium">{m.email}</div>
                          <div className="text-2xs text-white/50 flex items-center gap-1 mt-0.5">
                            <Phone size={11} />
                            <span>{m.phone}</span>
                            {m.state && (
                              <>
                                <span>·</span>
                                <span>{m.state}</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-1 rounded-lg border ${roleCfg.badge}`}
                          >
                            <Shield size={11} />
                            {roleCfg.label}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.badge}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                m.membership_status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Monthly Dues */}
                        <td className="px-5 py-4 text-right font-medium text-white">
                          {formatNGN(m.monthly_contribution_amount)}
                        </td>

                        {/* Savings Vault */}
                        <td className="px-5 py-4 text-right">
                          <div className="font-semibold text-white">
                            {formatNGN(m.total_savings)}
                          </div>
                          <div className="text-2xs text-white/50">
                            Contrib: {formatNGN(m.total_contributions)}
                          </div>
                        </td>

                        {/* Active Loan */}
                        <td className="px-5 py-4 text-right">
                          <div
                            className={`font-semibold ${
                              m.active_loan_balance > 0 ? 'text-amber-600' : 'text-white/50'
                            }`}
                          >
                            {m.active_loan_balance > 0 ? formatNGN(m.active_loan_balance) : '—'}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Profile Dossier */}
                            <button
                              onClick={() => {
                                setSelectedMember(m);
                                setShowDetailsDrawer(true);
                              }}
                              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
                              title="View Full Profile Dossier"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Change Role Button */}
                            <button
                              onClick={() => handleOpenRoleModal(m)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Assign / Change Role"
                            >
                              <Shield size={16} />
                            </button>

                            {/* Toggle Status (Active/Suspend) */}
                            <button
                              onClick={() => handleToggleStatus(m)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                m.membership_status === 'active'
                                  ? 'text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={
                                m.membership_status === 'active'
                                  ? 'Suspend Account'
                                  : 'Activate Account'
                              }
                            >
                              {m.membership_status === 'active' ? (
                                <XCircle size={16} />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-white/[0.06]/20 border-t border-white/10/60 text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Showing <strong className="text-white">{filteredMembers.length}</strong> of{' '}
              <strong className="text-white">{members.length}</strong> total registered accounts
            </span>
            <span className="text-2xs">
              Direct Admin Access · Role changes are logged for security & audit trails
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL 1: ADD NEW MEMBER — ADMIN PROVISION FORM              */}
        {/* ============================================================ */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#0d1527] border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Add New Member</h2>
                    <p className="text-xs text-white/40 mt-0.5">
                      Enter basic info &amp; assign role · Member completes their profile on first login
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateSubmit}>
                <div className="p-6 space-y-5">

                  {/* Info Banner */}
                  <div className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5">
                    <AlertCircle size={15} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300 leading-relaxed">
                      Only fill in the member&apos;s personal info and assign their role. All other details
                      (address, next of kin, KYC documents, monthly contribution) will be completed
                      by the member in their own dashboard.
                    </p>
                  </div>

                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">
                        First Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="e.g. Olumide"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">
                        Last Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Balogun"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                      <span className="ml-1 text-white/30 font-normal">(will be used to log in)</span>
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="email"
                        required
                        placeholder="member@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">
                      Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="tel"
                        required
                        placeholder="+234 803 000 0000"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-2">
                      Assign Role <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['admin', 'accountant', 'financial_secretary', 'auditor'] as UserRole[]).map(r => {
                        const cfg = ROLE_CONFIG[r];
                        const isSelected = formData.role === r;
                        const icons: Record<string, React.ReactNode> = {
                          admin: <Shield size={15} className={isSelected ? 'text-emerald-400' : 'text-white/30'} />,
                          accountant: <Banknote size={15} className={isSelected ? 'text-emerald-400' : 'text-white/30'} />,
                          financial_secretary: <CreditCard size={15} className={isSelected ? 'text-emerald-400' : 'text-white/30'} />,
                          auditor: <Eye size={15} className={isSelected ? 'text-emerald-400' : 'text-white/30'} />,
                        };
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setFormData({ ...formData, role: r })}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                            }`}
                          >
                            <div className={`mt-0.5 p-1.5 rounded-lg ${isSelected ? 'bg-emerald-500/15' : 'bg-white/[0.06]'}`}>
                              {icons[r]}
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>
                                {cfg.label}
                              </p>
                              <p className="text-2xs text-white/35 mt-0.5 line-clamp-2 leading-relaxed">
                                {cfg.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Temporary Password */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                        <Key size={13} className="text-amber-400" />
                        Temporary Password
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, temporaryPassword: generateRandomPassword() });
                            toast.info('New password generated');
                          }}
                          className="text-2xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw size={11} /> Regenerate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.temporaryPassword || '');
                            setCopiedPwd(true);
                            toast.success('Password copied');
                            setTimeout(() => setCopiedPwd(false), 2000);
                          }}
                          className="text-2xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                        >
                          {copiedPwd ? <Check size={11} /> : <Copy size={11} />}
                          {copiedPwd ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <p className="font-mono text-sm text-amber-300 font-bold tracking-wider">
                      {formData.temporaryPassword}
                    </p>
                    <p className="text-2xs text-white/30 mt-1.5">
                      Share this with the member · They&apos;ll be prompted to change it on first login
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/25 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {creating ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Creating Account…</span>
                      </>
                    ) : (
                      <>
                        <UserCheck size={14} />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ============================================================ */}
        {/* MODAL 2: CREDENTIALS SLIP — SHARE WITH NEW MEMBER           */}
        {/* ========================================================================= */}
        {showCredentialsSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-[#0d1527] border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 size={26} />
                </div>
                <h3 className="text-lg font-bold text-white mt-2">
                  Member Profile Provisioned Successfully
                </h3>
                <p className="text-xs text-white/50">
                  Give these initial credentials to the member. They must log in and
                    complete their profile to activate their account.
                </p>
              </div>

              {/* Printable Card */}
              <div className="bg-white/[0.06]/40 border border-white/10/80 rounded-2xl p-4 space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-white/10/40 pb-2">
                  <span className="font-bold text-white">CLIMPS Cooperative Society</span>
                  <span className="text-2xs font-mono font-bold text-emerald-400">
                    {showCredentialsSlip.member.member_number}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-2xs text-white/50 block">Full Name</span>
                    <span className="font-semibold text-white">
                      {showCredentialsSlip.member.first_name} {showCredentialsSlip.member.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs text-white/50 block">Assigned Role</span>
                    <span className="font-semibold text-white">
                      {ROLE_CONFIG[showCredentialsSlip.member.role]?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs text-white/50 block">Sign-In Email</span>
                    <span className="font-semibold text-white break-all">
                      {showCredentialsSlip.member.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs text-white/50 block">Temporary Password</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {showCredentialsSlip.password || '••••••••'}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs text-white/50 block">Account Status</span>
                    <span className="font-semibold text-amber-400">Pending — profile completion required</span>
                  </div>
                  <div>
                    <span className="text-2xs text-white/50 block">Portal URL</span>
                    <span className="font-mono text-2xs text-white">climps.org/login</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `CLIMPS Member Credentials:\nName: ${showCredentialsSlip.member.first_name} ${showCredentialsSlip.member.last_name}\nMember ID: ${showCredentialsSlip.member.member_number}\nEmail: ${showCredentialsSlip.member.email}\nPassword: ${showCredentialsSlip.password}\nLogin at: https://climps.org/login`;
                    copyToClipboard(text, 'Credentials slip');
                  }}
                  className="btn-outline text-xs flex-1 py-2.5 flex items-center justify-center gap-1.5"
                >
                  <Copy size={14} />
                  <span>Copy Credentials</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary text-xs px-3 py-2.5 flex items-center justify-center gap-1"
                  title="Print Slip"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCredentialsSlip(null)}
                  className="btn-primary text-xs px-5 py-2.5 font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: ASSIGN / CHANGE USER ROLE */}
        {/* ========================================================================= */}
        {showRoleModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-[#0d1527] border border-white/10 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Assign System Role</h3>
                    <p className="text-2xs text-white/50">
                      {selectedMember.first_name} {selectedMember.last_name} (
                      {selectedMember.member_number})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-white/50 hover:text-white p-1.5 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRoleChangeSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white block mb-2">
                    Select New Role & Permission Tier
                  </label>
                  <div className="space-y-2">
                    {(['member', 'staff', 'manager', 'accountant', 'financial_secretary', 'auditor', 'admin'] as UserRole[]).map(r => {
                      const cfg = ROLE_CONFIG[r];
                      const isSelected = newRoleSelection === r;
                      return (
                        <div
                          key={r}
                          onClick={() => setNewRoleSelection(r)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-emerald-500/5 ring-1 ring-primary'
                              : 'border-white/10 bg-background hover:bg-white/[0.06]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{cfg.label}</span>
                            {isSelected && <CheckCircle2 size={15} className="text-emerald-400" />}
                          </div>
                          <p className="text-2xs text-white/50 mt-0.5">{cfg.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white block mb-1">
                    Administrative Reason / Change Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Promoted to Credit Risk Officer per Board resolution"
                    value={roleChangeReason}
                    onChange={e => setRoleChangeReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10/40">
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRole}
                    className="btn-primary text-xs px-5 py-2 font-bold"
                  >
                    {submittingRole ? 'Saving...' : 'Update Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DRAWER / MODAL 4: MEMBER PROFILE DOSSIER */}
        {/* ========================================================================= */}
        {showDetailsDrawer && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
            <div className="bg-[#0d1527] border-l border-white/10 w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/10/60 flex items-center justify-between bg-white/[0.06]/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center">
                    {selectedMember.first_name[0]}
                    {selectedMember.last_name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {selectedMember.first_name} {selectedMember.middle_name || ''}{' '}
                      {selectedMember.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-2xs font-mono font-semibold text-emerald-400">
                        {selectedMember.member_number}
                      </span>
                      <span>·</span>
                      <span
                        className={`text-2xs px-2 py-0.5 rounded-md font-semibold border ${
                          STATUS_CONFIG[selectedMember.membership_status].badge
                        }`}
                      >
                        {STATUS_CONFIG[selectedMember.membership_status].label}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsDrawer(false)}
                  className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/[0.06]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.06]/30 border border-white/10/60 rounded-2xl p-3">
                    <span className="text-2xs text-white/50 block">Monthly Thrift Commitment</span>
                    <span className="text-base font-bold text-white">
                      {formatNGN(selectedMember.monthly_contribution_amount)}
                    </span>
                  </div>
                  <div className="bg-white/[0.06]/30 border border-white/10/60 rounded-2xl p-3">
                    <span className="text-2xs text-white/50 block">Total Savings Vault</span>
                    <span className="text-base font-bold text-white">
                      {formatNGN(selectedMember.total_savings)}
                    </span>
                  </div>
                  <div className="bg-white/[0.06]/30 border border-white/10/60 rounded-2xl p-3">
                    <span className="text-2xs text-white/50 block">Active Loan Balance</span>
                    <span
                      className={`text-base font-bold ${
                        selectedMember.active_loan_balance > 0
                          ? 'text-amber-600'
                          : 'text-white/50'
                      }`}
                    >
                      {selectedMember.active_loan_balance > 0
                        ? formatNGN(selectedMember.active_loan_balance)
                        : '₦0 (No Debt)'}
                    </span>
                  </div>
                  <div className="bg-white/[0.06]/30 border border-white/10/60 rounded-2xl p-3">
                    <span className="text-2xs text-white/50 block">Investment Portfolio</span>
                    <span className="text-base font-bold text-white">
                      {formatNGN(selectedMember.investment_portfolio_value)}
                    </span>
                  </div>
                </div>

                {/* Contact & Residential Information */}
                <div className="bg-[#0d1527] border border-white/10/60 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/10/40 pb-2">
                    <Phone size={14} className="text-emerald-400" />
                    Contact & Residential
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-2xs text-white/50 block">Email</span>
                      <span className="font-medium text-white">{selectedMember.email}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/50 block">Phone</span>
                      <span className="font-medium text-white">{selectedMember.phone}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/50 block">State of Residence</span>
                      <span className="font-medium text-white">{selectedMember.state || '—'}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/50 block">LGA</span>
                      <span className="font-medium text-white">{selectedMember.lga || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-2xs text-white/50 block">Address</span>
                      <span className="font-medium text-white">
                        {selectedMember.address || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Occupation & Next of Kin */}
                <div className="bg-[#0d1527] border border-white/10/60 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/10/40 pb-2">
                    <Briefcase size={14} className="text-emerald-400" />
                    Employment & Next of Kin
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-2xs text-white/50 block">Occupation</span>
                      <span className="font-medium text-white">
                        {selectedMember.occupation || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/50 block">Employer</span>
                      <span className="font-medium text-white">
                        {selectedMember.employer || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/50 block">Next of Kin Name</span>
                      <span className="font-medium text-white">
                        {selectedMember.nok_name || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/50 block">Relationship</span>
                      <span className="font-medium text-white">
                        {selectedMember.nok_relationship || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/50 block">Next of Kin Phone</span>
                      <span className="font-medium text-white">
                        {selectedMember.nok_phone || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/50 block">ID Document</span>
                      <span className="font-mono text-2xs text-white">
                        {selectedMember.id_type}: {selectedMember.id_number || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-white/10/60 bg-white/[0.06]/20 flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowDetailsDrawer(false);
                    handleOpenRoleModal(selectedMember);
                  }}
                  className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5"
                >
                  <Shield size={14} />
                  <span>Change Role</span>
                </button>

                <button
                  onClick={() => {
                    handleToggleStatus(selectedMember);
                    setShowDetailsDrawer(false);
                  }}
                  className={`text-xs px-4 py-2 rounded-xl font-semibold transition-colors ${
                    selectedMember.membership_status === 'active'
                      ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {selectedMember.membership_status === 'active'
                    ? 'Suspend Account'
                    : 'Activate Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
