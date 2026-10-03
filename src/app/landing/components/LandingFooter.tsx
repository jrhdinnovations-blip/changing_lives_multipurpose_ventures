'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0f1e] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
              alt="CLIMPS Logo"
              width={42}
              height={42}
              className="rounded-xl object-cover ring-2 ring-white/15"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-white text-base">CLIMPS</span>
              <span className="text-[10px] text-white/40 font-medium">Changing Lives Multipurpose Ventures</span>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-white/30">
            © {year} CLIMPS Cooperative. All rights reserved.
          </p>

          {/* Legal & About links */}
          <div className="flex items-center gap-5 text-xs text-white/35">
            <Link href="/landing#about" className="hover:text-white/70 transition-colors">
              About Us
            </Link>
            <Link href="/" className="hover:text-white/70 transition-colors">
              Privacy
            </Link>
            <Link href="/" className="hover:text-white/70 transition-colors">
              Terms
            </Link>
            <Link href="/" className="hover:text-white/70 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
