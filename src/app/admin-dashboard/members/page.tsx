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
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    desc: 'Complete administrative privilege, system configurations, and master overrides.',
  },
  admin: {
    label: 'Administrator',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    desc: 'Can create member profiles, approve loans, manage investments, and assign operational roles.',
  },
  accountant: {
    label: 'Accountant',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    desc: 'Manages cooperative finances, bookkeeping, monthly contribution tracking, and financial reports.',
  },
  financial_secretary: {
    label: 'Financial Secretary',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    desc: 'Records all financial transactions, issues receipts, manages dues collection, and prepares statements.',
  },
  auditor: {
    label: 'Auditor',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    desc: 'Independent financial oversight, audit trail review, compliance checks, and internal controls.',
  },
  manager: {
    label: 'Branch Manager',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    desc: 'Credit risk assessment, guarantor review, loan verification, and operational reporting.',
  },
  staff: {
    label: 'Operations Staff',
    badge: 'bg-emerald-500/15 text-[#00E599] border-emerald-500/30',
    desc: 'Application intake, document receipt verification, customer service, and inquiry support.',
  },
  member: {
    label: 'Cooperative Member',
    badge: 'bg-white/10 text-white/50 border-white/15',
    desc: 'Standard member eligible for monthly thrift, regular savings, loans, and investments.',
  },
  borrower: {
    label: 'Borrower',
    badge: 'bg-[#00E599]/15 text-amber-300 border-amber-500/30',
    desc: 'Customer with active loan account under credit supervision.',
  },
};

