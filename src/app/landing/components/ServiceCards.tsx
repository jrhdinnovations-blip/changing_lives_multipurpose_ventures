'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, LogIn, PiggyBank, TrendingUp, CreditCard, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const pillars = [
  {
    category: 'SAVE & THRIFT',
    rate: '4% /mo',
    rateSub: '48% p.a. on 1-yr thrift',
    headline: 'Cooperative Savings',
    desc: 'Disciplined monthly thrift contributions from ₦5,000/mo. Earn guaranteed interest plus annual cooperative surplus dividends.',
    image: '/assets/images/climps_save_hero.jpg',
    cardBorder: 'border-2 border-blue-200 hover:border-blue-500 shadow-md shadow-blue-500/5',
    categoryColor: 'text-blue-600',
    badgeBg: 'bg-blue-600 text-white',
    badge: '48% P.A. GROWTH',
    icon: PiggyBank,
    btnClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25',
    viewLinkClass: 'text-blue-600 hover:text-blue-800',
    href: '/save/start',
    viewHref: '/savings-products',
    cta: 'Start Saving',
    guestCta: 'Sign In to Save',
    viewCta: 'Explore Savings Products →',
  },
  {
    category: 'WEALTH CIRCLE',
    rate: '3.5% /mo',
    rateSub: 'agreed monthly return',
    headline: 'High-Yield Investments',
    desc: 'Exclusive pooled capital tranches backed by verified cooperative assets and real enterprise growth with predictable payouts.',
    image: '/assets/images/climps_invest_hero.jpg',
    cardBorder: 'border-2 border-emerald-200 hover:border-emerald-500 shadow-md shadow-emerald-500/5',
    categoryColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-600 text-white',
    badge: '3.5% MONTHLY RETURN',
    icon: TrendingUp,
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25',
    viewLinkClass: 'text-emerald-600 hover:text-emerald-800',
    href: '/investors-circle',
    viewHref: '/investment-products',
    cta: 'Join Wealth Circle',
    guestCta: 'Sign In to Invest',
    viewCta: 'Explore Wealth Circle →',
  },
  {
    category: '24-HOUR LOANS',
    rate: '10% /mo',
    rateSub: 'cooperative personal rate',
    headline: 'Fast Express Credit',
    desc: 'Low-interest cooperative emergency and business capital loans. Fast review and funds disbursement within 24 hours.',
    image: '/assets/images/climps_loan_hero.jpg',
    cardBorder: 'border-2 border-red-200 hover:border-red-500 shadow-md shadow-red-500/5',
    categoryColor: 'text-red-600',
    badgeBg: 'bg-red-600 text-white',
    badge: 'FUNDS IN 24 HOURS',
    icon: CreditCard,
    btnClass: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25',
    viewLinkClass: 'text-red-600 hover:text-red-800',
    href: '/loan-application',
    viewHref: '/loan-products',
    cta: 'Apply for 24h Loan',
    guestCta: 'Sign In to Apply',
    viewCta: 'Explore Loan Products →',
  },
];

export default function ServiceCards() {
  const { user } = useAuth();
  const { ref: sectionRef, inView } = useInView(0.08);

  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-white border-t border-slate-200 scroll-mt-16 overflow-hidden" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Direct Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-10 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <div>
            <div className="inline-flex items-center gap-2 text-slate-800 text-xs font-bold tracking-widest uppercase mb-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </span>
              <span>Core Financial Solutions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Three Direct Ways to <span className="text-emerald-600">Prosper</span>
            </h2>
          </div>
          <p className="text-slate-600 text-sm sm:text-base font-semibold max-w-sm sm:text-right">
            Disciplined thrift savings (Blue), high-yield wealth (Green), and express 24h loans (Red).
          </p>
        </div>

        {/* 3 Unified White Cards with Red, Green, Blue Branding */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.category}
                className={`relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between bg-white ${pillar.cardBorder} overflow-hidden group transition-all duration-300 hover:scale-[1.01]`}
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(32px)',
                  transitionDelay: `${150 + i * 100}ms`,
                }}
              >
                {/* Image Banner */}
                <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden mb-5 border border-slate-200">
                  <Image
                    src={pillar.image}
                    alt={pillar.headline}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  
                  {/* Badge on photo */}
                  <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${pillar.badgeBg} text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                    <span>{pillar.badge}</span>
                  </div>

                  {/* Rate on photo */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{pillar.rate}</div>
                      <div className="text-[10px] sm:text-xs text-white/90 font-bold">{pillar.rateSub}</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 mb-5">
                  <div className={`text-xs font-extrabold uppercase tracking-widest mb-1.5 ${pillar.categoryColor}`}>
                    {pillar.category}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                    {pillar.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {pillar.desc}
                  </p>
                </div>

                {/* CTA buttons */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {user ? (
                    <Link
                      href={pillar.href}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 w-full ${pillar.btnClass}`}
                    >
                      <span>{pillar.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href={`/login?redirect=${encodeURIComponent(pillar.href)}`}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 w-full ${pillar.btnClass}`}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{pillar.guestCta}</span>
                    </Link>
                  )}
                  <Link
                    href={pillar.viewHref}
                    className={`block text-center text-xs font-bold py-1 transition-colors ${pillar.viewLinkClass}`}
                  >
                    {pillar.viewCta}
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
