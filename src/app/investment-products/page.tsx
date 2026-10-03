'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { INVESTMENT_PRODUCTS, InvestmentProductDetail, formatNairaCompact } from '@/lib/investmentsData';
import { TrendingUp, ShieldCheck, Calendar, ArrowRight, Calculator, Sparkles, Filter, AlertCircle } from 'lucide-react';
import LandingNav from '../landing/components/LandingNav';
import LandingFooter from '../landing/components/LandingFooter';

type FilterType = 'all' | 'regular' | 'coming-soon';

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Opportunities' },
  { id: 'regular', label: 'Wealth Circle (Open)' },
  { id: 'coming-soon', label: 'Coming Soon (Agro & Real Estate)' },
];

const filterMap: Record<FilterType, (p: InvestmentProductDetail) => boolean> = {
  all: () => true,
  regular: (p) => p.productStatus === 'open' && !p.comingSoon,
  'coming-soon': (p) => p.comingSoon || p.productStatus === 'coming_soon',
};

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  open: { label: 'Open for Subscription', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', dot: 'bg-emerald-400 animate-pulse' },
  coming_soon: { label: 'Coming Soon', color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/30', dot: 'bg-amber-400' },
  fully_subscribed: { label: 'Fully Subscribed', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', dot: 'bg-amber-400' },
  closed: { label: 'Closed', color: 'text-white/60', bg: 'bg-white/10 border-white/15', dot: 'bg-white/40' },
  matured: { label: 'Matured', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', dot: 'bg-blue-400' },
  suspended: { label: 'Suspended', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', dot: 'bg-red-400' },
  draft: { label: 'Draft', color: 'text-white/40', bg: 'bg-white/5 border-white/10', dot: 'bg-white/30' },
};

function ProductCard({ product }: { product: InvestmentProductDetail }) {
  const isComingSoon = product.comingSoon || product.productStatus === 'coming_soon';
  const isRegular = product.category === 'Regular Investment' || product.id === 'investors-circle';
  const statusCfg = STATUS_BADGES[product.productStatus] || (isComingSoon ? STATUS_BADGES.coming_soon : STATUS_BADGES.open);
  const capacityPct = Math.min(100, Math.round((product.totalSubscribed / product.totalCapacity) * 100));

  return (
    <div
      className={`relative flex flex-col rounded-3xl border bg-[#0d1527] p-6 lg:p-7 shadow-xl shadow-black/30 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 group ${
        isComingSoon ? 'border-amber-500/30' : 'border-white/10'
      }`}
    >
      {/* Top Banner Ribbon */}
      {isRegular ? (
        <div className="absolute -top-px -right-px">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl rounded-tr-3xl tracking-widest uppercase shadow-md">
            ★ WEALTH CIRCLE
          </div>
        </div>
      ) : isComingSoon ? (
        <div className="absolute -top-px -right-px">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl rounded-tr-3xl tracking-widest uppercase shadow-md flex items-center gap-1">
            <span>⏳ COMING SOON</span>
          </div>
        </div>
      ) : product.featured && (
        <div className="absolute -top-px -right-px">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl rounded-tr-3xl tracking-widest uppercase shadow-md">
            ★ FEATURED
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-bold text-white/60 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-md">
              {product.code}
            </span>
            <span className={`text-xs font-semibold ${isComingSoon ? 'text-amber-400' : 'text-emerald-400'}`}>
              {product.category}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
            {product.name}
          </h3>
        </div>
      </div>

      <p className={`text-xs font-semibold mb-2 ${isComingSoon ? 'text-amber-300' : 'text-emerald-400'}`}>
        {product.tagline}
      </p>
      <p className="text-white/60 text-sm leading-relaxed mb-5 line-clamp-2">
        {product.description}
      </p>

      {/* Key Metrics Bento */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/10 text-center">
          <div className="text-[11px] text-white/50 mb-0.5">
            {product.isGuaranteed ? 'Agreed Return' : 'Agreed Return'}
          </div>
          <div
            className={`text-base font-extrabold font-tabular ${
              isComingSoon ? 'text-amber-300' : 'text-emerald-400'
            }`}
          >
            {product.projectedReturnLabel}
          </div>
          <span
            className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 border ${
              isComingSoon
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isComingSoon ? 'Estimated' : 'Agreed'}
          </span>
        </div>

        <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/10 text-center">
          <div className="text-[11px] text-white/50 mb-0.5">
            {isComingSoon ? 'Est. Min' : 'Min. Deposit'}
          </div>
          <div className="text-base font-bold text-white font-tabular">
            {formatNairaCompact(product.minimumInvestment)}
          </div>
          <span className="text-[9px] text-white/40 block mt-0.5">Entry minimum</span>
        </div>

        <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/10 text-center">
          <div className="text-[11px] text-white/50 mb-0.5">Duration</div>
          <div className="text-base font-bold text-white font-tabular">
            {product.durationMonths} Mo
          </div>
          <span className="text-[9px] text-white/40 block mt-0.5">{product.durationLabel.split(' ')[0]}</span>
        </div>
      </div>

      {/* Capacity & Status */}
      <div className="mb-5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
            <span className={`font-semibold ${isComingSoon ? 'text-amber-300' : 'text-white'}`}>
              {statusCfg.label}
            </span>
          </span>
          {isComingSoon ? (
            <span className="font-bold text-amber-300 text-[11px] bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Waitlist Open
            </span>
          ) : (
            <span className="font-tabular font-bold text-white">
              {capacityPct}% <span className="font-normal text-white/50">filled</span>
            </span>
          )}
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isComingSoon ? 'bg-amber-400 w-1/4 animate-pulse' : capacityPct >= 95 ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: isComingSoon ? '25%' : `${capacityPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-white/50 pt-0.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-white/40" />
            {isComingSoon
              ? 'Target Launch: Opening Soon'
              : `Closes: ${new Date(product.closingDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </span>
          <span>
            Risk: <strong className="text-white">{product.riskLevel}</strong>
          </span>
        </div>
      </div>

      {/* Disclosure Tag */}
      <div className="mb-6 p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-[11px] text-white/60 leading-relaxed flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
        <span>
          {isComingSoon
            ? 'Offer in preparation. Returns and terms are indicative and finalized upon prospectus release.'
            : 'Agreed return structured under CLIMPS Wealth Circle Agreement. Liquidation subject to applicable notice period.'}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-auto grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
        <Link
          href={`/invest/products/${product.id}`}
          className="border border-white/20 bg-white/[0.04] text-white hover:bg-white/10 text-center py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
        >
          View Details
        </Link>
        {isComingSoon ? (
          <a
            href="mailto:admin@climps.org?subject=Investment Waitlist"
            className="border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-center py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
          >
            Notify Me
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        ) : product.productStatus === 'open' ? (
          <Link
            href={product.id === 'investors-circle' ? '/investors-circle' : `/invest/now?product=${product.id}`}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 text-center py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            {product.id === 'investors-circle' ? 'Join Wealth Circle' : 'Wealth Circle'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <button
            disabled
            className="border border-white/10 text-white/40 opacity-60 cursor-not-allowed text-center py-2.5 rounded-xl text-xs font-semibold"
          >
            Closed
          </button>
        )}
      </div>
    </div>
  );
}

export default function InvestmentProductsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const visibleProducts = INVESTMENT_PRODUCTS.filter(filterMap[activeFilter]);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      <LandingNav />

      {/* Hero banner */}
      <div className="pt-28 pb-16 lg:pt-36 lg:pb-24 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 mb-4 text-xs font-medium">
            <Link href="/landing" className="text-white/60 hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-emerald-400">Wealth Circle</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Investment Products</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                {INVESTMENT_PRODUCTS.filter((p) => p.productStatus === 'open').length} Open Opportunities Available
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              Invest with purpose.<br />
              <span className="text-emerald-400">Multiply your wealth.</span>
            </h1>
            <p className="text-white/70 text-base lg:text-lg leading-relaxed max-w-2xl">
              Grow your wealth with CLIMPS Wealth Circle (CWC) — our flagship 3.5% monthly agreed return opportunity with structured liquidation and member-first security.
            </p>
            <p className="text-white/40 text-xs mt-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Statutory notice: All transactions governed by CLIMPS cooperative by-laws and applicable Wealth Circle agreement.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/invest/calculator"
              className="inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/10 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-colors"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              Calculate Potential Returns
            </Link>
            <Link
              href="/investors-circle"
              className="inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/10 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              CLIMPS Wealth Circle (3.5%/mo)
            </Link>
            <Link
              href="/invest/now"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 transition-colors"
            >
              Wealth Circle Direct
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs bar */}
      <div className="bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/10 sticky top-16 lg:top-20 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3.5 overflow-x-auto scrollbar-thin">
            <span className="text-xs text-white/50 font-bold uppercase tracking-wider mr-2 hidden md:inline-flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-400" /> Filter:
            </span>
            {filters.map((f) => {
              const count = INVESTMENT_PRODUCTS.filter(filterMap[f.id]).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeFilter === f.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {f.label}
                  <span
                    className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-md ${
                      activeFilter === f.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {filters.find((f) => f.id === activeFilter)?.label}
            </h2>
            <p className="text-sm text-white/50 mt-0.5">
              Showing {visibleProducts.length} investment opportunit{visibleProducts.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Regulatory Disclaimers Card */}
        <div className="mt-16 bg-[#0d1527] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Cooperative Investor Protection & Disclosures
              </h3>
              <p className="text-xs text-white/60 leading-relaxed mb-3">
                All investment activities are conducted in accordance with the Bye-Laws of Changing Lives Multipurpose Ventures (CLIMPS) and relevant cooperative statutes. 
                CLIMPS Wealth Circle (CWC) features an agreed return of 3.5% monthly. Partial or full liquidation shall be subject to the applicable notice period and terms contained in the Wealth Circle Agreement.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-emerald-400">
                <Link href="/investors-circle" className="hover:underline">Read Wealth Circle Agreement Terms →</Link>
                <Link href="/invest/calculator" className="hover:underline">Simulate Compound Returns →</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
