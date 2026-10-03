'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type ProductCategory = 'savings' | 'investment' | 'loan';

interface ProductItem {
  name: string;
  tag: string;
  tagColor: string;
  rate: string;
  rateLabel: string;
  minAmount: string;
  minLabel: string;
  duration: string;
  durationLabel: string;
  description: string;
  features: string[];
  accentColor: string;
  btnClass: string;
  href: string;
  viewHref?: string;
  requiresAuth?: boolean;
  ctaText: string;
  guestCtaText?: string;
  comingSoon?: boolean;
}

const products: Record<ProductCategory, ProductItem[]> = {
  savings: [
    {
      name: 'Monthly Cooperative Contribution',
      tag: 'Core Savings',
      tagColor: 'bg-blue-500/20 text-blue-300',
      rate: '4%',
      rateLabel: 'Monthly',
      minAmount: '₦5,000 – ₦200,000',
      minLabel: 'Per Month',
      duration: '12+ months',
      durationLabel: 'Min. Tenure',
      description:
        'Core cooperative thrift contribution. Earns 4% monthly when maintained for at least 1 year — early withdrawal forfeits interest.',
      features: [
        '4% monthly interest on balance',
        'At least 1-year tenure to retain interest',
        '₦5,000 – ₦200,000 monthly contribution',
      ],
      accentColor: 'border-blue-500/30',
      btnClass: 'bg-blue-600 hover:bg-blue-500',
      href: '/save/start',
      viewHref: '/savings-products',
      requiresAuth: true,
      ctaText: 'Start Contributing',
      guestCtaText: 'Sign In to Subscribe',
    },
    {
      name: 'Regular Savings Account',
      tag: 'Voluntary Savings',
      tagColor: 'bg-teal-500/20 text-teal-300',
      rate: '4%',
      rateLabel: 'Monthly',
      minAmount: '₦5,000 – ₦200,000',
      minLabel: 'Per Month',
      duration: '12+ months',
      durationLabel: 'Min. Tenure',
      description:
        'Flexible cooperative savings. Deposits held for at least 1 full year earn 4% monthly interest. Simple. Structured. Rewarding.',
      features: [
        '4% monthly return on saved funds',
        '1-year tenure rule applies',
        'Up to ₦200,000 per month',
      ],
      accentColor: 'border-teal-500/30',
      btnClass: 'bg-teal-600 hover:bg-teal-500',
      href: '/savings-products',
      requiresAuth: false,
      ctaText: 'Explore Savings Products',
    },
  ],
  investment: [
    {
      name: 'CLIMPS Wealth Circle (CWC)',
      tag: 'Open for Enrolment',
      tagColor: 'bg-emerald-500/20 text-emerald-300',
      rate: '3.5%',
      rateLabel: 'Monthly Agreed Return',
      minAmount: '₦50,000',
      minLabel: 'Min. Capital',
      duration: '3–24 months',
      durationLabel: 'Structured Tenure',
      description:
        'A structured wealth-building Circle for eligible CLIMPS members, offering a 3.5% monthly agreed return under clearly defined terms.',
      features: [
        '3.5% monthly agreed return',
        'Notice period for liquidation',
        'Formal Wealth Circle Agreement',
      ],
      accentColor: 'border-emerald-500/30',
      btnClass: 'bg-emerald-600 hover:bg-emerald-500',
      href: '/investors-circle',
      viewHref: '/investment-products',
      requiresAuth: true,
      ctaText: 'Join Wealth Circle',
      guestCtaText: 'Sign In to Invest',
      comingSoon: false,
    },
    {
      name: 'Real Estate Fund',
      tag: 'Coming Soon',
      tagColor: 'bg-amber-500/20 text-amber-300',
      rate: 'TBD',
      rateLabel: 'Projected Return',
      minAmount: '₦500,000',
      minLabel: 'Est. Min. Investment',
      duration: '24–60 months',
      durationLabel: 'Investment Period',
      description:
        'Pool funds with other members to invest in verified prime Nigerian real estate — housing estates to commercial builds.',
      features: ['Quarterly progress reports', 'Exit option after 24 months', 'Insured & titled portfolio'],
      accentColor: 'border-amber-500/20',
      btnClass: 'bg-amber-600 hover:bg-amber-500',
      href: '/investment-products',
      requiresAuth: false,
      ctaText: 'View Portfolio',
      comingSoon: true,
    },
  ],
  loan: [
    {
      name: 'Personal Loan',
      tag: 'Most Popular',
      tagColor: 'bg-blue-500/20 text-blue-300',
      rate: '10%',
      rateLabel: 'Monthly Interest',
      minAmount: 'Up to ₦1,500,000',
      minLabel: 'Loan Limit',
      duration: '3–24 months',
      durationLabel: 'Repayment',
      description:
        'Flexible personal financing for home improvements, travel, weddings, or any personal project at 10% monthly cooperative interest.',
      features: ['10% monthly cooperative interest', 'Flexible tenure up to 24 months', 'No early repayment penalty'],
      accentColor: 'border-blue-500/30',
      btnClass: 'bg-blue-600 hover:bg-blue-500',
      href: '/loan-application',
      viewHref: '/loan-products',
      requiresAuth: true,
      ctaText: 'Apply for Personal Loan',
      guestCtaText: 'Sign In to Apply',
    },
  ],
};

