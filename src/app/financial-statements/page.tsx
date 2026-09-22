'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FileText, Download, Calendar, Filter, RefreshCw, TrendingUp, CreditCard, PiggyBank, Wallet, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Printer, BarChart3, ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNGN(val: number) {
  return '₦' + (val || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function toISODate(d: Date) {
  return d.toISOString().split('T')[0];
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatementRow {
  id: string;
  date: string;
  ref: string;
  type: string;
  category: string;
  description: string;
  debit: number;
  credit: number;
  balance_after: number | null;
  status: string;
  source: 'transaction' | 'contribution' | 'loan' | 'investment';
}

interface StatementSummary {
  openingBalance: number;
  totalCredits: number;
  totalDebits: number;
  closingBalance: number;
  totalContributions: number;
  totalLoanDisbursed: number;
  totalLoanRepaid: number;
  totalInvested: number;
  totalInvestmentReturns: number;
  rowCount: number;
}

interface MemberInfo {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  contribution: 'bg-blue-100 text-blue-700',
  savings_deposit: 'bg-teal-100 text-teal-700',
  savings_withdrawal: 'bg-orange-100 text-orange-700',
  loan_disbursement: 'bg-purple-100 text-purple-700',
  loan_repayment: 'bg-indigo-100 text-indigo-700',
  investment_subscription: 'bg-emerald-100 text-emerald-700',
  investment_return: 'bg-green-100 text-green-700',
  investment_maturity: 'bg-green-100 text-green-700',
  penalty: 'bg-red-100 text-red-700',
  charge: 'bg-amber-100 text-amber-700',
  adjustment: 'bg-gray-100 text-gray-600',
  refund: 'bg-cyan-100 text-cyan-700',
  reversal: 'bg-rose-100 text-rose-700',
  processing_fee: 'bg-amber-100 text-amber-700',
  default_charge: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  reversed: 'bg-rose-100 text-rose-700',
  cancelled: 'bg-gray-100 text-gray-500',
  paid: 'bg-green-100 text-green-700',
  partially_paid: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-red-100 text-red-700',
  overdue: 'bg-red-200 text-red-800',
};

const CATEGORY_LABELS: Record<string, string> = {
  contribution: 'Monthly Contribution',
  savings_deposit: 'Savings Deposit',
  savings_withdrawal: 'Savings Withdrawal',
  loan_disbursement: 'Loan Disbursement',
  loan_repayment: 'Loan Repayment',
  investment_subscription: 'Investment Subscription',
  investment_return: 'Investment Return',
  investment_maturity: 'Investment Maturity',
  penalty: 'Penalty',
  charge: 'Charge',
  adjustment: 'Adjustment',
  refund: 'Refund',
  reversal: 'Reversal',
  processing_fee: 'Processing Fee',
  default_charge: 'Default Charge',
};

// ─── Quick date presets ───────────────────────────────────────────────────────

function getPresetRange(preset: string): { from: string; to: string } {
  const today = new Date();
  const to = toISODate(today);

  switch (preset) {
    case 'this_month': {
      const from = toISODate(new Date(today.getFullYear(), today.getMonth(), 1));
      return { from, to };
    }
    case 'last_month': {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: toISODate(first), to: toISODate(last) };
    }
    case 'last_3_months': {
      const from = toISODate(new Date(today.getFullYear(), today.getMonth() - 3, 1));
      return { from, to };
    }
    case 'last_6_months': {
      const from = toISODate(new Date(today.getFullYear(), today.getMonth() - 6, 1));
      return { from, to };
    }
    case 'this_year': {
      const from = toISODate(new Date(today.getFullYear(), 0, 1));
      return { from, to };
    }
    case 'last_year': {
      const from = toISODate(new Date(today.getFullYear() - 1, 0, 1));
      const last = toISODate(new Date(today.getFullYear() - 1, 11, 31));
      return { from, to: last };
    }
    default:
      return { from: toISODate(new Date(today.getFullYear(), 0, 1)), to };
  }
}

// ─── PDF Generation ───────────────────────────────────────────────────────────

function generatePDFContent(
  member: MemberInfo,
  rows: StatementRow[],
  summary: StatementSummary,
  dateFrom: string,
  dateTo: string,
  statementType: string
): string {
  const now = new Date();
  const generatedAt = now.toLocaleString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const typeLabel = statementType === 'all' ? 'Comprehensive Financial Statement'
    : statementType === 'transactions' ? 'Transaction Statement'
    : statementType === 'loans' ? 'Loan Statement'
    : statementType === 'investments'? 'Investment Statement' :'Savings & Contributions Statement';

  const rowsHTML = rows.map((r, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
      <td style="padding:6px 8px;font-size:11px;color:#374151;border-bottom:1px solid #e5e7eb">${formatDate(r.date)}</td>
      <td style="padding:6px 8px;font-size:11px;color:#374151;border-bottom:1px solid #e5e7eb;font-family:monospace">${r.ref}</td>
      <td style="padding:6px 8px;font-size:11px;color:#374151;border-bottom:1px solid #e5e7eb">${CATEGORY_LABELS[r.category] || r.category}</td>
      <td style="padding:6px 8px;font-size:11px;color:#374151;border-bottom:1px solid #e5e7eb;max-width:200px">${r.description}</td>
      <td style="padding:6px 8px;font-size:11px;text-align:right;color:${r.debit > 0 ? '#dc2626' : '#9ca3af'};border-bottom:1px solid #e5e7eb">${r.debit > 0 ? formatNGN(r.debit) : '—'}</td>
      <td style="padding:6px 8px;font-size:11px;text-align:right;color:${r.credit > 0 ? '#16a34a' : '#9ca3af'};border-bottom:1px solid #e5e7eb">${r.credit > 0 ? formatNGN(r.credit) : '—'}</td>
      <td style="padding:6px 8px;font-size:11px;text-align:right;color:#374151;border-bottom:1px solid #e5e7eb">${r.balance_after != null ? formatNGN(r.balance_after) : '—'}</td>
      <td style="padding:6px 8px;font-size:11px;border-bottom:1px solid #e5e7eb">
        <span style="padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:600;background:${r.status === 'completed' || r.status === 'paid' ? '#dcfce7' : r.status === 'pending' ? '#fef3c7' : '#fee2e2'};color:${r.status === 'completed' || r.status === 'paid' ? '#15803d' : r.status === 'pending' ? '#92400e' : '#b91c1c'}">${r.status.replace(/_/g, ' ').toUpperCase()}</span>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${typeLabel} — ${member.member_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: #fff; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body style="padding:32px;max-width:1100px;margin:0 auto">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:20px;border-bottom:3px solid #1e3a5f">
    <div>
      <div style="font-size:22px;font-weight:800;color:#1e3a5f;letter-spacing:-0.5px">CLIMPS</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px">Changing Lives Multipurpose Cooperative Society</div>
      <div style="font-size:11px;color:#6b7280">First Bank · Account: 2044406437</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:16px;font-weight:700;color:#1e3a5f">${typeLabel}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px">Period: ${formatDate(dateFrom)} — ${formatDate(dateTo)}</div>
      <div style="font-size:11px;color:#6b7280">Generated: ${generatedAt}</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:2px">For record-keeping and tax compliance</div>
    </div>
  </div>

  <!-- Member Info -->
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px">
    <div style="font-size:12px;font-weight:700;color:#1e3a5f;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">Member Information</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
      <div><div style="font-size:10px;color:#9ca3af;text-transform:uppercase">Member Name</div><div style="font-size:13px;font-weight:600;color:#111827">${member.first_name} ${member.last_name}</div></div>
      <div><div style="font-size:10px;color:#9ca3af;text-transform:uppercase">Member ID</div><div style="font-size:13px;font-weight:600;color:#111827;font-family:monospace">${member.member_number}</div></div>
      <div><div style="font-size:10px;color:#9ca3af;text-transform:uppercase">Email</div><div style="font-size:13px;font-weight:600;color:#111827">${member.email}</div></div>
      <div><div style="font-size:10px;color:#9ca3af;text-transform:uppercase">Phone</div><div style="font-size:13px;font-weight:600;color:#111827">${member.phone || '—'}</div></div>
      <div><div style="font-size:10px;color:#9ca3af;text-transform:uppercase">Address</div><div style="font-size:13px;font-weight:600;color:#111827">${member.address || '—'}</div></div>
    </div>
  </div>

  <!-- Summary Cards -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px">
      <div style="font-size:10px;color:#3b82f6;text-transform:uppercase;font-weight:600">Total Credits</div>
      <div style="font-size:16px;font-weight:800;color:#1d4ed8;margin-top:4px">${formatNGN(summary.totalCredits)}</div>
    </div>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px">
      <div style="font-size:10px;color:#ef4444;text-transform:uppercase;font-weight:600">Total Debits</div>
      <div style="font-size:16px;font-weight:800;color:#dc2626;margin-top:4px">${formatNGN(summary.totalDebits)}</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px">
      <div style="font-size:10px;color:#22c55e;text-transform:uppercase;font-weight:600">Total Contributions</div>
      <div style="font-size:16px;font-weight:800;color:#15803d;margin-top:4px">${formatNGN(summary.totalContributions)}</div>
    </div>
    <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:14px">
      <div style="font-size:10px;color:#a855f7;text-transform:uppercase;font-weight:600">Total Invested</div>
      <div style="font-size:16px;font-weight:800;color:#7c3aed;margin-top:4px">${formatNGN(summary.totalInvested)}</div>
    </div>
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px">
      <div style="font-size:10px;color:#f97316;text-transform:uppercase;font-weight:600">Loan Disbursed</div>
      <div style="font-size:16px;font-weight:800;color:#ea580c;margin-top:4px">${formatNGN(summary.totalLoanDisbursed)}</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px">
      <div style="font-size:10px;color:#22c55e;text-transform:uppercase;font-weight:600">Loan Repaid</div>
      <div style="font-size:16px;font-weight:800;color:#15803d;margin-top:4px">${formatNGN(summary.totalLoanRepaid)}</div>
    </div>
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:14px">
      <div style="font-size:10px;color:#10b981;text-transform:uppercase;font-weight:600">Investment Returns</div>
      <div style="font-size:16px;font-weight:800;color:#059669;margin-top:4px">${formatNGN(summary.totalInvestmentReturns)}</div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px">
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:600">Total Transactions</div>
      <div style="font-size:16px;font-weight:800;color:#1e293b;margin-top:4px">${summary.rowCount}</div>
    </div>
  </div>

  <!-- Transactions Table -->
  <div style="margin-bottom:24px">
    <div style="font-size:13px;font-weight:700;color:#1e3a5f;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">Transaction Details</div>
    <table style="width:100%;border-collapse:collapse;font-size:11px">
      <thead>
        <tr style="background:#1e3a5f;color:#fff">
          <th style="padding:8px;text-align:left;font-weight:600">Date</th>
          <th style="padding:8px;text-align:left;font-weight:600">Reference</th>
          <th style="padding:8px;text-align:left;font-weight:600">Category</th>
          <th style="padding:8px;text-align:left;font-weight:600">Description</th>
          <th style="padding:8px;text-align:right;font-weight:600">Debit (₦)</th>
          <th style="padding:8px;text-align:right;font-weight:600">Credit (₦)</th>
          <th style="padding:8px;text-align:right;font-weight:600">Balance (₦)</th>
          <th style="padding:8px;text-align:left;font-weight:600">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML || '<tr><td colspan="8" style="padding:20px;text-align:center;color:#9ca3af">No transactions found for the selected period.</td></tr>'}
      </tbody>
      <tfoot>
        <tr style="background:#f1f5f9;font-weight:700">
          <td colspan="4" style="padding:8px;font-size:12px;color:#1e3a5f">TOTALS</td>
          <td style="padding:8px;text-align:right;font-size:12px;color:#dc2626">${formatNGN(summary.totalDebits)}</td>
          <td style="padding:8px;text-align:right;font-size:12px;color:#16a34a">${formatNGN(summary.totalCredits)}</td>
          <td colspan="2" style="padding:8px;font-size:12px;color:#1e3a5f">${summary.rowCount} records</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #e5e7eb;padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end">
    <div>
      <div style="font-size:10px;color:#9ca3af">This statement is generated electronically and is valid without a signature.</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:2px">For queries, contact CLIMPS at support@climps.coop</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:2px">Statement Reference: STMT/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:10px;color:#9ca3af">Changing Lives Multipurpose Cooperative Society</div>
      <div style="font-size:10px;color:#9ca3af">Regulated · Trusted · Member-Owned</div>
    </div>
  </div>

</body>
</html>`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FinancialStatementsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [rows, setRows] = useState<StatementRow[]>([]);
  const [summary, setSummary] = useState<StatementSummary | null>(null);
  const [generated, setGenerated] = useState(false);

  // Filters
  const [preset, setPreset] = useState('this_year');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statementType, setStatementType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Init dates from preset
  useEffect(() => {
    const range = getPresetRange(preset);
    setDateFrom(range.from);
    setDateTo(range.to);
  }, [preset]);

  // Load member
  useEffect(() => {
    if (!user) return;
    loadMember();
  }, [user]);

  async function loadMember() {
    try {
      const { data } = await supabase
        .from('members')
        .select('id, member_number, first_name, last_name, email, phone, address')
        .eq('user_id', user!.id)
        .maybeSingle();
      setMember(data);
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }

  const generateStatement = useCallback(async () => {
    if (!member) return;
    setGenerating(true);
    setGenerated(false);

    try {
      const allRows: StatementRow[] = [];

      // ── Transactions ──────────────────────────────────────────────────────
      if (statementType === 'all' || statementType === 'transactions') {
        const { data: txns } = await supabase
          .from('transactions')
          .select('*')
          .eq('member_id', member.id)
          .gte('created_at', dateFrom + 'T00:00:00')
          .lte('created_at', dateTo + 'T23:59:59')
          .order('created_at', { ascending: true });

        (txns || []).forEach((t: any) => {
          allRows.push({
            id: t.id,
            date: t.created_at,
            ref: t.transaction_ref || t.id.slice(0, 8).toUpperCase(),
            type: t.transaction_type,
            category: t.transaction_type,
            description: t.description || t.transaction_type.replace(/_/g, ' '),
            debit: t.is_debit ? (t.amount || 0) : 0,
            credit: !t.is_debit ? (t.amount || 0) : 0,
            balance_after: null,
            status: t.tx_status || 'completed',
            source: 'transaction',
          });
        });
      }

      // ── Contributions ─────────────────────────────────────────────────────
      if (statementType === 'all' || statementType === 'savings') {
        const { data: contribs } = await supabase
          .from('contributions')
          .select('*')
          .eq('member_id', member.id)
          .gte('created_at', dateFrom + 'T00:00:00')
          .lte('created_at', dateTo + 'T23:59:59')
          .order('created_at', { ascending: true });

        (contribs || []).forEach((c: any) => {
          if ((c.amount_paid || 0) > 0) {
            allRows.push({
              id: c.id,
              date: c.payment_date || c.created_at,
              ref: c.transaction_reference || `CONT/${c.contribution_year}/${String(c.contribution_month).padStart(2, '0')}`,
              type: 'contribution',
              category: 'contribution',
              description: `Monthly Contribution — ${new Date(c.contribution_year, c.contribution_month - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}`,
              debit: 0,
              credit: c.amount_paid || 0,
              balance_after: null,
              status: c.contribution_status || 'paid',
              source: 'contribution',
            });
          }
        });
      }

      // ── Loan Applications (disbursements & repayments) ────────────────────
      if (statementType === 'all' || statementType === 'loans') {
        const { data: loanApps } = await supabase
          .from('loan_applications')
          .select('*')
          .eq('member_id', member.id)
          .gte('created_at', dateFrom + 'T00:00:00')
          .lte('created_at', dateTo + 'T23:59:59')
          .order('created_at', { ascending: true });

        (loanApps || []).forEach((la: any) => {
          // Application entry
          allRows.push({
            id: la.id + '_app',
            date: la.created_at,
            ref: la.loan_reference || la.id.slice(0, 8).toUpperCase(),
            type: 'loan_application',
            category: la.app_status === 'disbursed' || la.app_status === 'active' ? 'loan_disbursement' : 'charge',
            description: `Loan Application — ₦${(la.loan_amount || 0).toLocaleString()} (${la.loan_duration_label || la.loan_duration_months + ' months'})`,
            debit: 0,
            credit: la.app_status === 'disbursed' || la.app_status === 'active' ? (la.loan_amount || 0) : 0,
            balance_after: null,
            status: la.app_status || 'submitted',
            source: 'loan',
          });

          // Processing fee
          if (la.processing_fee && la.processing_fee > 0) {
            allRows.push({
              id: la.id + '_fee',
              date: la.created_at,
              ref: (la.loan_reference || la.id.slice(0, 8).toUpperCase()) + '-FEE',
              type: 'processing_fee',
              category: 'processing_fee',
              description: `Loan Processing Fee (1%) — ${la.loan_reference || ''}`,
              debit: la.processing_fee,
              credit: 0,
              balance_after: null,
              status: 'completed',
              source: 'loan',
            });
          }
        });

        // Loan interest records
        const { data: interestRecs } = await supabase
          .from('loan_interest_records')
          .select('*, loan_applications(loan_reference)')
          .eq('member_id', member.id)
          .gte('created_at', dateFrom + 'T00:00:00')
          .lte('created_at', dateTo + 'T23:59:59')
          .order('created_at', { ascending: true });

        (interestRecs || []).forEach((ir: any) => {
          if ((ir.interest_paid || 0) > 0) {
            allRows.push({
              id: ir.id,
              date: ir.payment_date || ir.created_at,
              ref: `INT/${ir.loan_application_id?.slice(0, 6).toUpperCase() || 'LOAN'}/${ir.period_month}`,
              type: 'loan_repayment',
              category: 'loan_repayment',
              description: `Loan Interest Payment — Period ${ir.period_month}/${ir.period_year}`,
              debit: ir.interest_paid || 0,
              credit: 0,
              balance_after: null,
              status: ir.record_status || 'paid',
              source: 'loan',
            });
          }
          if ((ir.default_charge || 0) > 0) {
            allRows.push({
              id: ir.id + '_dc',
              date: ir.created_at,
              ref: `DEF/${ir.loan_application_id?.slice(0, 6).toUpperCase() || 'LOAN'}/${ir.period_month}`,
              type: 'default_charge',
              category: 'default_charge',
              description: `Default Charge — Period ${ir.period_month}/${ir.period_year}`,
              debit: ir.default_charge || 0,
              credit: 0,
              balance_after: null,
              status: 'completed',
              source: 'loan',
            });
          }
        });
      }

      // ── Investments ───────────────────────────────────────────────────────
      if (statementType === 'all' || statementType === 'investments') {
        const { data: invApps } = await supabase
          .from('investor_circle_applications')
          .select('*')
          .eq('user_id', user!.id)
          .gte('created_at', dateFrom + 'T00:00:00')
          .lte('created_at', dateTo + 'T23:59:59')
          .order('created_at', { ascending: true });

        (invApps || []).forEach((ia: any) => {
          allRows.push({
            id: ia.id + '_inv',
            date: ia.created_at,
            ref: ia.application_number || ia.id.slice(0, 8).toUpperCase(),
            type: 'investment_subscription',
            category: 'investment_subscription',
            description: `Investment Application — ₦${(ia.investment_amount || 0).toLocaleString()} for ${ia.investment_duration_label || ia.investment_duration_months + ' months'}`,
            debit: ia.investment_amount || 0,
            credit: 0,
            balance_after: null,
            status: ia.app_status || 'submitted',
            source: 'investment',
          });

          if (ia.processing_fee && ia.processing_fee > 0) {
            allRows.push({
              id: ia.id + '_invfee',
              date: ia.created_at,
              ref: (ia.application_number || ia.id.slice(0, 8).toUpperCase()) + '-FEE',
              type: 'processing_fee',
              category: 'processing_fee',
              description: `Investment Processing Fee — ${ia.application_number || ''}`,
              debit: ia.processing_fee,
              credit: 0,
              balance_after: null,
              status: 'completed',
              source: 'investment',
            });
          }
        });

        // Investment records (active/matured)
        const { data: invRecs } = await supabase
          .from('investor_circle_records')
          .select('*')
          .eq('user_id', user!.id)
          .gte('created_at', dateFrom + 'T00:00:00')
          .lte('created_at', dateTo + 'T23:59:59')
          .order('created_at', { ascending: true });

        (invRecs || []).forEach((ir: any) => {
          if (ir.record_status === 'matured' && (ir.actual_return || 0) > 0) {
            allRows.push({
              id: ir.id + '_ret',
              date: ir.maturity_date || ir.created_at,
              ref: (ir.investment_number || ir.id.slice(0, 8).toUpperCase()) + '-RET',
              type: 'investment_return',
              category: 'investment_return',
              description: `Investment Return — ${ir.investment_number} matured`,
              debit: 0,
              credit: ir.actual_return || 0,
              balance_after: null,
              status: 'completed',
              source: 'investment',
            });
          }
        });
      }

      // ── Calculate Running Balance (Chronological order) ───────────────
      allRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let running = 0;
      for (const r of allRows) {
        running += (r.credit || 0) - (r.debit || 0);
        r.balance_after = running;
      }

      // ── Sort ──────────────────────────────────────────────────────────────
      allRows.sort((a, b) => {
        if (sortField === 'date') {
          const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
          return sortDir === 'asc' ? diff : -diff;
        } else {
          const aAmt = a.credit + a.debit;
          const bAmt = b.credit + b.debit;
          return sortDir === 'asc' ? aAmt - bAmt : bAmt - aAmt;
        }
      });

      // ── Summary ───────────────────────────────────────────────────────────
      const totalCredits = allRows.reduce((s, r) => s + r.credit, 0);
      const totalDebits = allRows.reduce((s, r) => s + r.debit, 0);
      const totalContributions = allRows.filter(r => r.category === 'contribution').reduce((s, r) => s + r.credit, 0);
      const totalLoanDisbursed = allRows.filter(r => r.category === 'loan_disbursement').reduce((s, r) => s + r.credit, 0);
      const totalLoanRepaid = allRows.filter(r => r.category === 'loan_repayment').reduce((s, r) => s + r.debit, 0);
      const totalInvested = allRows.filter(r => r.category === 'investment_subscription').reduce((s, r) => s + r.debit, 0);
      const totalInvestmentReturns = allRows.filter(r => r.category === 'investment_return' || r.category === 'investment_maturity').reduce((s, r) => s + r.credit, 0);

      setSummary({
        openingBalance: 0,
        totalCredits,
        totalDebits,
        closingBalance: totalCredits - totalDebits,
        totalContributions,
        totalLoanDisbursed,
        totalLoanRepaid,
        totalInvested,
        totalInvestmentReturns,
        rowCount: allRows.length,
      });
      setRows(allRows);
      setGenerated(true);
    } catch (err) {
      console.error('Statement generation error:', err);
    } finally {
      setGenerating(false);
    }
  }, [member, dateFrom, dateTo, statementType, sortField, sortDir, supabase, user]);

  function handleDownloadPDF() {
    if (!member || !summary) return;
    const html = generatePDFContent(member, rows, summary, dateFrom, dateTo, statementType);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  }

  function handleDownloadCSV() {
    if (!rows.length) return;
    const headers = ['Date', 'Reference', 'Category', 'Description', 'Debit (NGN)', 'Credit (NGN)', 'Balance (NGN)', 'Status'];
    const csvRows = rows.map(r => [
      formatDate(r.date),
      r.ref,
      CATEGORY_LABELS[r.category] || r.category,
      `"${r.description.replace(/"/g, '""')}"`,
      r.debit > 0 ? r.debit.toFixed(2) : '',
      r.credit > 0 ? r.credit.toFixed(2) : '',
      r.balance_after != null ? r.balance_after.toFixed(2) : '',
      r.status,
    ].join(','));
    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CLIMPS_Statement_${member?.member_number}_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fullName = member ? `${member.first_name} ${member.last_name}` : 'Member';
  const memberId = member?.member_number || '—';

  if (loading) {
    return (
      <AppLayout role="member" memberName="Loading…" memberId="—">
        <div className="p-6 xl:p-8 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="member" memberName={fullName} memberId={memberId}>
      <div className="p-6 xl:p-8 2xl:p-10 max-w-screen-2xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Statements</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Generate comprehensive statements for record-keeping and tax compliance
            </p>
          </div>
          {generated && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
              >
                <Download size={15} />
                Export CSV
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Printer size={15} />
                Download PDF
              </button>
            </div>
          )}
        </div>

        {/* ── Filter Panel ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => setShowFilters(v => !v)}
          >
            <div className="flex items-center gap-2.5">
              <Filter size={16} className="text-primary" />
              <span className="font-semibold text-sm text-foreground">Statement Filters</span>
              {generated && (
                <span className="text-xs text-muted-foreground">
                  · {rows.length} records · {formatDate(dateFrom)} — {formatDate(dateTo)}
                </span>
              )}
            </div>
            {showFilters ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </div>

          {showFilters && (
            <div className="px-5 pb-5 border-t border-border space-y-4">
              {/* Date Presets */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Quick Date Range</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'this_month', label: 'This Month' },
                    { value: 'last_month', label: 'Last Month' },
                    { value: 'last_3_months', label: 'Last 3 Months' },
                    { value: 'last_6_months', label: 'Last 6 Months' },
                    { value: 'this_year', label: 'This Year' },
                    { value: 'last_year', label: 'Last Year' },
                    { value: 'custom', label: 'Custom' },
                  ].map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPreset(p.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        preset === p.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => { setDateFrom(e.target.value); setPreset('custom'); }}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => { setDateTo(e.target.value); setPreset('custom'); }}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Statement Type</label>
                  <select
                    value={statementType}
                    onChange={e => setStatementType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="all">All Financial Activity</option>
                    <option value="transactions">Transactions Only</option>
                    <option value="savings">Savings & Contributions</option>
                    <option value="loans">Loans & Repayments</option>
                    <option value="investments">Investments</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortField}
                      onChange={e => setSortField(e.target.value as 'date' | 'amount')}
                      className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                    </select>
                    <button
                      onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
                      title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={generateStatement}
                disabled={generating || !dateFrom || !dateTo}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <><RefreshCw size={15} className="animate-spin" /> Generating…</>
                ) : (
                  <><BarChart3 size={15} /> Generate Statement</>
                )}
              </button>
            </div>
          )}

          {/* Generate CTA when filters hidden */}
          {!showFilters && !generated && (
            <div className="px-5 pb-5">
              <button
                onClick={() => { setShowFilters(true); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <BarChart3 size={15} /> Configure & Generate Statement
              </button>
            </div>
          )}
        </div>

        {/* ── Generate Prompt (initial state) ── */}
        {!generated && !generating && (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Generate Your Financial Statement</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Select a date range and statement type above, then click Generate Statement to view all your transactions, investments, loans, and balances.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: PiggyBank, label: 'Savings & Contributions', color: 'text-teal-600 bg-teal-50' },
                { icon: CreditCard, label: 'Loans & Repayments', color: 'text-purple-600 bg-purple-50' },
                { icon: TrendingUp, label: 'Investments', color: 'text-emerald-600 bg-emerald-50' },
                { icon: Wallet, label: 'All Transactions', color: 'text-blue-600 bg-blue-50' },
              ].map(item => (
                <div key={item.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${item.color}`}>
                  <item.icon size={14} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Loading State ── */}
        {generating && (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <RefreshCw size={32} className="text-primary animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground">Compiling your financial statement…</p>
            <p className="text-xs text-muted-foreground mt-1">Fetching transactions, contributions, loans, and investments</p>
          </div>
        )}

        {/* ── Summary Cards ── */}
        {generated && summary && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {[
                { label: 'Total Credits', value: summary.totalCredits, icon: ArrowDownLeft, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
                { label: 'Total Debits', value: summary.totalDebits, icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
                { label: 'Contributions', value: summary.totalContributions, icon: PiggyBank, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
                { label: 'Loan Disbursed', value: summary.totalLoanDisbursed, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
                { label: 'Loan Repaid', value: summary.totalLoanRepaid, icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
                { label: 'Total Invested', value: summary.totalInvested, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                { label: 'Investment Returns', value: summary.totalInvestmentReturns, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                { label: 'Net Position', value: summary.totalCredits - summary.totalDebits, icon: Wallet, color: 'text-primary', bg: 'bg-primary/5 border-primary/10' },
              ].map(card => (
                <div key={card.label} className={`${card.bg} border rounded-2xl p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{card.label}</span>
                    <card.icon size={15} className={card.color} />
                  </div>
                  <div className={`text-lg font-bold ${card.color}`}>{formatNGN(card.value)}</div>
                </div>
              ))}
            </div>

            {/* ── Statement Info Bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(dateFrom)} — {formatDate(dateTo)}</span>
                <span className="flex items-center gap-1.5"><FileText size={13} /> {summary.rowCount} records</span>
                <span className="flex items-center gap-1.5"><Shield size={13} /> Member: {memberId}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Download size={12} /> CSV
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  <Printer size={12} /> PDF
                </button>
              </div>
            </div>

            {/* ── Transactions Table ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground text-sm">Transaction Details</h2>
                <span className="text-xs text-muted-foreground">{summary.rowCount} entries</span>
              </div>

              {rows.length === 0 ? (
                <div className="p-10 text-center">
                  <AlertCircle size={28} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No transactions found for the selected period and filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Debit</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Credit</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Balance</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row, i) => (
                        <tr key={row.id + i} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(row.date)}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-foreground">{row.ref}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[row.category] || 'bg-gray-100 text-gray-600'}`}>
                              {CATEGORY_LABELS[row.category] || row.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell max-w-[220px] truncate">{row.description}</td>
                          <td className="px-4 py-3 text-right">
                            {row.debit > 0 ? (
                              <span className="text-red-600 font-semibold text-xs">{formatNGN(row.debit)}</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {row.credit > 0 ? (
                              <span className="text-green-600 font-semibold text-xs">{formatNGN(row.credit)}</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {row.balance_after != null ? formatNGN(row.balance_after) : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-600'}`}>
                              {row.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50 border-t-2 border-border font-semibold">
                        <td colSpan={4} className="px-4 py-3 text-xs text-foreground">PERIOD TOTALS</td>
                        <td className="px-4 py-3 text-right text-xs text-red-600 font-bold">{formatNGN(summary.totalDebits)}</td>
                        <td className="px-4 py-3 text-right text-xs text-green-600 font-bold">{formatNGN(summary.totalCredits)}</td>
                        <td className="px-4 py-3 text-right text-xs text-primary font-bold font-mono">{formatNGN(summary.closingBalance)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{summary.rowCount} records</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* ── Disclaimer ── */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                This statement is generated from CLIMPS records and is provided for informational purposes. For official tax filings, please ensure all figures are reconciled with executed agreements and official receipts. Contact CLIMPS for certified statements.
              </p>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
