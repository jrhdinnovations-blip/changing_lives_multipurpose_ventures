'use client';
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AdminOverdueAlerts() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600">
          <ShieldCheck size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Credit Risk & Delinquency</h2>
          <p className="text-2xs text-slate-500">Portfolio health & overdue tracking</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs mb-1">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>Zero Delinquent Facilities</span>
        </div>
        <p className="text-2xs text-emerald-700 font-medium">
          All cooperative accounts are in good standing. No loans are currently overdue or flagged for recovery.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-2xs font-semibold text-slate-500">Default Rate: 0.0%</span>
        <Link
          href="/admin-dashboard/loans"
          className="text-2xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          View Loan Ledger <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}