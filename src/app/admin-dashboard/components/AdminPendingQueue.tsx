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
        // Check for any pending members
        const { data: pendingMembers } = await supabase
          .from('members')
          .select('id, membership_no, first_name, last_name, created_at, status')
          .eq('status', 'pending');

        const pendingList: PendingItem[] = [];
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <Clock size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Pending Verification Queue</h2>
            <p className="text-2xs text-slate-500">Membership & facility applications awaiting review</p>
          </div>
        </div>
        {items.length > 0 && (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded-full">
            {items.length} Pending
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-xs font-bold text-slate-900 mb-1">Operational Queue is Clear</h3>
          <p className="text-2xs text-slate-500 max-w-sm mx-auto font-medium">
            All member registrations and loan files are up to date. New submissions will appear here automatically for review.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map(item => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  {item.type === 'loan' ? <CreditCard size={15} /> : <User size={15} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.applicantName}</p>
                  <p className="text-2xs text-slate-500 font-mono">{item.ref} · {item.submittedDate}</p>
                </div>
              </div>
              <Link
                href="/admin-dashboard/members"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
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