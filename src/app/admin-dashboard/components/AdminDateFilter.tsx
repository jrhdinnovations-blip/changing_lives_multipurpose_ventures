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
      <div className="flex items-center gap-1.5 bg-white/[0.06] rounded-xl p-1">
        {periods?.map(p => (
          <button
            key={p?.id}
            onClick={() => setActive(p?.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              active === p?.id
                ? 'bg-[#0d1527] text-emerald-400 card-shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {p?.label}
          </button>
        ))}
      </div>
      {active === 'filter-custom' && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input type="date" className="input-base h-8 text-xs pl-7 w-36" defaultValue="2026-09-01" />
          </div>
          <span className="text-xs text-white/50">to</span>
          <div className="relative">
            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input type="date" className="input-base h-8 text-xs pl-7 w-36" defaultValue="2026-09-21" />
          </div>
          <button className="btn-primary text-xs px-3 py-1.5">Apply</button>
        </div>
      )}
    </div>
  );
}