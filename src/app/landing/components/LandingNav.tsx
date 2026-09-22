'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, PiggyBank, Calculator, ArrowRight, CreditCard, TrendingUp, Sparkles } from 'lucide-react';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loansOpen, setLoansOpen] = useState(false);
  const [investOpen, setInvestOpen] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const loansTimeout = useRef<NodeJS.Timeout | null>(null);
  const investTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleMouseEnter = (setter: (v: boolean) => void, timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setter(true);
  };

  const handleMouseLeave = (setter: (v: boolean) => void, timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    timeoutRef.current = setTimeout(() => {
      setter(false);
    }, 150);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2.5 flex-shrink-0">
            <Image
              src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
              alt="CLIMPS Cooperative Logo"
              width={36}
              height={36}
              className="rounded-lg object-cover"
            />
            <span className={`font-bold text-lg tracking-tight transition-colors ${scrolled ? 'text-primary' : 'text-white'}`}>
              CLIMPS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <a
              href="#services"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-white/10 ${
                scrolled ? 'text-foreground hover:bg-muted' : 'text-white/90 hover:text-white'
              }`}
            >
              Services
            </a>

            <a
              href="#how-it-works"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-white/10 ${
                scrolled ? 'text-foreground hover:bg-muted' : 'text-white/90 hover:text-white'
              }`}
            >
              How It Works
            </a>

            {/* SAVE Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter(setSaveOpen, saveTimeout)}
              onMouseLeave={() => handleMouseLeave(setSaveOpen, saveTimeout)}
            >
              <button
                onClick={() => setSaveOpen(!saveOpen)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 hover:bg-white/10 ${
                  scrolled ? 'text-foreground hover:bg-muted' : 'text-white/95 hover:text-white'
                }`}
                aria-expanded={saveOpen}
              >
                <PiggyBank className="w-4 h-4 text-accent" />
                <span>Save</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${saveOpen ? 'rotate-180' : ''}`} />
              </button>

              {saveOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-72 bg-card rounded-2xl shadow-xl border border-border p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/savings-products"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                    onClick={() => setSaveOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                      <PiggyBank className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Savings Products</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Explore structured & voluntary plans</div>
                    </div>
                  </Link>

                  <Link
                    href="/save/calculator"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                    onClick={() => setSaveOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">Savings Calculator</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Simulate growth & compound interest</div>
                    </div>
                  </Link>

                  <Link
                    href="/save/start"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-accent/10 transition-colors group border-t border-border mt-1 pt-2"
                    onClick={() => setSaveOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent-foreground flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-accent group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-1.5">
                        Start Saving
                        <span className="text-[10px] bg-accent/20 text-accent font-bold px-1.5 py-0.5 rounded-md">New</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Enroll online in minutes</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* LOANS Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter(setLoansOpen, loansTimeout)}
              onMouseLeave={() => handleMouseLeave(setLoansOpen, loansTimeout)}
            >
              <button
                onClick={() => setLoansOpen(!loansOpen)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-white/10 ${
                  scrolled ? 'text-foreground hover:bg-muted' : 'text-white/90 hover:text-white'
                }`}
                aria-expanded={loansOpen}
              >
                <span>Loans</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${loansOpen ? 'rotate-180' : ''}`} />
              </button>

              {loansOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-card rounded-2xl shadow-xl border border-border p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/loan-products"
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted/80 text-sm font-medium text-foreground transition-colors"
                    onClick={() => setLoansOpen(false)}
                  >
                    <CreditCard className="w-4 h-4 text-primary" />
                    Loan Products
                  </Link>
                  <Link
                    href="/loan-application"
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted/80 text-sm font-medium text-foreground transition-colors"
                    onClick={() => setLoansOpen(false)}
                  >
                    <ArrowRight className="w-4 h-4 text-accent" />
                    Apply for Loan
                  </Link>
                </div>
              )}
            </div>

            {/* INVEST Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter(setInvestOpen, investTimeout)}
              onMouseLeave={() => handleMouseLeave(setInvestOpen, investTimeout)}
            >
              <button
                onClick={() => setInvestOpen(!investOpen)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 hover:bg-white/10 ${
                  scrolled ? 'text-foreground hover:bg-muted' : 'text-white/95 hover:text-white'
                }`}
                aria-expanded={investOpen}
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Invest</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${investOpen ? 'rotate-180' : ''}`} />
              </button>

              {investOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-72 bg-card rounded-2xl shadow-xl border border-border p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/investment-products"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                    onClick={() => setInvestOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">Investment Products</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Explore high-yield opportunities</div>
                    </div>
                  </Link>

                  <Link
                    href="/invest/calculator"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                    onClick={() => setInvestOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">Investment Calculator</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Model projected returns & maturity</div>
                    </div>
                  </Link>

                  <Link
                    href="/investors-circle"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
                    onClick={() => setInvestOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground group-hover:text-amber-600 transition-colors">CLIMPS Investors Circle</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Exclusive high-net-worth partnership</div>
                    </div>
                  </Link>

                  <Link
                    href="/invest/now"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-500/10 transition-colors group border-t border-border mt-1 pt-2"
                    onClick={() => setInvestOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                        Invest Now
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">Direct</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Subscribe to open opportunities</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                scrolled
                  ? 'text-primary hover:bg-secondary' : 'text-white hover:bg-white/10'
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition-all duration-150 active:scale-95 shadow-sm"
            >
              Become a Member
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'}`}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-card border-t border-border py-4 px-3 space-y-2 rounded-b-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Links</div>
            <a
              href="#services"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Services
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              How It Works
            </a>

            {/* Mobile SAVE section */}
            <div className="pt-2 border-t border-border">
              <div className="px-2 py-1 text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <PiggyBank className="w-3.5 h-3.5 text-accent" />
                Save Module
              </div>
              <Link
                href="/savings-products"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Savings Products
              </Link>
              <Link
                href="/save/calculator"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Savings Calculator
              </Link>
              <Link
                href="/save/start"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-accent hover:bg-accent/10 transition-colors"
              >
                Start Saving →
              </Link>
            </div>

            {/* Mobile LOANS section */}
            <div className="pt-2 border-t border-border">
              <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">Loans</div>
              <Link
                href="/loan-products"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Loan Products
              </Link>
              <Link
                href="/loan-application"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Apply for Loan
              </Link>
            </div>

            {/* Mobile INVEST section */}
            <div className="pt-2 border-t border-border">
              <div className="px-2 py-1 text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Invest Module
              </div>
              <Link
                href="/investment-products"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Investment Products
              </Link>
              <Link
                href="/invest/calculator"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Investment Calculator
              </Link>
              <Link
                href="/investors-circle"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                CLIMPS Investors Circle
              </Link>
              <Link
                href="/invest/now"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                Invest Now →
              </Link>
            </div>

            <div className="pt-3 flex flex-col gap-2 border-t border-border">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-outline text-center py-2.5 text-sm">
                Sign In
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-accent text-center py-2.5 text-sm">
                Become a Member
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
