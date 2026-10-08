'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Banknote,
  Users,
  CreditCard,
  PiggyBank,
  Calendar,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// ── Types & Data ──────────────────────────────────────────────────────────────
function formatNGN(val: number) {
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}K`;
  return `₦${val.toLocaleString('en-NG')}`;
}

function formatNGNFull(val: number) {
  return '₦' + val.toLocaleString('en-NG');
}

type Period = 'this_month' | 'last_month' | 'q3_2026' | 'ytd_2026' | 'all_time';

const PERIOD_LABELS: Record<Period, string> = {
  this_month: 'September 2026',
  last_month: 'August 2026',
  q3_2026: 'Q3 2026 (Jul–Sep)',
  ytd_2026: 'Year-to-Date 2026',
  all_time: 'All Time',
};

// ── Mock summary data per period ───────────────────────────────────────────────
const SUMMARY_DATA: Record<Period, {
  totalSavings: number; savingsDelta: number;
  totalLoansOut: number; loansDelta: number;
  totalRepayments: number; repaymentsDelta: number;
  totalMembers: number; membersDelta: number;
  totalInvestments: number; investmentsDelta: number;
  totalInterestEarned: number; interestDelta: number;
  loansApproved: number; loansRejected: number;
  newMembers: number; activeLoans: number;
  overdueLoans: number; defaultRate: number;
}> = {
  this_month: {
    totalSavings: 141_200_000, savingsDelta: 4.8,
    totalLoansOut: 62_400_000, loansDelta: -2.1,
    totalRepayments: 18_750_000, repaymentsDelta: 12.4,
    totalMembers: 122, membersDelta: 1.6,
    totalInvestments: 34_800_000, investmentsDelta: 8.2,
    totalInterestEarned: 6_240_000, interestDelta: 5.5,
    loansApproved: 14, loansRejected: 3,
    newMembers: 2, activeLoans: 47,
    overdueLoans: 7, defaultRate: 3.2,
  },
  last_month: {
    totalSavings: 134_700_000, savingsDelta: 3.1,
    totalLoansOut: 63_750_000, loansDelta: 5.4,
    totalRepayments: 16_680_000, repaymentsDelta: 8.9,
    totalMembers: 120, membersDelta: 0.8,
    totalInvestments: 32_150_000, investmentsDelta: 3.7,
    totalInterestEarned: 5_913_000, interestDelta: 2.3,
    loansApproved: 18, loansRejected: 5,
    newMembers: 1, activeLoans: 51,
    overdueLoans: 9, defaultRate: 4.1,
  },
  q3_2026: {
    totalSavings: 141_200_000, savingsDelta: 11.2,
    totalLoansOut: 62_400_000, loansDelta: 6.8,
    totalRepayments: 52_110_000, repaymentsDelta: 22.5,
    totalMembers: 122, membersDelta: 4.3,
    totalInvestments: 34_800_000, investmentsDelta: 21.4,
    totalInterestEarned: 18_740_000, interestDelta: 14.8,
    loansApproved: 44, loansRejected: 11,
    newMembers: 6, activeLoans: 47,
    overdueLoans: 7, defaultRate: 3.2,
  },
  ytd_2026: {
    totalSavings: 141_200_000, savingsDelta: 26.7,
    totalLoansOut: 62_400_000, loansDelta: 18.3,
    totalRepayments: 187_440_000, repaymentsDelta: 31.2,
    totalMembers: 122, membersDelta: 19.6,
    totalInvestments: 34_800_000, investmentsDelta: 55.8,
    totalInterestEarned: 74_880_000, interestDelta: 28.4,
    loansApproved: 152, loansRejected: 38,
    newMembers: 22, activeLoans: 47,
    overdueLoans: 7, defaultRate: 3.2,
  },
  all_time: {
    totalSavings: 141_200_000, savingsDelta: 0,
    totalLoansOut: 62_400_000, loansDelta: 0,
    totalRepayments: 312_000_000, repaymentsDelta: 0,
    totalMembers: 122, membersDelta: 0,
    totalInvestments: 34_800_000, investmentsDelta: 0,
    totalInterestEarned: 187_200_000, interestDelta: 0,
    loansApproved: 412, loansRejected: 88,
    newMembers: 122, activeLoans: 47,
    overdueLoans: 7, defaultRate: 3.2,
  },
};

// ── Monthly portfolio trend data ───────────────────────────────────────────────
const MONTHLY_PORTFOLIO = [
  { month: 'Oct 25', savings: 112, loans: 44, investments: 12 },
  { month: 'Nov 25', savings: 117, loans: 47, investments: 14 },
  { month: 'Dec 25', savings: 121, loans: 50, investments: 17 },
  { month: 'Jan 26', savings: 108, loans: 53, investments: 19 },
  { month: 'Feb 26', savings: 114, loans: 55, investments: 21 },
  { month: 'Mar 26', savings: 120, loans: 57, investments: 24 },
  { month: 'Apr 26', savings: 124, loans: 59, investments: 26 },
  { month: 'May 26', savings: 128, loans: 61, investments: 29 },
  { month: 'Jun 26', savings: 130, loans: 60, investments: 31 },
  { month: 'Jul 26', savings: 133, loans: 61, investments: 32 },
  { month: 'Aug 26', savings: 135, loans: 64, investments: 32 },
  { month: 'Sep 26', savings: 141, loans: 62, investments: 35 },
];

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({
  label, value, sublabel, delta, icon: Icon, iconBg, iconColor,
}: {
  label: string;
  value: string;
  sublabel?: string;
  delta?: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/40">{label}</span>
        <span className={`p-2 rounded-xl border border-white/10 ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </span>
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
      {sublabel && (
        <div className="mt-1 text-xs text-white/50">{sublabel}</div>
      )}
      {delta !== undefined && delta !== 0 && (
        <div className={`mt-1 flex items-center gap-1 text-xs font-bold ${delta > 0 ? 'text-[#00E599]' : 'text-rose-400'}`}>
          {delta > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(delta)}% vs prior period
        </div>
      )}
      {delta === 0 && (
        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-white/50">
          <Minus size={13} />
          All-time cumulative
        </div>
      )}
    </div>
  );
}

