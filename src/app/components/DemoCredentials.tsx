'use client';
import React, { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';
import { toast } from 'sonner';

interface DemoCredentialsProps {
  onFill: (email: string, password: string) => void;
}

const demoAccounts = [
  { id: 'demo-member', role: 'Member', email: 'adaeze.okonkwo@climps.ng', password: 'Member@2026!', description: 'Regular cooperative member' },
  { id: 'demo-admin', role: 'Administrator', email: 'admin@climps.ng', password: 'Admin@2026!', description: 'Full admin access' },
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
    <div className="mt-6 border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/50 border-b border-border">
        <Info size={14} className="text-primary shrink-0" />
        <span className="text-xs font-semibold text-primary">Demo Accounts — Click any row to autofill</span>
      </div>
      <div className="divide-y divide-border">
        {demoAccounts.map(account => (
          <div
            key={account.id}
            className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => {
              onFill(account.email, account.password);
              toast.info(`${account.role} credentials autofilled`);
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                  account.role === 'Administrator' ?'bg-primary/10 text-primary'
                    : account.role === 'Manager' ?'bg-purple-100 text-purple-700'
                    : account.role === 'Staff' ?'bg-warning/10 text-warning' :'bg-accent/10 text-accent'
                }`}>
                  {account.role}
                </span>
                <span className="text-xs text-muted-foreground">{account.description}</span>
              </div>
              <span className="text-2xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Click to use →
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-2xs text-muted-foreground font-medium w-14">Email:</span>
                <span className="text-2xs text-foreground font-mono truncate flex-1">{account.email}</span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleCopy(account.email, `${account.id}-email`); }}
                  className="p-0.5 rounded hover:bg-muted transition-colors shrink-0"
                  aria-label="Copy email"
                >
                  {copiedField === `${account.id}-email` ? (
                    <Check size={11} className="text-accent" />
                  ) : (
                    <Copy size={11} className="text-muted-foreground" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xs text-muted-foreground font-medium w-16">Password:</span>
                <span className="text-2xs text-foreground font-mono truncate flex-1">{account.password}</span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleCopy(account.password, `${account.id}-pass`); }}
                  className="p-0.5 rounded hover:bg-muted transition-colors shrink-0"
                  aria-label="Copy password"
                >
                  {copiedField === `${account.id}-pass` ? (
                    <Check size={11} className="text-accent" />
                  ) : (
                    <Copy size={11} className="text-muted-foreground" />
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