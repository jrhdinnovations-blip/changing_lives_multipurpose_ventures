'use client';
import React, { useState } from 'react';

import { UserPlus, PiggyBank, TrendingUp, Receipt, CheckCircle2, XCircle, AlertCircle, RefreshCw, Banknote, Search } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface ActivityItem {
  id: string;
  ref: string;
  type: 'member_registered' | 'loan_approved' | 'loan_disbursed' | 'repayment_received' | 'contribution_recorded' | 'investment_activated' | 'loan_rejected' | 'member_approved' | 'investment_matured' | 'overdue_flagged';
  description: string;
  actor: string;
  target?: string;
  amount?: string;
  time: string;
  date: string;
}

const activities: ActivityItem[] = [
  { id: 'act-001', ref: 'TXN/2026/004821', type: 'contribution_recorded', description: 'Contribution recorded for Adaeze Okonkwo', actor: 'Staff Ngozi Eze', target: 'CLMV/2026/0047', amount: '₦10,000', time: '13:42', date: 'Today' },
  { id: 'act-002', ref: 'LN/2026/00521', type: 'loan_approved', description: 'Business loan application approved', actor: 'Admin Chukwuemeka Adeyemi', target: 'Ngozi Obi · CLMV/2026/0031', amount: '₦750,000', time: '13:15', date: 'Today' },
  { id: 'act-003', ref: 'APP/2026/003820', type: 'member_approved', description: 'Membership application approved', actor: 'Admin Chukwuemeka Adeyemi', target: 'Tunde Lawal → CLMV/2026/0292', time: '12:58', date: 'Today' },
  { id: 'act-004', ref: 'TXN/2026/004818', type: 'repayment_received', description: 'Loan repayment received', actor: 'Staff Amaka Osu', target: 'Kenneth Eze · LN/2026/00412', amount: '₦45,833', time: '12:30', date: 'Today' },
  { id: 'act-005', ref: 'INV/2026/00088', type: 'investment_activated', description: 'Investment subscription activated', actor: 'Admin Chukwuemeka Adeyemi', target: 'Bisi Adeleke · CLMV/2025/0634', amount: '₦250,000', time: '11:47', date: 'Today' },
  { id: 'act-006', ref: 'LN/2025/00802', type: 'overdue_flagged', description: 'Loan flagged as overdue — 67 days', actor: 'System (Auto)', target: 'Kenneth Okonkwo · LN/2025/00802', amount: '₦200,000 overdue', time: '08:00', date: 'Today' },
  { id: 'act-007', ref: 'LN/2026/00517', type: 'loan_rejected', description: 'Personal loan application rejected', actor: 'Manager Ibrahim Sule', target: 'Emeka Eze · CLMV/2026/0312', amount: '₦1,200,000', time: '17:22', date: 'Yesterday' },
  { id: 'act-008', ref: 'INV/2026/00071', type: 'investment_matured', description: 'Agro Fund I matured — returns processed', actor: 'System (Auto)', target: 'Adaeze Okonkwo · CLMV/2026/0047', amount: '₦174,000', time: '09:00', date: 'Yesterday' },
  { id: 'act-009', ref: 'APP/2026/003818', type: 'member_registered', description: 'New membership application received', actor: 'Self-registration', target: 'Babatunde Adewale', time: '11:05', date: 'Yesterday' },
  { id: 'act-010', ref: 'LN/2026/00510', type: 'loan_disbursed', description: 'Emergency loan disbursed', actor: 'Admin Chukwuemeka Adeyemi', target: 'Chiamaka Nwosu · CLMV/2026/0205', amount: '₦200,000', time: '14:30', date: '19 Sep 2026' },
];

const activityConfig: Record<ActivityItem['type'], { icon: React.ElementType; color: string; bg: string }> = {
  member_registered: { icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100' },
  member_approved: { icon: CheckCircle2, color: 'text-accent', bg: 'bg-accent/10' },
  loan_approved: { icon: CheckCircle2, color: 'text-accent', bg: 'bg-accent/10' },
  loan_disbursed: { icon: Banknote, color: 'text-blue-600', bg: 'bg-blue-100' },
  loan_rejected: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  repayment_received: { icon: RefreshCw, color: 'text-accent', bg: 'bg-accent/10' },
  contribution_recorded: { icon: PiggyBank, color: 'text-blue-600', bg: 'bg-blue-100' },
  investment_activated: { icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  investment_matured: { icon: Receipt, color: 'text-accent', bg: 'bg-accent/10' },
  overdue_flagged: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export default function AdminRecentActivity() {
  const [search, setSearch] = useState('');

  const filtered = activities.filter(a =>
    a.description.toLowerCase().includes(search.toLowerCase()) ||
    a.ref.toLowerCase().includes(search.toLowerCase()) ||
    (a.target && a.target.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = filtered.reduce<Record<string, ActivityItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header">Recent Activity</h2>
        <div className="relative w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activity…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="space-y-4 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={`activity-group-${date}`}>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-widest mb-2 sticky top-0 bg-card py-1">{date}</p>
            <div className="space-y-1">
              {items.map(item => {
                const cfg = activityConfig[item.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${cfg.bg}`}>
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-foreground leading-snug">{item.description}</p>
                        {item.amount && (
                          <p className="text-xs font-bold text-foreground font-tabular shrink-0 whitespace-nowrap">{item.amount}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-2xs text-muted-foreground truncate">
                          {item.actor}
                          {item.target && ` · ${item.target}`}
                        </p>
                        <span className="text-2xs text-muted-foreground shrink-0">· {item.time}</span>
                      </div>
                      <p className="text-2xs text-muted-foreground font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{item.ref}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}