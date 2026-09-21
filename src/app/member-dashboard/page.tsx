'use client';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import MemberKPIBento from './components/MemberKPIBento';
import MemberSavingsSection from './components/MemberSavingsSection';
import MemberLoanSection from './components/MemberLoanSection';
import MemberInvestmentSection from './components/MemberInvestmentSection';
import MemberTransactionsTable from './components/MemberTransactionsTable';
import MemberQuickActions from './components/MemberQuickActions';
import MemberUpcomingObligations from './components/MemberUpcomingObligations';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function MemberDashboardPage() {
  const { user, loading } = useAuth();
  const [member, setMember] = useState<any>(null);
  const [memberLoading, setMemberLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router?.replace('/');
      return;
    }
    if (user) loadMember();
  }, [user, loading]);

  async function loadMember() {
    try {
      const { data } = await supabase?.from('members')?.select('*')?.eq('user_id', user?.id)?.maybeSingle();
      setMember(data);
      // Gate: redirect to onboarding if KYC not completed
      if (data && !data?.kyc_completed) {
        router?.replace('/onboarding');
        return;
      }
    } catch {
      setMember(null);
    } finally {
      setMemberLoading(false);
    }
  }

  const fullName = member
    ? `${member?.first_name} ${member?.last_name}`
    : user?.user_metadata?.full_name || 'Member';
  const memberId = member?.member_number || '—';
  const firstName = member?.first_name || fullName?.split(' ')?.[0];

  const now = new Date();
  const hour = now?.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const dateStr = now?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading || memberLoading) {
    return (
      <AppLayout role="member" memberName="Loading…" memberId="—">
        <div className="p-6 xl:p-8 space-y-6">
          <div className="h-8 w-64 bg-muted rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6]?.map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="member" memberName={fullName} memberId={memberId}>
      <div className="p-6 xl:p-8 2xl:p-10 max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{greeting}, {firstName} 👋</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {dateStr} · Member ID: {memberId}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Live data · Updated just now
          </div>
        </div>

        {/* KPI Bento */}
        <MemberKPIBento />

        {/* Quick Actions */}
        <MemberQuickActions />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <MemberSavingsSection />
            <MemberLoanSection />
            <MemberTransactionsTable />
          </div>
          <div className="space-y-6">
            <MemberInvestmentSection />
            <MemberUpcomingObligations />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}