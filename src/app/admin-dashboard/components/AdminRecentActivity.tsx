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
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border border-emerald-200',
    },
    {
      id: 'sys-02',
      title: 'Database Cloud Synchronized',
      detail: 'Live Supabase connection verified · RLS policies active',
      time: 'Today',
      icon: Database,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border border-blue-200',
    },
    {
      id: 'sys-03',
      title: 'System Security Audit Completed',
      detail: 'Data encryption and auth token verification active',
      time: 'Today',
      icon: Shield,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border border-purple-200',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">System Security & Operations</h2>
          <p className="text-2xs text-slate-500">Recent verified system events</p>
        </div>
        <Link
          href="/admin-dashboard/audit-logs"
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Audit Logs <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-3">
        {events.map(ev => {
          const Icon = ev.icon;
          return (
            <div key={ev.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className={`p-2 rounded-lg ${ev.bg} ${ev.color} shrink-0 mt-0.5`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 truncate">{ev.title}</p>
                  <span className="text-2xs text-slate-400 font-medium">{ev.time}</span>
                </div>
                <p className="text-2xs text-slate-500 mt-0.5">{ev.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}