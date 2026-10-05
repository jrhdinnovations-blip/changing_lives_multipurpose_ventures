'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

const STAGES = [
  { key: 'pending', title: 'Pending Review', desc: 'Application received and queued for initial verification' },
  { key: 'under_review', title: 'Under Review', desc: 'Documents and identity verification in progress by admissions committee' },
  { key: 'approved', title: 'Approved', desc: 'Membership approved; account ready for initial activation' },
  { key: 'active', title: 'Active Member', desc: 'Full cooperative access granted with savings and loan facilities' },
];

export default function OnboardingPendingPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  async function fetchStatus() {
    if (!user) return;
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setMember(data);

      // If already active or approved, offer quick redirect
      if (data?.membership_status === 'active') {
        // can auto-route or let user click
      }
    } catch (err) {
      console.error('Error fetching member status:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchStatus();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading your membership status...</p>
        </div>
      </div>
    );
  }

  const currentStatus = member?.membership_status || 'pending';
  const stageIndex = STAGES.findIndex(s => s.key === currentStatus);
  const activeIndex = stageIndex >= 0 ? stageIndex : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Image
            src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
            alt="CLIMPS Logo"
            width={36}
            height={36}
            className="rounded-xl object-cover"
          />
          <span className="font-bold text-lg text-white tracking-tight">CLIMPS</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStatus()}
            disabled={refreshing}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10 flex items-center gap-1.5"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => signOut()}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-all border border-red-500/30"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {/* Status Header Badge */}
            <div className="text-center mb-8">
              {currentStatus === 'active' || currentStatus === 'approved' ? (
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {currentStatus === 'active'
                  ? 'Membership Active!'
                  : currentStatus === 'approved'
                  ? 'Application Approved!'
                  : 'Application Under Review'}
              </h1>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {currentStatus === 'active'
                  ? 'Your membership is active and all cooperative features are now available.'
                  : currentStatus === 'approved'
                  ? 'Your application has been approved by the administrators. Click below to enter your dashboard.'
                  : 'Thank you for submitting your KYC registration. Our admissions committee is verifying your documents.'}
              </p>

              {/* Member ID Badge */}
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-mono">
                <span className="text-slate-400">Application / Member ID:</span>
                <span className="text-primary font-bold">
                  {member?.member_number || `CLMV/2026/PENDING-${user?.id?.slice(0, 4)?.toUpperCase()}`}
                </span>
              </div>
            </div>

            {/* Approval Workflow Stepper */}
            <div className="mb-10 bg-black/20 rounded-2xl p-6 border border-white/5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
                Membership Approval Workflow
              </h3>

              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10 -z-0 hidden sm:block" />

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
                  {STAGES.map((stg, i) => {
                    const isDone = i < activeIndex;
                    const isCurrent = i === activeIndex;

                    return (
                      <div key={stg.key} className="flex flex-col sm:items-center text-left sm:text-center">
                        <div className="flex items-center gap-3 sm:block">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 sm:mx-auto mb-2 ${
                              isDone
                                ? 'bg-accent text-white shadow-lg shadow-accent/30'
                                : isCurrent
                                ? 'bg-primary text-white ring-4 ring-primary/30 shadow-lg shadow-primary/30 animate-pulse'
                                : 'bg-white/10 text-slate-500 border border-white/10'
                            }`}
                          >
                            {isDone ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span>{i + 1}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{stg.title}</div>
                            <div className="text-[11px] text-slate-400 sm:mt-1 max-w-[130px] sm:mx-auto hidden sm:block">
                              {stg.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Application Summary Box */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-8">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <span className="text-xs font-medium text-slate-400">Applicant Details</span>
                <span className="text-xs text-accent font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  KYC Submitted
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Full Name</span>
                  <span className="text-white font-medium">
                    {[member?.first_name, member?.middle_name, member?.last_name].filter(Boolean).join(' ') || user?.email}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Email Address</span>
                  <span className="text-white font-medium">{user?.email}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Phone Number</span>
                  <span className="text-white font-medium">{member?.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">State / LGA</span>
                  <span className="text-white font-medium">
                    {member?.state ? `${member.state}${member?.lga ? `, ${member.lga}` : ''}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Next of Kin</span>
                  <span className="text-white font-medium">
                    {member?.nok_name ? `${member.nok_name} (${member?.nok_relationship || 'Contact'})` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">ID Verification</span>
                  <span className="text-white font-medium">
                    {member?.id_type ? `${member.id_type} (Verified)` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps / CTA */}
            {currentStatus === 'active' || currentStatus === 'approved' ? (
              <button
                onClick={() => router.push('/member-dashboard')}
                className="w-full py-4 px-6 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-xl shadow-accent/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Member Dashboard</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-xs text-slate-300">
                  <p className="font-semibold text-primary mb-1">What happens next?</p>
                  <p>
                    Cooperative administrators will review your credentials within 24 hours. Once approved, you will receive an email confirmation and can immediately access member savings, contributions, and loan applications.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2">
                  <span>Questions or urgent request?</span>
                  <a href="mailto:support@climps.com" className="text-primary hover:underline font-medium">
                    Contact Admissions
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
