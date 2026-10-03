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
      className={`fixed top-0 right-0 h-16 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-white/10 flex items-center px-4 gap-3 z-20 transition-all duration-300 ${
        sidebarCollapsed ? 'left-[68px]' : 'left-[260px]'
      }`}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search transactions, members, loans…"
            className="w-full pl-9 pr-4 h-9 text-sm bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
            aria-label={`Notifications — ${unread} unread`}
          >
            <Bell size={18} className="text-white/60" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d1527] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">{unread} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {mockNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-white/40">
                    No new notifications
                  </div>
                ) : (
                  mockNotifications.map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.04] transition-colors cursor-pointer ${
                        !n.read ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-emerald-400' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white">{n.title}</p>
                          <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-2xs text-white/30 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-white/10">
                <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors w-full text-center">
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
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.08] transition-colors"
            aria-expanded={profileOpen}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
              {memberName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-white leading-none">{memberName.split(' ')[0]}</p>
              <p className="text-2xs text-white/40 leading-none mt-0.5 capitalize">{role}</p>
            </div>
            <ChevronDown size={14} className="text-white/40" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0d1527] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-semibold text-white">{memberName}</p>
                <p className="text-xs text-white/40">{memberId}</p>
              </div>
              <div className="p-1.5">
                {[
                  { icon: User, label: 'My Profile', href: role === 'admin' ? '/admin-dashboard' : '/member-dashboard/profile' },
                  { icon: Settings, label: 'Account Settings', href: role === 'admin' ? '/admin-dashboard' : '/member-dashboard/profile' },
                  { icon: HelpCircle, label: 'Help & Support', href: role === 'admin' ? '/admin-dashboard' : '/member-dashboard' },
                ].map(item => (
                  <Link
                    key={`profile-${item.label}`}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="p-1.5 border-t border-white/10">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
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