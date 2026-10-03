'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AppLayout from '@/components/AppLayout';
import type { SavingsGoal, SavingsGoalStatus } from '@/lib/types/climps';

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const GOAL_ICONS: Record<string, string> = {
  'School Fees': '🎓',
  'Rent': '🏠',
  'Business Capital': '💼',
  'Emergency Fund': '🛡️',
  'Wedding': '💍',
  'Travel': '✈️',
  'Property': '🏗️',
  'Vehicle': '🚗',
  'Custom': '⭐',
};

const GOAL_CATEGORIES = Object.keys(GOAL_ICONS);

const STATUS_CONFIG: Record<SavingsGoalStatus, { label: string; classes: string; dot: string }> = {
  active: { label: 'Active', classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400' },
  completed: { label: 'Completed', classes: 'bg-blue-500/15 text-blue-400 border-blue-500/25', dot: 'bg-blue-400' },
  paused: { label: 'Paused', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/25', dot: 'bg-amber-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-white/10 text-white/50 border-white/15', dot: 'bg-white/40' },
};

// Demo data
const DEMO_GOALS: (SavingsGoal & { category: string })[] = [
  { id: '1', memberId: 'm1', goalName: 'Rent Payment', targetAmount: 360000, currentAmount: 210000, targetDate: '2026-12-31', frequency: 'monthly', goalStatus: 'active', category: 'Rent', createdAt: '2026-01-01', updatedAt: '2026-09-01' },
  { id: '2', memberId: 'm1', goalName: 'Business Capital', targetAmount: 1000000, currentAmount: 340000, targetDate: '2027-06-30', frequency: 'monthly', goalStatus: 'active', category: 'Business Capital', createdAt: '2026-03-01', updatedAt: '2026-09-01' },
  { id: '3', memberId: 'm1', goalName: 'Son\'s University Fees', targetAmount: 500000, currentAmount: 500000, targetDate: '2026-09-01', frequency: 'monthly', goalStatus: 'completed', category: 'School Fees', createdAt: '2025-09-01', updatedAt: '2026-08-30' },
  { id: '4', memberId: 'm1', goalName: 'Emergency Fund', targetAmount: 200000, currentAmount: 45000, targetDate: '2027-03-31', frequency: 'monthly', goalStatus: 'active', category: 'Emergency Fund', createdAt: '2026-06-01', updatedAt: '2026-09-01' },
];

function GoalCard({
  goal, onStatusChange,
}: {
  goal: SavingsGoal & { category: string };
  onStatusChange: (id: string, status: SavingsGoalStatus) => void;
}) {
  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
  const remaining = goal.targetAmount - goal.currentAmount;
  const cfg = STATUS_CONFIG[goal.goalStatus];
  const icon = GOAL_ICONS[goal.category] || '⭐';

  const daysLeft = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className={`bg-[#0d1527] rounded-2xl border border-white/10 p-5 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md ${goal.goalStatus === 'cancelled' ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm leading-snug">{goal.goalName}</h3>
            <p className="text-xs text-white/50">{goal.category} · {goal.frequency}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.classes}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-white/50">Saved so far</span>
          <span className="font-bold text-emerald-400">{pct}%</span>
        </div>
        <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-emerald-500' : 'bg-amber-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className="font-tabular text-white font-semibold">{fmt(goal.currentAmount)}</span>
          <span className="font-tabular text-white/50">of {fmt(goal.targetAmount)}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Remaining', value: fmt(remaining), color: remaining > 0 ? 'text-red-600' : 'text-emerald-600' },
          { label: 'Target Date', value: goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : '—', color: 'text-white' },
          { label: 'Days Left', value: daysLeft !== null ? (daysLeft > 0 ? `${daysLeft}d` : 'Passed') : '—', color: daysLeft !== null && daysLeft < 30 ? 'text-red-600' : 'text-white' },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.06]/50 rounded-xl p-2.5 text-center">
            <p className={`text-xs font-bold font-tabular ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-white/50 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      {goal.goalStatus !== 'completed' && goal.goalStatus !== 'cancelled' && (
        <div className="flex gap-2 pt-1 border-t border-white/10">
          <button
            onClick={() => onStatusChange(goal.id, goal.goalStatus === 'paused' ? 'active' : 'paused')}
            className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white/50 hover:bg-white/[0.06] transition-colors"
          >
            {goal.goalStatus === 'paused' ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={() => onStatusChange(goal.id, 'cancelled')}
            className="flex-1 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Cancel Goal
          </button>
        </div>
      )}
    </div>
  );
}

// ── New Goal Modal ────────────────────────────────────────────────────────
function NewGoalModal({ onClose, onCreate }: { onClose: () => void; onCreate: (g: any) => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Custom');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [frequency, setFrequency] = useState('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      id: String(Date.now()),
      memberId: 'm1',
      goalName: name,
      category,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: 0,
      targetDate,
      frequency,
      goalStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#0d1527] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-white">Create Savings Goal</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-white block mb-1.5">Goal Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Daughter's School Fees" className="w-full border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background" />
          </div>
          <div>
            <label className="text-sm font-semibold text-white block mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all ${category === cat ? 'border-primary bg-emerald-500/5 text-emerald-400' : 'border-white/10 text-white/50 hover:border-primary/30'}`}
                >
                  <span>{GOAL_ICONS[cat]}</span>
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-white block mb-1.5">Target Amount (₦)</label>
              <input required type="number" min={1000} value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="e.g. 500000" className="w-full border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background" />
            </div>
            <div>
              <label className="text-sm font-semibold text-white block mb-1.5">Target Date</label>
              <input required type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-white block mb-1.5">Contribution Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background">
              {['daily','weekly','monthly','yearly'].map((f) => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
            <button type="submit" className="flex-1 btn-accent py-2.5 text-sm">Create Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<(SavingsGoal & { category: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [memberName, setMemberName] = useState('Member');
  const [memberId, setMemberId] = useState('');
  const [role, setRole] = useState<'member' | 'admin' | 'staff' | 'manager'>('member');
  const [statusFilter, setStatusFilter] = useState<SavingsGoalStatus | 'all'>('all');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        setMemberName(meta?.full_name || 'Member');
        setMemberId(meta?.member_number || '');
        setRole((meta?.role as typeof role) || 'member');
      }
    });
    setTimeout(() => { setGoals(DEMO_GOALS); setLoading(false); }, 500);
  }, []);

  const handleStatusChange = (id: string, status: SavingsGoalStatus) => {
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, goalStatus: status } : g));
  };

  const filtered = statusFilter === 'all' ? goals : goals.filter((g) => g.goalStatus === statusFilter);

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const activeGoals = goals.filter((g) => g.goalStatus === 'active');
  const completedGoals = goals.filter((g) => g.goalStatus === 'completed');
  const nearestDeadline = activeGoals.sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime())[0];

  return (
    <AppLayout role={role} memberName={memberName} memberId={memberId}>
      {showModal && <NewGoalModal onClose={() => setShowModal(false)} onCreate={(g) => setGoals((prev) => [g, ...prev])} />}

      <div className="p-6 xl:p-8 2xl:p-10 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-7 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
              <Link href="/member-dashboard" className="hover:text-white">Dashboard</Link>
              <span>/</span>
              <span className="text-white font-medium">Savings Goals</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">My Savings Goals</h1>
            <p className="text-white/50 text-sm mt-1">Track your personal financial targets and stay motivated.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-accent px-5 py-2.5 text-sm flex items-center gap-2 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Goal
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Goals', value: String(activeGoals.length), emoji: '🎯' },
            { label: 'Total Saved', value: fmt(totalSaved), emoji: '💰' },
            { label: 'Completed', value: String(completedGoals.length), emoji: '🏆' },
            { label: 'Next Deadline', value: nearestDeadline?.targetDate ? new Date(nearestDeadline.targetDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—', emoji: '📅' },
          ].map((c) => (
            <div key={c.label} className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm">
              <div className="text-xl mb-1.5">{c.emoji}</div>
              <p className="text-xs text-white/50">{c.label}</p>
              <p className="text-base font-extrabold text-white font-tabular">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {(['all', 'active', 'completed', 'paused', 'cancelled'] as (SavingsGoalStatus | 'all')[]).map((f) => {
            const count = f === 'all' ? goals.length : goals.filter((g) => g.goalStatus === f).length;
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${statusFilter === f ? 'bg-emerald-500 text-white border-primary shadow-sm' : 'bg-white/[0.06] text-white/50 border-white/10 hover:border-primary/40'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 text-[10px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Goals Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-white font-semibold mb-1">No goals yet</p>
            <p className="text-white/50 text-sm mb-5">Set your first savings goal to start tracking your progress.</p>
            <button onClick={() => setShowModal(true)} className="btn-accent px-6 py-2.5 text-sm">
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
