'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AppLayout from '@/components/AppLayout';
import {
  INVESTMENT_PRODUCTS,
  InvestmentProductDetail,
  formatNaira,
  formatNairaCompact,
} from '@/lib/investmentsData';
import {
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Search,
  Filter,
  Calendar,
  Building,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

interface PendingSubscription {
  id: string;
  reference: string;
  memberName: string;
  memberNumber: string;
  productName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  status: 'pending' | 'verified' | 'rejected';
}

const DEMO_SUBSCRIPTIONS: PendingSubscription[] = [
  {
    id: 'sub-1',
    reference: 'INV/2026/00201',
    memberName: 'Chukwudi Obi',
    memberNumber: 'CLMV/2026/0004',
    productName: 'Sovereign Treasury Notes',
    amount: 200000,
    paymentMethod: 'Bank Transfer (Zenith)',
    date: '2026-09-18',
    status: 'pending',
  },
  {
    id: 'sub-2',
    reference: 'INV/2026/00202',
    memberName: 'Yetunde Alabi',
    memberNumber: 'CLMV/2026/0005',
    productName: 'Cooperative Equity Shares',
    amount: 100000,
    paymentMethod: 'Savings Wallet',
    date: '2026-09-19',
    status: 'pending',
  },
  {
    id: 'sub-3',
    reference: 'INV/2026/00198',
    memberName: 'Emeka Nwosu',
    memberNumber: 'CLMV/2026/0002',
    productName: 'Real Estate Growth Fund',
    amount: 500000,
    paymentMethod: 'Bank Transfer (Zenith)',
    date: '2026-09-17',
    status: 'verified',
  },
];

export default function AdminInvestmentsPage() {
  const [products, setProducts] = useState<InvestmentProductDetail[]>(INVESTMENT_PRODUCTS);
  const [subscriptions, setSubscriptions] = useState<PendingSubscription[]>(DEMO_SUBSCRIPTIONS);
  const [activeTab, setActiveTab] = useState<'products' | 'subscriptions'>('products');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');

  // Create Product Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Fixed Income',
    tagline: '',
    description: '',
    minimumInvestment: 50000,
    maximumInvestment: 10000000,
    durationMonths: 12,
    projectedReturnRate: 15.0,
    returnMethod: 'Simple Annual Return',
    openingDate: '2026-10-01',
    closingDate: '2026-12-31',
    maturityDate: '2027-10-01',
    riskLevel: 'Low' as const,
    riskInformation: '',
    eligibility: 'All active members',
    totalCapacity: 50000000,
    productStatus: 'open' as const,
    isGuaranteed: false,
    terms: 'Tenure lock-in of 12 months. Certificate generated upon payment verification.',
  });

  const handleStatusChange = (productId: string, newStatus: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, productStatus: newStatus } : p))
    );
  };

  const handleVerifySubscription = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'verified' } : s))
    );
  };

  const handleRejectSubscription = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'rejected' } : s))
    );
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct: InvestmentProductDetail = {
      id: newId,
      code: formData.code || `INV-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      tagline: formData.tagline || 'High yield cooperative investment.',
      category: formData.category,
      description: formData.description,
      fullDescription: formData.description,
      minimumInvestment: Number(formData.minimumInvestment),
      maximumInvestment: Number(formData.maximumInvestment),
      durationMonths: Number(formData.durationMonths),
      durationLabel: `${formData.durationMonths} Months`,
      projectedReturnRate: Number(formData.projectedReturnRate),
      projectedReturnLabel: `${formData.projectedReturnRate}% p.a.`,
      isGuaranteed: formData.isGuaranteed,
      returnMethod: formData.returnMethod,
      openingDate: formData.openingDate,
      closingDate: formData.closingDate,
      maturityDate: formData.maturityDate,
      riskLevel: formData.riskLevel,
      riskInformation: formData.riskInformation || 'Managed cooperative risk.',
      disclosures: ['Projected return subject to business surplus.'],
      eligibility: formData.eligibility,
      totalCapacity: Number(formData.totalCapacity),
      totalSubscribed: 0,
      productStatus: formData.productStatus,
      terms: [formData.terms],
      benefits: ['Capital growth', 'Audited returns'],
    };

    setProducts([newProduct, ...products]);
    setShowCreateModal(false);
  };

  const totalCapitalMobilized = products.reduce((s, p) => s + p.totalSubscribed, 0);
  const pendingSubs = subscriptions.filter((s) => s.status === 'pending');

  return (
    <AppLayout role="admin" memberName="Operations Administrator" memberId="ADM/2026/0002">
      <div className="p-6 xl:p-8 2xl:p-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1.5">
              <Link href="/admin-dashboard" className="hover:text-white">Admin</Link>
              <span>/</span>
              <span className="text-white font-medium">Investment Management</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              Investment Products & Operations
            </h1>
            <p className="text-xs text-white/50 mt-0.5">
              Configure investment offerings, manage availability statuses, and verify subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/investment-products"
              target="_blank"
              className="btn-outline text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              Public Catalog ↗
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Create Investment Product
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm">
            <div className="text-xs text-white/50 mb-1">Total Products</div>
            <div className="text-xl font-extrabold text-white font-tabular">{products.length}</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">
              {products.filter((p) => p.productStatus === 'open').length} currently Open
            </div>
          </div>

          <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm">
            <div className="text-xs text-white/50 mb-1">Capital Mobilized</div>
            <div className="text-xl font-extrabold text-emerald-400 font-tabular">
              {formatNairaCompact(totalCapitalMobilized)}
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">Across active offerings</div>
          </div>

          <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm">
            <div className="text-xs text-white/50 mb-1">Pending Verification</div>
            <div className="text-xl font-extrabold text-amber-600 font-tabular">{pendingSubs.length}</div>
            <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Action required</div>
          </div>

          <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-4 shadow-sm">
            <div className="text-xs text-white/50 mb-1">Avg. Projected Yield</div>
            <div className="text-xl font-extrabold text-emerald-600 font-tabular">17.2% p.a.</div>
            <div className="text-[11px] text-white/50 mt-0.5">Across active tranches</div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-white/10 gap-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'products'
                ? 'border-primary text-emerald-400'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Product Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'subscriptions'
                ? 'border-primary text-emerald-400'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Subscription Verification
            {pendingSubs.length > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {pendingSubs.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: Products Catalog */}
        {activeTab === 'products' && (
          <div className="bg-[#0d1527] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search product by title, code, category…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.06]/40 border border-input rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.06]/60 border-b border-white/10 text-white/50 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Product Name & Code</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Min. Investment</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Projected Return</th>
                    <th className="px-4 py-3">Subscription Capacity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Change Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-tabular">
                  {products
                    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))
                    .map((p) => {
                      const capacityPct = Math.min(100, Math.round((p.totalSubscribed / p.totalCapacity) * 100));
                      return (
                        <tr key={p.id} className="hover:bg-white/[0.06]/30 transition-colors">
                          <td className="px-4 py-3.5 font-sans">
                            <div className="font-bold text-white text-sm leading-snug">{p.name}</div>
                            <div className="text-[11px] text-white/50 font-mono">{p.code}</div>
                          </td>
                          <td className="px-4 py-3.5 font-sans text-white/50">
                            {p.category}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-white">
                            {formatNaira(p.minimumInvestment)}
                          </td>
                          <td className="px-4 py-3.5 text-white/50">
                            {p.durationMonths} Mo
                          </td>
                          <td className="px-4 py-3.5 text-emerald-600 font-semibold">
                            {p.projectedReturnLabel}
                            <div className="text-[10px] text-white/50 font-sans">
                              {p.isGuaranteed ? 'Guaranteed' : 'Projected'}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 w-36">
                            <div className="text-[11px] text-white/50 mb-1">
                              {formatNairaCompact(p.totalSubscribed)} / {formatNairaCompact(p.totalCapacity)} ({capacityPct}%)
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${capacityPct}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-sans">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                p.productStatus === 'open'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                  : p.productStatus === 'fully_subscribed'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                                  : 'bg-white/10 text-white/60 border border-white/15'
                              }`}
                            >
                              {p.productStatus.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-sans">
                            <select
                              value={p.productStatus}
                              onChange={(e) => handleStatusChange(p.id, e.target.value)}
                              className="text-xs font-semibold rounded-lg border border-input bg-[#0d1527] px-2 py-1 focus:ring-1 focus:ring-primary"
                            >
                              <option value="open">Open</option>
                              <option value="fully_subscribed">Fully Subscribed</option>
                              <option value="closed">Closed</option>
                              <option value="matured">Matured</option>
                              <option value="suspended">Suspended</option>
                              <option value="draft">Draft</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Subscriptions Verification */}
        {activeTab === 'subscriptions' && (
          <div className="bg-[#0d1527] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                Investment Subscription Applications
              </h3>
              <p className="text-xs text-white/50">
                Verify member bank transfer narrations and activate investment accounts.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.06]/60 border-b border-white/10 text-white/50 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Channel</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-tabular">
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.06]/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                        {s.reference}
                      </td>
                      <td className="px-4 py-3.5 font-sans">
                        <div className="font-bold text-white">{s.memberName}</div>
                        <div className="text-[11px] text-white/50 font-mono">{s.memberNumber}</div>
                      </td>
                      <td className="px-4 py-3.5 font-sans text-white/50">
                        {s.productName}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        {formatNaira(s.amount)}
                      </td>
                      <td className="px-4 py-3.5 font-sans text-white/50">
                        {s.paymentMethod}
                      </td>
                      <td className="px-4 py-3.5 text-white/50">
                        {s.date}
                      </td>
                      <td className="px-4 py-3.5 font-sans">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            s.status === 'verified'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : s.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                              : 'bg-red-500/15 text-red-400 border border-red-500/25'
                          }`}
                        >
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-sans">
                        {s.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleVerifySubscription(s.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Verify & Activate
                            </button>
                            <button
                              onClick={() => handleRejectSubscription(s.id)}
                              className="px-2 py-1 border border-white/10 hover:bg-white/[0.06] text-red-400 rounded-lg text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-white/50 text-[11px]">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create New Investment Product */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white">
                  Create New Investment Product
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-white block mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Export Produce Warehouse Note"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-white block mb-1">Product Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. INV-EXP-2026"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-white block mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white"
                    >
                      <option>Fixed Income</option>
                      <option>Equity & Shares</option>
                      <option>Real Estate</option>
                      <option>Agriculture</option>
                      <option>SME Lending</option>
                      <option>Government Securities</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-white block mb-1">Short Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. Secured storage yields."
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-white block mb-1">Description & Objective</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Comprehensive description of where funds will be deployed..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-white block mb-1">Min. Amount (₦)</label>
                    <input
                      type="number"
                      required
                      value={formData.minimumInvestment}
                      onChange={(e) => setFormData({ ...formData, minimumInvestment: Number(e.target.value) })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white font-tabular"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-white block mb-1">Max. Amount (₦)</label>
                    <input
                      type="number"
                      value={formData.maximumInvestment}
                      onChange={(e) => setFormData({ ...formData, maximumInvestment: Number(e.target.value) })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white font-tabular"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-white block mb-1">Duration (Months)</label>
                    <input
                      type="number"
                      required
                      value={formData.durationMonths}
                      onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white font-tabular"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-white block mb-1">Projected Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.projectedReturnRate}
                      onChange={(e) => setFormData({ ...formData, projectedReturnRate: Number(e.target.value) })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white font-tabular"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-white block mb-1">Opening Date</label>
                    <input
                      type="date"
                      value={formData.openingDate}
                      onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-white block mb-1">Closing Date</label>
                    <input
                      type="date"
                      value={formData.closingDate}
                      onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-white block mb-1">Maturity Date</label>
                    <input
                      type="date"
                      value={formData.maturityDate}
                      onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-white block mb-1">Calculation Method</label>
                    <select
                      value={formData.returnMethod}
                      onChange={(e) => setFormData({ ...formData, returnMethod: e.target.value })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white"
                    >
                      <option>Simple Annual Return</option>
                      <option>Fixed Contractual Return</option>
                      <option>Harvest Cycle Surplus</option>
                      <option>Quarterly Rental Yield</option>
                      <option>AGM Annual Dividend</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-white block mb-1">Total Offering Capacity (₦)</label>
                    <input
                      type="number"
                      value={formData.totalCapacity}
                      onChange={(e) => setFormData({ ...formData, totalCapacity: Number(e.target.value) })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white font-tabular"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-white block mb-1">Product Status</label>
                    <select
                      value={formData.productStatus}
                      onChange={(e) => setFormData({ ...formData, productStatus: e.target.value as any })}
                      className="w-full rounded-xl border border-input p-2.5 bg-[#0d1527] text-white"
                    >
                      <option value="open">Open</option>
                      <option value="draft">Draft</option>
                      <option value="fully_subscribed">Fully Subscribed</option>
                      <option value="closed">Closed</option>
                      <option value="matured">Matured</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="guaranteed_check"
                    checked={formData.isGuaranteed}
                    onChange={(e) => setFormData({ ...formData, isGuaranteed: e.target.checked })}
                    className="w-4 h-4 text-emerald-400 rounded"
                  />
                  <label htmlFor="guaranteed_check" className="font-semibold text-white">
                    This offering has contractually guaranteed returns (e.g. fixed promissory note).
                  </label>
                </div>

                <div className="flex gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-outline flex-1 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 py-2.5"
                  >
                    Publish Investment Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
