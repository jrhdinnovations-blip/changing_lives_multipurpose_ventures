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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <ShieldCheck size={24} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Staff & Role Administration
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
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
          <div className="bg-white border border-purple-200 rounded-2xl p-4 bg-gradient-to-b from-purple-50/50 to-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">Super Admin</span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {staffMembers.filter(s => s.role === 'super_admin').length}
            </div>
            <p className="text-2xs text-slate-500 mt-1">Full governance & core settings</p>
          </div>

          <div className="bg-white border border-indigo-200 rounded-2xl p-4 bg-gradient-to-b from-indigo-50/50 to-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">Administrators</span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {staffMembers.filter(s => s.role === 'admin').length}
            </div>
            <p className="text-2xs text-slate-500 mt-1">Approvals, loans, & provisioning</p>
          </div>

          <div className="bg-white border border-blue-200 rounded-2xl p-4 bg-gradient-to-b from-blue-50/50 to-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">Branch Managers</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {staffMembers.filter(s => s.role === 'manager').length}
            </div>
            <p className="text-2xs text-slate-500 mt-1">Credit committee & risk audits</p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-2xl p-4 bg-gradient-to-b from-emerald-50/50 to-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">Operations Staff</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {staffMembers.filter(s => s.role === 'staff').length}
            </div>
            <p className="text-2xs text-slate-500 mt-1">Customer support & document intake</p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-slate-500">
              Total active privileged accounts: <strong className="text-slate-800">{staffMembers.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Personnel</th>
                  <th className="px-5 py-3">Role & Privilege</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Assigned Department</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
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
                      ? 'bg-purple-100 text-purple-800'
                      : s.role === 'admin'
                      ? 'bg-indigo-100 text-indigo-800'
                      : s.role === 'manager'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 text-sm">
                          {s.first_name} {s.last_name}
                        </div>
                        <div className="text-2xs font-mono text-slate-500">
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
                        <div className="text-slate-800 font-medium">{s.email}</div>
                        <div className="text-2xs text-slate-500">{s.phone}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">
                          {s.occupation || 'Operations Department'}
                        </div>
                        <div className="text-2xs text-slate-500">{s.state || 'Lagos'}</div>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {s.role !== 'super_admin' ? (
                          <button
                            onClick={() => handleDemote(s)}
                            className="text-2xs text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                          >
                            Revoke Staff Rights
                          </button>
                        ) : (
                          <span className="text-2xs text-slate-400">Primary Owner</span>
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Privilege Matrix</h3>
            <p className="text-xs text-slate-500">
              Security reference indicating functional boundaries and approval rights across each cooperative role tier.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Operational Capability</th>
                  <th className="py-2.5 px-3 text-center">Staff</th>
                  <th className="py-2.5 px-3 text-center">Manager</th>
                  <th className="py-2.5 px-3 text-center">Admin</th>
                  <th className="py-2.5 px-3 text-center">Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSION_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-800">{row.capability}</td>
                    <td className="py-3 px-3 text-center">
                      {row.staff ? (
                        <CheckCircle2 size={16} className="inline-block text-emerald-600" />
                      ) : (
                        <XCircle size={16} className="inline-block text-slate-300" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.manager ? (
                        <CheckCircle2 size={16} className="inline-block text-emerald-600" />
                      ) : (
                        <XCircle size={16} className="inline-block text-slate-300" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.admin ? (
                        <CheckCircle2 size={16} className="inline-block text-emerald-600" />
                      ) : (
                        <XCircle size={16} className="inline-block text-slate-300" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <CheckCircle2 size={16} className="inline-block text-emerald-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promote Member Modal */}
        {showPromoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Promote Member to Staff</h3>
                    <p className="text-2xs text-slate-500">
                      Grant operational privileges to an existing cooperative member
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPromoteModal(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePromoteSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Select Cooperative Member
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose member --</option>
                    {regularMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.first_name} {m.last_name} ({m.member_number}) - {m.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Assign Administrative Role
                  </label>
                  <select
                    value={promotedRole}
                    onChange={e => setPromotedRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="staff">Operations Staff (Document intake & receipts)</option>
                    <option value="manager">Branch Manager (Credit committee review)</option>
                    <option value="admin">Administrator (Full approvals & user creation)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowPromoteModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
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
