'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, ShieldCheck, Phone } from 'lucide-react';

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-100 border-t border-slate-200 text-slate-800 relative">
      {/* 4-Color Brand Top Stripe: Red, Green, Blue, White */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-emerald-600 via-blue-600 to-red-600" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
          {/* Brand */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
                alt="CLIMPS Logo"
                width={44}
                height={44}
                className="rounded-xl object-cover ring-2 ring-slate-300 shadow-sm"
              />
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 text-xl">CLIMPS</span>
                  <span className="inline-flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-semibold">Changing Lives Multipurpose Ventures</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed font-medium">
              Empowering people and businesses with disciplined thrift savings, high-yield wealth opportunities, cooperative loans, and sustainable economic solutions.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-bold pt-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Registered Multipurpose Cooperative Society</span>
            </div>
          </div>

          {/* Contact & Office Address */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Contact & Office Address</p>
            <div className="flex items-start gap-2.5 text-sm text-slate-700">
              <MapPin size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold text-slate-900">Changing Lives Multipurpose Cooperative</p>
                <p className="font-medium text-slate-600">Behind Deeperlife Bible Church, Rayfield adjacent House 7, Rayfield, Jos, Plateau State</p>
              </div>
            </div>

            {/* Officer & Phone / WhatsApp / Email */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-800">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact Person:</span>
                <span className="font-bold text-slate-900">Jauro Luka</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-700">
                <Phone size={15} className="text-emerald-600 shrink-0" />
                <div className="flex flex-wrap items-center gap-2 font-semibold">
                  <a href="tel:08144447710" className="hover:text-emerald-700 hover:underline">08144447710</a>
                  <span className="text-slate-300">/</span>
                  <a href="tel:08053331224" className="hover:text-emerald-700 hover:underline">08053331224</a>
                  <a
                    href="https://wa.me/2348144447710"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 hover:bg-emerald-200 transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-700">
                <Mail size={15} className="text-blue-600 shrink-0" />
                <a
                  href="mailto:Changinglivesmultipurpose@gmail.com"
                  className="hover:text-blue-700 font-semibold transition-colors break-all"
                >
                  Changinglivesmultipurpose@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Quick Navigation</p>
            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-600">
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                About CLIMPS
              </Link>
              <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">
                How It Works
              </Link>
              <Link href="/savings-products" className="hover:text-blue-600 transition-colors">
                Savings Products
              </Link>
              <Link href="/investors-circle" className="hover:text-emerald-600 transition-colors">
                Investors Circle
              </Link>
              <Link href="/loan-products" className="hover:text-red-600 transition-colors">
                Loan Products
              </Link>
              <Link href="/login" className="hover:text-blue-600 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-500 font-medium">
          <p>© {year} CLIMPS Cooperative. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="hover:text-slate-800 transition-colors">
              About Us
            </Link>
            <Link href="/savings-products" className="hover:text-slate-800 transition-colors">
              Savings
            </Link>
            <Link href="/investors-circle" className="hover:text-slate-800 transition-colors">
              Wealth Circle
            </Link>
            <Link href="/loan-products" className="hover:text-slate-800 transition-colors">
              Loans
            </Link>
            <a href="mailto:Changinglivesmultipurpose@gmail.com" className="hover:text-slate-800 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