const STATUS_CONFIG: Record<MembershipStatus, { label: string; badge: string }> = {
  active: { label: 'Active', badge: 'bg-emerald-500/15 text-[#00E599] border-emerald-500/30' },
  pending: { label: 'Pending KYC', badge: 'bg-[#00E599]/15 text-amber-300 border-amber-500/30' },
  under_review: { label: 'Under Review', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  approved: { label: 'Approved', badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  suspended: { label: 'Suspended', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  inactive: { label: 'Inactive', badge: 'bg-white/5 text-white/40 border-white/10' },
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/15 text-[#00E599] border border-emerald-500/30">
                <Users size={24} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Members & User Directory
              </h1>
            </div>
            <p className="text-sm text-white/40 mt-1 font-medium">
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
              className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2 shadow-xs"
            >
              <UserPlus size={16} />
              <span>Create New User Profile</span>
            </button>
          </div>
        </div>

        {/* Operational KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/40">Total Registered Users</span>
              <span className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <Users size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">{stats.total}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-white/40 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00E599] shadow-[0_0_8px_rgba(0,229,153,0.6)]" />
              <span>{stats.active} Active Members</span>
            </div>
          </div>

          <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/40">Monthly Thrift Commitment</span>
              <span className="p-2 rounded-xl bg-emerald-500/15 text-[#00E599] border border-emerald-500/30">
                <Calendar size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {formatNGN(stats.totalMonthlyCommitment)}
            </div>
            <div className="mt-1 text-xs text-white/40 font-medium">Monthly expected dues pool</div>
          </div>

          <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/40">Total Savings Vault</span>
              <span className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Banknote size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {formatNGN(stats.totalSavings)}
            </div>
            <div className="mt-1 text-xs text-white/40 font-medium">Combined voluntary & thrift</div>
          </div>

          <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/40">Staff & Admin Officers</span>
              <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Shield size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">{stats.staff}</div>
            <div className="mt-1 text-xs text-white/40 font-medium">Privileged system access</div>
          </div>
        </div>

        {/* Search, Filters & Controls */}
        <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-lg shadow-black/20 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search by name, email, phone, or member ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:border-emerald-500/50 focus:bg-[#0B1528] transition-colors"
              />
            </div>

            {/* Sort & Quick Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                <ArrowUpDown size={14} />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="newest" className="bg-[#0B1528] text-white">Recently Joined</option>
                  <option value="name" className="bg-[#0B1528] text-white">Full Name (A–Z)</option>
                  <option value="savings" className="bg-[#0B1528] text-white">Highest Savings</option>
                  <option value="loans" className="bg-[#0B1528] text-white">Highest Loan Balance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            {/* Roles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-white/40 mr-1">Role:</span>
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
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    roleFilter === r.id
                      ? 'bg-emerald-500/20 text-[#00E599] border border-emerald-500/40 shadow-[0_0_10px_rgba(0,229,153,0.15)]'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-white/40 mr-1">Status:</span>
              {[
                { id: 'all', label: 'All Status' },
                { id: 'active', label: 'Active' },
                { id: 'pending', label: 'Pending KYC' },
                { id: 'suspended', label: 'Suspended' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === s.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Member Table */}
        <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl shadow-xl shadow-black/20 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-xs font-bold text-white/40 uppercase tracking-wider">
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
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-white/40">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-[#00E599]" />
                        <span className="font-medium">Loading members directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-white/40">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users size={32} className="text-white/60" />
                        <span className="font-bold text-white">No members found</span>
                        <p className="text-xs text-white/40">
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
                      <tr key={m.id} className="hover:bg-white/5 transition-colors">
                        {/* Member & Account */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/30">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>
                                  {m.first_name} {m.middle_name ? `${m.middle_name} ` : ''}
                                  {m.last_name}
                                </span>
                              </div>
                              <div className="text-2xs font-mono font-bold text-[#00E599] bg-emerald-500/15 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-emerald-500/30">
                                {m.member_number}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Details */}
                        <td className="px-5 py-4">
                          <div className="text-xs text-white font-semibold">{m.email}</div>
                          <div className="text-2xs text-white/40 flex items-center gap-1 mt-0.5">
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
                            className={`inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-1 rounded-full border ${statusCfg.badge}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                m.membership_status === 'active' ? 'bg-[#00E599]' : 'bg-amber-400'
                              }`}
                            />
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Monthly Dues */}
                        <td className="px-5 py-4 text-right font-bold text-white font-tabular">
                          {formatNGN(m.monthly_contribution_amount)}
                        </td>

                        {/* Savings Vault */}
                        <td className="px-5 py-4 text-right">
                          <div className="font-bold text-white font-tabular">
                            {formatNGN(m.total_savings)}
                          </div>
                          <div className="text-2xs text-white/40 font-medium font-tabular">
                            Contrib: {formatNGN(m.total_contributions)}
                          </div>
                        </td>

                        {/* Active Loan */}
                        <td className="px-5 py-4 text-right">
                          <div
                            className={`font-bold font-tabular ${
                              m.active_loan_balance > 0 ? 'text-amber-400' : 'text-white/50'
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
                              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                              title="View Full Profile Dossier"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Change Role Button */}
                            <button
                              onClick={() => handleOpenRoleModal(m)}
                              className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/15 hover:text-indigo-300 transition-colors"
                              title="Assign / Change Role"
                            >
                              <Shield size={16} />
                            </button>

                            {/* Toggle Status (Active/Suspend) */}
                            <button
                              onClick={() => handleToggleStatus(m)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                m.membership_status === 'active'
                                  ? 'text-rose-400 hover:bg-rose-500/15'
                                  : 'text-[#00E599] hover:bg-emerald-500/15'
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

          <div className="p-4 bg-white/5 border-t border-white/10 text-xs text-white/40 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Showing <strong className="text-white font-bold">{filteredMembers.length}</strong> of{' '}
              <strong className="text-white font-bold">{members.length}</strong> total registered accounts
            </span>
            <span className="text-2xs font-medium text-white/50">
              Direct Admin Access · Role changes are logged for security & audit trails
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL 1: ADD NEW MEMBER — ADMIN PROVISION FORM              */}
        {/* ============================================================ */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <div className="bg-[#0B1528] border border-white/15 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#00E599]">
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
                  className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
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
                    <p className="text-xs text-blue-300 leading-relaxed font-medium">
                      Only fill in the member&apos;s personal info and assign their role. All other details
                      (address, next of kin, KYC documents, monthly contribution) will be completed
                      by the member in their own dashboard.
                    </p>
                  </div>

                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-white/50 mb-1.5">
                        First Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="e.g. Olumide"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/60 focus:bg-[#080E1C] transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/50 mb-1.5">
                        Last Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Balogun"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/60 focus:bg-[#080E1C] transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-white/50 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                      <span className="ml-1 text-white/40 font-normal">(will be used to log in)</span>
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        required
                        placeholder="member@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/60 focus:bg-[#080E1C] transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-white/50 mb-1.5">
                      Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="tel"
                        required
                        placeholder="+234 803 000 0000"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/60 focus:bg-[#080E1C] transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-xs font-bold text-white/50 mb-2">
                      Assign Role <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['admin', 'accountant', 'financial_secretary', 'auditor'] as UserRole[]).map(r => {
                        const cfg = ROLE_CONFIG[r];
                        const isSelected = formData.role === r;
                        const icons: Record<string, React.ReactNode> = {
                          admin: <Shield size={15} className={isSelected ? 'text-[#00E599]' : 'text-white/40'} />,
                          accountant: <Banknote size={15} className={isSelected ? 'text-[#00E599]' : 'text-white/40'} />,
                          financial_secretary: <CreditCard size={15} className={isSelected ? 'text-[#00E599]' : 'text-white/40'} />,
                          auditor: <Eye size={15} className={isSelected ? 'text-[#00E599]' : 'text-white/40'} />,
                        };
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setFormData({ ...formData, role: r })}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'border-[#00E599]/60 bg-emerald-500/15 ring-1 ring-[#00E599]/30 text-white'
                                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/50'
                            }`}
                          >
                            <div className={`mt-0.5 p-1.5 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-[#00E599]' : 'bg-white/10 text-white/40'}`}>
                              {icons[r]}
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${isSelected ? 'text-[#00E599]' : 'text-white'}`}>
                                {cfg.label}
                              </p>
                              <p className="text-2xs text-white/40 mt-0.5 line-clamp-2 leading-relaxed">
                                {cfg.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Temporary Password */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-white/50 flex items-center gap-1.5">
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
                          className="text-2xs text-white/40 hover:text-white flex items-center gap-1 transition-colors font-medium"
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
                          className="text-2xs text-[#00E599] hover:text-emerald-300 flex items-center gap-1 transition-colors font-bold"
                        >
                          {copiedPwd ? <Check size={11} /> : <Copy size={11} />}
                          {copiedPwd ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <p className="font-mono text-sm text-amber-400 font-bold tracking-wider">
                      {formData.temporaryPassword}
                    </p>
                    <p className="text-2xs text-white/40 mt-1.5 font-medium">
                      Share this with the member · They&apos;ll be prompted to change it on first login
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary flex items-center gap-2 px-6 py-2.5 text-xs font-bold active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <div className="bg-[#0B1528] border border-white/15 rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#00E599] mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 size={26} />
                </div>
                <h3 className="text-lg font-bold text-white mt-2">
                  Member Profile Provisioned Successfully
                </h3>
                <p className="text-xs text-white/40 font-medium">
                  Give these initial credentials to the member. They must log in and
                    complete their profile to activate their account.
                </p>
              </div>

              {/* Printable Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-white">CLIMPS Cooperative Society</span>
                  <span className="text-2xs font-mono font-bold text-[#00E599] bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    {showCredentialsSlip.member.member_number}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-2xs text-white/40 font-medium block">Full Name</span>
                    <span className="font-bold text-white">
                      {showCredentialsSlip.member.first_name} {showCredentialsSlip.member.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs text-white/40 font-medium block">Assigned Role</span>
                    <span className="font-bold text-white">
                      {ROLE_CONFIG[showCredentialsSlip.member.role]?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs text-white/40 font-medium block">Sign-In Email</span>
                    <span className="font-semibold text-white/50 break-all">
                      {showCredentialsSlip.member.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs text-white/40 font-medium block">Temporary Password</span>
                    <span className="font-mono font-bold text-[#00E599]">
                      {showCredentialsSlip.password || '••••••••'}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs text-white/40 font-medium block">Account Status</span>
                    <span className="font-semibold text-amber-400">Pending — profile completion required</span>
                  </div>
                  <div>
                    <span className="text-2xs text-white/40 font-medium block">Portal URL</span>
                    <span className="font-mono text-2xs text-white/50 font-bold">climps.org/login</span>
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
                  className="btn-outline text-xs px-3 py-2.5 flex items-center justify-center gap-1"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <div className="bg-[#0B1528] border border-white/15 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Assign System Role</h3>
                    <p className="text-2xs text-white/40 font-medium">
                      {selectedMember.first_name} {selectedMember.last_name} (
                      {selectedMember.member_number})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRoleChangeSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/50 block mb-2">
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
                              ? 'border-indigo-500/60 bg-indigo-500/15 ring-1 ring-indigo-500/30'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{cfg.label}</span>
                            {isSelected && <CheckCircle2 size={15} className="text-indigo-400" />}
                          </div>
                          <p className="text-2xs text-white/40 mt-0.5 font-medium">{cfg.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/50 block mb-1">
                    Administrative Reason / Change Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Promoted to Credit Risk Officer per Board resolution"
                    value={roleChangeReason}
                    onChange={e => setRoleChangeReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:border-indigo-500/60 focus:bg-[#080E1C] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="text-xs px-4 py-2 font-semibold text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-md">
            <div className="bg-[#0B1528] border-l border-white/10 w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-[#00E599] font-bold text-sm flex items-center justify-center border border-emerald-500/30">
                    {selectedMember.first_name[0]}
                    {selectedMember.last_name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {selectedMember.first_name} {selectedMember.middle_name || ''}{' '}
                      {selectedMember.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-2xs font-mono font-bold text-[#00E599]">
                        {selectedMember.member_number}
                      </span>
                      <span className="text-white/50">·</span>
                      <span
                        className={`text-2xs px-2 py-0.5 rounded-md font-bold border ${
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
                  className="p-2 text-white/40 hover:text-white rounded-full hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs bg-[#080E1C]">
                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0D182E] border border-white/10 rounded-2xl p-3">
                    <span className="text-2xs text-white/40 font-medium block">Monthly Thrift Commitment</span>
                    <span className="text-base font-bold text-white font-tabular">
                      {formatNGN(selectedMember.monthly_contribution_amount)}
                    </span>
                  </div>
                  <div className="bg-[#0D182E] border border-white/10 rounded-2xl p-3">
                    <span className="text-2xs text-white/40 font-medium block">Total Savings Vault</span>
                    <span className="text-base font-bold text-white font-tabular">
                      {formatNGN(selectedMember.total_savings)}
                    </span>
                  </div>
                  <div className="bg-[#0D182E] border border-white/10 rounded-2xl p-3">
                    <span className="text-2xs text-white/40 font-medium block">Active Loan Balance</span>
                    <span
                      className={`text-base font-bold font-tabular ${
                        selectedMember.active_loan_balance > 0
                          ? 'text-amber-400'
                          : 'text-white/50'
                      }`}
                    >
                      {selectedMember.active_loan_balance > 0
                        ? formatNGN(selectedMember.active_loan_balance)
                        : '₦0 (No Debt)'}
                    </span>
                  </div>
                  <div className="bg-[#0D182E] border border-white/10 rounded-2xl p-3">
                    <span className="text-2xs text-white/40 font-medium block">Investment Portfolio</span>
                    <span className="text-base font-bold text-white font-tabular">
                      {formatNGN(selectedMember.investment_portfolio_value)}
                    </span>
                  </div>
                </div>

                {/* Contact & Residential Information */}
                <div className="bg-[#0D182E] border border-white/10 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <Phone size={14} className="text-[#00E599]" />
                    Contact & Residential
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-2xs text-white/40 font-medium block">Email</span>
                      <span className="font-semibold text-white">{selectedMember.email}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/40 font-medium block">Phone</span>
                      <span className="font-semibold text-white">{selectedMember.phone}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/40 font-medium block">State of Residence</span>
                      <span className="font-semibold text-white">{selectedMember.state || '—'}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/40 font-medium block">LGA</span>
                      <span className="font-semibold text-white">{selectedMember.lga || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-2xs text-white/40 font-medium block">Address</span>
                      <span className="font-semibold text-white">
                        {selectedMember.address || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Occupation & Next of Kin */}
                <div className="bg-[#0D182E] border border-white/10 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <Briefcase size={14} className="text-[#00E599]" />
                    Employment & Next of Kin
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-2xs text-white/40 font-medium block">Occupation</span>
                      <span className="font-semibold text-white">
                        {selectedMember.occupation || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/40 font-medium block">Employer</span>
                      <span className="font-semibold text-white">
                        {selectedMember.employer || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/40 font-medium block">Next of Kin Name</span>
                      <span className="font-semibold text-white">
                        {selectedMember.nok_name || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/40 font-medium block">Relationship</span>
                      <span className="font-semibold text-white">
                        {selectedMember.nok_relationship || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/40 font-medium block">Next of Kin Phone</span>
                      <span className="font-semibold text-white">
                        {selectedMember.nok_phone || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-white/40 font-medium block">ID Document</span>
                      <span className="font-mono text-2xs font-semibold text-white/50">
                        {selectedMember.id_type}: {selectedMember.id_number || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
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
                  className={`text-xs px-4 py-2 rounded-xl font-bold transition-colors border ${
                    selectedMember.membership_status === 'active'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                      : 'bg-emerald-500/15 text-[#00E599] border-emerald-500/30 hover:bg-emerald-500/25'
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
