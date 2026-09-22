'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function RootPage() {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/landing');
      return;
    }

    // Role-based routing for authenticated users
    if (['super_admin', 'admin', 'manager', 'staff'].includes(userRole)) {
      router.replace('/admin-dashboard');
      return;
    }

    // Member KYC status check
    (async () => {
      try {
        const { data: member } = await supabase
          .from('members')
          .select('kyc_completed, membership_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!member || !member.kyc_completed) {
          router.replace('/onboarding');
        } else if (['pending', 'under_review'].includes(member.membership_status)) {
          router.replace('/onboarding/pending');
        } else {
          router.replace('/member-dashboard');
        }
      } catch {
        router.replace('/member-dashboard');
      }
    })();
  }, [user, loading, userRole, router, supabase]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading CLIMPS...</p>
      </div>
    </div>
  );
}