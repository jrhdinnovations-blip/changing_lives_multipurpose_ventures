import React from 'react';

type BadgeVariant =
  | 'active' |'paid' |'pending' |'overdue' |'unpaid' |'partial' |'approved' |'rejected' |'completed' |'paused' |'draft' |'open' |'closed' |'matured' |'disbursed' |'review' |'suspended' |'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  active: 'bg-accent/10 text-accent',
  paid: 'bg-accent/10 text-accent',
  approved: 'bg-accent/10 text-accent',
  completed: 'bg-accent/10 text-accent',
  open: 'bg-blue-50 text-blue-700',
  disbursed: 'bg-blue-50 text-blue-700',
  partial: 'bg-blue-50 text-blue-600',
  pending: 'bg-warning/10 text-warning',
  review: 'bg-warning/10 text-warning',
  paused: 'bg-warning/10 text-warning',
  draft: 'bg-muted text-muted-foreground',
  unpaid: 'bg-muted text-muted-foreground',
  default: 'bg-muted text-muted-foreground',
  overdue: 'bg-destructive/10 text-destructive',
  rejected: 'bg-destructive/10 text-destructive',
  closed: 'bg-muted text-muted-foreground',
  matured: 'bg-purple-50 text-purple-700',
  suspended: 'bg-destructive/10 text-destructive',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
}