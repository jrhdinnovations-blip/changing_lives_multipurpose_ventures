'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Lock,
  Eye,
  Edit2,
  RefreshCw,
  X,
  Phone,
  Mail,
  Building,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AdminMember,
  UserRole,
  fetchAllMembers,
  updateMemberRole,
  updateMemberStatus,
} from '@/lib/adminService';

const PERMISSION_MATRIX = [
  {
    capability: 'Create & Provision Member Profiles',
    super_admin: true,
    admin: true,
    manager: false,
    staff: false,
  },
  {
    capability: 'Assign & Modify System Roles',
    super_admin: true,
    admin: true,
    manager: false,
    staff: false,
  },
  {
    capability: 'Approve & Reject Loan Applications',
    super_admin: true,
    admin: true,
    manager: true,
    staff: false,
  },
  {
    capability: 'Disburse Approved Loans',
    super_admin: true,
    admin: true,
    manager: false,
    staff: false,
  },
  {
    capability: 'Review Investors Circle & Investments',
    super_admin: true,
    admin: true,
    manager: true,
    staff: false,
  },
  {
    capability: 'Record Cash / Bank Repayments',
    super_admin: true,
    admin: true,
    manager: true,
    staff: true,
  },
  {
    capability: 'Verify KYC & Identity Documents',
    super_admin: true,
    admin: true,
    manager: true,
    staff: true,
  },
  {
    capability: 'Export Financial Ledgers & Audits',
    super_admin: true,
    admin: true,
    manager: true,
    staff: false,
  },
];

