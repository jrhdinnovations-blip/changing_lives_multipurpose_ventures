'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, ArrowRight, ShieldCheck, ArrowLeft, Clock, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

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
  draft: 'bg-white/10 text-white/70 border-white/15',
  submitted: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  under_review: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  awaiting_payment: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  payment_verification: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  agreement_pending: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  matured: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  early_liquidation_requested: 'bg-red-500/15 text-red-400 border-red-500/30',
  early_liquidation_approved: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  early_liquidation_rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  completed: 'bg-white/10 text-white/70 border-white/15',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[status] || 'bg-white/10 text-white/70 border-white/15'}`}>
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
  const [activeTab, setActiveTab] = useState<'investments' | 'applications' | 'liquidations'>('investments');
  const [loading, setLoading] = useState(true);

  // Liquidation modal
  const [showLiqModal, setShowLiqModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InvestmentRecord | null>(null);
  const [liqForm, setLiqForm] = useState({ type: 'full', amount: '', reason: '', date: '' });
  const [liqSubmitting, setLiqSubmitting] = useState(false);
  const [liqError, setLiqError] = useState('');
  const [liqSuccess, setLiqSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [recsRes, appsRes, liqsRes] = await Promise.all([
        supabase
          .from('investors_circle_records')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('investors_circle_applications')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('investors_circle_liquidations')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
      ]);

      if (recsRes.data) setRecords(recsRes.data);
      if (appsRes.data) setApplications(appsRes.data);
      if (liqsRes.data) setLiquidations(liqsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Summary Metrics
  const activeInvestments = records.filter(r => r.record_status === 'active');
  const maturedInvestments = records.filter(r => r.record_status === 'matured');
  const totalInvested = records.reduce((sum, r) => sum + (r.principal || 0), 0);
  const projectedReturns = records.reduce((sum, r) => sum + (r.projected_total_return || 0), 0);
  const upcomingMaturities = records.filter(r => {
    if (r.record_status !== 'active') return false;
    const days = daysUntil(r.maturity_date);
    return days > 0 && days <= 30;
  });

  async function submitLiquidation() {
    if (!selectedRecord) return;
    if (liqForm.type === 'partial' && !liqForm.amount) {
      setLiqError('Please specify the amount to liquidate.');
      return;
    }
    if (!liqForm.date) {
      setLiqError('Please specify the requested liquidation date.');
      return;
    }
    if (!liqForm.reason.trim()) {
      setLiqError('Please provide a reason for the liquidation.');
      return;
    }

    setLiqSubmitting(true);
    setLiqError('');
    try {
      const reqAmount = liqForm.type === 'full' ? selectedRecord.principal : parseFloat(liqForm.amount);
      const { error } = await supabase
        .from('investors_circle_liquidations')
        .insert({
          record_id: selectedRecord.id,
          user_id: user?.id,
          liquidation_type: liqForm.type,
          amount_requested: reqAmount,
          reason: liqForm.reason,
          requested_date: liqForm.date,
          request_status: 'pending',
        });

      if (error) throw error;
      setLiqSuccess(true);
      loadData();
    } catch (err: any) {
      setLiqError(err.message || 'Liquidation request failed.');
    } finally {
      setLiqSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <div className="bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/landing" className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">CLIMPS</p>
              <h1 className="text-xl font-bold text-white tracking-tight">Wealth Circle Dashboard</h1>
            </div>
          </div>
          <Link
            href="/investors-circle"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-950/40 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Wealth Circle</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Capital', value: formatNGN(totalInvested), icon: '💰' },
                { label: 'Active Circles', value: activeInvestments.length.toString(), icon: '📈' },
                { label: 'Matured', value: maturedInvestments.length.toString(), icon: '✅' },
                { label: 'Agreed Returns (3.5%)', value: formatNGN(projectedReturns), icon: '🎯' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-[#0d1527] border border-white/10 rounded-2xl p-5 shadow-xl">
                  <div className="text-2xl mb-2">{kpi.icon}</div>
                  <p className="text-xs text-white/50 font-medium mb-1 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-xl lg:text-2xl font-bold text-white font-tabular">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Upcoming maturities alert */}
            {upcomingMaturities.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Upcoming Maturity Notice</p>
                  {upcomingMaturities.map(r => (
                    <p key={r.id} className="text-xs text-white/70 mt-0.5">
                      {r.investment_number} — matures in {daysUntil(r.maturity_date)} days ({formatDate(r.maturity_date)})
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-[#0d1527] border border-white/10 rounded-xl p-1 mb-6 w-fit">
              {[
                { id: 'investments', label: `Wealth Circle (${records.length})` },
                { id: 'applications', label: `Applications (${applications.length})` },
                { id: 'liquidations', label: `Liquidations (${liquidations.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-white/60 hover:text-white'
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
                  <div className="bg-[#0d1527] rounded-3xl border border-white/10 p-12 text-center">
                    <div className="text-4xl mb-3">📊</div>
                    <p className="text-white font-medium">No active investments yet</p>
                    <p className="text-white/50 text-sm mt-1 mb-6">Your approved Wealth Circle participations will appear here.</p>
                    <Link
                      href="/investors-circle"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-950/40 inline-block"
                    >
                      Join Wealth Circle
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {records.map(record => {
                      const days = daysUntil(record.maturity_date);
                      return (
                        <div key={record.id} className="bg-[#0d1527] rounded-2xl border border-white/10 p-6 shadow-xl">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-xs text-white/40 font-medium mb-0.5">Investment Reference</p>
                              <p className="text-lg font-bold text-white font-mono">{record.investment_number}</p>
                            </div>
                            <StatusBadge status={record.record_status} />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-white/40 mb-0.5">Principal</p>
                              <p className="font-bold text-white">{formatNGN(record.principal)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/40 mb-0.5">Duration</p>
                              <p className="font-semibold text-white/80">{record.investment_tenure_label}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/40 mb-0.5">Monthly Agreed Return</p>
                              <p className="font-bold text-emerald-400">{formatNGN(record.monthly_return)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/40 mb-0.5">Maturity Date</p>
                              <p className="font-semibold text-white/80">{formatDate(record.maturity_date)}</p>
                            </div>
                          </div>
                          {record.record_status === 'active' && days > 0 && (
                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 mb-4">
                              <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
                                <span>Progress to maturity</span>
                                <span>{days} days remaining</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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
                            {record.record_status === 'active' && (
                              <button
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setLiqForm({ type: 'full', amount: '', reason: '', date: '' });
                                  setLiqError('');
                                  setLiqSuccess(false);
                                  setShowLiqModal(true);
                                }}
                                className="px-3.5 py-1.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold hover:bg-red-500/25 transition-colors"
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
                  <div className="bg-[#0d1527] rounded-3xl border border-white/10 p-12 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-white font-medium">No applications yet</p>
                    <p className="text-white/50 text-sm mt-1 mb-6">Submit your first Wealth Circle application.</p>
                    <Link
                      href="/investors-circle"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-950/40 inline-block"
                    >
                      Apply Now
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {applications.map(app => (
                      <div key={app.id} className="bg-[#0d1527] rounded-2xl border border-white/10 p-6 shadow-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-white/40 mb-0.5">Application Reference</p>
                            <p className="font-bold text-white font-mono">{app.application_number || 'Pending'}</p>
                          </div>
                          <StatusBadge status={app.app_status} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div><p className="text-xs text-white/40">Capital</p><p className="font-bold text-emerald-400">{formatNGN(app.investment_amount)}</p></div>
                          <div><p className="text-xs text-white/40">Duration</p><p className="font-semibold text-white/80">{app.investment_duration_label}</p></div>
                          <div><p className="text-xs text-white/40">Monthly Return (est.)</p><p className="font-semibold text-emerald-400">{formatNGN(app.indicative_monthly_return)}</p></div>
                          <div><p className="text-xs text-white/40">Submitted</p><p className="font-semibold text-white/80">{formatDate(app.created_at)}</p></div>
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
                  <div className="bg-[#0d1527] rounded-3xl border border-white/10 p-12 text-center">
                    <div className="text-4xl mb-3">🔄</div>
                    <p className="text-white font-medium">No liquidation requests</p>
                    <p className="text-white/50 text-sm mt-1">Your liquidation notices will appear here.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {liquidations.map(liq => (
                      <div key={liq.id} className="bg-[#0d1527] rounded-2xl border border-white/10 p-6 shadow-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-white/40 mb-0.5">Type</p>
                            <p className="font-bold text-white capitalize">{liq.liquidation_type} Liquidation</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            liq.request_status === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                            liq.request_status === 'rejected'? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}>
                            {liq.request_status.charAt(0).toUpperCase() + liq.request_status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div><p className="text-xs text-white/40">Amount Requested</p><p className="font-bold text-white">{formatNGN(liq.amount_requested)}</p></div>
                          <div><p className="text-xs text-white/40">Requested Date</p><p className="font-semibold text-white/80">{formatDate(liq.requested_date)}</p></div>
                          <div><p className="text-xs text-white/40">Submitted</p><p className="font-semibold text-white/80">{formatDate(liq.created_at)}</p></div>
                          <div className="col-span-2 sm:col-span-3"><p className="text-xs text-white/40">Reason</p><p className="text-white/70">{liq.reason}</p></div>
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1527] border border-white/15 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {liqSuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Request Submitted</h3>
                <p className="text-white/60 text-sm mb-6">Your liquidation request has been submitted for cooperative administration review.</p>
                <button
                  onClick={() => setShowLiqModal(false)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-white">Request Liquidation</h3>
                  <button onClick={() => setShowLiqModal(false)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                    ✕
                  </button>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-5">
                  <p className="text-sm font-semibold text-amber-300 mb-1">Notice Policy</p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Requests for partial or full liquidation shall be subject to the applicable notice period and the terms contained in the Wealth Circle Agreement.
                  </p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-5 text-sm">
                  <p className="font-semibold text-white mb-1">{selectedRecord.investment_number}</p>
                  <p className="text-white/70">Principal: <span className="font-bold text-emerald-400">{formatNGN(selectedRecord.principal)}</span></p>
                  <p className="text-white/70">Maturity: <span className="font-semibold text-white">{formatDate(selectedRecord.maturity_date)}</span></p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">Liquidation Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['full', 'partial'].map(t => (
                        <button
                          key={t}
                          onClick={() => setLiqForm(f => ({ ...f, type: t }))}
                          className={`py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${
                            liqForm.type === t ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-emerald-500/40'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {liqForm.type === 'partial' && (
                    <div>
                      <label className="block text-sm font-semibold text-white/90 mb-1.5">Amount to Liquidate</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold">₦</span>
                        <input
                          type="number"
                          value={liqForm.amount}
                          onChange={e => setLiqForm(f => ({ ...f, amount: e.target.value }))}
                          placeholder="Amount"
                          className="w-full border border-white/15 bg-white/[0.05] rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1.5">Requested Date</label>
                    <input
                      type="date"
                      value={liqForm.date}
                      onChange={e => setLiqForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full border border-white/15 bg-white/[0.05] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1.5">Reason for Liquidation</label>
                    <textarea
                      value={liqForm.reason}
                      onChange={e => setLiqForm(f => ({ ...f, reason: e.target.value }))}
                      placeholder="Please provide your reason..."
                      rows={3}
                      className="w-full border border-white/15 bg-white/[0.05] rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    />
                  </div>
                </div>

                {liqError && <p className="text-red-400 text-xs mt-3">{liqError}</p>}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowLiqModal(false)} className="flex-1 border border-white/20 bg-white/[0.04] text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={submitLiquidation}
                    disabled={liqSubmitting}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {liqSubmitting ? 'Submitting...' : 'Submit Request'}
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
