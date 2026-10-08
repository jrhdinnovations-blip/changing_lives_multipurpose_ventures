'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

import { TrendingUp } from 'lucide-react';

interface SavingsChartProps {
  data?: { month: string; balance: number; contributions: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0D182E]/80 backdrop-blur-xl border border-white/10 shadow-md rounded-xl p-3 text-xs">
        <p className="font-semibold text-white/50 mb-1.5">{label}</p>
        <p className="text-white/50">Balance: <span className="font-bold text-emerald-600 font-tabular">₦{Number(payload[0]?.value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span></p>
      </div>
    );
  }
  return null;
};

export default function SavingsChart({ data }: SavingsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
          <TrendingUp size={18} />
        </div>
        <p className="text-sm font-bold text-white/50">No Savings History Yet</p>
        <p className="text-xs text-white/50 max-w-xs mt-1">
          Your savings balance and contribution growth trend will appear here as transactions are recorded.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-white/50 mb-3">Savings balance trend</p>
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