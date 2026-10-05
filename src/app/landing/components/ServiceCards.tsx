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
    color: 'bg-[#0d1b4b]',
    glow: 'rgba(59,130,246,0.2)',
    badge: '48% P.A. GROWTH',
    icon: PiggyBank,
    btnClass: 'bg-blue-600 hover:bg-blue-500 text-white',
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
    color: 'bg-[#003822]',
    glow: 'rgba(0,168,107,0.2)',
    badge: '3.5% MONTHLY RETURN',
    icon: TrendingUp,
    btnClass: 'bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold',
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
    color: 'bg-[#3b1700]',
    glow: 'rgba(249,115,22,0.2)',
    badge: 'FUNDS IN 24 HOURS',
    icon: CreditCard,
    btnClass: 'bg-orange-600 hover:bg-orange-500 text-white',
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
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-[#0a0f1e] scroll-mt-16 overflow-hidden" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Direct Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-10 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Financial Solutions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Three Direct Ways to <span className="text-emerald-400">Prosper</span>
            </h2>
          </div>
          <p className="text-white/60 text-sm sm:text-base font-semibold max-w-sm sm:text-right">
            Transparent interest, verified assets, and rapid 24-hour financing.
          </p>
        </div>

        {/* 3 Unified Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.category}
                className={`relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between ${pillar.color} border border-white/10 overflow-hidden group transition-all duration-500 hover:border-white/30`}
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(32px)',
                  transitionDelay: `${150 + i * 100}ms`,
                }}
              >
                {/* Image Banner */}
                <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden mb-5 border border-white/10">
                  <Image
                    src={pillar.image}
                    alt={pillar.headline}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Badge on photo */}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-extrabold text-white uppercase tracking-wider">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{pillar.badge}</span>
                  </div>

                  {/* Rate on photo */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{pillar.rate}</div>
                      <div className="text-[10px] sm:text-xs text-white/80 font-bold">{pillar.rateSub}</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 mb-5">
                  <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">
                    {pillar.category}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                    {pillar.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-medium">
                    {pillar.desc}
                  </p>
                </div>

                {/* CTA buttons */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  {user ? (
                    <Link
                      href={pillar.href}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all duration-200 active:scale-95 w-full ${pillar.btnClass}`}
                    >
                      <span>{pillar.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href={`/login?redirect=${encodeURIComponent(pillar.href)}`}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all duration-200 active:scale-95 w-full ${pillar.btnClass}`}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{pillar.guestCta}</span>
                    </Link>
                  )}
                  <Link
                    href={pillar.viewHref}
                    className="block text-center text-xs font-bold text-white/60 hover:text-white py-1 transition-colors"
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
