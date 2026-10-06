'use client';
import React from 'react';
import Link from 'next/link';
import { TrendingUp, Users, PiggyBank, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminChartsGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Cooperative Capital Health Card */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <PiggyBank size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cooperative Capital Allocation & Pool</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">Live summary of members savings and scheduled monthly cashflow</p>
          </div>
          <Link
            href="/financial-statements"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Detailed Statements <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-2xs text-slate-500 uppercase tracking-wider font-bold">Active Savings Inflow</span>
            <p className="text-lg font-black text-slate-900 mt-1 font-tabular">₦130,000 / mo</p>
            <span className="text-2xs text-emerald-600 font-bold mt-1 inline-block">100% on schedule</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-2xs text-slate-500 uppercase tracking-wider font-bold">Outstanding Loans</span>
            <p className="text-lg font-black text-slate-900 mt-1 font-tabular">₦0.00</p>
            <span className="text-2xs text-slate-400 mt-1 inline-block font-medium">0 active disbursements</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-2xs text-slate-500 uppercase tracking-wider font-bold">Reserve Fund Ratio</span>
            <p className="text-lg font-black text-slate-900 mt-1 font-tabular">100% Liquidity</p>
            <span className="text-2xs text-blue-600 font-bold mt-1 inline-block">Zero risk exposure</span>
          </div>
        </div>

        {/* Progress Bar of Capital Health */}
        <div className="space-y-2">
          <div className="flex justify-between text-2xs text-slate-600 font-semibold">
            <span>Cooperative Solvency Index</span>
            <span className="font-bold text-emerald-600">Optimal (100%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Governance & Compliance Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <ShieldCheck size={16} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Governance & Audit</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5">Current administrative posture and compliance status</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-600 font-medium">Lead Administrator</span>
              <span className="text-xs font-bold text-slate-900">Raymond Longdiem</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-600 font-medium">Database Status</span>
              <span className="text-xs font-bold text-emerald-600">Live & Synchronized</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-600 font-medium">Cooperative ID</span>
              <span className="text-xs font-mono font-bold text-slate-700">ADM/2026/0001</span>
            </div>
          </div>
        </div>

        <Link
          href="/admin-dashboard/staff"
          className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition-all"
        >
          <span>Manage Staff & Access</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}