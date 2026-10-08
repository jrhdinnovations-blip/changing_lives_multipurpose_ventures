'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const STATIC_MESSAGES = [
  '🌟 CLIMPS — Changing Lives Multipurpose Ventures Cooperative Society',
  '📞 Contact Person: Jauro Luka • Phone/WhatsApp: 08144447710, 08053331224',
  '💰 Earn 9–25% returns p.a. on your savings — join the Wealth Circle today',
  '✉️ Email: Changinglivesmultipurpose@gmail.com',
  '⚡ Fast loan approvals within 24 hours for qualified members',
  '🤝 A registered cooperative empowering communities across Nigeria',
  '📈 Your savings. Your growth. Your future — powered by CLIMPS',
  '✅ Transparent. Trustworthy. Member-owned cooperative since inception',
  '🎯 Fixed & flexible savings plans tailored to your financial goals',
  '🔒 All funds are securely managed by licensed cooperative officers',
];

export default function NetworkTicker() {
  const [memberCount, setMemberCount] = useState<number>(500);
  const [fundAmount, setFundAmount] = useState<number>(500_000_000);

  useEffect(() => {
    const supabase = createClient();
    const BASELINE_MEMBERS = 500;
    const BASELINE_FUNDS = 500_000_000;

    async function loadStats() {
      try {
        const { count: memberCount } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true });

        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const additionalMembers = Math.max(memberCount ?? 0, userCount ?? 0);
        setMemberCount(BASELINE_MEMBERS + additionalMembers);

        const { data: savingsData } = await supabase
          .from('savings_subscriptions')
          .select('total_deposited');
        const totalSaved = (savingsData ?? []).reduce(
          (sum: number, r: { total_deposited: number | null }) => sum + (r.total_deposited ?? 0),
          0,
        );

        const { data: investData } = await supabase
          .from('investments')
          .select('amount');
        const totalInvested = (investData ?? []).reduce(
          (sum: number, r: { amount: number | null }) => sum + (r.amount ?? 0),
          0,
        );

        setFundAmount(BASELINE_FUNDS + totalSaved + totalInvested);
      } catch {
        // silently keep defaults
      }
    }

    loadStats();
  }, []);

  const formatFund = (n: number) => {
    if (n >= 1_000_000_000) return `\u20a6${(n / 1_000_000_000).toFixed(1)}B`;
    return `\u20a6${(n / 1_000_000).toFixed(0)}M`;
  };

  const dynamicMessages = [
    `\ud83d\udc65 ${memberCount.toLocaleString()}+ members and growing — join a thriving cooperative community`,
    `\ud83d\udcbc ${formatFund(fundAmount)} in funds managed by CLIMPS — growing every day`,
  ];

  const allMessages = [...STATIC_MESSAGES, ...dynamicMessages];
  const tickerItems = [...allMessages, ...allMessages];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-8 bg-[#030712]/95 backdrop-blur-md border-b border-white/10 shadow-xs flex items-center overflow-hidden text-slate-300">
      {/* Brand Color Top Stripe: Red, Green, Blue, White */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-emerald-400 via-blue-500 to-red-500" />

      {/* Logo badge pinned on left */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 bg-[#070E20] h-full border-r border-white/10 z-10">
        <Image
          src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
          alt="CLIMPS Logo"
          width={20}
          height={20}
          className="rounded-md object-cover ring-1 ring-white/20"
        />
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold text-white tracking-wider uppercase whitespace-nowrap">
            CLIMPS Network
          </span>
          <span className="inline-flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Red" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Green" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Blue" />
          </span>
        </div>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex animate-ticker whitespace-nowrap">
          {tickerItems.map((msg, i) => (
            <span
              key={i}
              className="inline-flex items-center text-[11px] font-medium text-slate-300 px-6 gap-1.5 whitespace-nowrap"
            >
              {msg}
              <span className="mx-3 text-emerald-500/60 font-bold">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
