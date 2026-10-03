'use client';
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AdminOverdueAlerts() {
  return (
    <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <ShieldCheck size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Credit Risk & Delinquency</h2>
          <p className="text-2xs text-white/50">Portfolio health & overdue tracking</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
          <CheckCircle2 size={15} />
          <span>Zero Delinquent Facilities</span>
        </div>
        <p className="text-2xs text-white/50">
          All cooperative accounts are in good standing. No loans are currently overdue or flagged for recovery.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-2xs text-white/40">Default Rate: 0.0%</span>
        <Link
          href="/admin-dashboard/loans"
          className="text-2xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          View Loan Ledger <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}