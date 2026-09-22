'use client';
import React from 'react';
import Link from 'next/link';

const steps = [
  {
    step: '01',
    title: 'Register & Verify',
    description: 'Complete your membership application online in under 5 minutes. Submit your BVN, NIN, and a valid ID for instant verification.',
    color: 'bg-blue-50 border-blue-100',
    stepColor: 'text-blue-600 bg-blue-100',
    iconColor: 'text-blue-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Fund Your Account',
    description: 'Make your first contribution via bank transfer, USSD, or card payment. Minimum opening balance of ₦5,000 to activate your membership.',
    color: 'bg-emerald-50 border-emerald-100',
    stepColor: 'text-emerald-600 bg-emerald-100',
    iconColor: 'text-emerald-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Choose Your Plan',
    description: 'Select from savings goals, investment portfolios, or loan products. Our advisors help you pick the right financial mix for your goals.',
    color: 'bg-amber-50 border-amber-100',
    stepColor: 'text-amber-600 bg-amber-100',
    iconColor: 'text-amber-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Watch It Grow',
    description: 'Track your savings, investments, and loan repayments in real-time on your member dashboard. Receive monthly statements and annual dividends.',
    color: 'bg-purple-50 border-purple-100',
    stepColor: 'text-purple-600 bg-purple-100',
    iconColor: 'text-purple-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Left sticky header */}
          <div className="lg:w-80 lg:sticky lg:top-24 flex-shrink-0">
            <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-1.5 mb-4">
              <span className="text-primary text-xs font-semibold uppercase tracking-widest">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
              From zero to<br />
              <span className="text-primary">financially free</span><br />
              in 4 steps.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              Joining CLIMPS is simple, fast, and fully digital. No branch visits required.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all duration-150 active:scale-95"
            >
              Become a Member
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Steps grid — 2x2 */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {steps?.map((step) => (
              <div
                key={step?.step}
                className={`relative rounded-2xl border p-6 ${step?.color} transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${step?.stepColor}`}>
                    {step?.icon}
                  </div>
                  <div>
                    <div className={`text-xs font-bold tracking-widest uppercase mb-1 ${step?.stepColor?.split(' ')?.[0]}`}>
                      Step {step?.step}
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">{step?.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step?.description}</p>
                  </div>
                </div>
                {/* Step number watermark */}
                <div className={`absolute bottom-3 right-4 text-5xl font-black opacity-5 ${step?.stepColor?.split(' ')?.[0]}`}>
                  {step?.step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
