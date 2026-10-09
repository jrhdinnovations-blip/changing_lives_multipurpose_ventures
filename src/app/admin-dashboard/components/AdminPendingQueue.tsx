'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, User, CreditCard, Clock, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface PendingItem {
  id: string;
  ref: string;
  type: 'membership' | 'loan';
  applicantName: string;
  submittedDate: string;
  detail: string;
}

export default function AdminPendingQueue() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPending() {
      try {
        const supabase = createClient();
        const pendingList: PendingItem[] = [];

        // 1. Pending members
        try {
          const { data: pendingMembers } = await supabase
            .from('members')
            .select('id, membership_no, first_name, last_name, created_at, status')
            .eq('status', 'pending');

          if (pendingMembers && pendingMembers.length > 0) {
            pendingMembers.forEach(m => {
              pendingList.push({
                id: m.id,
                ref: m.membership_no || 'MEM-NEW',
                type: 'membership',
                applicantName: `${m.first_name} ${m.last_name}`,
                submittedDate: new Date(m.created_at).toLocaleDateString('en-GB'),
                detail: 'New membership verification',
              });
            });
          }
        } catch (memErr) {
          console.warn('Pending members query fallback:', memErr);
        }

        // 2. Pending loan applications from Supabase
        const seenLoanIds = new Set<string>();
        try {
          const { data: pendingLoans } = await supabase
            .from('loan_applications')
            .select('*')
            .in('status', ['pending', 'submitted', 'review', 'under_review'])
            .order('created_at', { ascending: false });

          if (pendingLoans && pendingLoans.length > 0) {
            pendingLoans.forEach(l => {
              seenLoanIds.add(l.id);
              let notesData: any = {};
              if (l.notes) {
                try { notesData = typeof l.notes === 'string' ? JSON.parse(l.notes) : l.notes; } catch {}
              }
              const amt = Number(l.amount || l.requested_amount || notesData.loan_amount || 0);
              const dur = Number(l.repayment_period_months || l.duration_months || notesData.loan_duration_months || 1);
              pendingList.push({
                id: l.id,
                ref: l.app_no || l.application_number || notesData.application_number || 'LN-APP',
                type: 'loan',
                applicantName: l.applicant_name || notesData.applicant_name || 'Member Applicant',
                submittedDate: l.created_at ? new Date(l.created_at).toLocaleDateString('en-GB') : 'Recent',
                detail: `₦${amt.toLocaleString('en-NG')} · ${dur} mo`,
              });
            });
          }
        } catch (loanErr) {
          console.warn('Pending loans query fallback:', loanErr);
        }

        // 3. Fallback from localStorage
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('climps_loan_applications');
            if (stored) {
              const localApps = JSON.parse(stored);
              localApps.forEach((l: any) => {
                const st = l.status || l.app_status || l.application_status || 'pending';
                if (['pending', 'submitted', 'review', 'under_review'].includes(st) && !seenLoanIds.has(l.id)) {
                  seenLoanIds.add(l.id);
                  const amt = Number(l.amount || l.requested_amount || l.loan_amount || 0);
                  const dur = Number(l.repayment_period_months || l.duration_months || l.loan_duration_months || 1);
                  pendingList.push({
                    id: l.id || l.application_number,
                    ref: l.app_no || l.application_number || 'LN-APP',
                    type: 'loan',
                    applicantName: l.applicant_name || 'Member Applicant',
                    submittedDate: l.created_at ? new Date(l.created_at).toLocaleDateString('en-GB') : 'Recent',
                    detail: `₦${amt.toLocaleString('en-NG')} · ${dur} mo`,
                  });
                }
              });
            }
          } catch {}
        }

        setItems(pendingList);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadPending();
  }, []);

  return (
    <div className="bg-[#0D182E]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Clock size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Pending Verification Queue</h2>
            <p className="text-2xs text-slate-400">Membership & facility applications awaiting review</p>
          </div>
        </div>
        {items.length > 0 && (
          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
            {items.length} Pending
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-[#00D084] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-xl bg-white/5 border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#00E599] flex items-center justify-center mx-auto mb-2.5">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-xs font-bold text-white mb-1">Operational Queue is Clear</h3>
          <p className="text-2xs text-slate-400 max-w-sm mx-auto font-medium">
            All member registrations and loan files are up to date. New submissions will appear here automatically for review.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {items.map(item => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${item.type === 'loan' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                  {item.type === 'loan' ? <CreditCard size={15} /> : <User size={15} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white">{item.applicantName}</p>
                    {item.type === 'loan' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Loan Request
                      </span>
                    )}
                  </div>
                  <p className="text-2xs text-slate-400 font-mono">
                    {item.ref} · {item.submittedDate} · <span className="text-slate-300 font-sans">{item.detail}</span>
                  </p>
                </div>
              </div>
              <Link
                href={item.type === 'loan' ? `/admin-dashboard/loans?appId=${item.id}` : '/admin-dashboard/members'}
                className="text-xs font-bold text-[#00E599] hover:text-emerald-300 flex items-center gap-1 transition-colors shrink-0"
              >
                Review <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}