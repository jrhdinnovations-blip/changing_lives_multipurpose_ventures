'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ChevronRight, UserCheck, Search } from 'lucide-react';
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

export default function AdminMembersRoster() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadMembers() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('members')
          .select('id, membership_no, first_name, last_name, email, phone, status, monthly_contribution')
          .order('membership_no', { ascending: true });

        if (!error && data) {
          setMembers(data);
        }
      } catch (err) {
        console.warn('Failed to load members roster:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.membership_no || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Registered Cooperative Members</h2>
            <p className="text-2xs text-white/50">Active member files synced with database</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 shrink-0"
          >
            Full Directory <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-xs text-white/50">
          No members matched your search.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-2xs uppercase tracking-wider text-white/50">
                <th className="pb-2.5 font-semibold">Member</th>
                <th className="pb-2.5 font-semibold">Member ID</th>
                <th className="pb-2.5 font-semibold">Monthly Inflow</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filtered.map(member => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4">
                    <div>
                      <p className="font-semibold text-white">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-2xs text-white/40">{member.email}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-mono text-2xs text-white/70 bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/10">
                      {member.membership_no || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-tabular font-medium text-white">
                      ₦{Number(member.monthly_contribution || 0).toLocaleString('en-NG')}
                    </span>
                    <span className="text-2xs text-white/40"> / mo</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <UserCheck size={10} />
                      <span className="capitalize">{member.status || 'Active'}</span>
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin-dashboard/members`}
                      className="text-2xs font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
