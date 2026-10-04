'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function useInView(threshold = 0.15) {
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
    category: 'SAVE',
    rate: '4%',
    rateSub: 'p.a. monthly',
    headline: 'Build your safety net.',
    color: 'bg-[#0d1b4b]',
    glow: 'rgba(59,130,246,0.15)',
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
    glow: 'rgba(0,168,107,0.15)',
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
    glow: 'rgba(249,115,22,0.15)',
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
  const { ref: sectionRef, inView } = useInView(0.1);

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#0a0f1e] scroll-mt-16 overflow-hidden" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header — slide up */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)' }}
        >
          <div>
            <p className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">HOW WE SERVE YOU</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Three ways to<br />
              <span className="text-emerald-400">build wealth.</span>
            </h2>
          </div>
          <p className="text-white/40 text-sm sm:text-base sm:text-right max-w-xs transition-all duration-700" style={{ transitionDelay: '150ms' }}>
            All built for cooperative members.
          </p>
        </div>

        {/* Cards — staggered slide up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.category}
              className={`relative rounded-2xl p-8 sm:p-10 flex flex-col justify-between min-h-[350px] ${pillar.color} overflow-hidden group cursor-default transition-all duration-700`}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0) scale(1)' : 'translateY(48px) scale(0.97)',
                transitionDelay: `${200 + i * 120}ms`,
              }}
            >
              {/* Hover glow overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 50%, ${pillar.glow}, transparent 70%)` }}
              />

              {/* Animated border shine on hover */}
              <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/20 transition-all duration-300 pointer-events-none" />

              {/* Category label & View link */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <span className={`text-xs font-bold tracking-[0.2em] uppercase ${pillar.subtextColor} group-hover:text-white/80 transition-colors duration-300`}>
                  {pillar.category}
                </span>
                <Link
                  href={pillar.viewHref}
                  className={`text-xs font-semibold underline underline-offset-4 opacity-75 hover:opacity-100 transition-opacity ${pillar.textColor}`}
                >
                  View Details
                </Link>
              </div>

              {/* Rate — scale on hover */}
              <div className="flex-1 relative z-10">
                <div
                  className={`text-7xl sm:text-8xl font-black leading-none tracking-tight mb-1 ${pillar.textColor} transition-transform duration-300 group-hover:scale-105 origin-left`}
                >
                  {pillar.rate}
                </div>
                <div className={`text-sm font-medium mb-6 ${pillar.subtextColor}`}>{pillar.rateSub}</div>
                <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${pillar.textColor}`}>{pillar.headline}</h3>
              </div>

              {/* CTA Area */}
              <div className="flex flex-col gap-2 pt-2 relative z-10">
                {user ? (
                  <Link
                    href={pillar.href}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 w-full ${pillar.btnClass} group/btn`}
                  >
                    <span>{pillar.cta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                ) : (
                  <Link
                    href={`/login?redirect=${encodeURIComponent(pillar.href)}`}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 w-full ${pillar.btnClass}`}
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
