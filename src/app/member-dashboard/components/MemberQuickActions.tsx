'use client';
import React from 'react';
import {
  Plus, Target, CreditCard, TrendingUp, Download, Receipt, Send, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


const actions = [
  { id: 'qa-add-savings', label: 'Add Savings', icon: Plus, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { id: 'qa-create-goal', label: 'Create Goal', icon: Target, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { id: 'qa-apply-loan', label: 'Apply for Loan', icon: CreditCard, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
  { id: 'qa-invest', label: 'Invest Now', icon: TrendingUp, color: 'bg-accent/10 text-accent hover:bg-accent/20' },
  { id: 'qa-transfer', label: 'Transfer Funds', icon: Send, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
  { id: 'qa-statement', label: 'Download Statement', icon: Download, color: 'bg-muted text-muted-foreground hover:bg-muted/80' },
  { id: 'qa-receipts', label: 'View Receipts', icon: Receipt, color: 'bg-muted text-muted-foreground hover:bg-muted/80' },
  { id: 'qa-help', label: 'Get Help', icon: HelpCircle, color: 'bg-muted text-muted-foreground hover:bg-muted/80' },
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