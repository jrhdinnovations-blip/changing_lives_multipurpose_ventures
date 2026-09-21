'use client';
import React, { useState } from 'react';

import { CheckCircle2, XCircle, Eye, ChevronRight, User, CreditCard, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


type QueueType = 'membership' | 'loan' | 'investment';

interface QueueItem {
  id: string;
  ref: string;
  type: QueueType;
  applicantName: string;
  memberId?: string;
  amount?: string;
  product?: string;
  submittedDate: string;
  submittedTime: string;
  priority: 'high' | 'normal' | 'low';
  notes?: string;
}

const queueItems: QueueItem[] = [
  { id: 'q-001', ref: 'APP/2026/003821', type: 'membership', applicantName: 'Oluwaseun Fashola', submittedDate: '21 Sep 2026', submittedTime: '09:14', priority: 'high', notes: 'Documents verified' },
  { id: 'q-002', ref: 'LN/2026/00521', type: 'loan', applicantName: 'Ngozi Obi', memberId: 'CLMV/2026/0031', amount: '₦750,000', product: 'Business Loan', submittedDate: '21 Sep 2026', submittedTime: '08:42', priority: 'high' },
  { id: 'q-003', ref: 'INV/2026/00089', type: 'investment', applicantName: 'Ibrahim Musa', memberId: 'CLMV/2026/0118', amount: '₦500,000', product: 'CLIMPS Growth Fund IV', submittedDate: '20 Sep 2026', submittedTime: '16:30', priority: 'normal' },
  { id: 'q-004', ref: 'LN/2026/00519', type: 'loan', applicantName: 'Chiamaka Nwosu', memberId: 'CLMV/2026/0205', amount: '₦200,000', product: 'Emergency Loan', submittedDate: '20 Sep 2026', submittedTime: '14:17', priority: 'high', notes: 'Medical emergency' },
  { id: 'q-005', ref: 'APP/2026/003818', type: 'membership', applicantName: 'Babatunde Adewale', submittedDate: '19 Sep 2026', submittedTime: '11:05', priority: 'normal' },
  { id: 'q-006', ref: 'INV/2026/00086', type: 'investment', applicantName: 'Fatima Bello', memberId: 'CLMV/2026/0089', amount: '₦1,000,000', product: 'Fixed Income Bond III', submittedDate: '19 Sep 2026', submittedTime: '10:22', priority: 'normal' },
  { id: 'q-007', ref: 'LN/2026/00515', type: 'loan', applicantName: 'Emeka Eze', memberId: 'CLMV/2026/0312', amount: '₦1,200,000', product: 'Personal Loan', submittedDate: '18 Sep 2026', submittedTime: '15:48', priority: 'normal' },
];

const typeIcon = {
  membership: User,
  loan: CreditCard,
  investment: TrendingUp,
};

const typeColor = {
  membership: 'bg-purple-100 text-purple-600',
  loan: 'bg-orange-100 text-orange-600',
  investment: 'bg-accent/10 text-accent',
};

const priorityBadge = {
  high: 'bg-destructive/10 text-destructive',
  normal: 'bg-muted text-muted-foreground',
  low: 'bg-muted text-muted-foreground',
};

type FilterTab = 'all' | QueueType;

export default function AdminPendingQueue() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  const filtered = filter === 'all' ? queueItems : queueItems.filter(i => i.type === filter);

  const counts = {
    all: queueItems.length,
    membership: queueItems.filter(i => i.type === 'membership').length,
    loan: queueItems.filter(i => i.type === 'loan').length,
    investment: queueItems.filter(i => i.type === 'investment').length,
  };

  const handleApprove = async (item: QueueItem) => {
    setProcessing(`approve-${item.id}`);
    // BACKEND INTEGRATION: PATCH /api/admin/applications/:ref/approve
    await new Promise(r => setTimeout(r, 800));
    setProcessing(null);
    toast.success(`${item.ref} approved successfully`);
  };

  const handleReject = async (item: QueueItem) => {
    setProcessing(`reject-${item.id}`);
    // BACKEND INTEGRATION: PATCH /api/admin/applications/:ref/reject
    await new Promise(r => setTimeout(r, 800));
    setProcessing(null);
    toast.error(`${item.ref} rejected`);
  };

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="section-header">Pending Applications</h2>
          <span className="bg-destructive text-destructive-foreground text-2xs font-bold px-2 py-0.5 rounded-full">
            {queueItems.length}
          </span>
        </div>
        <button
          onClick={() => toast.info('Full applications queue — coming soon')}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          View All <ChevronRight size={13} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(['all', 'membership', 'loan', 'investment'] as FilterTab[]).map(tab => (
          <button
            key={`queue-tab-${tab}`}
            onClick={() => setFilter(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              filter === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="capitalize">{tab === 'all' ? 'All' : tab === 'loan' ? 'Loans' : tab === 'membership' ? 'Membership' : 'Investments'}</span>
            <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-full ${
              filter === tab ? 'bg-white/20 text-white' : 'bg-background'
            }`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="table-header">Reference</th>
              <th className="table-header">Type</th>
              <th className="table-header">Applicant</th>
              <th className="table-header">Details</th>
              <th className="table-header">Submitted</th>
              <th className="table-header">Priority</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const Icon = typeIcon[item.type];
              return (
                <tr key={item.id} className="border-b border-border/60 table-row-hover">
                  <td className="table-cell">
                    <span className="font-mono text-xs text-muted-foreground">{item.ref}</span>
                  </td>
                  <td className="table-cell">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${typeColor[item.type]}`}>
                      <Icon size={12} />
                      <span className="text-xs font-semibold capitalize">{item.type}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.applicantName}</p>
                      {item.memberId && <p className="text-2xs text-muted-foreground font-mono">{item.memberId}</p>}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      {item.amount && <p className="text-xs font-semibold text-foreground font-tabular">{item.amount}</p>}
                      {item.product && <p className="text-2xs text-muted-foreground">{item.product}</p>}
                      {item.notes && <p className="text-2xs text-accent">{item.notes}</p>}
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-xs text-foreground">{item.submittedDate}</p>
                    <p className="text-2xs text-muted-foreground">{item.submittedTime}</p>
                  </td>
                  <td className="table-cell">
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full uppercase ${priorityBadge[item.priority]}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toast.info(`Viewing ${item.ref}`)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title={`View ${item.ref} details`}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={processing === `approve-${item.id}`}
                        className="p-1.5 rounded-lg hover:bg-accent/10 transition-colors text-muted-foreground hover:text-accent disabled:opacity-50"
                        title={`Approve ${item.ref}`}
                      >
                        <CheckCircle2 size={13} />
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        disabled={processing === `reject-${item.id}`}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50"
                        title={`Reject ${item.ref} — this cannot be undone`}
                      >
                        <XCircle size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}