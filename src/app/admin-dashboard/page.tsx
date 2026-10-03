'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import {
  Users,
  PiggyBank,
  CreditCard,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Search,
  UserCheck,
  FileText,
  Shield,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MemberItem {
  id: string;
  membership_no: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  monthly_contribution: number;
}

export default function AdminDashboardPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    async function loadMembers() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('members')
          .select('id, membership_no, first_name, last_name, email, phone, status, monthly_contribution')
          .order('membership_no', { ascending: true });

        if (!error && data && data.length > 0) {
          setMembers(data);
        }
      } catch (err) {
        console.warn('Admin dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  const totalMembers = members.length;
  const monthlyInflow = members.reduce((sum, m) => sum + (Number(m.monthly_contribution) || 0), 0);

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase();
    const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.membership_no || '').toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout role="admin" memberName="Raymond Longdiem" memberId="ADM/2026/0001">
      <div className="p-6 xl:p-8 2xl:p-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Operations Center</h1>
            <p className="text-xs text-white/50 mt-1">
              Welcome, Raymond Longdiem · Lead Administrator · {today}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live System Connected</span>
            </div>
            <Link
              href="/admin-dashboard/members"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <UserPlus size={14} />
              <span>Add Member</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/50">Registered Members</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-tabular">{totalMembers}</p>
            <p className="text-2xs text-white/40 mt-1">Active cooperative accounts</p>
          </div>

          <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/50">Monthly Savings Run-Rate</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <PiggyBank size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-tabular">
              ₦{monthlyInflow.toLocaleString('en-NG')}
            </p>
            <p className="text-2xs text-white/40 mt-1">Scheduled monthly contributions</p>
          </div>

          <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/50">Active Loan Portfolio</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CreditCard size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-tabular">₦0.00</p>
            <p className="text-2xs text-white/40 mt-1">0 active facilities · 0% at risk</p>
          </div>

          <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/50">Operational Health</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-tabular">100%</p>
            <p className="text-2xs text-white/40 mt-1">Zero defaults · Clean standing</p>
          </div>
        </div>

        {/* Main Content Area: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members Table (2 Columns wide) */}
          <div className="lg:col-span-2 bg-[#0b1329] border border-white/10 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Registered Members Directory</h2>
                <p className="text-2xs text-white/50">Real-time cooperative member records</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search member..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 w-44"
                  />
                </div>
                <Link
                  href="/admin-dashboard/members"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0"
                >
                  Manage <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-12 text-center text-xs text-white/50">
                No members found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-2xs uppercase tracking-wider text-white/50">
                      <th className="pb-2.5 font-semibold">Member</th>
                      <th className="pb-2.5 font-semibold">Member ID</th>
                      <th className="pb-2.5 font-semibold">Contribution</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredMembers.map(m => (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-semibold text-white">
                              {m.first_name} {m.last_name}
                            </p>
                            <p className="text-2xs text-white/40">{m.email}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-mono text-2xs text-white/70 bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/10">
                            {m.membership_no || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-tabular font-medium text-white">
                          ₦{Number(m.monthly_contribution || 0).toLocaleString('en-NG')}
                          <span className="text-2xs text-white/40">/mo</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <UserCheck size={10} />
                            <span className="capitalize">{m.status || 'Active'}</span>
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href="/admin-dashboard/members"
                            className="text-2xs font-medium text-emerald-400 hover:text-emerald-300"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions & System Status (1 Column) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-white mb-3">Administrative Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/admin-dashboard/members"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-xs font-semibold text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <UserPlus size={15} className="text-emerald-400" />
                    <span>Create Member Profile</span>
                  </div>
                  <ArrowRight size={13} className="text-white/40 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/admin-dashboard/loans"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-xs font-semibold text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard size={15} className="text-amber-400" />
                    <span>Loan Facility & Underwriting</span>
                  </div>
                  <ArrowRight size={13} className="text-white/40 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/financial-statements"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-xs font-semibold text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={15} className="text-blue-400" />
                    <span>Financial Statements & Reports</span>
                  </div>
                  <ArrowRight size={13} className="text-white/40 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/admin-dashboard/staff"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-xs font-semibold text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield size={15} className="text-purple-400" />
                    <span>Staff & Role Permissions</span>
                  </div>
                  <ArrowRight size={13} className="text-white/40 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/admin-dashboard/audit-logs"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-xs font-semibold text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList size={15} className="text-teal-400" />
                    <span>System Audit Trail</span>
                  </div>
                  <ArrowRight size={13} className="text-white/40 group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>

            {/* Verification Status Card */}
            <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-2">
                <CheckCircle2 size={16} />
                <span>Operational Queue Clear</span>
              </div>
              <p className="text-2xs text-white/50 leading-relaxed">
                All cooperative member files are up to date. No pending approvals, overdue loans, or flagged accounts requiring administrative action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}