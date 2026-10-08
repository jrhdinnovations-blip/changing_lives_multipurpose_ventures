'use client';
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const periods = [
  { id: 'filter-today', label: 'Today' },
  { id: 'filter-week', label: 'This Week' },
  { id: 'filter-month', label: 'This Month' },
  { id: 'filter-quarter', label: 'This Quarter' },
  { id: 'filter-year', label: 'This Year' },
  { id: 'filter-custom', label: 'Custom' },
];

export default function AdminDateFilter() {
  const [active, setActive] = useState('filter-month');

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-md">
        {periods?.map(p => (
          <button
            key={p?.id}
            onClick={() => setActive(p?.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              active === p?.id
                ? 'bg-emerald-500/20 text-[#00E599] font-bold border border-emerald-500/30 shadow-[0_0_12px_rgba(0,229,153,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {p?.label}
          </button>
        ))}
      </div>
      {active === 'filter-custom' && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="date" className="input-base h-8 text-xs pl-7 w-36 bg-[#0B1528] text-white border-white/10" defaultValue="2026-09-01" />
          </div>
          <span className="text-xs text-slate-400">to</span>
          <div className="relative">
            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="date" className="input-base h-8 text-xs pl-7 w-36 bg-[#0B1528] text-white border-white/10" defaultValue="2026-09-21" />
          </div>
          <button className="btn-primary text-xs px-3 py-1.5">Apply</button>
        </div>
      )}
    </div>
  );
}