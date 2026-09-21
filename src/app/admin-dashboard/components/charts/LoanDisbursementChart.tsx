'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Apr 26', disbursed: 72, repaid: 61 },
  { month: 'May 26', disbursed: 81, repaid: 65 },
  { month: 'Jun 26', disbursed: 68, repaid: 70 },
  { month: 'Jul 26', disbursed: 90, repaid: 74 },
  { month: 'Aug 26', disbursed: 83, repaid: 80 },
  { month: 'Sep 26', disbursed: 95, repaid: 38 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-2.5 card-shadow text-xs">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <p key={`loan-tt-${p.dataKey}`} className="text-muted-foreground">
            {p.name}: <span className="font-bold" style={{ color: p.stroke }}>₦{p.value}M</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LoanDisbursementChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `₦${v}M`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="disbursed" name="Disbursed" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3, fill: 'var(--primary)' }} />
        <Line type="monotone" dataKey="repaid" name="Repaid" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent)' }} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}