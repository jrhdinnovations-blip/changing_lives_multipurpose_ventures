'use client';
import React, { useState } from 'react';
import { Bell, Search, ChevronDown, Settings, LogOut, User, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

const mockNotifications: Notification[] = [];


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
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      router.push('/login?logout=1');
    }
  };

  const typeColor = {
    info: 'bg-blue-100 text-blue-600',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-accent/10 text-accent',
    error: 'bg-destructive/10 text-destructive',
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs flex items-center px-4 gap-3 z-20 transition-all duration-300 ${
        sidebarCollapsed ? 'left-[68px]' : 'left-[260px]'
      }`}
    >
      {/* 4-Color Brand Stripe on top of topbar */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-red-600 via-emerald-600 via-blue-600 to-red-600" />

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions, members, loans…"
            className="w-full pl-9 pr-4 h-9 text-sm bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label={`Notifications — ${unread} unread`}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <span className="text-sm font-bold text-slate-900">Notifications</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">{unread} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {mockNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-medium">
                    No new notifications
                  </div>
                ) : (
                  mockNotifications.map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !n.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-2xs text-slate-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                <button className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors w-full text-center">
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
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            aria-expanded={profileOpen}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {memberName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{memberName.split(' ')[0]}</p>
              <p className="text-2xs text-slate-500 font-semibold leading-none mt-1 capitalize">{role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-sm font-bold text-slate-900">{memberName}</p>
                <p className="text-xs text-slate-500 font-medium">{memberId}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                {[
                  { icon: User, label: 'My Profile', href: role === 'admin' ? '/admin-dashboard' : '/member-dashboard/profile' },
                  { icon: Settings, label: 'Account Settings', href: role === 'admin' ? '/admin-dashboard' : '/member-dashboard/profile' },
                  { icon: HelpCircle, label: 'Help & Support', href: role === 'admin' ? '/admin-dashboard' : '/member-dashboard' },
                ].map(item => (
                  <Link
                    key={`profile-${item.label}`}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition-colors"
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="p-1.5 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}