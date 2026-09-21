'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const SavingsGrowthChart = dynamic(() => import('./charts/SavingsGrowthChart'), { ssr: false });
const ContributionsBarChart = dynamic(() => import('./charts/ContributionsBarChart'), { ssr: false });
const LoanDisbursementChart = dynamic(() => import('./charts/LoanDisbursementChart'), { ssr: false });
const MemberGrowthChart = dynamic(() => import('./charts/MemberGrowthChart'), { ssr: false });

export default function AdminChartsGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-5">
      <div className="card-base 2xl:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Savings Portfolio Growth</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Total savings under management — 12 months</p>
          </div>
          <span className="badge-active text-2xs">+₦48M this month</span>
        </div>
        <SavingsGrowthChart />
      </div>

      <div className="card-base">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Monthly Contributions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Collected vs expected</p>
          </div>
        </div>
        <ContributionsBarChart />
      </div>

      <div className="card-base">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Loan Activity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Disbursements vs repayments</p>
          </div>
        </div>
        <LoanDisbursementChart />
      </div>

      <div className="card-base 2xl:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Member Growth</h3>
            <p className="text-xs text-muted-foreground mt-0.5">New registrations per month</p>
          </div>
        </div>
        <MemberGrowthChart />
      </div>
    </div>
  );
}