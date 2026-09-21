'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InvestmentRecord {
  id: string;
  investment_number: string;
  investor_name: string;
  investor_email: string;
  principal: number;
  processing_fee: number;
  interest_rate_percent: number;
  investment_start_date: string;
  investment_tenure_months: number;
  investment_tenure_label: string;
  maturity_date: string;
  monthly_return: number;
  projected_total_return: number;
  projected_maturity_value: number;
  actual_return: number;
  account_name: string;
  bank_name: string;
  record_status: string;
  agreement_reference: string | null;
  created_at: string;
}

interface Application {
  id: string;
  application_number: string | null;
  investor_name: string;
  investment_amount: number;
  investment_duration_label: string;
  investment_duration_months: number;
  indicative_monthly_return: number;
  indicative_maturity_value: number;
  investment_maturity_date: string | null;
  app_status: string;
  created_at: string;
}

interface LiquidationRequest {
  id: string;
  record_id: string;
  liquidation_type: string;
  amount_requested: number;
  reason: string;
  requested_date: string;
  request_status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  awaiting_payment: 'bg-orange-100 text-orange-700',
  payment_verification: 'bg-purple-100 text-purple-700',
  approved: 'bg-emerald-100 text-emerald-700',
  agreement_pending: 'bg-teal-100 text-teal-700',
  active: 'bg-green-100 text-green-700',
  matured: 'bg-indigo-100 text-indigo-700',
  early_liquidation_requested: 'bg-red-100 text-red-700',
  early_liquidation_approved: 'bg-orange-100 text-orange-700',
  early_liquidation_rejected: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

function formatNGN(val: number) {
  return '₦' + (val || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

export default function InvestorsDashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [records, setRecords] = useState<InvestmentRecord[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [liquidations, setLiquidations] = useState<LiquidationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'investments' | 'applications' | 'liquidations'>('investments');

  // Liquidation modal
  const [showLiqModal, setShowLiqModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InvestmentRecord | null>(null);
  const [liqForm, setLiqForm] = useState({ type: 'full', amount: '', reason: '', date: '' });
  const [liqSubmitting, setLiqSubmitting] = useState(false);
  const [liqError, setLiqError] = useState('');
  const [liqSuccess, setLiqSuccess] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [recRes, appRes, liqRes] = await Promise.all([
        supabase.from('investor_circle_records').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('investor_circle_applications').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('investor_circle_liquidation_requests').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      ]);
      setRecords(recRes.data || []);
      setApplications(appRes.data || []);
      setLiquidations(liqRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Summary stats
  const totalInvested = records.reduce((s, r) => s + (r.principal || 0), 0);
  const activeInvestments = records.filter(r => r.record_status === 'active');
  const maturedInvestments = records.filter(r => r.record_status === 'matured' || r.record_status === 'completed');
  const projectedReturns = records.filter(r => r.record_status === 'active').reduce((s, r) => s + (r.projected_total_return || 0), 0);
  const upcomingMaturities = activeInvestments.filter(r => daysUntil(r.maturity_date) <= 30 && daysUntil(r.maturity_date) > 0);

  async function submitLiquidation() {
    if (!selectedRecord || !user) return;
    if (!liqForm.reason.trim()) { setLiqError('Please provide a reason.'); return; }
    if (!liqForm.date) { setLiqError('Please provide a requested date.'); return; }
    const amt = liqForm.type === 'full' ? selectedRecord.principal : parseFloat(liqForm.amount);
    if (!amt || amt <= 0) { setLiqError('Please enter a valid amount.'); return; }

    setLiqSubmitting(true);
    setLiqError('');
    try {
      const requestedDate = new Date(liqForm.date);
      const today = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      const isEarly = requestedDate < oneMonthFromNow;

      const { error } = await supabase.from('investor_circle_liquidation_requests').insert({
        record_id: selectedRecord.id,
        user_id: user.id,
        liquidation_type: liqForm.type,
        amount_requested: amt,
        reason: liqForm.reason,
        requested_date: liqForm.date,
        is_early_liquidation: isEarly,
        request_status: 'pending',
      });
      if (error) throw error;

      // Update record status
      await supabase.from('investor_circle_records').update({ record_status: 'early_liquidation_requested' }).eq('id', selectedRecord.id);

      setLiqSuccess(true);
      loadData();
    } catch (err: any) {
      setLiqError(err?.message || 'Failed to submit request.');
    } finally {
      setLiqSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-500 text-sm mb-6">Please sign in to view your Investors Circle dashboard.</p>
          <Link href="/" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-widest">CLIMPS</p>
            <h1 className="text-xl font-bold text-gray-900">Investors Circle Dashboard</h1>
          </div>
          <Link
            href="/investors-circle"
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invest Now
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Invested', value: formatNGN(totalInvested), icon: '💰', color: 'bg-emerald-50 border-emerald-100' },
                { label: 'Active Investments', value: activeInvestments.length.toString(), icon: '📈', color: 'bg-blue-50 border-blue-100' },
                { label: 'Matured', value: maturedInvestments.length.toString(), icon: '✅', color: 'bg-indigo-50 border-indigo-100' },
                { label: 'Projected Returns', value: formatNGN(projectedReturns), icon: '🎯', color: 'bg-amber-50 border-amber-100' },
              ].map(kpi => (
                <div key={kpi.label} className={`${kpi.color} border rounded-2xl p-5`}>
                  <div className="text-2xl mb-2">{kpi.icon}</div>
                  <p className="text-xs text-gray-500 font-medium mb-1">{kpi.label}</p>
                  <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Upcoming maturities alert */}
            {upcomingMaturities.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <span className="text-xl">⏰</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Upcoming Maturity</p>
                  {upcomingMaturities.map(r => (
                    <p key={r.id} className="text-xs text-amber-700 mt-0.5">
                      {r.investment_number} — matures in {daysUntil(r.maturity_date)} days ({formatDate(r.maturity_date)})
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
              {[
                { id: 'investments', label: `Investments (${records.length})` },
                { id: 'applications', label: `Applications (${applications.length})` },
                { id: 'liquidations', label: `Liquidations (${liquidations.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Investments Tab ── */}
            {activeTab === 'investments' && (
              <div>
                {records.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="text-4xl mb-3">📊</div>
                    <p className="text-gray-500 font-medium">No active investments yet</p>
                    <p className="text-gray-400 text-sm mt-1 mb-4">Your approved investments will appear here.</p>
                    <Link href="/investors-circle" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors inline-block">
                      Start Investing
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {records.map(record => {
                      const days = daysUntil(record.maturity_date);
                      return (
                        <div key={record.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-xs text-gray-400 font-medium mb-0.5">Investment Reference</p>
                              <p className="text-lg font-bold text-gray-900 font-mono">{record.investment_number}</p>
                            </div>
                            <StatusBadge status={record.record_status} />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Principal</p>
                              <p className="font-bold text-gray-900">{formatNGN(record.principal)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Duration</p>
                              <p className="font-semibold text-gray-800">{record.investment_tenure_label}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Monthly Return</p>
                              <p className="font-bold text-emerald-600">{formatNGN(record.monthly_return)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Maturity Date</p>
                              <p className="font-semibold text-gray-800">{formatDate(record.maturity_date)}</p>
                            </div>
                          </div>
                          {record.record_status === 'active' && days > 0 && (
                            <div className="bg-gray-50 rounded-xl p-3 mb-4">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                                <span>Progress to maturity</span>
                                <span>{days} days remaining</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-2 bg-emerald-500 rounded-full transition-all"
                                  style={{
                                    width: `${Math.max(0, Math.min(100, 100 - (days / (record.investment_tenure_months * 30)) * 100))}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                              View Investment
                            </button>
                            {record.agreement_reference && (
                              <button className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                                Download Agreement
                              </button>
                            )}
                            <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
                              View Transactions
                            </button>
                            <button className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                              Download Receipt
                            </button>
                            {record.record_status === 'active' && (
                              <button
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setLiqForm({ type: 'full', amount: '', reason: '', date: '' });
                                  setLiqError('');
                                  setLiqSuccess(false);
                                  setShowLiqModal(true);
                                }}
                                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                              >
                                Request Liquidation
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Applications Tab ── */}
            {activeTab === 'applications' && (
              <div>
                {applications.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-500 font-medium">No applications yet</p>
                    <p className="text-gray-400 text-sm mt-1 mb-4">Submit your first investment application.</p>
                    <Link href="/investors-circle" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors inline-block">
                      Apply Now
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {applications.map(app => (
                      <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Application Reference</p>
                            <p className="font-bold text-gray-900 font-mono">{app.application_number || 'Pending'}</p>
                          </div>
                          <StatusBadge status={app.app_status} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div><p className="text-xs text-gray-400">Amount</p><p className="font-bold text-emerald-700">{formatNGN(app.investment_amount)}</p></div>
                          <div><p className="text-xs text-gray-400">Duration</p><p className="font-semibold text-gray-800">{app.investment_duration_label}</p></div>
                          <div><p className="text-xs text-gray-400">Monthly Return (est.)</p><p className="font-semibold text-emerald-600">{formatNGN(app.indicative_monthly_return)}</p></div>
                          <div><p className="text-xs text-gray-400">Submitted</p><p className="font-semibold text-gray-800">{formatDate(app.created_at)}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Liquidations Tab ── */}
            {activeTab === 'liquidations' && (
              <div>
                {liquidations.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="text-4xl mb-3">🔄</div>
                    <p className="text-gray-500 font-medium">No liquidation requests</p>
                    <p className="text-gray-400 text-sm mt-1">Your liquidation requests will appear here.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {liquidations.map(liq => (
                      <div key={liq.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Type</p>
                            <p className="font-bold text-gray-900 capitalize">{liq.liquidation_type} Liquidation</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            liq.request_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            liq.request_status === 'rejected'? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {liq.request_status.charAt(0).toUpperCase() + liq.request_status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div><p className="text-xs text-gray-400">Amount Requested</p><p className="font-bold text-gray-900">{formatNGN(liq.amount_requested)}</p></div>
                          <div><p className="text-xs text-gray-400">Requested Date</p><p className="font-semibold text-gray-800">{formatDate(liq.requested_date)}</p></div>
                          <div><p className="text-xs text-gray-400">Submitted</p><p className="font-semibold text-gray-800">{formatDate(liq.created_at)}</p></div>
                          <div className="col-span-2 sm:col-span-3"><p className="text-xs text-gray-400">Reason</p><p className="text-gray-700">{liq.reason}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Liquidation Modal */}
      {showLiqModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            {liqSuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Request Submitted</h3>
                <p className="text-gray-500 text-sm mb-4">Your liquidation request has been submitted for admin review.</p>
                <button onClick={() => setShowLiqModal(false)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900">Request Early Liquidation</h3>
                  <button onClick={() => setShowLiqModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                  <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Notice Required</p>
                  <p className="text-xs text-amber-700">One month's written notice is required for withdrawal or liquidation. Early liquidation requests are subject to admin review and may incur a 1% administrative charge and forfeiture of accrued returns for the notice period.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm">
                  <p className="font-semibold text-gray-800 mb-1">{selectedRecord.investment_number}</p>
                  <p className="text-gray-600">Principal: <span className="font-bold text-gray-900">{formatNGN(selectedRecord.principal)}</span></p>
                  <p className="text-gray-600">Maturity: <span className="font-semibold">{formatDate(selectedRecord.maturity_date)}</span></p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Liquidation Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['full', 'partial'].map(t => (
                        <button
                          key={t}
                          onClick={() => setLiqForm(f => ({ ...f, type: t }))}
                          className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${
                            liqForm.type === t ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-200 text-gray-700 hover:border-emerald-300'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {liqForm.type === 'partial' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount to Liquidate</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                        <input
                          type="number"
                          value={liqForm.amount}
                          onChange={e => setLiqForm(f => ({ ...f, amount: e.target.value }))}
                          placeholder="Amount"
                          className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Requested Date</label>
                    <input
                      type="date"
                      value={liqForm.date}
                      onChange={e => setLiqForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason for Liquidation</label>
                    <textarea
                      value={liqForm.reason}
                      onChange={e => setLiqForm(f => ({ ...f, reason: e.target.value }))}
                      placeholder="Please provide your reason..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                </div>

                {liqError && <p className="text-red-500 text-xs mt-3">{liqError}</p>}

                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowLiqModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={submitLiquidation}
                    disabled={liqSubmitting}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {liqSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </>
                    ) : 'Submit Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
