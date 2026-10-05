'use client';
import React from 'react';

const testimonials = [
  {
    name: 'Adaeze Okonkwo',
    role: 'Small Business Owner, Lagos',
    initials: 'AO',
    avatarColor: 'bg-blue-600',
    quote: 'I joined CLIMPS in 2021 with just ₦5,000. Three years later, my savings account has grown to ₦840,000 and I\'ve taken two business loans that helped me expand my boutique to three locations.',
    rating: 5,
    highlight: '₦840,000 saved',
    product: 'Daily Thrift + Business Loan',
    featured: true,
  },
  {
    name: 'Ibrahim Musa',
    role: 'Civil Servant, Abuja',
    initials: 'IM',
    avatarColor: 'bg-emerald-600',
    quote: 'The investment portfolio gave me 19% returns last year. My salary alone couldn\'t do that. CLIMPS has genuinely changed how I think about money.',
    rating: 5,
    highlight: '19% returns',
    product: 'Cooperative Shares',
    featured: false,
  },
  {
    name: 'Ngozi Eze',
    role: 'Teacher, Enugu',
    initials: 'NE',
    avatarColor: 'bg-purple-600',
    quote: 'When my daughter needed school fees urgently, CLIMPS approved my education loan in 18 hours. No stress, no collateral. Just a phone call and it was done.',
    rating: 5,
    highlight: 'Approved in 18hrs',
    product: 'Education Loan',
    featured: false,
  },
  {
    name: 'Chukwuemeka Obi',
    role: 'Farmer, Anambra',
    initials: 'CO',
    avatarColor: 'bg-amber-600',
    quote: 'The Agri-Business Fund connected me with capital I never thought I\'d access. My farm output doubled and I received my first dividend cheque of ₦180,000.',
    rating: 5,
    highlight: '₦180,000 dividend',
    product: 'Agri-Business Fund',
    featured: false,
  },
  {
    name: 'Fatima Bello',
    role: 'Nurse, Kano',
    initials: 'FB',
    avatarColor: 'bg-rose-600',
    quote: 'I used my Regular Savings account to set aside money for my wedding — ₦1.2M in 18 months. The quarterly compound interest and instant access made saving effortless.',
    rating: 5,
    highlight: 'Goal achieved',
    product: 'Regular Savings Account',
    featured: false,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const featured = testimonials[0];
  const rest = testimonials.slice(1);

  return (
    <section className="py-20 lg:py-28 bg-[#0d1117] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-1.5 mb-4">
              <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">⭐ Member Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Real members,<br />
              <span className="text-emerald-400">real results.</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 pb-2">
            <div className="text-center">
              <div className="text-2xl font-black text-white font-tabular">4.9/5</div>
              <div className="text-sm text-white/50 font-semibold">Member Rating</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-400 font-tabular">12,400+</div>
              <div className="text-sm text-white/50 font-semibold">Happy Members</div>
            </div>
          </div>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Featured large card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden border border-emerald-500/30">
            <div>
              <StarRating count={featured.rating} />
              <blockquote className="text-white/90 text-xl leading-relaxed mt-4 mb-6 font-semibold">
                &ldquo;{featured.quote}&rdquo;
              </blockquote>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 mb-5 border border-white/20">
                <svg className="w-3.5 h-3.5 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white/80 text-xs font-semibold">{featured.highlight}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${featured.avatarColor} flex items-center justify-center text-white text-base font-black flex-shrink-0 ring-2 ring-white/20`}>
                  {featured.initials}
                </div>
                <div>
                  <div className="text-white font-bold text-base">{featured.name}</div>
                  <div className="text-white/60 text-sm font-medium">{featured.role}</div>
                </div>
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute bottom-12 -right-4 w-16 h-16 rounded-full bg-white/5" />
          </div>

          {/* 2x2 grid of smaller cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rest.map((t) => (
              <div key={t.name} className="bg-white/[0.04] rounded-2xl border border-white/10 p-5 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 hover:-translate-y-0.5">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <StarRating count={t.rating} />
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{t.product}</span>
                  </div>
                  <blockquote className="text-white/75 text-base leading-relaxed mb-4 font-medium">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-full ${t.avatarColor} flex items-center justify-center text-white text-xs font-black flex-shrink-0 ring-2 ring-white/10`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">{t.name}</div>
                      <div className="text-sm text-white/50 font-medium">{t.role}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    {t.highlight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
