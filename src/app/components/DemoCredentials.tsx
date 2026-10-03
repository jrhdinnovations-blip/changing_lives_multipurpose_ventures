'use client';
import React, { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';
import { toast } from 'sonner';

interface DemoCredentialsProps {
  onFill: (email: string, password: string) => void;
}

const demoAccounts = [
  { id: 'demo-admin', role: 'Super Admin', email: 'raymondlongdiem22@gmail.com', password: 'R@ymond22', description: 'Full Super Admin access' },
  { id: 'demo-member', role: 'Member', email: 'adaeze.okonkwo@climps.ng', password: 'Member@2026!', description: 'Regular cooperative member' },
  { id: 'demo-manager', role: 'Manager', email: 'manager.ibrahim@climps.ng', password: 'Manager@2026!', description: 'Review & reporting access' },
  { id: 'demo-staff', role: 'Staff', email: 'staff.ngozi@climps.ng', password: 'Staff@2026!', description: 'Operational data entry' },
];

export default function DemoCredentials({ onFill }: DemoCredentialsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, fieldId: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(fieldId);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="mt-6 border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04]/50 border-b border-white/10">
        <Info size={14} className="text-emerald-400 shrink-0" />
        <span className="text-xs font-semibold text-emerald-400">Demo Accounts — Click any row to autofill</span>
      </div>
      <div className="divide-y divide-white/10">
        {demoAccounts.map(account => (
          <div
            key={account.id}
            className="px-4 py-3 hover:bg-white/[0.06]/50 transition-colors cursor-pointer group"
            onClick={() => {
              onFill(account.email, account.password);
              toast.info(`${account.role} credentials autofilled`);
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                  account.role === 'Super Admin' || account.role === 'Administrator' ? 'bg-emerald-500/10 text-emerald-400'
                    : account.role === 'Manager' ? 'bg-purple-100 text-purple-700'
                    : account.role === 'Staff' ? 'bg-warning/10 text-warning' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {account.role}
                </span>
                <span className="text-xs text-white/50">{account.description}</span>
              </div>
              <span className="text-2xs text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Click to use →
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-2xs text-white/50 font-medium w-14">Email:</span>
                <span className="text-2xs text-white font-mono truncate flex-1">{account.email}</span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleCopy(account.email, `${account.id}-email`); }}
                  className="p-0.5 rounded hover:bg-white/[0.06] transition-colors shrink-0"
                  aria-label="Copy email"
                >
                  {copiedField === `${account.id}-email` ? (
                    <Check size={11} className="text-blue-400" />
                  ) : (
                    <Copy size={11} className="text-white/50" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xs text-white/50 font-medium w-16">Password:</span>
                <span className="text-2xs text-white font-mono truncate flex-1">{account.password}</span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleCopy(account.password, `${account.id}-pass`); }}
                  className="p-0.5 rounded hover:bg-white/[0.06] transition-colors shrink-0"
                  aria-label="Copy password"
                >
                  {copiedField === `${account.id}-pass` ? (
                    <Check size={11} className="text-blue-400" />
                  ) : (
                    <Copy size={11} className="text-white/50" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}