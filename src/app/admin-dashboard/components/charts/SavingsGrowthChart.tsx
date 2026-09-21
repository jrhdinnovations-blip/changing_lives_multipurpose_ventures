'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { month: 'Oct 25', savings: 1120 },
  { month: 'Nov 25', savings: 1148 },
  { month: 'Dec 25', savings: 1175 },
  { month: 'Jan 26', savings: 1198 },
  { month: 'Feb 26', savings: 1224 },
  { month: 'Mar 26', savings: 1256 },
  { month: 'Apr 26', savings: 1288 },
  { month: 'May 26', savings: 1315 },
  { month: 'Jun 26', savings: 1340 },
  { month: 'Jul 26', savings: 1364 },
  { month: 'Aug 26', savings: 1375 },
  { month: 'Sep 26', savings: 1420 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-2.5 card-shadow text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-muted-foreground">
          Total Savings: <span className="font-bold text-primary">₦{payload[0]?.value}M</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function SavingsGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="adminSavingsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `₦${v}M`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="savings" stroke="var(--primary)" strokeWidth={2} fill="url(#adminSavingsGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}