const TABS: { id: ProductCategory; label: string }[] = [
  { id: 'savings', label: 'Savings' },
  { id: 'investment', label: 'Wealth Circle' },
  { id: 'loan', label: 'Loans' },
];

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<ProductCategory>('savings');
  const { user } = useAuth();
  const currentProducts = products[activeTab];

  return (
    <section id="products" className="py-20 lg:py-28 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <div className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
            OUR PRODUCTS
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight max-w-2xl">
            Products built for<br />
            <span className="text-emerald-400">every financial goal.</span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 bg-white/[0.05] p-1 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-[#0a0f1e] shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {currentProducts.map((product) => {
            const isComingSoon = 'comingSoon' in product && product.comingSoon;
            const needsAuth = product.requiresAuth && !user;

            return (
              <div
                key={product.name}
                className={`relative rounded-2xl border p-7 flex flex-col bg-white/[0.04] ${product.accentColor} transition-all duration-200 ${
                  isComingSoon ? 'opacity-60' : 'hover:bg-white/[0.07] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20'
                }`}
              >
                {/* Coming soon overlay */}
                {isComingSoon && (
                  <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-center">
                      <p className="text-white font-bold mb-1">Coming Soon</p>
                      <a href="mailto:admin@climps.org" className="text-emerald-400 text-xs hover:underline">
                        Join waitlist →
                      </a>
                    </div>
                  </div>
                )}

                {/* Tag & View details link */}
                <div className="flex items-center justify-between mb-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${product.tagColor}`}>
                    {product.tag}
                  </span>
                  {product.viewHref && (
                    <Link
                      href={product.viewHref}
                      className="text-xs text-white/50 hover:text-emerald-400 transition-colors underline underline-offset-4"
                    >
                      View Details
                    </Link>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-6">{product.description}</p>

                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { val: product.rate, label: product.rateLabel },
                    { val: product.minAmount, label: product.minLabel },
                    { val: product.duration, label: product.durationLabel },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/[0.06] rounded-xl p-3 text-center">
                      <div className="text-sm font-bold text-white font-tabular">{m.val}</div>
                      <div className="text-[11px] text-white/35 mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-7 flex-1">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/55">
                      <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {isComingSoon ? (
                  <button disabled className="w-full text-center py-3 rounded-xl text-sm font-bold bg-white/10 text-white/30 cursor-not-allowed">
                    Coming Soon
                  </button>
                ) : needsAuth ? (
                  <div className="space-y-2 w-full">
                    <Link
                      href={`/login?redirect=${encodeURIComponent(product.href)}`}
                      className={`w-full text-center py-3 px-4 rounded-xl text-sm font-bold text-white transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 ${product.btnClass}`}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{product.guestCtaText || 'Sign In to Subscribe'}</span>
                    </Link>
                    {product.viewHref && (
                      <Link
                        href={product.viewHref}
                        className="block text-center text-xs text-white/50 hover:text-emerald-400 py-1 transition-colors hover:underline"
                      >
                        Explore Product Catalog & Details →
                      </Link>
                    )}
                  </div>
                ) : (
                  <Link
                    href={product.href}
                    className={`w-full text-center py-3 rounded-xl text-sm font-bold text-white transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 ${product.btnClass}`}
                  >
                    <span>{product.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

