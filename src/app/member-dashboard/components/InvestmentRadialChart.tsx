'use client';
import React from 'react';
import {
  RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip
} from 'recharts';

const data = [
  { name: 'Growth Fund III', value: 300000, fill: 'var(--primary)' },
  { name: 'Fixed Income II', value: 200000, fill: 'var(--accent)' },
  { name: 'Agro Fund I', value: 150000, fill: 'var(--warning)' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1527] border border-white/10 rounded-xl p-2.5 card-shadow text-xs">
        <p className="font-semibold text-white">{payload[0]?.name}</p>
        <p className="text-white/50">₦{payload[0]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function InvestmentRadialChart() {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="30%"
        outerRadius="80%"
        data={data}
        startAngle={180}
        endAngle={-180}
      >
        <RadialBar dataKey="value" cornerRadius={4} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconSize={8}
          iconType="circle"
          formatter={(value) => <span style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>{value}</span>}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}