'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, PiggyBank, Calculator, ArrowRight, CreditCard, TrendingUp, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loansOpen, setLoansOpen] = useState(false);
  const [investOpen, setInvestOpen] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const loansTimeout = useRef<NodeJS.Timeout | null>(null);
  const investTimeout = useRef<NodeJS.Timeout | null>(null);
  const { user, userRole, signOut } = useAuth();

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
        scrolled
          ? 'bg-[#060D1E]/95 backdrop-blur-xl shadow-xl border-b border-white/10'
          : 'bg-[#060D1E]/80 backdrop-blur-lg border-b border-white/10 shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 lg:h-32">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-3.5 flex-shrink-0 group">
            <Image
              src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
              alt="CLIMPS Logo"
              width={128}
              height={128}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-xl group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-tight text-white">
                  CLIMPS
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Red" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Green" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Blue" />
                </span>
              </div>
              <span className="text-xs font-semibold tracking-wide text-slate-300">
                Changing Lives Multipurpose Ventures
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/landing#services"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              Services
            </Link>

            <Link
              href="/about"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              About CLIMPS
            </Link>

            <Link
              href="/landing#welcome-vision"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              Vision & Mission
            </Link>

            <Link
              href="/how-it-works"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              How It Works
            </Link>

            {/* SAVE Dropdown (BLUE) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter(setSaveOpen, saveTimeout)}
              onMouseLeave={() => handleMouseLeave(setSaveOpen, saveTimeout)}
            >
              <button
                onClick={() => setSaveOpen(!saveOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150"
                aria-expanded={saveOpen}
              >
                <PiggyBank className="w-4 h-4 text-blue-400" />
                <span>Save</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${saveOpen ? 'rotate-180' : ''}`} />
              </button>

              {saveOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#0B1528] rounded-2xl shadow-2xl border border-white/15 p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/savings-products"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    onClick={() => setSaveOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <PiggyBank className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Savings Products</div>
                      <div className="text-xs text-slate-400 mt-0.5">Explore structured & voluntary plans</div>
                    </div>
                  </Link>

                  <Link
                    href="/save/calculator"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    onClick={() => setSaveOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Savings Calculator</div>
                      <div className="text-xs text-slate-400 mt-0.5">Simulate growth & compound interest</div>
                    </div>
                  </Link>

                  <Link
                    href={user ? '/save/start' : `/login?redirect=${encodeURIComponent('/save/start')}`}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-600/10 transition-colors group border-t border-white/10 mt-1 pt-2"
                    onClick={() => setSaveOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500 transition-colors">
                      {user ? <ArrowRight className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        {user ? 'Start Saving' : 'Sign In to Save'}
                        {user && <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded-md border border-blue-500/30">Direct</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {user ? 'Open regular or locked savings' : 'Sign in to start saving'}
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* INVEST Dropdown (GREEN) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter(setInvestOpen, investTimeout)}
              onMouseLeave={() => handleMouseLeave(setInvestOpen, investTimeout)}
            >
              <button
                onClick={() => setInvestOpen(!investOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150"
                aria-expanded={investOpen}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Wealth Circle</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${investOpen ? 'rotate-180' : ''}`} />
              </button>

              {investOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#0B1528] rounded-2xl shadow-2xl border border-white/15 p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/investment-products"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    onClick={() => setInvestOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Wealth Circle Products</div>
                      <div className="text-xs text-slate-400 mt-0.5">Explore Wealth Circle opportunities</div>
                    </div>
                  </Link>

                  <Link
                    href="/invest/calculator"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    onClick={() => setInvestOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Wealth Circle Calculator</div>
                      <div className="text-xs text-slate-400 mt-0.5">Model projected returns & maturity</div>
                    </div>
                  </Link>

                  <Link
                    href="/investors-circle"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    onClick={() => setInvestOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">CLIMPS Wealth Circle</div>
                      <div className="text-xs text-slate-400 mt-0.5">Exclusive financial partnership</div>
                    </div>
                  </Link>

                  <Link
                    href={user ? '/invest/now' : `/login?redirect=${encodeURIComponent('/invest/now')}`}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-500/10 transition-colors group border-t border-white/10 mt-1 pt-2"
                    onClick={() => setInvestOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#00D084] text-slate-950 font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-400 transition-colors">
                      {user ? <ArrowRight className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                        {user ? 'Wealth Circle' : 'Sign In to Invest'}
                        {user && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/30">Direct</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {user ? 'Subscribe to open opportunities' : 'Sign in to access investment portal'}
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* LOANS Dropdown (RED) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter(setLoansOpen, loansTimeout)}
              onMouseLeave={() => handleMouseLeave(setLoansOpen, loansTimeout)}
            >
              <button
                onClick={() => setLoansOpen(!loansOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150"
                aria-expanded={loansOpen}
              >
                <CreditCard className="w-4 h-4 text-red-400" />
                <span>Loans</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${loansOpen ? 'rotate-180' : ''}`} />
              </button>

              {loansOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#0B1528] rounded-2xl shadow-2xl border border-white/15 p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/loan-products"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    onClick={() => setLoansOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">Loan Products</div>
                      <div className="text-xs text-slate-400 mt-0.5">Explore low-interest financing</div>
                    </div>
                  </Link>

                  <a
                    href="#calculators"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    onClick={() => setLoansOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">Loan Calculator</div>
                      <div className="text-xs text-slate-400 mt-0.5">Calculate monthly repayments</div>
                    </div>
                  </a>

                  <Link
                    href={user ? '/loan-application' : `/login?redirect=${encodeURIComponent('/loan-application')}`}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-red-600/10 transition-colors group border-t border-white/10 mt-1 pt-2"
                    onClick={() => setLoansOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-500 transition-colors">
                      {user ? <ArrowRight className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                        {user ? 'Apply for Loan' : 'Sign In to Apply'}
                        {user && <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-1.5 py-0.5 rounded-md border border-red-500/30">24h Express</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {user ? 'Apply online in 5 minutes' : 'Sign in to submit a loan request'}
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={['super_admin', 'admin', 'manager', 'staff'].includes(userRole) ? '/admin-dashboard' : '/member-dashboard'}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#00D084] hover:bg-[#00BA76] text-slate-950 transition-all duration-150 shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-all duration-150 border border-white/15"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white border border-white/20 hover:bg-white/10 transition-all duration-150 flex items-center gap-1.5"
                >
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#00D084] hover:bg-[#00BA76] text-slate-950 transition-all duration-150 shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
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
          <div className="lg:hidden bg-[#0B1528] border border-white/10 py-4 px-3 space-y-2 rounded-b-2xl shadow-2xl max-h-[80vh] overflow-y-auto text-white">
            <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Links</div>
            <Link
              href="/landing#services"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
            >
              Services
            </Link>
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
            >
              About CLIMPS
            </Link>
            <Link
              href="/landing#welcome-vision"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
            >
              Vision & Mission
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
            >
              How It Works
            </Link>

            {/* Mobile SAVE section (BLUE) */}
            <div className="pt-2 border-t border-white/10">
              <div className="px-2 py-1 text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <PiggyBank className="w-3.5 h-3.5 text-blue-400" />
                Save Module
              </div>
              <Link
                href="/savings-products"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
              >
                Savings Products
              </Link>
              <Link
                href="/save/calculator"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
              >
                Savings Calculator
              </Link>
              <Link
                href={user ? '/save/start' : `/login?redirect=${encodeURIComponent('/save/start')}`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-blue-400 hover:bg-white/10 transition-colors"
              >
                {user ? 'Start Saving →' : 'Sign In to Save →'}
              </Link>
            </div>

            {/* Mobile INVEST section (GREEN) */}
            <div className="pt-2 border-t border-white/10">
              <div className="px-2 py-1 text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Wealth Circle Module
              </div>
              <Link
                href="/investment-products"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
              >
                Wealth Circle Products
              </Link>
              <Link
                href="/invest/calculator"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
              >
                Wealth Circle Calculator
              </Link>
              <Link
                href="/investors-circle"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
              >
                CLIMPS Wealth Circle
              </Link>
              <Link
                href={user ? '/invest/now' : `/login?redirect=${encodeURIComponent('/invest/now')}`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-emerald-400 hover:bg-white/10 transition-colors"
              >
                {user ? 'Wealth Circle →' : 'Sign In to Invest →'}
              </Link>
            </div>

            {/* Mobile LOANS section (RED) */}
            <div className="pt-2 border-t border-white/10">
              <div className="px-2 py-1 text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-red-400" />
                Loans Module
              </div>
              <Link
                href="/loan-products"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
              >
                Loan Products
              </Link>
              <a
                href="#calculators"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
              >
                Loan Calculator
              </a>
              <Link
                href={user ? '/loan-application' : `/login?redirect=${encodeURIComponent('/loan-application')}`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-white/10 transition-colors"
              >
                {user ? 'Apply for Loan →' : 'Sign In to Apply →'}
              </Link>
            </div>

            <div className="pt-3 flex flex-col gap-2 border-t border-white/10">
              {user ? (
                <>
                  <Link
                    href={['super_admin', 'admin', 'manager', 'staff'].includes(userRole) ? '/admin-dashboard' : '/member-dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 rounded-xl text-sm font-bold bg-[#00D084] hover:bg-[#00BA76] text-slate-950 shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                    }}
                    className="w-full text-center py-2 px-4 rounded-xl text-xs font-semibold bg-white/10 text-slate-300 border border-white/15 hover:bg-white/15 transition-colors"
                  >
                    Sign Out ({user.email})
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 rounded-xl text-sm font-bold bg-[#00D084] hover:bg-[#00BA76] text-slate-950 shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
