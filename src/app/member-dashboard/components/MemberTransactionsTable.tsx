'use client';
import React, { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import { Search, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TransactionType } from '@/lib/types/climps';

const typeLabel: Record<TransactionType, string> = {
  contribution: 'Contribution',
  loan_repayment: 'Loan Repayment',
  savings_deposit: 'Savings Deposit',
  savings_withdrawal: 'Savings Withdrawal',
  loan_disbursement: 'Loan Disbursement',
  investment_subscription: 'Investment',
  investment_return: 'Investment Return',
  investment_maturity: 'Investment Maturity',
  penalty: 'Penalty',
  charge: 'Charge',
  adjustment: 'Adjustment',
  refund: 'Refund',
  reversal: 'Reversal',
};

const typeBadgeVariant: Record<string, 'active' | 'pending' | 'paid' | 'partial' | 'approved'> = {
  contribution: 'paid',
  loan_repayment: 'partial',
  savings_deposit: 'active',
  savings_withdrawal: 'partial',
  loan_disbursement: 'approved',
  investment_subscription: 'approved',
  investment_return: 'active',
  investment_maturity: 'active',
  penalty: 'partial',
  charge: 'partial',
  adjustment: 'pending',
  refund: 'active',
  reversal: 'pending',
};

interface MemberTransactionsTableProps {
  member?: any;
}

export default function MemberTransactionsTable({ member: memberProp }: MemberTransactionsTableProps = {}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    loadTransactions();
  }, [user, memberProp]);

  async function loadTransactions() {
    setLoading(true);
    try {
      let memberId = memberProp?.id;
      if (!memberId && user) {
        let { data: m } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!m && user.email) {
          const { data: byEmail } = await supabase
            .from('members')
            .select('id')
            .ilike('email', user.email)
            .maybeSingle();
          m = byEmail;
        }
        memberId = m?.id;
      }

      if (!memberId) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        if (error.code?.startsWith('42')) throw error;
        console.log('Transactions fetch error:', error.message);
      } else {
        setTransactions(data || []);
      }
    } catch (err: any) {
      console.error('Transactions load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = transactions.filter(t => {
    const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.transaction_ref?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.transaction_type === typeFilter;
    return matchSearch && matchType;
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header">Recent Transactions</h2>
        <button
          onClick={() => toast.info('Download statement — coming soon')}
          className="btn-outline text-xs flex items-center gap-1.5 px-3 py-1.5"
        >
          <Download size={13} />
          Statement
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-base pl-8 h-8 text-xs"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="input-base h-8 text-xs w-40"
        >
          <option value="all">All Types</option>
          <option value="contribution">Contributions</option>
          <option value="savings_deposit">Savings</option>
          <option value="loan_repayment">Loan Repayments</option>
          <option value="investment_subscription">Investments</option>
          <option value="investment_return">Returns</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="h-10 bg-white/[0.06] rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="table-header text-left">Reference</th>
                <th className="table-header text-left">Date</th>
                <th className="table-header text-left">Description</th>
                <th className="table-header text-left">Type</th>
                <th className="table-header text-right">Debit (₦)</th>
                <th className="table-header text-right">Credit (₦)</th>
                <th className="table-header text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(txn => (
                <tr key={txn.id} className="border-b border-white/10/60 table-row-hover">
                  <td className="table-cell">
                    <span className="font-mono text-xs text-white/50">{txn.transaction_ref}</span>
                  </td>
                  <td className="table-cell whitespace-nowrap text-xs">{formatDate(txn.created_at)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      {txn.is_debit ? (
                        <ArrowUpRight size={13} className="text-red-400 shrink-0" />
                      ) : (
                        <ArrowDownLeft size={13} className="text-blue-400 shrink-0" />
                      )}
                      <span className="text-xs font-medium text-white truncate max-w-[180px]">{txn.description}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <Badge variant={typeBadgeVariant[txn.transaction_type] || 'pending'}>
                      {typeLabel[txn.transaction_type as TransactionType] || txn.transaction_type}
                    </Badge>
                  </td>
                  <td className="table-cell text-right font-tabular text-xs text-red-400 font-medium">
                    {txn.is_debit ? Number(txn.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '—'}
                  </td>
                  <td className="table-cell text-right font-tabular text-xs text-blue-400 font-medium">
                    {!txn.is_debit ? Number(txn.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '—'}
                  </td>
                  <td className="table-cell">
                    <Badge variant={txn.tx_status === 'completed' ? 'paid' : txn.tx_status === 'pending' ? 'pending' : 'rejected'}>
                      {txn.tx_status?.charAt(0).toUpperCase() + txn.tx_status?.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-white/50">
                {transactions.length === 0 ? 'No transactions found.' : 'No transactions match your search.'}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-white/50">Showing {filtered.length} of {transactions.length} transactions</p>
        <button
          onClick={() => toast.info('Full transaction history — coming soon')}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-400/80 transition-colors"
        >
          View All Transactions →
        </button>
      </div>
    </div>
  );
}