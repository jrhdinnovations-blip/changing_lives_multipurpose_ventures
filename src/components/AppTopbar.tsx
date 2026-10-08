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

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#070D1E]/95 backdrop-blur-md border-b border-white/10 shadow-xl flex items-center px-4 gap-3 z-20 transition-all duration-300 ${
        sidebarCollapsed ? 'left-[68px]' : 'left-[260px]'
      }`}
    >
      {/* 4-Color Brand Stripe on top of topbar */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-rose-500 via-[#00D084] via-blue-500 to-rose-500" />

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions, members, loans…"
            className="w-full pl-9 pr-4 h-9 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:bg-white/10 focus:outline-none focus:border-[#00D084]/60 focus:ring-1 focus:ring-[#00D084]/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
            aria-label={`Notifications — ${unread} unread`}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-sm shadow-rose-500/50" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0D182E] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#070D1E]/80">
                <span className="text-sm font-bold text-white">Notifications</span>
                <span className="text-xs bg-emerald-500/15 text-[#00E599] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">{unread} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {mockNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium">
                    No new notifications
                  </div>
                ) : (
                  mockNotifications.map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${
                        !n.read ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-[#00D084]' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-2xs text-slate-500 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-white/10 bg-[#070D1E]/60">
                <button className="text-xs font-bold text-[#00E599] hover:text-emerald-300 transition-colors w-full text-center">
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
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 text-white transition-colors"
            aria-expanded={profileOpen}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-[#00D084] flex items-center justify-center text-slate-950 text-xs font-black shadow-md">
              {memberName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">{memberName.split(' ')[0]}</p>
              <p className="text-2xs text-slate-400 font-medium leading-none mt-1 capitalize">{role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0D182E] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/10 bg-[#070D1E]/80">
                <p className="text-sm font-bold text-white">{memberName}</p>
                <p className="text-xs text-slate-400 font-medium">{memberId}</p>
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
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="p-1.5 border-t border-white/10">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors w-full"
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