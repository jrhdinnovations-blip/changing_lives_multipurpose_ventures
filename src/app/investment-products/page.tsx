'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface InvestmentProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  minAmount: string;
  expectedReturns: string;
  duration: string;
  riskLevel: 'Low' | 'Low–Medium' | 'Medium' | 'Medium–High' | 'High';
  riskColor: string;
  riskBg: string;
  benefits: string[];
  badge: string;
  badgeColor: string;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
  icon: React.ReactNode;
  featured?: boolean;
}

const investmentProducts: InvestmentProduct[] = [
  {
    id: 'cooperative-shares',
    name: 'Cooperative Shares',
    tagline: 'Own a piece. Earn dividends.',
    description: 'Purchase shares in CLIMPS Cooperative and earn annual dividends from the society\'s profits. The more shares you hold, the higher your dividend payout.',
    minAmount: '₦10,000',
    expectedReturns: '14–18% p.a.*',
    duration: 'Ongoing (annual dividend)',
    riskLevel: 'Low',
    riskColor: 'text-emerald-700',
    riskBg: 'bg-emerald-100',
    benefits: ['Annual dividend payout', 'Voting rights at AGM', 'Shares appreciable over time', 'Transferable to next of kin'],
    badge: 'Member Exclusive',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    accentColor: 'text-emerald-600',
    bgGradient: 'from-emerald-50/80 to-white',
    borderColor: 'border-emerald-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    featured: true,
  },
  {
    id: 'fixed-investment',
    name: 'Fixed Investment Plan',
    tagline: 'Lock in. Earn guaranteed returns.',
    description: 'Commit a lump sum for a defined period and receive fixed, guaranteed returns at maturity. Ideal for members with idle capital seeking predictable income.',
    minAmount: '₦50,000',
    expectedReturns: '15% p.a.*',
    duration: '6 – 24 months',
    riskLevel: 'Low',
    riskColor: 'text-blue-700',
    riskBg: 'bg-blue-100',
    benefits: ['Guaranteed fixed returns', 'Monthly interest payout option', 'Auto-rollover on maturity', 'Certificate of investment issued'],
    badge: 'Guaranteed',
    badgeColor: 'bg-blue-100 text-blue-700',
    accentColor: 'text-blue-600',
    bgGradient: 'from-blue-50/80 to-white',
    borderColor: 'border-blue-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 'real-estate-fund',
    name: 'Real Estate Investment Fund',
    tagline: 'Property wealth. Shared access.',
    description: 'Pool resources with other members to invest in vetted real estate projects — residential estates, commercial properties, and land banking — and earn rental income plus capital appreciation.',
    minAmount: '₦100,000',
    expectedReturns: '18–22% p.a.*',
    duration: '12 – 36 months',
    riskLevel: 'Medium',
    riskColor: 'text-amber-700',
    riskBg: 'bg-amber-100',
    benefits: ['Quarterly rental income', 'Capital appreciation on exit', 'Professional property management', 'Diversified property portfolio'],
    badge: 'High Yield',
    badgeColor: 'bg-amber-100 text-amber-700',
    accentColor: 'text-amber-600',
    bgGradient: 'from-amber-50/80 to-white',
    borderColor: 'border-amber-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'agri-investment',
    name: 'Agricultural Investment',
    tagline: 'Farm the future. Harvest returns.',
    description: 'Invest in cooperative-managed agricultural projects — crop farming, poultry, and aquaculture — and earn returns from harvest proceeds. Supports food security and rural livelihoods.',
    minAmount: '₦25,000',
    expectedReturns: '20–28% per cycle*',
    duration: '3 – 9 months (per cycle)',
    riskLevel: 'Medium–High',
    riskColor: 'text-green-700',
    riskBg: 'bg-green-100',
    benefits: ['Short investment cycles', 'Harvest-linked returns', 'Insurance-backed crops', 'Reinvest across multiple cycles'],
    badge: 'Seasonal',
    badgeColor: 'bg-green-100 text-green-700',
    accentColor: 'text-green-600',
    bgGradient: 'from-green-50/80 to-white',
    borderColor: 'border-green-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'sme-investment',
    name: 'SME Growth Fund',
    tagline: 'Back businesses. Share the profit.',
    description: 'Co-invest in vetted small and medium enterprises within the cooperative network. Earn profit-sharing returns as the businesses grow, with quarterly performance reports.',
    minAmount: '₦75,000',
    expectedReturns: '16–24% p.a.*',
    duration: '12 – 24 months',
    riskLevel: 'Medium–High',
    riskColor: 'text-purple-700',
    riskBg: 'bg-purple-100',
    benefits: ['Profit-sharing model', 'Quarterly business reports', 'Portfolio of 5+ SMEs', 'Exit option at 12 months'],
    badge: 'SME Backed',
    badgeColor: 'bg-purple-100 text-purple-700',
    accentColor: 'text-purple-600',
    bgGradient: 'from-purple-50/80 to-white',
    borderColor: 'border-purple-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'treasury-notes',
    name: 'Treasury Notes',
    tagline: 'Government-backed. Zero default risk.',
    description: 'Invest in cooperative-pooled Nigerian Treasury Bills and FGN Bonds. Enjoy sovereign-grade security with returns above commercial bank rates, managed by our investment desk.',
    minAmount: '₦20,000',
    expectedReturns: '13–16% p.a.*',
    duration: '91 days – 12 months',
    riskLevel: 'Low',
    riskColor: 'text-sky-700',
    riskBg: 'bg-sky-100',
    benefits: ['Sovereign-grade security', 'Above-bank-rate returns', 'Flexible tenors (91/182/364 days)', 'Rollover on maturity'],
    badge: 'Capital Safe',
    badgeColor: 'bg-sky-100 text-sky-700',
    accentColor: 'text-sky-600',
    bgGradient: 'from-sky-50/80 to-white',
    borderColor: 'border-sky-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'mutual-fund',
    name: 'Cooperative Mutual Fund',
    tagline: 'Diversified. Professionally managed.',
    description: 'A diversified fund investing across equities, bonds, and money market instruments. Managed by our certified investment professionals for steady long-term wealth creation.',
    minAmount: '₦5,000',
    expectedReturns: '12–20% p.a.*',
    duration: 'Open-ended (min. 6 months)',
    riskLevel: 'Medium',
    riskColor: 'text-teal-700',
    riskBg: 'bg-teal-100',
    benefits: ['Diversified across asset classes', 'Professional fund management', 'Redeem anytime after 6 months', 'Monthly NAV statements'],
    badge: 'Diversified',
    badgeColor: 'bg-teal-100 text-teal-700',
    accentColor: 'text-teal-600',
    bgGradient: 'from-teal-50/80 to-white',
    borderColor: 'border-teal-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  },
  {
    id: 'dollar-investment',
    name: 'Dollar Investment Plan',
    tagline: 'Hedge against naira. Earn in USD.',
    description: 'Invest in USD-denominated instruments and earn returns in foreign currency. Protects your wealth from naira depreciation while generating competitive dollar returns.',
    minAmount: '$50 (≈ ₦80,000)',
    expectedReturns: '8–12% p.a. (USD)*',
    duration: '6 – 18 months',
    riskLevel: 'Low–Medium',
    riskColor: 'text-indigo-700',
    riskBg: 'bg-indigo-100',
    benefits: ['Returns paid in USD', 'FX hedge protection', 'Domiciliary account linked', 'Repatriate or reinvest on maturity'],
    badge: 'FX Protected',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    accentColor: 'text-indigo-600',
    bgGradient: 'from-indigo-50/80 to-white',
    borderColor: 'border-indigo-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const riskOrder = { 'Low': 1, 'Low–Medium': 2, 'Medium': 3, 'Medium–High': 4, 'High': 5 };

type FilterType = 'all' | 'low-risk' | 'medium-risk' | 'high-yield';

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Products' },
  { id: 'low-risk', label: 'Low Risk' },
  { id: 'medium-risk', label: 'Medium Risk' },
  { id: 'high-yield', label: 'High Yield' },
];

const filterMap: Record<FilterType, string[]> = {
  all: investmentProducts.map((p) => p.id),
  'low-risk': ['cooperative-shares', 'fixed-investment', 'treasury-notes'],
  'medium-risk': ['mutual-fund', 'dollar-investment', 'real-estate-fund'],
  'high-yield': ['real-estate-fund', 'agri-investment', 'sme-investment'],
};

function RiskBadge({ level, color, bg }: { level: string; color: string; bg: string }) {
  const dots = riskOrder[level as keyof typeof riskOrder] ?? 1;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${bg}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i <= dots ? color.replace('text-', 'bg-') : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <span className={`text-xs font-semibold ${color}`}>{level} Risk</span>
    </div>
  );
}

function ProductCard({ product }: { product: InvestmentProduct }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 ${product.borderColor} bg-gradient-to-br ${product.bgGradient} p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group`}
    >
      {/* Featured ribbon */}
      {product.featured && (
        <div className="absolute -top-px -right-px">
          <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-wide">
            ★ TOP PICK
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-white border border-border flex items-center justify-center ${product.accentColor} shadow-sm`}>
          {product.icon}
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${product.badgeColor}`}>
          {product.badge}
        </span>
      </div>

      {/* Name & tagline */}
      <h3 className="text-lg font-bold text-foreground mb-0.5">{product.name}</h3>
      <p className={`text-xs font-semibold ${product.accentColor} mb-3`}>{product.tagline}</p>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{product.description}</p>

      {/* Key metrics grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/80 rounded-xl p-3 text-center border border-white/90">
          <div className={`text-sm font-bold font-tabular ${product.accentColor}`}>{product.expectedReturns}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Proj. Returns</div>
        </div>
        <div className="bg-white/80 rounded-xl p-3 text-center border border-white/90">
          <div className="text-[11px] font-bold text-foreground font-tabular leading-tight">{product.minAmount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Min. Amount</div>
        </div>
        <div className="bg-white/80 rounded-xl p-3 text-center border border-white/90">
          <div className="text-[11px] font-bold text-foreground font-tabular leading-tight">{product.duration}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Duration</div>
        </div>
      </div>

      {/* Risk level */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Risk:</span>
        <RiskBadge level={product.riskLevel} color={product.riskColor} bg={product.riskBg} />
      </div>

      {/* Benefits */}
      <div className="mb-5 flex-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Key Benefits</p>
        <ul className="space-y-1.5">
          {product.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-xs text-foreground">
              <svg className={`w-3.5 h-3.5 flex-shrink-0 ${product.accentColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <Link
        href="/"
        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all duration-150 hover:bg-primary/90 active:scale-95 group-hover:shadow-md"
      >
        Start Investing
        <svg className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}

export default function InvestmentProductsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const visibleIds = filterMap[activeFilter];
  const visibleProducts = investmentProducts.filter((p) => visibleIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
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
              <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/" className="btn-accent text-sm px-4 py-2">
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
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/90 text-sm font-medium">Investment Products</span>
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-white/90 text-xs font-semibold uppercase tracking-widest">8 Investment Products Available</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Grow your wealth with<br />
              <span className="text-accent">CLIMPS Investments.</span>
            </h1>
            <p className="text-white/70 text-base lg:text-lg leading-relaxed max-w-xl">
              From treasury notes to real estate funds — every product is designed to multiply your money with transparent projected returns and managed risk.
            </p>
            <p className="text-white/50 text-xs mt-3">
              * All returns are projected estimates based on historical performance and are not guaranteed. Investments carry risk.
            </p>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 mt-10">
            {[
              { label: 'Avg. Projected Returns', value: '16% p.a.' },
              { label: 'Active Investors', value: '5,800+' },
              { label: 'Total Funds Managed', value: '₦2.1B+' },
              { label: 'Successful Payouts', value: '99.4%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 border border-white/15 rounded-xl px-5 py-3">
                <div className="text-white font-bold text-lg font-tabular">{stat.value}</div>
                <div className="text-white/60 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-thin">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  activeFilter === f.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                {f.label}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${activeFilter === f.id ? 'bg-white/20 text-white' : 'bg-border text-muted-foreground'}`}>
                  {filterMap[f.id].length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {activeFilter === 'all' ? 'All Investment Products' : filters.find((f) => f.id === activeFilter)?.label}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {visibleProducts.length} product{visibleProducts.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
            <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            SEC registered · CBN regulated
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8">
          <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Investment Disclaimer:</span> All projected returns marked with * are estimates based on historical performance and market conditions. Past performance does not guarantee future results. Investments carry risk and the value of your investment may go up or down.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA banner */}
        <div className="mt-16 rounded-2xl gradient-primary p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-1/2 translate-x-1/4" />
          </div>
          <div className="relative text-center lg:text-left">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Ready to grow your wealth?</h3>
            <p className="text-white/70 text-sm lg:text-base max-w-lg">
              Our investment advisors will help you build a portfolio aligned with your risk appetite, financial goals, and timeline — at no cost.
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold rounded-xl px-6 py-3 text-sm hover:bg-accent/90 transition-all active:scale-95">
              Invest Now
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold rounded-xl px-6 py-3 text-sm hover:bg-white/20 transition-all active:scale-95">
              Talk to an Advisor
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
              alt="CLIMPS Logo"
              width={24}
              height={24}
              className="rounded object-cover"
            />
            <span className="text-sm font-semibold text-primary">CLIMPS Cooperative</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © 2026 CLIMPS Multipurpose Cooperative Society. Regulated by the CBN & SEC. Investments carry risk.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/landing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
