'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const data = [
  { month: 'Oct 25', members: 18 },
  { month: 'Nov 25', members: 24 },
  { month: 'Dec 25', members: 15 },
  { month: 'Jan 26', members: 31 },
  { month: 'Feb 26', members: 28 },
  { month: 'Mar 26', members: 42 },
  { month: 'Apr 26', members: 37 },
  { month: 'May 26', members: 29 },
  { month: 'Jun 26', members: 45 },
  { month: 'Jul 26', members: 38 },
  { month: 'Aug 26', members: 22 },
  { month: 'Sep 26', members: 34 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-md text-xs">
        <p className="font-semibold text-slate-900 mb-1">{label}</p>
        <p className="text-slate-500">New Members: <span className="font-bold text-blue-600">{payload[0]?.value}</span></p>
      </div>
    );
  }
  return null;
};

export default function MemberGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="members" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-member-${index}`}
              fill={entry.members >= 40 ? 'var(--accent)' : entry.members <= 20 ? 'var(--muted-foreground)' : 'var(--primary)'}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}