export default function AdminStaffPage() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [promotedRole, setPromotedRole] = useState<UserRole>('staff');
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchAllMembers();
      setMembers(data);
    } catch {
      toast.error('Failed to load personnel roster');
    } finally {
      setLoading(false);
    }
  }

  // Filter only staff, managers, and admins
  const staffMembers = members.filter(m =>
    ['super_admin', 'admin', 'manager', 'staff'].includes(m.role)
  );

  const regularMembers = members.filter(m => m.role === 'member');

  const filteredStaff = staffMembers.filter(m => {
    const full = `${m.first_name} ${m.last_name}`.toLowerCase();
    return (
      full.includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.member_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast.error('Please select a member to promote');
      return;
    }

    setPromoting(true);
    try {
      await updateMemberRole(selectedMemberId, promotedRole, 'Administrative appointment');
      const target = members.find(m => m.id === selectedMemberId);
      toast.success(
        `Assigned ${promotedRole.toUpperCase()} role to ${target?.first_name} ${target?.last_name}`
      );
      setShowPromoteModal(false);
      setSelectedMemberId('');
      await loadData();
    } catch {
      toast.error('Failed to promote member');
    } finally {
      setPromoting(false);
    }
  };

  const handleDemote = async (member: AdminMember) => {
    if (confirm(`Are you sure you want to demote ${member.first_name} ${member.last_name} back to regular Member?`)) {
      try {
        await updateMemberRole(member.id, 'member', 'Revoked administrative privileges');
        toast.info(`${member.first_name} ${member.last_name} reverted to regular member`);
        await loadData();
      } catch {
        toast.error('Failed to update role');
      }
    }
  };

  return (
    <AppLayout role="admin" memberName="Raymond Longdiem" memberId="ADM/2026/0001">
      <div className="p-6 xl:p-8 2xl:p-10 max-w-screen-2xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <ShieldCheck size={24} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Staff & Role Administration
              </h1>
            </div>
            <p className="text-sm text-white/40 mt-1">
              Cooperative personnel governance: assign administrative roles, monitor access rights, and delegate operational responsibilities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPromoteModal(true)}
              className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2"
            >
              <UserPlus size={16} />
              <span>Promote Member to Staff</span>
            </button>
          </div>
        </div>

        {/* Roles Breakdown Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0D182E]/90 border border-purple-500/30 rounded-2xl p-4 backdrop-blur-xl shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">Super Admin</span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {staffMembers.filter(s => s.role === 'super_admin').length}
            </div>
            <p className="text-2xs text-white/40 mt-1">Full governance & core settings</p>
          </div>

          <div className="bg-[#0D182E]/90 border border-indigo-500/30 rounded-2xl p-4 backdrop-blur-xl shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300">Administrators</span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {staffMembers.filter(s => s.role === 'admin').length}
            </div>
            <p className="text-2xs text-white/40 mt-1">Approvals, loans, & provisioning</p>
          </div>

          <div className="bg-[#0D182E]/90 border border-blue-500/30 rounded-2xl p-4 backdrop-blur-xl shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300">Branch Managers</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {staffMembers.filter(s => s.role === 'manager').length}
            </div>
            <p className="text-2xs text-white/40 mt-1">Credit committee & risk audits</p>
          </div>

          <div className="bg-[#0D182E]/90 border border-emerald-500/30 rounded-2xl p-4 backdrop-blur-xl shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00E599]">Operations Staff</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] shadow-[0_0_8px_rgba(0,229,153,0.5)]" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {staffMembers.filter(s => s.role === 'staff').length}
            </div>
            <p className="text-2xs text-white/40 mt-1">Customer support & document intake</p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl shadow-xl shadow-black/20 overflow-hidden backdrop-blur-xl">
          <div className="p-4 border-b border-white/10 bg-white/5/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:border-[#00E599]/60 focus:bg-[#080E1C]"
              />
            </div>
            <span className="text-xs text-white/40">
              Total active privileged accounts: <strong className="text-white">{staffMembers.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-white/40 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Personnel</th>
                  <th className="px-5 py-3">Role & Privilege</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Assigned Department</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredStaff.map(s => {
                  const roleLabel =
                    s.role === 'super_admin'
                      ? 'Super Admin'
                      : s.role === 'admin'
                      ? 'Administrator'
                      : s.role === 'manager'
                      ? 'Branch Manager'
                      : 'Operations Staff';

                  const badgeStyle =
                    s.role === 'super_admin'
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      : s.role === 'admin'
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      : s.role === 'manager'
                      ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/15 text-[#00E599] border border-emerald-500/30';

                  return (
                    <tr key={s.id} className="hover:bg-white/5/[0.03] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-white text-sm">
                          {s.first_name} {s.last_name}
                        </div>
                        <div className="text-2xs font-mono text-white/40">
                          {s.member_number}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-md text-2xs ${badgeStyle}`}
                        >
                          <Shield size={11} />
                          {roleLabel}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="text-white/50 font-medium">{s.email}</div>
                        <div className="text-2xs text-white/40">{s.phone}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-medium text-white/50">
                          {s.occupation || 'Operations Department'}
                        </div>
                        <div className="text-2xs text-white/40">{s.state || 'Lagos'}</div>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#00E599] border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shadow-[0_0_6px_rgba(0,229,153,0.6)]" />
                          Active
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {s.role !== 'super_admin' ? (
                          <button
                            onClick={() => handleDemote(s)}
                            className="text-2xs text-rose-400 hover:text-rose-300 hover:underline font-semibold"
                          >
                            Revoke Staff Rights
                          </button>
                        ) : (
                          <span className="text-2xs text-white/50">Primary Owner</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Permissions Matrix */}
        <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/20 space-y-4 backdrop-blur-xl">
          <div>
            <h3 className="text-base font-bold text-white">System Privilege Matrix</h3>
            <p className="text-xs text-white/40">
              Security reference indicating functional boundaries and approval rights across each cooperative role tier.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 font-semibold text-white/40">
                <tr>
                  <th className="py-2.5 px-3">Operational Capability</th>
                  <th className="py-2.5 px-3 text-center">Staff</th>
                  <th className="py-2.5 px-3 text-center">Manager</th>
                  <th className="py-2.5 px-3 text-center">Admin</th>
                  <th className="py-2.5 px-3 text-center">Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {PERMISSION_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5/[0.03] transition-colors">
                    <td className="py-3 px-3 font-medium text-white/50">{row.capability}</td>
                    <td className="py-3 px-3 text-center">
                      {row.staff ? (
                        <CheckCircle2 size={16} className="inline-block text-[#00E599]" />
                      ) : (
                        <XCircle size={16} className="inline-block text-white/60" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.manager ? (
                        <CheckCircle2 size={16} className="inline-block text-[#00E599]" />
                      ) : (
                        <XCircle size={16} className="inline-block text-white/60" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.admin ? (
                        <CheckCircle2 size={16} className="inline-block text-[#00E599]" />
                      ) : (
                        <XCircle size={16} className="inline-block text-white/60" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <CheckCircle2 size={16} className="inline-block text-[#00E599]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promote Member Modal */}
        {showPromoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <div className="bg-[#0B1528] border border-white/15 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-[#00E599] border border-emerald-500/20">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Promote Member to Staff</h3>
                    <p className="text-2xs text-white/40">
                      Grant operational privileges to an existing cooperative member
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPromoteModal(false)}
                  className="text-white/40 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePromoteSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-white/50 block mb-1">
                    Select Cooperative Member
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-white/10 bg-[#080E1C] text-white focus:outline-none focus:border-[#00E599]/60"
                  >
                    <option value="" className="bg-[#0B1528] text-white">-- Choose member --</option>
                    {regularMembers.map(m => (
                      <option key={m.id} value={m.id} className="bg-[#0B1528] text-white">
                        {m.first_name} {m.last_name} ({m.member_number}) - {m.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-white/50 block mb-1">
                    Assign Administrative Role
                  </label>
                  <select
                    value={promotedRole}
                    onChange={e => setPromotedRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl border border-white/10 bg-[#080E1C] text-white font-semibold focus:outline-none focus:border-[#00E599]/60"
                  >
                    <option value="staff" className="bg-[#0B1528] text-white">Operations Staff (Document intake & receipts)</option>
                    <option value="manager" className="bg-[#0B1528] text-white">Branch Manager (Credit committee review)</option>
                    <option value="admin" className="bg-[#0B1528] text-white">Administrator (Full approvals & user creation)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowPromoteModal(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={promoting}
                    className="btn-primary text-xs px-5 py-2 font-bold"
                  >
                    {promoting ? 'Promoting...' : 'Promote Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
