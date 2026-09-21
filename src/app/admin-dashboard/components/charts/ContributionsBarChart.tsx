'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Apr 26', expected: 28470, collected: 26800 },
  { month: 'May 26', expected: 28470, collected: 27100 },
  { month: 'Jun 26', expected: 28470, collected: 27640 },
  { month: 'Jul 26', expected: 28470, collected: 26950 },
  { month: 'Aug 26', expected: 28470, collected: 27820 },
  { month: 'Sep 26', expected: 28470, collected: 28470 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-2.5 card-shadow text-xs">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <p key={`contrib-tt-${p.dataKey}`} className="text-muted-foreground">
            {p.name}: <span className="font-bold" style={{ color: p.fill }}>₦{(p.value / 1000).toFixed(1)}k</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ContributionsBarChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barSize={10} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="expected" name="Expected" fill="var(--muted)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="collected" name="Collected" fill="var(--accent)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}