'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const STATIC_MESSAGES = [
  '🌟 CLIMPS — Changing Lives Multipurpose Ventures Cooperative Society',
  '💰 Earn 9–25% returns p.a. on your savings — join the Wealth Circle today',
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
    <div className="fixed top-0 left-0 right-0 z-[60] h-8 bg-gradient-to-r from-emerald-900 via-[#0d1a2e] to-emerald-900 border-b border-emerald-800/60 flex items-center overflow-hidden">
      {/* Logo badge pinned on left */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 bg-[#0a0f1e]/80 h-full border-r border-emerald-800/60 z-10">
        <Image
          src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
          alt="CLIMPS Logo"
          width={20}
          height={20}
          className="rounded-md object-cover ring-1 ring-emerald-500/40"
        />
        <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase hidden sm:block whitespace-nowrap">
          CLIMPS Network
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex animate-ticker whitespace-nowrap">
          {tickerItems.map((msg, i) => (
            <span
              key={i}
              className="inline-flex items-center text-[11px] font-medium text-white/80 px-6 gap-1.5 whitespace-nowrap"
            >
              {msg}
              <span className="mx-3 text-emerald-600 opacity-60">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
