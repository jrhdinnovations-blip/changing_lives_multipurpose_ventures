'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { month: 'Oct 25', balance: 612000, contributions: 10000 },
  { month: 'Nov 25', balance: 638500, contributions: 10000 },
  { month: 'Dec 25', balance: 661000, contributions: 10000 },
  { month: 'Jan 26', balance: 689000, contributions: 10000 },
  { month: 'Feb 26', balance: 704500, contributions: 10000 },
  { month: 'Mar 26', balance: 718000, contributions: 10000 },
  { month: 'Apr 26', balance: 730500, contributions: 10000 },
  { month: 'May 26', balance: 745000, contributions: 10000 },
  { month: 'Jun 26', balance: 758000, contributions: 10000 },
  { month: 'Jul 26', balance: 774500, contributions: 10000 },
  { month: 'Aug 26', balance: 792000, contributions: 10000 },
  { month: 'Sep 26', balance: 847250, contributions: 10000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 card-shadow-md text-xs">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        <p className="text-muted-foreground">Balance: <span className="font-bold text-primary font-tabular">₦{payload[0]?.value?.toLocaleString()}</span></p>
      </div>
    );
  }
  return null;
};

export default function SavingsChart() {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">12-month savings balance trend</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#savingsGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}