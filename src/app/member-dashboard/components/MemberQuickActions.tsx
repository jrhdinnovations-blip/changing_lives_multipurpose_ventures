'use client';
import React from 'react';
import {
  Plus, Target, CreditCard, TrendingUp, Download, Receipt, Send, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

const actions = [
  { id: 'qa-add-savings', label: 'Add Savings', icon: Plus, color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20' },
  { id: 'qa-create-goal', label: 'Create Goal', icon: Target, color: 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20' },
  { id: 'qa-apply-loan', label: 'Apply for Loan', icon: CreditCard, color: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20' },
  { id: 'qa-invest', label: 'Wealth Circle', icon: TrendingUp, color: 'bg-emerald-500/10 text-[#00E599] hover:bg-emerald-500/20 border border-emerald-500/20' },
  { id: 'qa-transfer', label: 'Transfer Funds', icon: Send, color: 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20' },
  { id: 'qa-statement', label: 'Download Statement', icon: Download, color: 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10' },
  { id: 'qa-receipts', label: 'View Receipts', icon: Receipt, color: 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10' },
  { id: 'qa-help', label: 'Get Help', icon: HelpCircle, color: 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10' },
];

export default function MemberQuickActions() {
  return (
    <div className="card-base">
      <h2 className="section-header mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {actions?.map(action => {
          const Icon = action?.icon;
          return (
            <button
              key={action?.id}
              onClick={() => toast?.info(`${action?.label} — coming soon in full release`)}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all duration-150 active:scale-95 group backdrop-blur-md ${action?.color}`}
            >
              <Icon size={20} />
              <span className="text-2xs font-semibold text-center leading-tight">{action?.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}