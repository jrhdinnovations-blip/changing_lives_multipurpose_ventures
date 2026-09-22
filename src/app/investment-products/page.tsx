'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { INVESTMENT_PRODUCTS, InvestmentProductDetail, formatNaira, formatNairaCompact } from '@/lib/investmentsData';
import { TrendingUp, ShieldCheck, Calendar, ArrowRight, Calculator, Sparkles, Filter, CheckCircle2, AlertCircle } from 'lucide-react';

type FilterType = 'all' | 'open' | 'fixed' | 'high-yield' | 'agri-sme';

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Opportunities' },
  { id: 'open', label: 'Open for Subscription' },
  { id: 'fixed', label: 'Fixed & Sovereign' },
  { id: 'high-yield', label: 'High Yield (18%+)' },
  { id: 'agri-sme', label: 'Real Sector (Agri & SME)' },
];

const filterMap: Record<FilterType, (p: InvestmentProductDetail) => boolean> = {
  all: () => true,
  open: (p) => p.productStatus === 'open',
  fixed: (p) => p.isGuaranteed || p.category === 'Fixed Income' || p.category === 'Government Securities',
  'high-yield': (p) => p.projectedReturnRate >= 18,
  'agri-sme': (p) => p.category === 'Agriculture' || p.category === 'SME Lending' || p.category === 'Real Estate',
};

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  open: { label: 'Open for Subscription', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500 animate-pulse' },
  fully_subscribed: { label: 'Fully Subscribed', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  closed: { label: 'Closed', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-200', dot: 'bg-gray-400' },
  matured: { label: 'Matured', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  suspended: { label: 'Suspended', color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
  draft: { label: 'Draft', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-300' },
};

function ProductCard({ product }: { product: InvestmentProductDetail }) {
  const statusCfg = STATUS_BADGES[product.productStatus] || STATUS_BADGES.open;
  const capacityPct = Math.min(100, Math.round((product.totalSubscribed / product.totalCapacity) * 100));

  return (
    <div className="relative flex flex-col rounded-3xl border border-border bg-card p-6 lg:p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group">
      {/* Top Pick / Featured Ribbon */}
      {product.featured && (
        <div className="absolute -top-px -right-px">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl rounded-tr-3xl tracking-widest uppercase shadow-sm">
            ★ FEATURED
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {product.code}
            </span>
            <span className="text-xs font-semibold text-primary/80">
              {product.category}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </div>
      </div>

      <p className="text-xs font-semibold text-emerald-600 mb-2">{product.tagline}</p>
      <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-2">
        {product.description}
      </p>

      {/* Key Metrics Bento */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="bg-muted/40 rounded-2xl p-3 border border-border/50 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">
            {product.isGuaranteed ? 'Guaranteed Return' : 'Projected Return'}
          </div>
          <div className={`text-base font-extrabold font-tabular ${product.isGuaranteed ? 'text-blue-600' : 'text-emerald-600'}`}>
            {product.projectedReturnLabel}
          </div>
          <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 ${product.isGuaranteed ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800'}`}>
            {product.isGuaranteed ? 'Contractual' : 'Projected'}
          </span>
        </div>

        <div className="bg-muted/40 rounded-2xl p-3 border border-border/50 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Min. Deposit</div>
          <div className="text-base font-bold text-foreground font-tabular">
            {formatNairaCompact(product.minimumInvestment)}
          </div>
          <span className="text-[9px] text-muted-foreground">Entry minimum</span>
        </div>

        <div className="bg-muted/40 rounded-2xl p-3 border border-border/50 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Duration</div>
          <div className="text-base font-bold text-foreground font-tabular">
            {product.durationMonths} Mo
          </div>
          <span className="text-[9px] text-muted-foreground">{product.durationLabel.split(' ')[0]}</span>
        </div>
      </div>

      {/* Capacity & Dates */}
      <div className="mb-5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
            <span className="font-semibold text-foreground">{statusCfg.label}</span>
          </span>
          <span className="font-tabular font-bold text-foreground">
            {capacityPct}% <span className="font-normal text-muted-foreground">filled</span>
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${capacityPct >= 95 ? 'bg-amber-500' : 'bg-primary'}`}
            style={{ width: `${capacityPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Closes: {new Date(product.closingDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span>Risk: <strong className="text-foreground">{product.riskLevel}</strong></span>
        </div>
      </div>

      {/* Non-Guaranteed Disclosure Tag */}
      <div className="mb-6 p-2.5 rounded-xl bg-muted/30 border border-border/60 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <span>
          {product.isGuaranteed
            ? 'Contractually fixed rate issued under CLIMPS asset-backed securities covenant.'
            : 'Projected Return — not contractually guaranteed. Subject to cooperative trading performance.'}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-auto grid grid-cols-2 gap-2.5 pt-2 border-t border-border">
        <Link
          href={`/invest/products/${product.id}`}
          className="btn-outline text-center py-2.5 text-xs font-semibold flex items-center justify-center gap-1 hover:border-primary/50"
        >
          View Details
        </Link>
        {product.productStatus === 'open' ? (
          <Link
            href={`/invest/now?product=${product.id}`}
            className="btn-primary text-center py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
          >
            Invest Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <button
            disabled
            className="btn-outline opacity-60 cursor-not-allowed text-center py-2.5 text-xs font-semibold"
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
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-2.5">
              <Image
                src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
                alt="CLIMPS Cooperative Logo"
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
              <span className="font-bold text-base text-primary tracking-tight">CLIMPS</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/invest/calculator" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center gap-1">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Calculator
              </Link>
              <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="btn-accent text-sm px-4 py-2">
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="gradient-primary py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/landing" className="text-white/60 text-sm hover:text-white/90 transition-colors">Home</Link>
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90 text-sm font-medium">Invest</span>
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90 text-sm font-medium">Investment Products</span>
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-white/90 text-xs font-semibold uppercase tracking-widest">
                {INVESTMENT_PRODUCTS.filter(p => p.productStatus === 'open').length} Open Opportunities Available
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Invest with purpose.<br />
              <span className="text-accent">Multiply your wealth.</span>
            </h1>
            <p className="text-white/80 text-base lg:text-lg leading-relaxed max-w-xl">
              Transparent, audited cooperative investment plans across real estate, agriculture, treasury assets, and member credit — with clearly disclosed projected returns.
            </p>
            <p className="text-white/50 text-xs mt-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Statutory notice: Returns labelled <strong>Projected Return</strong> are performance estimates and carry business risk.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/invest/calculator"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-colors"
            >
              <Calculator className="w-4 h-4 text-accent" />
              Calculate Potential Returns
            </Link>
            <Link
              href="/investors-circle"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              CLIMPS Investors Circle
            </Link>
            <Link
              href="/invest/now"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition-colors"
            >
              Invest Now Direct
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs bar */}
      <div className="bg-card border-b border-border sticky top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-thin">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mr-2 hidden md:inline-flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {filters.map((f) => {
              const count = INVESTMENT_PRODUCTS.filter(filterMap[f.id]).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    activeFilter === f.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  {f.label}
                  <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-md ${activeFilter === f.id ? 'bg-white/20 text-white' : 'bg-border text-muted-foreground'}`}>
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
            <h2 className="text-2xl font-extrabold text-foreground">
              {filters.find((f) => f.id === activeFilter)?.label}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
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
        <div className="mt-16 bg-muted/40 border border-border rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">
                Cooperative Investor Protection & Disclosures
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                All investment activities are conducted in accordance with the Bye-Laws of Changing Lives Multipurpose Ventures (CLIMPS) and relevant cooperative statutes. 
                Any stated return not contractually guaranteed is a <strong>Projected Return</strong> based on commercial evaluations. 
                We do not present speculative returns as guaranteed income. 
                Past returns do not guarantee future earnings. Please evaluate product risks, duration, and your liquidity requirements prior to subscribing.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-primary">
                <Link href="/investors-circle" className="hover:underline">Read Investors Circle Terms →</Link>
                <Link href="/invest/calculator" className="hover:underline">Simulate Compound Returns →</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
