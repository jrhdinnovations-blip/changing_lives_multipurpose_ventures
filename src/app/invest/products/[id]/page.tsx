'use client';
import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { INVESTMENT_PRODUCTS, InvestmentProductDetail, formatNaira, formatNairaCompact } from '@/lib/investmentsData';
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-2.5">
              <Image
                src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
                alt="CLIMPS Cooperative Logo"
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
              <span className="font-bold text-base text-primary tracking-tight">CLIMPS</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/investment-products"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to All Opportunities
              </Link>
              <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
              <Link href="/register" className="btn-accent text-xs px-3.5 py-1.5">
                Join Cooperative
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Header Breadcrumbs */}
      <div className="gradient-primary py-10 lg:py-14 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center gap-2 text-xs text-white/70 mb-4">
            <Link href="/landing" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/investment-products" className="hover:text-white">Investment Products</Link>
            <span>/</span>
            <span className="text-white font-medium">{product.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold bg-white/15 text-white px-2.5 py-1 rounded-lg border border-white/20">
                  {product.code}
                </span>
                <span className="text-xs font-semibold text-accent bg-white/10 px-2.5 py-1 rounded-lg">
                  {product.category}
                </span>
                <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                  {product.productStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
                {product.name}
              </h1>
              <p className="text-white/80 text-base leading-relaxed">{product.tagline}</p>
            </div>

            {/* Quick Hero CTA Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 lg:w-72 shrink-0 flex flex-col gap-3">
              <div>
                <div className="text-xs text-white/70">
                  {product.isGuaranteed ? 'Contractual Return' : 'Projected Return'}
                </div>
                <div className="text-2xl font-extrabold text-accent font-tabular">
                  {product.projectedReturnLabel}
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">{product.returnMethod}</div>
              </div>
              <div className="pt-2 border-t border-white/15 flex flex-col gap-2">
                {product.productStatus === 'open' ? (
                  <Link
                    href={`/invest/now?product=${product.id}`}
                    className="btn-accent text-center py-2.5 text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                  >
                    Invest Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button disabled className="btn-outline opacity-60 text-center py-2.5 text-xs font-bold text-white border-white/30">
                    Subscription Closed
                  </button>
                )}
                <Link
                  href={`/invest/calculator?product=${product.id}`}
                  className="bg-white/15 hover:bg-white/25 text-white text-center py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Calculate Potential Return
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Core Terms, Overview, Disclosures */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview & Full Description */}
            <section className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Investment Prospectus & Objective
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line mb-6">
                {product.fullDescription}
              </p>

              {/* Capacity Progress Box */}
              <div className="bg-muted/40 rounded-2xl p-5 border border-border/60">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    Subscription Capacity Progress
                  </span>
                  <span className="text-foreground font-tabular font-bold">
                    {capacityPct}% Filled
                  </span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-tabular">
                  <span>Subscribed: <strong className="text-foreground">{formatNaira(product.totalSubscribed)}</strong></span>
                  <span>Total Target: <strong className="text-foreground">{formatNaira(product.totalCapacity)}</strong></span>
                </div>
                {remainingCapacity > 0 && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-2">
                    ✓ {formatNaira(remainingCapacity)} remaining in this offering tranche.
                  </p>
                )}
              </div>
            </section>

            {/* Key Financial Terms & Specifications */}
            <section className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                Financial Term Sheet
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Minimum Investment</span>
                  <span className="text-lg font-extrabold text-foreground font-tabular">
                    {formatNaira(product.minimumInvestment)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Maximum Investment</span>
                  <span className="text-lg font-extrabold text-foreground font-tabular">
                    {product.maximumInvestment ? formatNaira(product.maximumInvestment) : 'No Maximum Cap'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Investment Duration</span>
                  <span className="text-lg font-extrabold text-foreground font-tabular">
                    {product.durationLabel}
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">({product.durationMonths} Calendar Months)</span>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">
                    {product.isGuaranteed ? 'Guaranteed Return' : 'Projected Return'}
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600 font-tabular">
                    {product.projectedReturnLabel}
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">{product.returnMethod}</span>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Calculation Basis</span>
                  <span className="text-sm font-bold text-foreground">
                    {product.returnMethod}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Investor Eligibility</span>
                  <span className="text-sm font-semibold text-foreground">
                    {product.eligibility}
                  </span>
                </div>
              </div>
            </section>

            {/* Key Timeline Dates */}
            <section className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Schedule & Critical Dates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <span className="text-xs text-muted-foreground block mb-1">Subscription Opens</span>
                  <span className="text-sm font-bold text-foreground">
                    {new Date(product.openingDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <span className="text-xs text-muted-foreground block mb-1">Subscription Closes</span>
                  <span className="text-sm font-bold text-amber-600">
                    {new Date(product.closingDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <span className="text-xs text-muted-foreground block mb-1">Target Maturity Date</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {new Date(product.maturityDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </section>

            {/* Terms and Conditions */}
            <section className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Terms & Conditions
              </h2>
              <ul className="space-y-3">
                {product.terms.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Mandatory Regulatory Risk Disclosures */}
            <section className="bg-amber-50/70 border-2 border-amber-200/80 rounded-3xl p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <h3 className="text-base font-bold text-amber-900">
                  Risk Factors & Important Disclosures
                </h3>
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed mb-4">
                {product.riskInformation}
              </p>
              <div className="space-y-2 border-t border-amber-200 pt-3">
                {product.disclosures.map((d, i) => (
                  <div key={i} className="text-xs text-amber-900/80 flex items-start gap-2">
                    <span className="font-bold text-amber-700">•</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Sidebar CTA & Calculator Trigger) */}
          <div className="space-y-6">
            {/* Sticky Action Card */}
            <div className="bg-card rounded-3xl border border-border p-6 shadow-md sticky top-24">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Action Center
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{product.name}</h3>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between py-1.5 border-b border-border text-xs">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-bold text-emerald-600 font-tabular">{product.projectedReturnLabel}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border text-xs">
                  <span className="text-muted-foreground">Min. Commitment:</span>
                  <span className="font-bold font-tabular">{formatNaira(product.minimumInvestment)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border text-xs">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-bold">{product.durationMonths} Months</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border text-xs">
                  <span className="text-muted-foreground">Risk Category:</span>
                  <span className="font-bold text-primary">{product.riskLevel}</span>
                </div>
              </div>

              <div className="space-y-3">
                {product.productStatus === 'open' ? (
                  <Link
                    href={`/invest/now?product=${product.id}`}
                    className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                  >
                    Invest Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full btn-outline opacity-60 text-center py-3 text-sm font-bold cursor-not-allowed"
                  >
                    Subscription Closed
                  </button>
                )}

                <Link
                  href={`/invest/calculator?product=${product.id}`}
                  className="w-full btn-outline py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:border-primary/50"
                >
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  Simulate in Calculator
                </Link>

                <Link
                  href="/investors-circle"
                  className="w-full text-center block text-xs font-semibold text-primary hover:underline py-2"
                >
                  Learn about High-Net-Worth Circle →
                </Link>
              </div>

              {/* Help & Support note */}
              <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground">
                Questions about this offering? Contact our investment desk at <strong>invest@climps.coop</strong> or visit any CLIMPS branch.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
