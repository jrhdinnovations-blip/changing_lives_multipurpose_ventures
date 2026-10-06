'use client';
import React from 'react';
import {
  Plus, Target, CreditCard, TrendingUp, Download, Receipt, Send, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


const actions = [
  { id: 'qa-add-savings', label: 'Add Savings', icon: Plus, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-2xs' },
  { id: 'qa-create-goal', label: 'Create Goal', icon: Target, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-2xs' },
  { id: 'qa-apply-loan', label: 'Apply for Loan', icon: CreditCard, color: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-2xs' },
  { id: 'qa-invest', label: 'Wealth Circle', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-2xs' },
  { id: 'qa-transfer', label: 'Transfer Funds', icon: Send, color: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 shadow-2xs' },
  { id: 'qa-statement', label: 'Download Statement', icon: Download, color: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs' },
  { id: 'qa-receipts', label: 'View Receipts', icon: Receipt, color: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs' },
  { id: 'qa-help', label: 'Get Help', icon: HelpCircle, color: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs' },
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
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-150 active:scale-95 group ${action?.color}`}
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