// ── Simple SVG Bar Chart ──────────────────────────────────────────────────────
function MiniBarChart({ data, key1, key2, color1, color2, label1, label2 }: {
  data: typeof MONTHLY_PORTFOLIO;
  key1: keyof typeof MONTHLY_PORTFOLIO[0];
  key2?: keyof typeof MONTHLY_PORTFOLIO[0];
  color1: string;
  color2?: string;
  label1: string;
  label2?: string;
}) {
  const max = Math.max(...data.flatMap(d => [Number(d[key1]), key2 ? Number(d[key2]) : 0]));
  const W = 600, H = 140, padL = 36, padR = 10, padT = 10, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barGroupW = chartW / data.length;
  const barW = key2 ? barGroupW * 0.36 : barGroupW * 0.55;
  const gap = key2 ? barGroupW * 0.06 : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
      {/* Y-axis gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = padT + chartH * (1 - ratio);
        return (
          <g key={ratio}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={8} fill="#64748b">
              {Math.round(max * ratio)}M
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const cx = padL + i * barGroupW + barGroupW / 2;
        const h1 = (Number(d[key1]) / max) * chartH;
        const x1 = cx - (key2 ? barW + gap / 2 : barW / 2);

        return (
          <g key={i}>
            <rect x={x1} y={padT + chartH - h1} width={barW} height={h1} fill={color1} rx={3} opacity={0.85} />
            {key2 && (() => {
              const h2 = (Number(d[key2]) / max) * chartH;
              const x2 = cx + gap / 2;
              return <rect x={x2} y={padT + chartH - h2} width={barW} height={h2} fill={color2} rx={3} opacity={0.75} />;
            })()}
            <text x={cx} y={H - 4} textAnchor="middle" fontSize={8} fill="#94a3b8">
              {String(d.month)}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <circle cx={padL + 6} cy={padT + 4} r={4} fill={color1} />
      <text x={padL + 14} y={padT + 8} fontSize={9} fill="#cbd5e1" fontWeight="600">{label1}</text>
      {key2 && color2 && label2 && (
        <>
          <circle cx={padL + 80} cy={padT + 4} r={4} fill={color2} />
          <text x={padL + 88} y={padT + 8} fontSize={9} fill="#cbd5e1" fontWeight="600">{label2}</text>
        </>
      )}
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [period, setPeriod] = useState<Period>('this_month');
  const d = SUMMARY_DATA[period];

  const handleExport = (type: 'csv' | 'print') => {
    if (type === 'print') {
      window.print();
      return;
    }
    const rows = [
      ['Metric', 'Value'],
      ['Period', PERIOD_LABELS[period]],
      ['Total Savings Portfolio', formatNGNFull(d.totalSavings)],
      ['Active Loans Outstanding', formatNGNFull(d.totalLoansOut)],
      ['Repayments Collected', formatNGNFull(d.totalRepayments)],
      ['Total Members', String(d.totalMembers)],
      ['Total Investments', formatNGNFull(d.totalInvestments)],
      ['Interest Earned', formatNGNFull(d.totalInterestEarned)],
      ['Loans Approved', String(d.loansApproved)],
      ['Loans Rejected', String(d.loansRejected)],
      ['Active Loan Accounts', String(d.activeLoans)],
      ['Overdue Accounts', String(d.overdueLoans)],
      ['Default Rate (%)', String(d.defaultRate)],
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climps_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout role="admin" memberName="Raymond Longdiem" memberId="ADM/2026/0001">
      <div className="p-6 xl:p-8 2xl:p-10 max-w-screen-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <BarChart3 size={24} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Financial Reports
              </h1>
            </div>
            <p className="text-sm text-white/40 mt-1 font-medium">
              Cooperative performance metrics, portfolio health, and financial position summaries.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport('csv')}
              className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('print')}
              className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Printer size={14} />
              Print
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-white/40 mr-1 flex items-center gap-1.5">
            <Calendar size={13} />
            Report Period:
          </span>
          {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                period === key
                  ? 'bg-[#00E599] text-[#050B17] font-black shadow-lg shadow-[#00E599]/20'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            label="Savings Portfolio"
            value={formatNGN(d.totalSavings)}
            sublabel="Combined thrift & voluntary"
            delta={d.savingsDelta}
            icon={PiggyBank}
            iconBg="bg-emerald-500/15"
            iconColor="text-[#00E599]"
          />
          <KPICard
            label="Loans Outstanding"
            value={formatNGN(d.totalLoansOut)}
            sublabel={`${d.activeLoans} active accounts`}
            delta={d.loansDelta}
            icon={CreditCard}
            iconBg="bg-[#00E599]/15"
            iconColor="text-amber-400"
          />
          <KPICard
            label="Repayments Collected"
            value={formatNGN(d.totalRepayments)}
            sublabel="Principal + interest"
            delta={d.repaymentsDelta}
            icon={Banknote}
            iconBg="bg-blue-500/15"
            iconColor="text-blue-400"
          />
          <KPICard
            label="Total Members"
            value={String(d.totalMembers)}
            sublabel={`${d.newMembers} new this period`}
            delta={d.membersDelta}
            icon={Users}
            iconBg="bg-indigo-500/15"
            iconColor="text-indigo-400"
          />
          <KPICard
            label="Investments (IC)"
            value={formatNGN(d.totalInvestments)}
            sublabel="Investors Circle portfolio"
            delta={d.investmentsDelta}
            icon={TrendingUp}
            iconBg="bg-teal-500/15"
            iconColor="text-teal-400"
          />
          <KPICard
            label="Interest Earned"
            value={formatNGN(d.totalInterestEarned)}
            sublabel="From loans & investments"
            delta={d.interestDelta}
            icon={BarChart3}
            iconBg="bg-purple-500/15"
            iconColor="text-purple-400"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Savings vs Loans trend */}
          <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white">Portfolio Trend (₦M) — 12 Months</h3>
              <p className="text-xs text-white/40 mt-0.5 font-medium">Savings, Loans & Investments month-by-month</p>
            </div>
            <MiniBarChart
              data={MONTHLY_PORTFOLIO}
              key1="savings"
              key2="loans"
              color1="#00E599"
              color2="#f59e0b"
              label1="Savings"
              label2="Loans"
            />
          </div>

          {/* Investment vs Repayments */}
          <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white">Investments vs Repayments (₦M)</h3>
              <p className="text-xs text-white/40 mt-0.5 font-medium">Capital recycling & investor portfolio growth</p>
            </div>
            <MiniBarChart
              data={MONTHLY_PORTFOLIO}
              key1="investments"
              color1="#38bdf8"
              label1="Investments"
            />
          </div>
        </div>

        {/* Loan & Operations Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Loan Activity Summary */}
          <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/20 backdrop-blur-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Loan Activity Summary</h3>
              <p className="text-xs text-white/40 font-medium">For {PERIOD_LABELS[period]}</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Applications Approved', val: d.loansApproved, color: 'text-[#00E599]', bar: 'bg-[#00E599]' },
                { label: 'Applications Rejected', val: d.loansRejected, color: 'text-rose-400', bar: 'bg-rose-500' },
                { label: 'Active Loan Accounts', val: d.activeLoans, color: 'text-blue-400', bar: 'bg-blue-500' },
                { label: 'Overdue Accounts', val: d.overdueLoans, color: 'text-amber-400', bar: 'bg-[#00E599]' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40 font-medium">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.val}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.bar}`}
                      style={{ width: `${Math.min(100, (item.val / Math.max(d.loansApproved, d.activeLoans)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-white/40 font-medium">Portfolio Default Rate</span>
                <span className={`font-bold ${d.defaultRate > 5 ? 'text-rose-400' : d.defaultRate > 3 ? 'text-amber-400' : 'text-[#00E599]'}`}>
                  {d.defaultRate}%
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${d.defaultRate > 5 ? 'bg-rose-500' : d.defaultRate > 3 ? 'bg-[#00E599]' : 'bg-[#00E599]'}`}
                  style={{ width: `${d.defaultRate * 10}%` }}
                />
              </div>
              <p className="text-2xs text-white/50 mt-1">
                Industry benchmark: &lt;5% is healthy
              </p>
            </div>
          </div>

          {/* Financial Position */}
          <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/20 backdrop-blur-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Financial Position</h3>
              <p className="text-xs text-white/40 font-medium">Cooperative balance sheet snapshot</p>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Savings Liability', val: d.totalSavings, note: 'Owed to members', neg: true },
                { label: 'Loans Receivable', val: d.totalLoansOut, note: 'Outstanding principal', neg: false },
                { label: 'Investment Portfolio', val: d.totalInvestments, note: 'IC capital deployed', neg: false },
                { label: 'Interest Earned', val: d.totalInterestEarned, note: 'Revenue generated', neg: false },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-start py-2 border-b border-white/5">
                  <div>
                    <div className="font-semibold text-white text-xs">{item.label}</div>
                    <div className="text-2xs text-white/40">{item.note}</div>
                  </div>
                  <div className={`font-bold text-sm tabular-nums ${item.neg ? 'text-rose-400' : 'text-[#00E599]'}`}>
                    {item.neg ? '(' : ''}{formatNGN(item.val)}{item.neg ? ')' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Member Growth Breakdown */}
          <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 shadow-xl shadow-black/20 backdrop-blur-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Member Breakdown</h3>
              <p className="text-xs text-white/40 font-medium">Roster composition & status</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Active Members', count: 98, total: d.totalMembers, color: 'bg-[#00E599]' },
                { label: 'Pending KYC', count: 14, total: d.totalMembers, color: 'bg-[#00E599]' },
                { label: 'Under Review', count: 6, total: d.totalMembers, color: 'bg-blue-500' },
                { label: 'Suspended', count: 4, total: d.totalMembers, color: 'bg-rose-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40 font-medium">{item.label}</span>
                    <span className="font-bold text-white">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${(item.count / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40 font-medium">Total Staff / Officers</span>
                <span className="font-bold text-white">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 font-medium">New Members This Period</span>
                <span className="font-bold text-[#00E599]">+{d.newMembers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-xs text-white/40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
          <BarChart3 size={14} className="shrink-0 text-[#00E599]" />
          <span>
            Reports are generated from live cooperative data. All financial figures are in Nigerian Naira (₦).
            For audited financial statements, contact your cooperative accountant or use the Audit Logs page.
          </span>
        </div>

      </div>
    </AppLayout>
  );
}
