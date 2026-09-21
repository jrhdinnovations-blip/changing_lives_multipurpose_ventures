'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, PiggyBank, TrendingUp, CreditCard, Users, FileText, Receipt, Bell, MessageSquare, Settings, ChevronDown, ChevronRight, LogOut, BarChart3, Shield, BookOpen, HelpCircle, Menu, Wallet, ClipboardList, FolderOpen } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


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
  {
    id: 'nav-savings', label: 'My Savings', icon: PiggyBank,
    children: [
      { id: 'nav-contributions', label: 'Contributions', href: '/member-dashboard' },
      { id: 'nav-savings-accs', label: 'Savings Accounts', href: '/member-dashboard' },
      { id: 'nav-goals', label: 'Savings Goals', href: '/member-dashboard' },
    ]
  },
  {
    id: 'nav-loans', label: 'My Loans', icon: CreditCard,
    children: [
      { id: 'nav-active-loans', label: 'Active Loans', href: '/loan-dashboard' },
      { id: 'nav-apply-loan', label: 'Apply for Loan', href: '/loan-application' },
      { id: 'nav-repayments', label: 'Repayments', href: '/loan-dashboard' },
      { id: 'nav-loan-dashboard', label: 'Loan Dashboard', href: '/loan-dashboard' },
    ]
  },
  {
    id: 'nav-investments', label: 'Investments', icon: TrendingUp,
    children: [
      { id: 'nav-portfolio', label: 'My Portfolio', href: '/member-dashboard' },
      { id: 'nav-invest-now', label: 'Invest Now', href: '/member-dashboard' },
      { id: 'nav-investors-circle', label: 'Investors Circle', href: '/investors-circle' },
      { id: 'nav-inv-dashboard', label: 'Circle Dashboard', href: '/investors-circle/dashboard' },
    ]
  },
  { id: 'nav-documents', label: 'My Documents', icon: FolderOpen, href: '/documents' },
  { id: 'nav-transactions', label: 'Transactions', icon: Wallet, href: '/member-dashboard' },
  { id: 'nav-statements', label: 'Statements', icon: FileText, href: '/financial-statements' },
  { id: 'nav-notifications', label: 'Notifications', icon: Bell, href: '/member-dashboard', badge: 3 },
  { id: 'nav-help', label: 'Help & Support', icon: HelpCircle, href: '/member-dashboard' },
  { id: 'nav-settings', label: 'Settings', icon: Settings, href: '/member-dashboard' },
];

