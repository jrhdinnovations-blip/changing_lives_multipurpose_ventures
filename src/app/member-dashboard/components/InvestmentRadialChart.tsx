'use client';
import React from 'react';
import {
  RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip
} from 'recharts';

interface InvestmentRadialChartProps {
  data?: { name: string; value: number; fill: string }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1527] border border-white/10 rounded-xl p-2.5 card-shadow text-xs">
        <p className="font-semibold text-white">{payload[0]?.name}</p>
        <p className="text-white/50">₦{Number(payload[0]?.value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

export default function InvestmentRadialChart({ data }: InvestmentRadialChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

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