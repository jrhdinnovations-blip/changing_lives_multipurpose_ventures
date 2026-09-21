'use client';
import React, { useState } from 'react';
import { Bell, Search, ChevronDown, Settings, LogOut, User, HelpCircle } from 'lucide-react';

import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

const mockNotifications: Notification[] = [
  { id: 'notif-001', title: 'Contribution Due', message: 'Your September 2026 contribution of ₦10,000 is due today.', time: '2h ago', read: false, type: 'warning' },
  { id: 'notif-002', title: 'Loan Repayment Reminder', message: 'Instalment #4 of ₦45,833 is due on 25 Sep 2026.', time: '5h ago', read: false, type: 'info' },
  { id: 'notif-003', title: 'Investment Opportunity', message: 'CLIMPS Growth Fund IV is now open. Min investment: ₦100,000.', time: '1d ago', read: false, type: 'success' },
  { id: 'notif-004', title: 'Savings Goal Milestone', message: 'Your "House Deposit" goal is 75% complete!', time: '2d ago', read: true, type: 'success' },
  { id: 'notif-005', title: 'Statement Ready', message: 'Your Q3 2026 financial statement is available for download.', time: '3d ago', read: true, type: 'info' },
];

interface AppTopbarProps {
  memberName: string;
  memberId: string;
  role: 'member' | 'admin' | 'staff' | 'manager';
  sidebarCollapsed: boolean;
}

export default function AppTopbar({ memberName, memberId, role, sidebarCollapsed }: AppTopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = mockNotifications.filter(n => !n.read).length;

  const typeColor = {
    info: 'bg-blue-100 text-blue-600',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-accent/10 text-accent',
    error: 'bg-destructive/10 text-destructive',
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-card border-b border-border flex items-center px-4 gap-3 z-20 transition-all duration-300 ${
        sidebarCollapsed ? 'left-[68px]' : 'left-[260px]'
      }`}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions, members, loans…"
            className="input-base pl-9 h-9 text-sm bg-muted/60 border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label={`Notifications — ${unread} unread`}
          >
            <Bell size={18} className="text-muted-foreground" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl card-shadow-lg scale-enter overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                <span className="badge-active">{unread} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {mockNotifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !n.read ? 'bg-secondary/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-2xs text-muted-foreground mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border">
                <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
            aria-expanded={profileOpen}
          >
            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {memberName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-none">{memberName.split(' ')[0]}</p>
              <p className="text-2xs text-muted-foreground leading-none mt-0.5 capitalize">{role}</p>
            </div>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl card-shadow-lg scale-enter overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{memberName}</p>
                <p className="text-xs text-muted-foreground">{memberId}</p>
              </div>
              <div className="p-1.5">
                {[
                  { icon: User, label: 'My Profile', href: role === 'admin' ? '/admin-dashboard' : '/member-dashboard' },
                  { icon: Settings, label: 'Account Settings', href: role === 'admin' ? '/admin-dashboard' : '/member-dashboard' },
                  { icon: HelpCircle, label: 'Help & Support', href: role === 'admin' ? '/admin-dashboard' : '/member-dashboard' },
                ].map(item => (
                  <Link
                    key={`profile-${item.label}`}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="p-1.5 border-t border-border">
                <Link
                  href="/sign-up-login-screen"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}