'use client';
import React from 'react';
import { Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const obligations = [
  {
    id: 'obl-001',
    type: 'contribution',
    title: 'Oct 2026 Contribution',
    amount: '₦10,000',
    dueDate: '01 Oct 2026',
    daysUntil: 10,
    urgency: 'upcoming' as const,
  },
  {
    id: 'obl-002',
    type: 'loan',
    title: 'Loan Instalment #7',
    amount: '₦45,833',
    dueDate: '25 Sep 2026',
    daysUntil: 4,
    urgency: 'soon' as const,
  },
  {
    id: 'obl-003',
    type: 'investment',
    title: 'Fixed Income II Maturity',
    amount: '₦222,000',
    dueDate: '30 Nov 2026',
    daysUntil: 70,
    urgency: 'upcoming' as const,
  },
  {
    id: 'obl-004',
    type: 'goal',
    title: 'School Fees Goal Deadline',
    amount: '₦160,000 remaining',
    dueDate: '15 Jan 2027',
    daysUntil: 116,
    urgency: 'upcoming' as const,
  },
];

const urgencyConfig = {
  overdue: { color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle, border: 'border-destructive/20' },
  soon: { color: 'text-warning', bg: 'bg-warning/10', icon: Clock, border: 'border-warning/20' },
  upcoming: { color: 'text-muted-foreground', bg: 'bg-muted', icon: Calendar, border: 'border-border' },
  done: { color: 'text-accent', bg: 'bg-accent/10', icon: CheckCircle2, border: 'border-accent/20' },
};

const typeLabel: Record<string, string> = {
  contribution: 'Contribution',
  loan: 'Loan Repayment',
  investment: 'Investment',
  goal: 'Savings Goal',
};

export default function MemberUpcomingObligations() {
  return (
    <div className="card-base">
      <h2 className="section-header mb-4">Upcoming Obligations</h2>
      <div className="space-y-2.5">
        {obligations.map(obl => {
          const cfg = urgencyConfig[obl.urgency];
          const Icon = cfg.icon;
          return (
            <div
              key={obl.id}
              className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.border} ${obl.urgency === 'soon' ? 'bg-warning/5' : ''}`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${cfg.bg}`}>
                <Icon size={14} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground truncate">{obl.title}</p>
                  <p className="text-xs font-bold text-foreground font-tabular shrink-0">{obl.amount}</p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-2xs text-muted-foreground">{typeLabel[obl.type]} · {obl.dueDate}</p>
                  <p className={`text-2xs font-semibold ${cfg.color}`}>
                    {obl.daysUntil <= 7 ? `${obl.daysUntil}d left` : `in ${obl.daysUntil}d`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}