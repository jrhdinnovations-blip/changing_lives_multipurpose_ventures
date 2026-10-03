'use client';
import React from 'react';
import Link from 'next/link';
import { TrendingUp, Users, PiggyBank, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminChartsGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Cooperative Capital Health Card */}
      <div className="lg:col-span-2 bg-[#0b1329] border border-white/10 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <PiggyBank size={16} />
              </div>
              <h3 className="text-sm font-bold text-white">Cooperative Capital Allocation & Pool</h3>
            </div>
            <p className="text-xs text-white/50 mt-1">Live summary of members savings and scheduled monthly cashflow</p>
          </div>
          <Link
            href="/financial-statements"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Detailed Statements <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-2xs text-white/50 uppercase tracking-wider font-semibold">Active Savings Inflow</span>
            <p className="text-lg font-bold text-white mt-1">₦130,000 / mo</p>
            <span className="text-2xs text-emerald-400 font-medium mt-1 inline-block">100% on schedule</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-2xs text-white/50 uppercase tracking-wider font-semibold">Outstanding Loans</span>
            <p className="text-lg font-bold text-white mt-1">₦0.00</p>
            <span className="text-2xs text-white/40 mt-1 inline-block">0 active disbursements</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-2xs text-white/50 uppercase tracking-wider font-semibold">Reserve Fund Ratio</span>
            <p className="text-lg font-bold text-white mt-1">100% Liquidity</p>
            <span className="text-2xs text-blue-400 font-medium mt-1 inline-block">Zero risk exposure</span>
          </div>
        </div>

        {/* Progress Bar of Capital Health */}
        <div className="space-y-2">
          <div className="flex justify-between text-2xs text-white/60">
            <span>Cooperative Solvency Index</span>
            <span className="font-semibold text-emerald-400">Optimal (100%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Governance & Compliance Overview */}
      <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck size={16} />
            </div>
            <h3 className="text-sm font-bold text-white">Governance & Audit</h3>
          </div>
          <p className="text-xs text-white/50 mb-5">Current administrative posture and compliance status</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-white/70">Lead Administrator</span>
              <span className="text-xs font-semibold text-white">Raymond Longdiem</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-white/70">Database Status</span>
              <span className="text-xs font-semibold text-emerald-400">Live & Synchronized</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-white/70">Cooperative ID</span>
              <span className="text-xs font-mono text-white/60">ADM/2026/0001</span>
            </div>
          </div>
        </div>

        <Link
          href="/admin-dashboard/staff"
          className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
        >
          <span>Manage Staff & Access</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}