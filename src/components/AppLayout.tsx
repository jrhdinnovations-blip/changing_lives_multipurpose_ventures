'use client';
import React, { useState, useEffect } from 'react';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

import { useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  role?: 'member' | 'admin' | 'staff' | 'manager';
  memberName?: string;
  memberId?: string;
}

export default function AppLayout({
  children,
  role: roleProp,
  memberName: memberNameProp,
  memberId: memberIdProp,
}: AppLayoutProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, profile, loading } = useAuth();
  const [resolvedName, setResolvedName] = useState(memberNameProp || '');
  const [resolvedId, setResolvedId] = useState(memberIdProp || '');
  const [resolvedRole, setResolvedRole] = useState<'member' | 'admin' | 'staff' | 'manager'>(
    roleProp || (profile?.role === 'super_admin' ? 'admin' : (profile?.role as any) || 'member')
  );

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (memberNameProp && memberIdProp) {
      setResolvedName(memberNameProp);
      setResolvedId(memberIdProp);
      if (roleProp) setResolvedRole(roleProp);
      return;
    }

    if (!user) return;

    // Resolve real user information
    async function resolveUserData() {
      try {
        const supabase = createClient();
        let { data: member } = await supabase
          .from('members')
          .select('first_name, last_name, member_number')
          .eq('user_id', user!.id)
          .maybeSingle();

        if (!member && user!.email) {
          const { data: byEmail } = await supabase
            .from('members')
            .select('first_name, last_name, member_number')
            .ilike('email', user!.email)
            .maybeSingle();
          member = byEmail;
        }

        const fullName = member
          ? `${member.first_name} ${member.last_name}`
          : user!.user_metadata?.full_name || user!.email?.split('@')[0] || 'Member';
        const mId = member?.member_number || user!.user_metadata?.member_number || '—';

        setResolvedName(memberNameProp || fullName);
        setResolvedId(memberIdProp || mId);

        if (!roleProp) {
          const uRole = profile?.role === 'super_admin' ? 'admin' : (profile?.role as any) || 'member';
          setResolvedRole(uRole);
        }
      } catch (e) {
        console.warn('Error resolving layout user info:', e);
      }
    }

    resolveUserData();
  }, [user, profile, memberNameProp, memberIdProp, roleProp]);

  return (
    <div className="min-h-screen bg-[#070c18] flex">
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
        <main className="flex-1 pt-16 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}