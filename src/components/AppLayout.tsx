'use client';
import React, { useState, useEffect } from 'react';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  role?: 'member' | 'admin' | 'staff' | 'manager' | 'accountant';
  memberName?: string;
  memberId?: string;
}

const KNOWN_USERS: Record<string, { name: string; id: string; role: 'admin' | 'accountant' | 'member' }> = {
  'plangnansamson@gmail.com': { name: 'Plangnan Samson', id: 'ADM/CLM/0001', role: 'admin' },
  'raymondlongdiem22@gmail.com': { name: 'Raymond Longdiem', id: 'ADM/2026/0001', role: 'admin' },
  'bimaeteng4@gmail.com': { name: 'Bima Josiah Emmanuel', id: 'ACCT/CLM/0013', role: 'accountant' },
};

export default function AppLayout({
  children,
  role: roleProp,
  memberName: memberNameProp,
  memberId: memberIdProp,
}: AppLayoutProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, profile, loading, userRole } = useAuth();

  const computeRole = (): 'member' | 'admin' | 'staff' | 'manager' | 'accountant' => {
    const emailLower = user?.email?.toLowerCase();
    if (emailLower && KNOWN_USERS[emailLower]) {
      return KNOWN_USERS[emailLower].role;
    }
    if (userRole) {
      if (userRole === 'super_admin' || userRole === 'admin') return 'admin';
      if (userRole === 'accountant') return 'accountant';
      if (userRole === 'manager') return 'manager';
      if (userRole === 'staff') return 'staff';
      if (userRole === 'member') return 'member';
    }
    return roleProp || 'member';
  };

  const [resolvedName, setResolvedName] = useState(memberNameProp || '');
  const [resolvedId, setResolvedId] = useState(memberIdProp || '');
  const [resolvedRole, setResolvedRole] = useState<'member' | 'admin' | 'staff' | 'manager' | 'accountant'>(computeRole);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) {
      if (roleProp) setResolvedRole(roleProp);
      if (memberNameProp) setResolvedName(memberNameProp);
      if (memberIdProp) setResolvedId(memberIdProp);
      return;
    }

    const emailLower = user.email?.toLowerCase() || '';
    const known = KNOWN_USERS[emailLower];

    // Priority 1: User's authenticated role
    const activeRole = computeRole();
    setResolvedRole(activeRole);

    // Initial default name & ID from known profiles or metadata
    const defaultName = known?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || memberNameProp || 'Member';
    const defaultId = known?.id || user.user_metadata?.member_number || memberIdProp || '—';
    setResolvedName(defaultName);
    setResolvedId(defaultId);

    // Resolve real user information from DB
    async function resolveUserData() {
      try {
        const supabase = createClient();
        let { data: member } = await supabase
          .from('members')
          .select('first_name, last_name, membership_no, member_number')
          .eq('user_id', user!.id)
          .maybeSingle();

        if (!member && user!.email) {
          const { data: byEmail } = await supabase
            .from('members')
            .select('first_name, last_name, membership_no, member_number')
            .ilike('email', user!.email)
            .maybeSingle();
          member = byEmail;
        }

        if (member) {
          const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
          const mId = member.membership_no || member.member_number;
          if (fullName) setResolvedName(fullName);
          if (mId) setResolvedId(mId);
        } else if (profile?.full_name) {
          setResolvedName(profile.full_name);
        }
      } catch (e) {
        console.warn('Error resolving layout user info:', e);
      }
    }

    resolveUserData();
  }, [user, profile, userRole, roleProp, memberNameProp, memberIdProp]);

  return (
    <div className="min-h-screen bg-[#050B17] text-slate-100 flex selection:bg-emerald-500/30 selection:text-white">
      <AppSidebar
        role={resolvedRole}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        memberName={resolvedName || 'Member'}
        memberId={resolvedId || '—'}
      />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '68px' : '260px' }}
      >
        <AppTopbar
          memberName={resolvedName || 'Member'}
          memberId={resolvedId || '—'}
          role={resolvedRole}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 pt-16 overflow-x-hidden bg-[#050B17]">
          {children}
        </main>
      </div>
    </div>
  );
}