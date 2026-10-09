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
import { AlertCircle, CheckCircle2, ArrowRight, User, MapPin, Users, FileText, Banknote } from 'lucide-react';

export default function MemberDashboardPage() {
  const { user, loading, userRole, isAccountant } = useAuth();
  const [member, setMember] = useState<any>(null);
  const [memberLoading, setMemberLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router?.replace('/');
      return;
    }
    if (user) {
      const email = user.email?.toLowerCase();
      if (email === 'bimaeteng4@gmail.com' || userRole === 'accountant' || isAccountant) {
        router?.replace('/accountant-dashboard');
        return;
      }
      loadMember();
    }
  }, [user, loading, userRole, isAccountant]);

  async function loadMember() {
    try {
      // 1. Try Supabase by user_id
      let { data } = await supabase?.from('members')?.select('*')?.eq('user_id', user?.id)?.maybeSingle();

      // 2. If not found by user_id, try by email (provisioned by admin before first auth login)
      if (!data && user?.email) {
        const { data: byEmail } = await supabase
          .from('members')
          .select('*')
          .ilike('email', user.email)
          .maybeSingle();

        if (byEmail) {
          data = byEmail;
          // Auto-link user_id to the member row
          if (!byEmail.user_id && user.id) {
            await supabase.from('members').update({ user_id: user.id }).eq('id', byEmail.id);
          }
        }
      }

      // 3. Fallback to localStorage cache
      if (!data && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`climps_member_profile_${user?.id}`);
          if (cached) {
            data = JSON.parse(cached);
          } else {
            const rawMembers = localStorage.getItem('climps_admin_members');
            if (rawMembers) {
              const parsed = JSON.parse(rawMembers);
              const found = parsed.find((m: any) =>
                m.user_id === user?.id ||
                (m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase())
              );
              if (found) {
                data = {
                  ...found,
                  first_name: found.first_name,
                  last_name: found.last_name,
                  phone: found.phone,
                  address: found.address,
                  nok_name: found.nok_name,
                  id_number: found.id_number,
                  monthly_contribution: found.monthly_contribution_amount || found.monthly_contribution,
                  member_number: found.member_number,
                };
              }
            }
          }
        } catch (e) {
          console.warn('Local storage member retrieval notice:', e);
        }
      }

      setMember(data);
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

  // Profile completion checklist
  const profileChecklist = [
    { label: 'Personal Info', done: !!(member?.first_name && member?.last_name && member?.phone), icon: <User size={13} /> },
    { label: 'Address & Location', done: !!(member?.address), icon: <MapPin size={13} /> },
    { label: 'Next of Kin', done: !!(member?.nok_name), icon: <Users size={13} /> },
    { label: 'KYC Documents', done: !!(member?.id_number), icon: <FileText size={13} /> },
    { label: 'Monthly Contribution', done: !!(member?.monthly_contribution && Number(member?.monthly_contribution) > 0), icon: <Banknote size={13} /> },
  ];
  const completedSteps = profileChecklist.filter(s => s.done).length;
  const profileIncomplete = completedSteps < profileChecklist.length;

  const now = new Date();
  const hour = now?.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading || memberLoading) {
    return (
      <AppLayout role="member" memberName="Loading…" memberId="—">
        <div className="p-6 xl:p-8 space-y-6">
          <div className="h-8 w-64 bg-white/10 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6]?.map(i => <div key={i} className="h-32 bg-white/10 rounded-2xl animate-pulse" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="member" memberName={fullName} memberId={memberId}>
      <div className="p-6 xl:p-8 2xl:p-10 max-w-screen-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{greeting}, {firstName} 👋</h1>
              <span className="inline-flex items-center gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shadow-sm shadow-emerald-500/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              {dateStr} · Member ID: <span className="font-bold text-white font-tabular">{memberId}</span>
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
            Live data · Updated just now
          </div>
        </div>

        {/* ── Profile Completion Banner ── */}
        {profileIncomplete && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-md shadow-lg">
            <div className="relative">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 shrink-0 mt-0.5">
                    <AlertCircle size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm">Complete Your Profile to Activate Your Account</h3>
                    <p className="text-xs text-slate-300 mt-0.5 font-normal">
                      Your account was created by an admin. Fill in your remaining details to gain full access to all cooperative services.
                    </p>

                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-xs border border-white/10">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${(completedSteps / profileChecklist.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-2xs text-amber-300 font-bold whitespace-nowrap font-tabular">
                        {completedSteps}/{profileChecklist.length} completed
                      </span>
                    </div>

                    {/* Checklist */}
                    <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
                      {profileChecklist.map(item => (
                        <div key={item.label} className="flex items-center gap-1.5">
                          {item.done
                            ? <CheckCircle2 size={13} className="text-[#00E599] shrink-0" />
                            : <div className="w-3 h-3 rounded-full border border-amber-400/60 bg-amber-400/20 shrink-0" />
                          }
                          <span className={`text-2xs ${item.done ? 'text-slate-500 line-through' : 'text-slate-300 font-medium'}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/member-dashboard/profile')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95 shrink-0 self-start"
                >
                  Complete Profile
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KPI Bento */}
        <MemberKPIBento member={member} />

        {/* Quick Actions */}
        <MemberQuickActions />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <MemberSavingsSection member={member} />
            <MemberLoanSection member={member} />
            <MemberTransactionsTable member={member} />
          </div>
          <div className="space-y-6">
            <MemberInvestmentSection member={member} />
            <MemberUpcomingObligations member={member} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}