'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const pillars = [
  {
    category: 'SAVE',
    rate: '4%',
    rateSub: 'p.a. monthly',
    headline: 'Build your safety net.',
    color: 'bg-[#0d1b4b]',
    textColor: 'text-white',
    subtextColor: 'text-white/60',
    btnClass: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    href: '/save/start',
    viewHref: '/savings-products',
    cta: 'Open Account',
    guestCta: 'Sign In to Save',
    viewCta: 'Explore Savings Products →',
  },
  {
    category: 'GROW',
    rate: '3.5%',
    rateSub: 'monthly agreed return',
    headline: 'Grow with the circle.',
    color: 'bg-[#00a86b]',
    textColor: 'text-white',
    subtextColor: 'text-white/70',
    btnClass: 'bg-white/15 hover:bg-white/25 text-white border border-white/20',
    href: '/investors-circle',
    viewHref: '/investment-products',
    cta: 'Join Wealth Circle',
    guestCta: 'Sign In to Invest',
    viewCta: 'Explore Wealth Circle →',
  },
  {
    category: 'BORROW',
    rate: '10%',
    rateSub: 'monthly cooperative rate',
    headline: 'Funds in 48 hours.',
    color: 'bg-[#f97316]',
    textColor: 'text-white',
    subtextColor: 'text-white/70',
    btnClass: 'bg-white/15 hover:bg-white/25 text-white border border-white/20',
    href: '/loan-application',
    viewHref: '/loan-products',
    cta: 'Apply for Loan',
    guestCta: 'Sign In to Apply',
    viewCta: 'Explore Loan Products →',
  },
];

export default function ServiceCards() {
  const { user } = useAuth();

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#0a0f1e] scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Three ways to<br />
              <span className="text-emerald-400">build wealth.</span>
            </h2>
          </div>
          <p className="text-white/40 text-sm sm:text-base sm:text-right max-w-xs">
            All built for cooperative members.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar) => (
            <div
              key={pillar.category}
              className={`relative rounded-2xl p-8 sm:p-10 flex flex-col justify-between min-h-[350px] ${pillar.color} overflow-hidden`}
            >
              {/* Category label & View link */}
              <div className="flex items-center justify-between mb-6">
                <span className={`text-xs font-bold tracking-[0.2em] uppercase ${pillar.subtextColor}`}>
                  {pillar.category}
                </span>
                <Link
                  href={pillar.viewHref}
                  className={`text-xs font-semibold underline underline-offset-4 opacity-75 hover:opacity-100 transition-opacity ${pillar.textColor}`}
                >
                  View Details
                </Link>
              </div>

              {/* Rate */}
              <div className="flex-1">
                <div className={`text-7xl sm:text-8xl font-black leading-none tracking-tight mb-1 ${pillar.textColor}`}>
                  {pillar.rate}
                </div>
                <div className={`text-sm font-medium mb-6 ${pillar.subtextColor}`}>
                  {pillar.rateSub}
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${pillar.textColor}`}>
                  {pillar.headline}
                </h3>
              </div>

              {/* CTA Area */}
              <div className="flex flex-col gap-2 pt-2">
                {user ? (
                  <Link
                    href={pillar.href}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95 w-full ${pillar.btnClass}`}
                  >
                    <span>{pillar.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href={`/login?redirect=${encodeURIComponent(pillar.href)}`}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95 w-full ${pillar.btnClass}`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{pillar.guestCta}</span>
                  </Link>
                )}
                <Link
                  href={pillar.viewHref}
                  className={`text-center text-xs font-medium py-1 hover:underline transition-opacity opacity-80 hover:opacity-100 ${pillar.subtextColor}`}
                >
                  {pillar.viewCta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