const adminNav: NavItem[] = [
  { id: 'anav-dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin-dashboard' },
  {
    id: 'anav-members', label: 'Members', icon: Users, badge: 4,
    children: [
      { id: 'anav-all-members', label: 'All Members', href: '/admin-dashboard' },
      { id: 'anav-add-member', label: 'Add Member', href: '/admin-dashboard' },
      { id: 'anav-pending', label: 'Pending Approvals', href: '/admin-dashboard', badge: 4 },
    ]
  },
  { id: 'anav-applications', label: 'Applications', icon: FileText, href: '/admin-dashboard/applications' },
  {
    id: 'anav-savings', label: 'Savings', icon: PiggyBank,
    children: [
      { id: 'anav-contributions', label: 'Contributions', href: '/admin-dashboard' },
      { id: 'anav-savings-accs', label: 'Savings Accounts', href: '/admin-dashboard' },
      { id: 'anav-goals', label: 'Goals', href: '/admin-dashboard' },
      { id: 'anav-products', label: 'Products', href: '/admin-dashboard' },
    ]
  },
  {
    id: 'anav-loans', label: 'Loans', icon: CreditCard, badge: 7,
    children: [
      { id: 'anav-loan-apps', label: 'Loan Applications', href: '/admin-dashboard/loans', badge: 5 },
      { id: 'anav-active-loans', label: 'Active Loans', href: '/admin-dashboard/loans' },
      { id: 'anav-repayments', label: 'Repayments', href: '/admin-dashboard/loans' },
      { id: 'anav-overdue', label: 'Overdue', href: '/admin-dashboard/loans', badge: 7 },
      { id: 'anav-loan-products', label: 'Products', href: '/admin-dashboard' },
    ]
  },
  {
    id: 'anav-investments', label: 'Investments', icon: TrendingUp,
    children: [
      { id: 'anav-inv-products', label: 'Products', href: '/admin-dashboard' },
      { id: 'anav-inv-apps', label: 'Applications', href: '/admin-dashboard', badge: 3 },
      { id: 'anav-inv-active', label: 'Active', href: '/admin-dashboard' },
      { id: 'anav-inv-matured', label: 'Matured', href: '/admin-dashboard' },
      { id: 'anav-inv-circle', label: 'Investor Circle', href: '/investors-circle' },
      { id: 'anav-inv-circle-dash', label: 'Circle Dashboard', href: '/investors-circle/dashboard' },
      { id: 'anav-inv-circle-admin', label: 'Circle Admin', href: '/admin-dashboard/investors-circle', badge: 3 },
    ]
  },
  { id: 'anav-documents', label: 'Documents', icon: FolderOpen, href: '/admin-dashboard/documents' },
  { id: 'anav-transactions', label: 'Transactions', icon: Wallet, href: '/admin-dashboard' },
  { id: 'anav-reports', label: 'Reports', icon: BarChart3, href: '/admin-dashboard' },
  { id: 'anav-receipts', label: 'Receipts', icon: Receipt, href: '/admin-dashboard' },
  { id: 'anav-notifications', label: 'Notifications', icon: Bell, href: '/admin-dashboard', badge: 2 },
  { id: 'anav-complaints', label: 'Complaints', icon: MessageSquare, href: '/admin-dashboard', badge: 3 },
  { id: 'anav-content', label: 'Content Mgmt', icon: BookOpen, href: '/admin-dashboard' },
  { id: 'anav-staff', label: 'Staff & Admins', icon: Shield, href: '/admin-dashboard' },
  { id: 'anav-audit', label: 'Audit Logs', icon: ClipboardList, href: '/admin-dashboard' },
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
              ? 'bg-secondary text-primary font-semibold' :'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          title={collapsed ? item.label : undefined}
          aria-expanded={expanded}
        >
          <Icon size={18} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="bg-destructive text-destructive-foreground text-2xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </>
          )}
        </button>
        {!collapsed && expanded && (
          <div className="ml-7 mt-0.5 space-y-0.5 border-l border-border pl-3">
            {item.children!.map(child => (
              <Link
                key={child.id}
                href={child.href}
                onClick={onNavigate}
                className={`flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-all duration-150 ${
                  pathname === child.href
                    ? 'text-primary font-semibold bg-secondary/60' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span>{child.label}</span>
                {child.badge != null && child.badge > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-2xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
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
          ? 'bg-secondary text-primary font-semibold' :'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <span className="bg-destructive text-destructive-foreground text-2xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
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

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-card border-r border-border flex flex-col z-30 sidebar-transition ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-border h-16 shrink-0 ${collapsed ? 'justify-center px-3' : 'px-4 gap-3'}`}>
        <div className="flex items-center gap-2.5">
          <AppLogo size={32} />
          {!collapsed && (
            <div>
              <span className="font-extrabold text-base text-primary tracking-tight leading-none">
                CLIMPS
              </span>
              <p className="text-2xs text-muted-foreground leading-none mt-0.5">Cooperative Platform</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Collapse sidebar"
          >
            <Menu size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Collapsed toggle */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="flex items-center justify-center h-10 hover:bg-muted transition-colors mx-2 mt-2 rounded-xl"
          aria-label="Expand sidebar"
        >
          <Menu size={16} className="text-muted-foreground" />
        </button>
      )}

      {/* Member/Admin info strip */}
      {!collapsed && (
        <div className="px-4 py-3 bg-secondary/40 border-b border-border">
          <p className="text-xs font-semibold text-primary truncate">{memberName || 'Member'}</p>
          <p className="text-2xs text-muted-foreground">{memberId || ''}</p>
          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-2xs font-semibold ${
            role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
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
      <div className="border-t border-border p-2">
        <Link
          href="/sign-up-login-screen"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}