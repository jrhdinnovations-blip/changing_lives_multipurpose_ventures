'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, PiggyBank, TrendingUp, CreditCard, Users, FileText, Receipt, Bell, MessageSquare, Settings, ChevronDown, ChevronRight, LogOut, BarChart3, Shield, BookOpen, HelpCircle, Menu, Wallet, ClipboardList, FolderOpen, Home, User } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';


interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: number;
  children?: { id: string; label: string; href: string; badge?: number }[];
}

interface AppSidebarProps {
  role: 'member' | 'admin' | 'staff' | 'manager';
  collapsed: boolean;
  onToggle: () => void;
  memberName?: string;
  memberId?: string;
}

const memberNav: NavItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/member-dashboard' },
  { id: 'nav-profile', label: 'My Profile & KYC', icon: User, href: '/member-dashboard/profile' },
  {
    id: 'nav-savings', label: 'Save', icon: PiggyBank,
    children: [
      { id: 'nav-savings-products', label: 'Savings Overview', href: '/savings-products' },
      { id: 'nav-contributions', label: 'Monthly Contribution', href: '/save/contributions' },
      { id: 'nav-regular-savings', label: 'Regular Savings', href: '/save/regular' },
      { id: 'nav-calculator', label: 'Savings Calculator', href: '/save/calculator' },
      { id: 'nav-start-saving', label: 'Start Saving', href: '/save/start' },
    ]
  },
  {
    id: 'nav-loans', label: 'My Loans', icon: CreditCard,
    children: [
      { id: 'nav-active-loans', label: 'Active Loans', href: '/loan-dashboard' },
      { id: 'nav-apply-loan', label: 'Apply for Loan', href: '/loan-application' },
      { id: 'nav-repayments', label: 'Repayments', href: '/loan-dashboard' },
    ]
  },
  {
    id: 'nav-investments', label: 'Wealth Circle', icon: TrendingUp,
    children: [
      { id: 'nav-investors-circle', label: 'Wealth Circle Overview', href: '/investors-circle' },
      { id: 'nav-inv-dashboard', label: 'Circle Dashboard', href: '/investors-circle/dashboard' },
      { id: 'nav-portfolio', label: 'My Portfolio', href: '/invest/portfolio' },
    ]
  },
  { id: 'nav-documents', label: 'My Documents', icon: FolderOpen, href: '/documents' },
  { id: 'nav-statements', label: 'Statements', icon: FileText, href: '/financial-statements' },
  { id: 'nav-settings', label: 'Settings', icon: Settings, href: '/member-dashboard' },
];

const adminNav: NavItem[] = [
  { id: 'anav-dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin-dashboard' },
  { id: 'anav-members', label: 'Members Directory', icon: Users, href: '/admin-dashboard/members' },
  { id: 'anav-loans', label: 'Loans & Credit', icon: CreditCard, href: '/admin-dashboard/loans' },
  { id: 'anav-savings', label: 'Contributions', icon: PiggyBank, href: '/save/admin/contributions' },
  { id: 'anav-investments', label: 'Wealth Circle', icon: TrendingUp, href: '/investment-products' },
  { id: 'anav-statements', label: 'Financial Statements', icon: FileText, href: '/financial-statements' },
  { id: 'anav-staff', label: 'Staff & Roles', icon: Shield, href: '/admin-dashboard/staff' },
  { id: 'anav-audit', label: 'Audit Logs', icon: ClipboardList, href: '/admin-dashboard/audit-logs' },
  { id: 'anav-settings', label: 'Settings', icon: Settings, href: '/admin-dashboard/settings' },
];

function NavItemRow({
  item,
  collapsed,
  active,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const isChildActive = hasChildren && item.children!.some(c => c.href === pathname);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(e => !e)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            isChildActive
              ? 'bg-emerald-500/15 text-emerald-400 font-semibold' :'text-white/60 hover:bg-white/[0.06] hover:text-white'
          }`}
          title={collapsed ? item.label : undefined}
          aria-expanded={expanded}
        >
          <Icon size={18} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="bg-red-500/80 text-white text-2xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </>
          )}
        </button>
        {!collapsed && expanded && (
          <div className="ml-7 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
            {item.children!.map(child => (
              <Link
                key={child.id}
                href={child.href}
                onClick={onNavigate}
                className={`flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-all duration-150 ${
                  pathname === child.href
                    ? 'text-emerald-400 font-semibold bg-emerald-500/10' :'text-white/50 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>{child.label}</span>
                {child.badge != null && child.badge > 0 && (
                  <span className="bg-red-500/80 text-white text-2xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {child.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-emerald-500/15 text-emerald-400 font-semibold' :'text-white/60 hover:bg-white/[0.06] hover:text-white'
      }`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <span className="bg-red-500/80 text-white text-2xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export default function AppSidebar({ role, collapsed, onToggle, memberName, memberId }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'admin' || role === 'staff' || role === 'manager' ? adminNav : memberNav;
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      router.push('/login');
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#0a0f1e] border-r border-white/10 flex flex-col z-30 sidebar-transition ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-white/10 h-16 shrink-0 ${collapsed ? 'justify-center px-3' : 'px-4 gap-3'}`}>
        <div className="flex items-center gap-2.5">
          <AppLogo size={44} className="rounded-xl ring-2 ring-white/20 shadow-lg" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-base text-emerald-400 tracking-tight leading-none">
                CLIMPS
              </span>
              <p className="text-[9px] text-white/50 leading-none mt-0.5 font-medium">Changing Lives Multipurpose Ventures</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Collapse sidebar"
          >
            <Menu size={16} className="text-white/50" />
          </button>
        )}
      </div>

      {/* Collapsed toggle */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="flex items-center justify-center h-10 hover:bg-white/10 transition-colors mx-2 mt-2 rounded-xl"
          aria-label="Expand sidebar"
        >
          <Menu size={16} className="text-white/50" />
        </button>
      )}

      {/* Member/Admin info strip */}
      {!collapsed && (
        <div className="px-4 py-3 bg-white/[0.04] border-b border-white/10">
          <p className="text-xs font-semibold text-emerald-400 truncate">{memberName || 'Member'}</p>
          <p className="text-2xs text-white/40">{memberId || ''}</p>
          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-2xs font-semibold ${
            role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {role === 'admin' ? 'Administrator' : role === 'manager' ? 'Manager' : role === 'staff' ? 'Staff' : 'Member'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0.5">
        {navItems.map(item => (
          <NavItemRow
            key={item.id}
            item={item}
            collapsed={collapsed}
            active={item.href === pathname}
          />
        ))}
      </nav>

      {/* Bottom: logout */}
      <div className="border-t border-white/10 p-2 space-y-1">
        <Link
          href="/landing"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-150 w-full"
          title={collapsed ? 'Back to Home' : undefined}
        >
          <Home size={18} className="shrink-0" />
          {!collapsed && <span>Back to Home</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 w-full"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}