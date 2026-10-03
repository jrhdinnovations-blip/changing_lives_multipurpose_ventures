'use client';
import React from 'react';
import Link from 'next/link';
import { Shield, KeyRound, Database, ArrowRight } from 'lucide-react';

export default function AdminRecentActivity() {
  const events = [
    {
      id: 'sys-01',
      title: 'Administrator Session Initialized',
      detail: 'Raymond Longdiem authenticated with Super Admin role',
      time: 'Today',
      icon: KeyRound,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      id: 'sys-02',
      title: 'Database Cloud Synchronized',
      detail: 'Live Supabase connection verified · RLS policies active',
      time: 'Today',
      icon: Database,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      id: 'sys-03',
      title: 'System Security Audit Completed',
      detail: 'Data encryption and auth token verification active',
      time: 'Today',
      icon: Shield,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white">System Security & Operations</h2>
          <p className="text-2xs text-white/50">Recent verified system events</p>
        </div>
        <Link
          href="/admin-dashboard/audit-logs"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          Audit Logs <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-3">
        {events.map(ev => {
          const Icon = ev.icon;
          return (
            <div key={ev.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className={`p-2 rounded-lg ${ev.bg} ${ev.color} shrink-0 mt-0.5`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white truncate">{ev.title}</p>
                  <span className="text-2xs text-white/40">{ev.time}</span>
                </div>
                <p className="text-2xs text-white/50 mt-0.5">{ev.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}