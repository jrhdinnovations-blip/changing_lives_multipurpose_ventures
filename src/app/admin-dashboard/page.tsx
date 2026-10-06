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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Operations Center</h1>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Welcome, Raymond Longdiem · Lead Administrator · {today}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Live System Connected</span>
            </div>
            <Link
              href="/admin-dashboard/members"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
            >
              <UserPlus size={14} />
              <span>Add Member</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Executive KPI Cards (Red, Green, Blue, White theme) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Registered Members</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <Users size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-tabular">{totalMembers}</p>
            <p className="text-2xs text-slate-500 mt-1 font-medium">Active cooperative accounts</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Monthly Savings Run-Rate</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <PiggyBank size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-tabular">
              ₦{monthlyInflow.toLocaleString('en-NG')}
            </p>
            <p className="text-2xs text-slate-500 mt-1 font-medium">Scheduled monthly contributions</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-red-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active Loan Portfolio</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                <CreditCard size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-tabular">₦0.00</p>
            <p className="text-2xs text-slate-500 mt-1 font-medium">0 active facilities · 0% at risk</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Operational Health</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ShieldCheck size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 font-tabular">100%</p>
            <p className="text-2xs text-slate-500 mt-1 font-medium">Zero defaults · Clean standing</p>
          </div>
        </div>

        {/* Main Content Area: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members Table (2 Columns wide) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Registered Members Directory</h2>
                <p className="text-2xs text-slate-500 font-medium">Real-time cooperative member records</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search member..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44 transition-all"
                  />
                </div>
                <Link
                  href="/admin-dashboard/members"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
                >
                  Manage <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 font-medium">
                No members found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-2xs uppercase tracking-wider text-slate-500">
                      <th className="pb-2.5 font-bold">Member</th>
                      <th className="pb-2.5 font-bold">Member ID</th>
                      <th className="pb-2.5 font-bold">Contribution</th>
                      <th className="pb-2.5 font-bold">Status</th>
                      <th className="pb-2.5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredMembers.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-bold text-slate-900">
                              {m.first_name} {m.last_name}
                            </p>
                            <p className="text-2xs text-slate-500">{m.email}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-mono text-2xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-semibold">
                            {m.membership_no || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-tabular font-bold text-slate-900">
                          ₦{Number(m.monthly_contribution || 0).toLocaleString('en-NG')}
                          <span className="text-2xs text-slate-400 font-normal">/mo</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <UserCheck size={10} />
                            <span className="capitalize">{m.status || 'Active'}</span>
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href="/admin-dashboard/members"
                            className="text-2xs font-bold text-blue-600 hover:text-blue-800"
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
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Administrative Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/admin-dashboard/members"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 transition-all text-xs font-bold text-slate-800 group"
                >
                  <div className="flex items-center gap-2.5">
                    <UserPlus size={15} className="text-blue-600" />
                    <span>Create Member Profile</span>
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </Link>

                <Link
                  href="/admin-dashboard/loans"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-red-50/60 border border-slate-200/80 transition-all text-xs font-bold text-slate-800 group"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard size={15} className="text-red-600" />
                    <span>Loan Facility & Underwriting</span>
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                </Link>

                <Link
                  href="/financial-statements"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 transition-all text-xs font-bold text-slate-800 group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={15} className="text-emerald-600" />
                    <span>Financial Statements & Reports</span>
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </Link>

                <Link
                  href="/admin-dashboard/staff"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 transition-all text-xs font-bold text-slate-800 group"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield size={15} className="text-purple-600" />
                    <span>Staff & Role Permissions</span>
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                </Link>

                <Link
                  href="/admin-dashboard/audit-logs"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 transition-all text-xs font-bold text-slate-800 group"
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList size={15} className="text-teal-600" />
                    <span>System Audit Trail</span>
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Verification Status Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Operational Queue Clear</span>
              </div>
              <p className="text-2xs text-emerald-700 leading-relaxed font-medium">
                All cooperative member files are up to date. No pending approvals, overdue loans, or flagged accounts requiring administrative action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}