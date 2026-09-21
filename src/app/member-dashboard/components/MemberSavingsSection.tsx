'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Badge from '@/components/ui/Badge';
import { Plus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const SavingsChart = dynamic(() => import('./SavingsChart'), { ssr: false });

const savingsAccounts = [
  { id: 'sa-001', name: 'Monthly Cooperative Contribution', balance: '₦310,000.00', rate: '6% p.a.', status: 'active' as const, monthsPaid: 31 },
  { id: 'sa-002', name: 'Regular Savings Account', balance: '₦285,750.00', rate: '5.5% p.a.', status: 'active' as const, monthsPaid: 24 },
  { id: 'sa-003', name: 'Emergency Savings', balance: '₦150,000.00', rate: '4% p.a.', status: 'active' as const, monthsPaid: 18 },
  { id: 'sa-004', name: 'Target Savings — Education', balance: '₦101,500.00', rate: '5% p.a.', status: 'active' as const, monthsPaid: 12 },
];

const savingsGoals = [
  { id: 'goal-001', name: 'House Deposit', target: 2000000, saved: 1490000, deadline: '31 Dec 2027', status: 'active' as const },
  { id: 'goal-002', name: 'Emergency Fund (6 months)', target: 600000, saved: 600000, deadline: '01 Jun 2026', status: 'completed' as const },
  { id: 'goal-003', name: 'School Fees — Daughter', target: 450000, saved: 290000, deadline: '15 Jan 2027', status: 'active' as const },
  { id: 'goal-004', name: 'Business Capital', target: 1500000, saved: 487500, deadline: '30 Jun 2027', status: 'active' as const },
  { id: 'goal-005', name: 'Annual Family Holiday', target: 350000, saved: 105000, deadline: '15 Dec 2026', status: 'paused' as const },
];

const goalStatusColor: Record<string, string> = {
  active: 'bg-accent h-full rounded-full',
  completed: 'bg-blue-500 h-full rounded-full',
  paused: 'bg-warning h-full rounded-full',
  cancelled: 'bg-destructive h-full rounded-full',
};

function GoalProgressBar({ goal }: { goal: typeof savingsGoals[0] }) {
  const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  return (
    <div className="hover:bg-muted/40 rounded-xl p-3 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{goal.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Target: {goal.deadline}</p>
        </div>
        <div className="text-right">
          <Badge variant={goal.status}>{goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}</Badge>
          <p className="text-xs font-bold text-foreground mt-1 font-tabular">
            ₦{goal.saved.toLocaleString()} <span className="font-normal text-muted-foreground">/ ₦{goal.target.toLocaleString()}</span>
          </p>
        </div>
      </div>
      <div className="progress-bar-bg h-2">
        <div
          className={`${goalStatusColor[goal.status]} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <p className="text-xs text-muted-foreground">₦{(goal.target - goal.saved).toLocaleString()} remaining</p>
        <p className="text-xs font-bold text-primary">{pct}%</p>
      </div>
    </div>
  );
}

export default function MemberSavingsSection() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'goals' | 'chart'>('accounts');

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header">Savings Overview</h2>
        <button
          onClick={() => toast.info('Add savings — coming soon')}
          className="btn-outline text-xs flex items-center gap-1.5 px-3 py-1.5"
        >
          <Plus size={13} />
          Add Savings
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 mb-4">
        {(['accounts', 'goals', 'chart'] as const).map(tab => (
          <button
            key={`savings-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 capitalize ${
              activeTab === tab ? 'bg-card text-primary card-shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'accounts' ? 'Accounts' : tab === 'goals' ? 'Goals' : 'Growth Chart'}
          </button>
        ))}
      </div>

      {activeTab === 'accounts' && (
        <div className="space-y-2">
          {savingsAccounts.map(acc => (
            <div
              key={acc.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors cursor-pointer group"
            >
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{acc.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{acc.monthsPaid} months · {acc.rate}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground font-tabular">{acc.balance}</p>
                  <Badge variant="active">Active</Badge>
                </div>
                <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Total Savings Balance</p>
            <p className="text-base font-bold text-primary font-tabular">₦847,250.00</p>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-1">
          {savingsGoals.map(goal => (
            <GoalProgressBar key={goal.id} goal={goal} />
          ))}
          <button
            onClick={() => toast.info('Create savings goal — coming soon')}
            className="w-full mt-2 py-2.5 border-2 border-dashed border-border rounded-xl text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-all duration-150 flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Create New Savings Goal
          </button>
        </div>
      )}

      {activeTab === 'chart' && (
        <SavingsChart />
      )}
    </div>
  );
}