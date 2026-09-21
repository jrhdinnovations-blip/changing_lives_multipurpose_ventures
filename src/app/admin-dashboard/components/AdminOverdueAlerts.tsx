'use client';
import React, { useState } from 'react';
import { AlertTriangle, Phone, Mail, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface OverdueLoan {
  id: string;
  ref: string;
  memberName: string;
  memberId: string;
  phone: string;
  product: string;
  overdueAmount: number;
  daysOverdue: number;
  totalOutstanding: number;
  missedInstalments: number;
}

const overdueLoans: OverdueLoan[] = [
  { id: 'od-001', ref: 'LN/2026/00412', memberName: 'Olawale Adebisi', memberId: 'CLMV/2026/0198', phone: '08034521987', product: 'Business Loan', overdueAmount: 125000, daysOverdue: 42, totalOutstanding: 680000, missedInstalments: 2 },
  { id: 'od-002', ref: 'LN/2026/00389', memberName: 'Chidinma Okafor', memberId: 'CLMV/2025/0847', phone: '07012345678', product: 'Personal Loan', overdueAmount: 87500, daysOverdue: 35, totalOutstanding: 437500, missedInstalments: 2 },
  { id: 'od-003', ref: 'LN/2025/00918', memberName: 'Suleiman Garba', memberId: 'CLMV/2025/0512', phone: '08098765432', product: 'Salary Loan', overdueAmount: 45000, daysOverdue: 28, totalOutstanding: 225000, missedInstalments: 1 },
  { id: 'od-004', ref: 'LN/2026/00445', memberName: 'Adunola Balogun', memberId: 'CLMV/2026/0067', phone: '09011223344', product: 'Emergency Loan', overdueAmount: 30000, daysOverdue: 21, totalOutstanding: 90000, missedInstalments: 1 },
  { id: 'od-005', ref: 'LN/2025/00802', memberName: 'Kenneth Okonkwo', memberId: 'CLMV/2025/0301', phone: '07098765432', product: 'Business Loan', overdueAmount: 200000, daysOverdue: 67, totalOutstanding: 1200000, missedInstalments: 3 },
];

export default function AdminOverdueAlerts() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const totalAtRisk = overdueLoans.reduce((s, l) => s + l.overdueAmount, 0);

  return (
    <div className="card-base border-destructive/20 bg-destructive/2">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-destructive/10 rounded-lg">
          <AlertTriangle size={15} className="text-destructive" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">Overdue Loans</h2>
          <p className="text-2xs text-muted-foreground">₦{totalAtRisk.toLocaleString()} at risk</p>
        </div>
        <span className="bg-destructive text-destructive-foreground text-2xs font-bold px-2 py-0.5 rounded-full">
          {overdueLoans.length}
        </span>
      </div>

      <div className="space-y-2">
        {overdueLoans.map(loan => (
          <div
            key={loan.id}
            className={`rounded-xl border transition-all duration-150 overflow-hidden ${
              loan.daysOverdue > 60
                ? 'border-destructive/30 bg-destructive/5' :'border-border bg-card'
            }`}
          >
            <button
              onClick={() => setExpanded(e => e === loan.id ? null : loan.id)}
              className="w-full flex items-start justify-between p-3 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-foreground truncate">{loan.memberName}</p>
                  {loan.daysOverdue > 60 && (
                    <span className="text-2xs font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive shrink-0">CRITICAL</span>
                  )}
                </div>
                <p className="text-2xs text-muted-foreground font-mono">{loan.ref}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs font-bold text-destructive font-tabular">₦{loan.overdueAmount.toLocaleString()}</p>
                  <p className="text-2xs text-muted-foreground">{loan.daysOverdue} days overdue</p>
                </div>
              </div>
              {expanded === loan.id ? (
                <ChevronUp size={14} className="text-muted-foreground shrink-0 mt-0.5" />
              ) : (
                <ChevronDown size={14} className="text-muted-foreground shrink-0 mt-0.5" />
              )}
            </button>

            {expanded === loan.id && (
              <div className="px-3 pb-3 border-t border-border/60 pt-2.5 slide-up">
                <div className="grid grid-cols-2 gap-2 mb-3 text-2xs">
                  <div>
                    <p className="text-muted-foreground">Product</p>
                    <p className="font-semibold text-foreground">{loan.product}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Member ID</p>
                    <p className="font-semibold text-foreground font-mono">{loan.memberId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Missed Instalments</p>
                    <p className="font-semibold text-destructive">{loan.missedInstalments}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Outstanding</p>
                    <p className="font-semibold text-foreground font-tabular">₦{loan.totalOutstanding.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => toast.info(`Calling ${loan.memberName} at ${loan.phone}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-2xs font-semibold"
                  >
                    <Phone size={11} />
                    Call
                  </button>
                  <button
                    onClick={() => toast.info(`Sending SMS to ${loan.memberName}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-2xs font-semibold"
                  >
                    <MessageSquare size={11} />
                    SMS
                  </button>
                  <button
                    onClick={() => toast.info(`Emailing ${loan.memberName}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors text-2xs font-semibold"
                  >
                    <Mail size={11} />
                    Email
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => toast.info('Full overdue loans report — coming soon')}
        className="w-full mt-3 py-2 text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors text-center border border-destructive/20 rounded-xl hover:bg-destructive/5"
      >
        View All 27 Overdue Loans →
      </button>
    </div>
  );
}