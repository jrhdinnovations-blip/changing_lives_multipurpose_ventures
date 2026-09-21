'use client';
import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';

interface AppLayoutProps {
  children: React.ReactNode;
  role?: 'member' | 'admin' | 'staff' | 'manager';
  memberName?: string;
  memberId?: string;
}

export default function AppLayout({
  children,
  role = 'member',
  memberName = 'Adaeze Okonkwo',
  memberId = 'CLMV/2026/0047',
}: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar
        role={role}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        memberName={memberName}
        memberId={memberId}
      />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '68px' : '260px' }}
      >
        <AppTopbar
          memberName={memberName}
          memberId={memberId}
          role={role}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 pt-16 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}