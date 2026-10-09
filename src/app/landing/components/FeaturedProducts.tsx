'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/* ── Scroll-reveal hook ───────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Tab switch animation ─────────────────────────────────────── */
function useTabTransition(activeTab: string) {
  const [displayed, setDisplayed] = useState(activeTab);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    setFade(false);
    const t = setTimeout(() => { setDisplayed(activeTab); setFade(true); }, 180);
    return () => clearTimeout(t);
  }, [activeTab]);
  return { displayed, fade };
}

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
  glowColor: string;
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
      name: 'Regular Savings',
      tag: 'Regular Savings',
      tagColor: 'bg-blue-500/20 text-blue-300',
      rate: '4%',
      rateLabel: 'Monthly',
      minAmount: '₦5,000 – ₦200,000',
      minLabel: 'Per Month',
      duration: '12+ months',
      durationLabel: 'Min. Tenure',
      description:
        'Core thrift contribution. Earns 4% monthly interest when maintained for at least 1 year — early withdrawal forfeits ALL interest.',
      features: [
        '4% monthly interest on balance',
        'At least 1-year tenure to retain interest',
        '₦5,000 – ₦200,000 monthly contribution',
      ],
      accentColor: 'border-blue-500/30',
      glowColor: 'rgba(59,130,246,0.12)',
      btnClass: 'bg-blue-600 hover:bg-blue-500',
      href: '/save/start',
      viewHref: '/savings-products',
      requiresAuth: true,
      ctaText: 'Start Regular Savings',
      guestCtaText: 'Sign In to Subscribe',
    },
    {
      name: 'Lock Your Funds',
      tag: 'Lock Your Funds',
      tagColor: 'bg-amber-500/20 text-amber-300',
      rate: '7%',
      rateLabel: 'p.a. at Maturity',
      minAmount: '₦10,000',
      minLabel: 'Min. Deposit',
      duration: '6–24 months',
      durationLabel: 'Lock-up Period',
      description:
        'Fixed-term locked savings. Lock for 6+ months and earn 7% p.a. interest at maturity. Withdraw early and ALL interest is forfeited — principal returned.',
      features: [
        '7% p.a. interest credited at maturity only',
        '⚠️ ALL interest forfeited on early withdrawal',
        'Tenors: 6, 9, 12, 18, or 24 months',
      ],
      accentColor: 'border-amber-500/30',
      glowColor: 'rgba(245,158,11,0.12)',
      btnClass: 'bg-amber-600 hover:bg-amber-500',
      href: '/save/regular',
      viewHref: '/savings-products',
      requiresAuth: false,
      ctaText: 'Explore Lock Your Funds',
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
      glowColor: 'rgba(16,185,129,0.12)',
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
      glowColor: 'rgba(245,158,11,0.08)',
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
        'Flexible personal financing for home improvements, travel, weddings, or any personal project at 10% monthly interest.',
      features: ['10% monthly interest', 'Flexible tenure up to 24 months', 'No early repayment penalty'],
      accentColor: 'border-blue-500/30',
      glowColor: 'rgba(59,130,246,0.12)',
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

/* ── Product Card ─────────────────────────────────────────────── */
function ProductCard({ product, index, visible }: { product: ProductItem; index: number; visible: boolean }) {
  const { user } = useAuth();
  const [hovered, setHovered] = useState(false);
  const isComingSoon = 'comingSoon' in product && product.comingSoon;
  const needsAuth = product.requiresAuth && !user;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.55s ease ${index * 0.12}s, transform 0.55s ease ${index * 0.12}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-2xl border p-7 flex flex-col overflow-hidden ${product.accentColor} ${
        isComingSoon ? 'opacity-60' : ''
      }`}
      // Subtle glass bg base
    >
      {/* Dynamic radial glow on hover */}
      <div
        style={{
          background: `radial-gradient(circle at 50% 0%, ${product.glowColor}, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Card background */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300"
        style={{ background: hovered && !isComingSoon ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)' }}
      />

      {/* Hover border shimmer */}
      {!isComingSoon && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Content (above overlays) */}
      <div className="relative z-10 flex flex-col h-full">
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
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${product.tagColor}`}>
            {product.tag}
          </span>
          {product.viewHref && (
            <Link
              href={product.viewHref}
              className="text-sm text-white/70 font-semibold hover:text-emerald-400 transition-colors underline underline-offset-4"
            >
              View Details
            </Link>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
        <p className="text-white/60 text-base leading-relaxed mb-6">{product.description}</p>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { val: product.rate, label: product.rateLabel },
            { val: product.minAmount, label: product.minLabel },
            { val: product.duration, label: product.durationLabel },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-white/[0.06] rounded-xl p-3 text-center transition-all duration-200 hover:bg-white/[0.1]"
            >
              <div className="text-base font-bold text-white font-tabular">{m.val}</div>
              <div className="text-xs text-white/50 font-medium mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-7 flex-1">
          {product.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-base text-white/70 font-medium">
              <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {isComingSoon ? (
          <button disabled className="w-full text-center py-3 rounded-xl text-base font-bold bg-white/10 text-white/30 cursor-not-allowed">
            Coming Soon
          </button>
        ) : needsAuth ? (
          <div className="space-y-2 w-full">
            <Link
              href={`/login?redirect=${encodeURIComponent(product.href)}`}
              className={`w-full text-center py-3 px-4 rounded-xl text-base font-bold text-white transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 ${product.btnClass} hover:shadow-lg hover:-translate-y-0.5`}
            >
              <LogIn className="w-4 h-4" />
              <span>{product.guestCtaText || 'Sign In to Subscribe'}</span>
            </Link>
            {product.viewHref && (
              <Link
                href={product.viewHref}
                className="block text-center text-sm text-white/60 font-semibold hover:text-emerald-400 py-1 transition-colors hover:underline"
              >
                Explore Product Catalog & Details →
              </Link>
            )}
          </div>
        ) : (
          <Link
            href={product.href}
            className={`w-full text-center py-3 rounded-xl text-base font-bold text-white transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 ${product.btnClass} hover:shadow-lg hover:-translate-y-0.5`}
          >
            <span>{product.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ── Main Section ─────────────────────────────────────────────── */
export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<ProductCategory>('savings');
  const { displayed, fade } = useTabTransition(activeTab);
  const currentProducts = products[displayed as ProductCategory];
  const { ref, visible } = useInView(0.1);
  const [cardsVisible, setCardsVisible] = useState(false);

  // Retrigger card entrance on tab change
  useEffect(() => {
    setCardsVisible(false);
    const t = setTimeout(() => setCardsVisible(true), 200);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Also trigger when section first enters view
  useEffect(() => {
    if (visible) setCardsVisible(true);
  }, [visible]);

  return (
    <section id="products" ref={ref} className="py-20 lg:py-28 bg-[#0d1117] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div
          className="mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div className="text-emerald-400 text-sm font-bold tracking-[0.2em] uppercase mb-4">
            OUR PRODUCTS
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight max-w-2xl">
            Products built for<br />
            <span className="text-emerald-400">every financial goal.</span>
          </h2>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-10 bg-white/[0.05] p-1 rounded-xl w-fit"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-base font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-[#0a0f1e] shadow-sm scale-[1.02]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          style={{
            opacity: fade ? 1 : 0,
            transform: fade ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}
        >
          {currentProducts.map((product, i) => (
            <ProductCard key={product.name} product={product} index={i} visible={cardsVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
