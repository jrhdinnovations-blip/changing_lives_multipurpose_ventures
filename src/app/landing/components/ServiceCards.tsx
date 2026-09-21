'use client';
import React from 'react';
import Link from 'next/link';

const services = [
  {
    id: 'save',
    label: 'SAVE',
    title: 'Build Your Safety Net',
    description: 'Flexible savings plans with competitive interest rates. From daily contributions to fixed deposits — your money grows while you sleep.',
    features: ['Up to 12% p.a. on fixed savings', 'Daily, weekly, or monthly contributions', 'Instant access to emergency funds', 'Automatic goal tracking'],
    cta: 'Start Saving',
    ctaHref: '/',
    gradient: 'from-blue-600 to-blue-800',
    accentColor: 'bg-blue-100 text-blue-700',
    iconBg: 'bg-blue-500/20',
    icon: (
      <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    stat: '₦4.2B', statLabel: 'Total Savings',
    dark: true,
  },
  {
    id: 'invest',
    label: 'INVEST',
    title: 'Grow Your Wealth',
    description: 'Diversified investment portfolios managed by cooperative experts. Put your money to work with transparent returns and zero hidden fees.',
    features: ['Avg. 18% annual returns', 'Diversified portfolio options', 'Quarterly dividend payouts', 'Real-time portfolio tracking'],
    cta: 'Invest Now',
    ctaHref: '/',
    gradient: 'from-emerald-600 to-emerald-800',
    accentColor: 'bg-emerald-100 text-emerald-700',
    iconBg: 'bg-emerald-500/20',
    icon: (
      <svg className="w-7 h-7 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    stat: '18%', statLabel: 'Avg. Annual Return',
    dark: true,
  },
  {
    id: 'borrow',
    label: 'BORROW',
    title: 'Access Funds Fast',
    description: 'Low-interest loans for members with quick approval. Whether it\'s business capital, education, or emergencies — we\'ve got you covered.',
    features: ['Interest from 8% p.a.', 'Approval within 48 hours', 'Flexible repayment terms', 'No collateral for small loans'],
    cta: 'Apply for Loan',
    ctaHref: '/',
    gradient: 'from-amber-500 to-orange-700',
    accentColor: 'bg-amber-100 text-amber-700',
    iconBg: 'bg-amber-500/20',
    icon: (
      <svg className="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    stat: '₦1.8B', statLabel: 'Loans Disbursed',
    dark: true,
  },
];

export default function ServiceCards() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-1.5 mb-4">
            <span className="text-primary text-xs font-semibold uppercase tracking-widest">Our Services</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Everything you need<br />
              <span className="text-primary">in one cooperative.</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-sm sm:text-right">
              Three pillars of financial empowerment, built for Nigerian families and businesses.
            </p>
          </div>
        </div>

        {/* Bento grid — asymmetric layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Save — large card */}
          <div className={`lg:col-span-1 lg:row-span-1 relative rounded-3xl overflow-hidden bg-gradient-to-br ${services?.[0]?.gradient} p-7 flex flex-col justify-between min-h-[380px] group`}>
            <div>
              <div className={`w-12 h-12 rounded-2xl ${services?.[0]?.iconBg} flex items-center justify-center mb-5`}>
                {services?.[0]?.icon}
              </div>
              <span className="text-white/50 text-xs font-bold tracking-[0.2em] uppercase">{services?.[0]?.label}</span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-3">{services?.[0]?.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-5">{services?.[0]?.description}</p>
              <ul className="space-y-2">
                {services?.[0]?.features?.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/80 text-sm">
                    <svg className="w-4 h-4 text-blue-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
              <div>
                <div className="text-2xl font-bold text-white font-tabular">{services?.[0]?.stat}</div>
                <div className="text-white/50 text-xs">{services?.[0]?.statLabel}</div>
              </div>
              <Link href={services?.[0]?.ctaHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-all duration-150 active:scale-95 backdrop-blur-sm border border-white/20">
                {services?.[0]?.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {/* Decorative circle */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
          </div>

          {/* Invest */}
          <div className={`lg:col-span-1 relative rounded-3xl overflow-hidden bg-gradient-to-br ${services?.[1]?.gradient} p-7 flex flex-col justify-between min-h-[380px] group`}>
            <div>
              <div className={`w-12 h-12 rounded-2xl ${services?.[1]?.iconBg} flex items-center justify-center mb-5`}>
                {services?.[1]?.icon}
              </div>
              <span className="text-white/50 text-xs font-bold tracking-[0.2em] uppercase">{services?.[1]?.label}</span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-3">{services?.[1]?.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-5">{services?.[1]?.description}</p>
              <ul className="space-y-2">
                {services?.[1]?.features?.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/80 text-sm">
                    <svg className="w-4 h-4 text-emerald-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
              <div>
                <div className="text-2xl font-bold text-white font-tabular">{services?.[1]?.stat}</div>
                <div className="text-white/50 text-xs">{services?.[1]?.statLabel}</div>
              </div>
              <Link href={services?.[1]?.ctaHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-all duration-150 active:scale-95 backdrop-blur-sm border border-white/20">
                {services?.[1]?.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          </div>

          {/* Borrow */}
          <div className={`lg:col-span-1 relative rounded-3xl overflow-hidden bg-gradient-to-br ${services?.[2]?.gradient} p-7 flex flex-col justify-between min-h-[380px] group`}>
            <div>
              <div className={`w-12 h-12 rounded-2xl ${services?.[2]?.iconBg} flex items-center justify-center mb-5`}>
                {services?.[2]?.icon}
              </div>
              <span className="text-white/50 text-xs font-bold tracking-[0.2em] uppercase">{services?.[2]?.label}</span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-3">{services?.[2]?.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-5">{services?.[2]?.description}</p>
              <ul className="space-y-2">
                {services?.[2]?.features?.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/80 text-sm">
                    <svg className="w-4 h-4 text-amber-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
              <div>
                <div className="text-2xl font-bold text-white font-tabular">{services?.[2]?.stat}</div>
                <div className="text-white/50 text-xs">{services?.[2]?.statLabel}</div>
              </div>
              <Link href={services?.[2]?.ctaHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-all duration-150 active:scale-95 backdrop-blur-sm border border-white/20">
                {services?.[2]?.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
