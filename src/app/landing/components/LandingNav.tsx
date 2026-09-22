'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Products', href: '#products' },
    { label: 'Calculators', href: '#calculators' },
    { label: 'Savings Products', href: '/savings-products' },
    { label: 'Loan Products', href: '/loan-products' },
    { label: 'Apply for Loan', href: '/loan-application' },
    { label: 'Investment Products', href: '/investment-products' },
    { label: 'Investors Circle', href: '/investors-circle' },
  ];

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
          <nav className="hidden md:flex items-center gap-1">
            {navLinks?.map((link) => (
              <a
                key={link?.label}
                href={link?.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-white/10 ${
                  scrolled ? 'text-foreground hover:bg-muted' : 'text-white/90 hover:text-white'
                }`}
              >
                {link?.label}
              </a>
            ))}
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
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition-all duration-150 active:scale-95"
            >
              Become a Member
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'}`}
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
          <div className="md:hidden bg-white border-t border-border py-4 px-2 space-y-1">
            {navLinks?.map((link) => (
              <a
                key={link?.label}
                href={link?.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {link?.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2 px-2">
              <Link href="/login" className="btn-outline text-center">Sign In</Link>
              <Link href="/register" className="btn-accent text-center">Become a Member</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
