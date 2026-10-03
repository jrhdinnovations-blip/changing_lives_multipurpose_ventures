'use client';
import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INVESTMENT_PRODUCTS, formatNaira } from '@/lib/investmentsData';
import LandingNav from '@/app/landing/components/LandingNav';
import LandingFooter from '@/app/landing/components/LandingFooter';
import {
  TrendingUp,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Calculator,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Clock,
  Banknote,
  CheckCircle2,
  Users,
  Building,
} from 'lucide-react';

export default function InvestmentProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const product = INVESTMENT_PRODUCTS.find((p) => p.id === resolvedParams.id);

  if (!product) {
    notFound();
  }

  const capacityPct = Math.min(100, Math.round((product.totalSubscribed / product.totalCapacity) * 100));
  const remainingCapacity = Math.max(0, product.totalCapacity - product.totalSubscribed);
  const isComingSoon = product.comingSoon || product.productStatus === 'coming_soon';

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <LandingNav />

      {/* Hero / Header Breadcrumbs */}
      <div className="relative py-12 lg:py-16 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#0d1e38] to-[#08213b] pointer-events-none" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <Link href="/landing" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/investment-products" className="hover:text-white transition-colors">Investment Products</Link>
            <span>/</span>
            <span className="text-emerald-400 font-medium">{product.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold bg-white/10 text-white px-2.5 py-1 rounded-lg border border-white/15">
                  {product.code}
                </span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  {product.category}
                </span>
                <span className="text-xs font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-lg">
                  {product.productStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                {product.name}
              </h1>
              <p className="text-white/70 text-base leading-relaxed">{product.tagline}</p>
            </div>

            {/* Quick Hero CTA Card */}
            <div className="bg-[#0d1527] border border-white/15 rounded-2xl p-5 lg:w-72 shrink-0 flex flex-col gap-3 shadow-xl">
              <div>
                <div className="text-xs text-white/50">
                  {product.isGuaranteed ? 'Agreed Return' : 'Projected Return'}
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 font-tabular">
                  {product.projectedReturnLabel}
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">{product.returnMethod}</div>
              </div>
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                {isComingSoon ? (
                  <a
                    href="mailto:admin@climps.org?subject=Investment Waitlist"
                    className="text-center py-2.5 text-xs font-bold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    Get Notified
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ) : product.productStatus === 'open' ? (
                  <Link
                    href={product.id === 'investors-circle' ? '/investors-circle' : `/invest/now?product=${product.id}`}
                    className="text-center py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    {product.id === 'investors-circle' ? 'Join Wealth Circle' : 'Wealth Circle'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button disabled className="opacity-50 text-center py-2.5 text-xs font-bold text-white border border-white/20 rounded-xl cursor-not-allowed">
                    Subscription Closed
                  </button>
                )}
                <Link
                  href={`/invest/calculator?product=${product.id}`}
                  className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-center py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  Calculate Potential Return
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Core Terms, Overview, Disclosures */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview & Full Description */}
            <section className="bg-[#0d1527] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Investment Prospectus & Objective
              </h2>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line mb-6">
                {product.fullDescription}
              </p>

              {/* Capacity Progress Box */}
              <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-white/60 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Subscription Capacity Progress
                  </span>
                  <span className="text-white font-tabular font-bold">
                    {capacityPct}% Filled
                  </span>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-white/50 font-tabular">
                  <span>Subscribed: <strong className="text-white">{formatNaira(product.totalSubscribed)}</strong></span>
                  <span>Total Target: <strong className="text-white">{formatNaira(product.totalCapacity)}</strong></span>
                </div>
                {remainingCapacity > 0 && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-2">
                    ✓ {formatNaira(remainingCapacity)} remaining in this offering tranche.
                  </p>
                )}
              </div>
            </section>

            {/* Key Financial Terms & Specifications */}
            <section className="bg-[#0d1527] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-400" />
                Financial Term Sheet
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-xs text-white/50 block mb-1">Minimum Investment</span>
                  <span className="text-lg font-extrabold text-white font-tabular">
                    {formatNaira(product.minimumInvestment)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-xs text-white/50 block mb-1">Duration & Tenure</span>
                  <span className="text-lg font-extrabold text-white">
                    {product.durationMonths} Months ({Math.round((product.durationMonths / 12) * 10) / 10} Yrs)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-xs text-white/50 block mb-1">Return Model</span>
                  <span className="text-lg font-extrabold text-emerald-400 font-tabular">
                    {product.projectedReturnLabel}
                  </span>
                  <span className="text-2xs text-white/50 block mt-0.5">{product.returnMethod}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-xs text-white/50 block mb-1">Risk Profile</span>
                  <span className="text-lg font-extrabold text-amber-400 capitalize">
                    {product.riskLevel} Risk
                  </span>
                </div>
              </div>
            </section>

            {/* Terms, Conditions & Liquidation Rules */}
            <section className="bg-[#0d1527] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Terms & Liquidation Policy
              </h2>
              <div className="space-y-4 text-xs text-white/70 leading-relaxed">
                <p>
                  <strong>Agreed Returns:</strong> For the CLIMPS Wealth Circle (CWC), agreed return is <strong>3.5% monthly</strong>.
                </p>
                <p>
                  <strong>Withdrawal & Liquidation:</strong> Requests for partial or full liquidation shall be subject to the applicable notice period and the terms contained in the Wealth Circle Agreement. Early liquidation may affect the return applicable and may attract an administrative charge where expressly provided for in the Agreement.
                </p>
                <p>
                  <strong>Eligibility:</strong> Only verified and fully onboarded CLIMPS members in good standing are eligible to hold active investment shares.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column (1 Col): Investment Action Box */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 p-6 sm:p-7 shadow-xl sticky top-24 space-y-5">
              <div className="pb-4 border-b border-white/10">
                <span className="text-2xs uppercase tracking-wider font-bold text-white/50 block mb-1">
                  Ready to Subscribe?
                </span>
                <h3 className="text-lg font-bold text-white">Join This Offering</h3>
              </div>

              <div className="space-y-3">
                {isComingSoon ? (
                  <a
                    href="mailto:admin@climps.org?subject=Investment Waitlist"
                    className="w-full py-3.5 px-4 rounded-xl bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all shadow-md"
                  >
                    Get Notified
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : product.productStatus === 'open' ? (
                  <Link
                    href={product.id === 'investors-circle' ? '/investors-circle' : `/invest/now?product=${product.id}`}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {product.id === 'investors-circle' ? 'Join Wealth Circle' : 'Wealth Circle'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full border border-white/20 text-white/50 text-center py-3 text-sm font-bold rounded-xl cursor-not-allowed"
                  >
                    Subscription Closed
                  </button>
                )}

                <Link
                  href={`/invest/calculator?product=${product.id}`}
                  className="w-full py-3 px-4 rounded-xl border border-white/15 bg-white/[0.04] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/[0.08] transition-all"
                >
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  Simulate in Calculator
                </Link>

                {product.id !== 'investors-circle' && (
                  <Link
                    href="/investors-circle"
                    className="w-full text-center block text-xs font-semibold text-emerald-400 hover:underline py-2"
                  >
                    Explore Regular Wealth Circle →
                  </Link>
                )}
              </div>

              {/* Help & Support note */}
              <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-white/50">
                Questions about this offering? Contact our investment desk at <strong className="text-white">invest@climps.coop</strong> or visit any CLIMPS branch.
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
