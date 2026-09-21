import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminKPISection from './components/AdminKPISection';
import AdminChartsGrid from './components/AdminChartsGrid';
import AdminPendingQueue from './components/AdminPendingQueue';
import AdminOverdueAlerts from './components/AdminOverdueAlerts';
import AdminRecentActivity from './components/AdminRecentActivity';
import AdminDateFilter from './components/AdminDateFilter';

export default function AdminDashboardPage() {
  return (
    <AppLayout role="admin" memberName="Chukwuemeka Adeyemi" memberId="ADM/2026/0003">
      <div className="p-6 xl:p-8 2xl:p-10 max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monday, 21 September 2026 · CLIMPS Cooperative Operations Centre
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Live · Updated just now
            </div>
          </div>
        </div>

        {/* Date filter */}
        <AdminDateFilter />

        {/* KPI Sections */}
        <AdminKPISection />

        {/* Charts Grid */}
        <AdminChartsGrid />

        {/* Bottom grid: queues + alerts + activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <AdminPendingQueue />
            <AdminRecentActivity />
          </div>
          <div>
            <AdminOverdueAlerts />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}