'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Wallet,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SavingsChart = dynamic(() => import('./SavingsChart'), { ssr: false });

interface MemberSavingsSectionProps {
  member?: any;
}

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MemberSavingsSection({ member: memberProp }: MemberSavingsSectionProps) {
  const [activeTab, setActiveTab] = useState<'accounts' | 'chart'>('accounts');
  const [loading, setLoading] = useState(true);
  const [savingsAccount, setSavingsAccount] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [currentMonthStatus, setCurrentMonthStatus] = useState<string>('unpaid');
  const [chartData, setChartData] = useState<{ month: string; balance: number; contributions: number }[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    loadSavingsData();
  }, [user, memberProp]);

  async function loadSavingsData() {
    setLoading(true);
    try {
      let member = memberProp;
      if (!member && user) {
        const { data } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        member = data;

        if (!member && user.email) {
          const { data: byEmail } = await supabase
            .from('members')
            .select('*')
            .ilike('email', user.email)
            .maybeSingle();
          member = byEmail;
        }
      }

      if (!member) {
        setLoading(false);
        return;
      }

      // Fetch regular savings account
      const { data: acc } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('member_id', member.id)
        .maybeSingle();
      setSavingsAccount(acc);

      // Fetch contributions
      const { data: contribs } = await supabase
        .from('contributions')
        .select('*')
        .eq('member_id', member.id)
        .order('contribution_year', { ascending: true })
        .order('contribution_month', { ascending: true });

      const contribList = contribs || [];
      setContributions(contribList);

      // Current month status
      const now = new Date();
      const current = contribList.find(
        c => c.contribution_month === now.getMonth() + 1 && c.contribution_year === now.getFullYear()
      );
      if (current) {
        setCurrentMonthStatus(current.contribution_status || 'unpaid');
      } else {
        const hasCommitment = Number(member.monthly_contribution_amount || member.monthly_contribution || 0) > 0;
        setCurrentMonthStatus(hasCommitment ? 'unpaid' : 'none');
      }

      // Build chart data from paid contributions if any
      const paidContribs = contribList.filter(c => c.contribution_status === 'paid' && Number(c.amount_paid) > 0);
      if (paidContribs.length > 0) {
        let runningTotal = 0;
        const cData = paidContribs.map(c => {
          runningTotal += Number(c.amount_paid || 0);
          const date = new Date(c.contribution_year, c.contribution_month - 1, 1);
          const monthStr = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          return {
            month: monthStr,
            balance: runningTotal,
            contributions: Number(c.amount_paid || 0),
          };
        });
        setChartData(cData);
      } else {
        setChartData([]);
      }
    } catch (e) {
      console.error('Error loading savings section data:', e);
    } finally {
      setLoading(false);
    }
  }

  // Calculate real balances
  const paidContributionsSum = contributions
    .filter(c => c.contribution_status === 'paid')
    .reduce((sum, c) => sum + (Number(c.amount_paid) || 0), 0);

  const monthlyContribBalance = paidContributionsSum > 0
    ? paidContributionsSum
    : Number(memberProp?.total_contributions) || 0;

  const regularSavingsBalance = Number(savingsAccount?.balance) || 0;
  const accruedInterest = Number(savingsAccount?.accrued_interest) || 0;
  const totalCooperativeSavings = Number(memberProp?.total_savings) || (monthlyContribBalance + regularSavingsBalance);
  const loanCreditLimit = monthlyContribBalance * 2.5;

  const now = new Date();
  const currentMonthName = now.toLocaleString('default', { month: 'long' });

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Savings Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Your Monthly Contribution and Regular Savings balances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/save/regular"
            className="btn-outline text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-teal-700 border-teal-200 hover:bg-teal-50"
          >
            <Wallet size={13} />
            Regular Wallet
          </Link>
          <Link
            href="/save/contributions"
            className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          >
            <Calendar size={13} />
            Pay Dues
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4 border border-slate-200">
        {(['accounts', 'chart'] as const).map((tab) => (
          <button
            key={`savings-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 capitalize ${
              activeTab === tab
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab === 'accounts' ? 'Savings Accounts' : 'Growth Trend Chart'}
          </button>
        ))}
      </div>

      {activeTab === 'accounts' && (
        <div className="space-y-3">
          {/* Account 1: Monthly Cooperative Contribution */}
          <Link
            href="/save/contributions"
            className="block p-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-white hover:border-blue-400 transition-all shadow-xs group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      Monthly Cooperative Contribution
                    </p>
                    <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-blue-100 text-blue-800">
                      Mandatory
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    9.0% p.a. + Annual Surplus Dividends • Due 5th monthly
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-base font-black text-slate-900 font-tabular">{fmt(monthlyContribBalance)}</p>
                <span className={`text-[11px] font-bold ${
                  currentMonthStatus === 'paid' ? 'text-emerald-600' :
                  currentMonthStatus === 'partially_paid' ? 'text-amber-600' :
                  currentMonthStatus === 'none' ? 'text-slate-400' : 'text-red-600'
                }`}>
                  {currentMonthStatus === 'paid' ? `${currentMonthName} Paid` :
                   currentMonthStatus === 'partially_paid' ? `${currentMonthName} Partial` :
                   currentMonthStatus === 'none' ? 'No monthly plan set' : `${currentMonthName} Unpaid`}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-blue-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Unlocks 2.5× Loan Multiplier ({fmt(loanCreditLimit)} credit limit)</span>
              <span className="text-blue-600 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                View Schedule <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Account 2: Regular Savings Account */}
          <Link
            href="/save/regular"
            className="block p-4 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/60 via-white to-white hover:border-teal-400 transition-all shadow-xs group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      Regular Savings Account
                    </p>
                    <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-teal-100 text-teal-800">
                      Liquid
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    7.0% p.a. Compounded Quarterly • Up to 2 withdrawals/month
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-base font-black text-slate-900 font-tabular">{fmt(regularSavingsBalance)}</p>
                <span className="text-[11px] text-teal-700 font-bold">Available Balance</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-teal-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Accrued Interest: +{fmt(accruedInterest)}</span>
              <span className="text-teal-700 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Deposit & Withdraw <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Combined Total Summary */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between px-1">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Cooperative Savings</p>
              <p className="text-xs text-emerald-700 font-bold">Insured by Changing Lives Multipurpose</p>
            </div>
            <p className="text-lg font-black text-emerald-600 font-tabular">{fmt(totalCooperativeSavings)}</p>
          </div>
        </div>
      )}

      {activeTab === 'chart' && <SavingsChart data={chartData} />}
    </div>
  );
}