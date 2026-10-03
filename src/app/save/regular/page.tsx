'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  Building2,
  CreditCard,
  PhoneCall,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';

interface RegularTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'interest';
  amount: number;
  date: string;
  reference: string;
  channel: string;
  status: 'completed' | 'pending' | 'failed';
  balanceAfter: number;
  description: string;
}

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RegularSavingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<{ id?: string; name: string; memberNumber: string; email: string }>({
    name: 'Member',
    memberNumber: 'CLM-0000',
    email: '',
  });

  // Account stats state
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [interestAccrued, setInterestAccrued] = useState(0);
  const [withdrawalsThisMonth, setWithdrawalsThisMonth] = useState(0);

  // Transactions list
  const [transactions, setTransactions] = useState<RegularTransaction[]>([]);

  const [activeFilter, setActiveFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'interest'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositChannel, setDepositChannel] = useState<'transfer' | 'card' | 'ussd'>('transfer');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [lastRef, setLastRef] = useState('');

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTBank)');
  const [accountNumInput, setAccountNumInput] = useState('0123456789');
  const [accountNameInput, setAccountNameInput] = useState('JOHN DOE');
  const [withdrawReason, setWithdrawReason] = useState('Personal expense');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  // Projection state
  const [projMonths, setProjMonths] = useState(12);
  const [monthlyTopup, setMonthlyTopup] = useState(20000);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        const meta = user.user_metadata;
        const { data: memberData } = await supabase
          .from('members')
          .select('id, first_name, last_name, member_number, email')
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberData) {
          setMember({
            id: memberData.id,
            name: `${memberData.first_name} ${memberData.last_name}`,
            memberNumber: memberData.member_number || 'CLM-0000',
            email: memberData.email || user.email || '',
          });
          setAccountNameInput(`${memberData.first_name.toUpperCase()} ${memberData.last_name.toUpperCase()}`);

          // Fetch real savings account
          const { data: acc } = await supabase
            .from('savings_accounts')
            .select('*')
            .eq('member_id', memberData.id)
            .maybeSingle();

          if (acc) {
            setAccountNumber(acc.account_number || `CLM-RS-${(memberData.member_number || '').replace(/\D/g, '')}`);
            setBalance(Number(acc.balance) || 0);
            setTotalDeposited(Number(acc.total_deposited) || 0);
            setTotalWithdrawn(Number(acc.total_withdrawn) || 0);
            if (acc.interest_accrued) setInterestAccrued(Number(acc.interest_accrued));
          } else {
            setAccountNumber(`CLM-RS-${(memberData.member_number || '0000').replace(/\D/g, '')}`);
          }

          // Fetch real transactions
          const { data: txData } = await supabase
            .from('savings_transactions')
            .select('*')
            .eq('member_id', memberData.id)
            .order('created_at', { ascending: false })
            .limit(50);

          if (txData && txData.length > 0) {
            const mapped: RegularTransaction[] = txData.map((t: any) => ({
              id: t.id,
              type: t.transaction_type || t.type || 'deposit',
              amount: Number(t.amount) || 0,
              date: (t.created_at || '').replace('T', ' ').slice(0, 16),
              reference: t.reference || t.transaction_reference || '',
              channel: t.channel || t.payment_method || 'Bank Transfer',
              status: t.status || 'completed',
              balanceAfter: Number(t.balance_after) || 0,
              description: t.description || t.notes || '',
            }));
            setTransactions(mapped);

            // Count this month's withdrawals
            const thisMonth = new Date().toISOString().slice(0, 7);
            const monthlyWithdrawals = mapped.filter(
              (t) => t.type === 'withdrawal' && t.date.startsWith(thisMonth)
            ).length;
            setWithdrawalsThisMonth(monthlyWithdrawals);
          }
        } else {
          setMember({
            name: meta?.full_name || 'Cooperative Member',
            memberNumber: meta?.member_number || 'CLM-0000',
            email: user.email || '',
          });
        }
      } catch (err) {
        console.error('Error fetching member savings data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Handle Deposit
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(depositAmount.replace(/,/g, ''));
    if (!parsed || parsed < 1000) {
      alert('Minimum deposit amount is ₦1,000');
      return;
    }

    setDepositLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    const ref = `TXN-DEP-${Date.now().toString().slice(-8)}`;
    setLastRef(ref);

    const newTx: RegularTransaction = {
      id: `tx-${Date.now()}`,
      type: 'deposit',
      amount: parsed,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reference: ref,
      channel: depositChannel === 'card' ? 'Debit Card' : depositChannel === 'ussd' ? 'USSD' : 'Bank Transfer',
      status: 'completed',
      balanceAfter: balance + parsed,
      description: 'Voluntary Regular Savings Top-up',
    };

    setBalance((prev) => prev + parsed);
    setTotalDeposited((prev) => prev + parsed);
    setTransactions((prev) => [newTx, ...prev]);
    setDepositLoading(false);
    setDepositSuccess(true);
  };

  // Handle Withdrawal
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    const parsed = parseFloat(withdrawAmount.replace(/,/g, ''));

    if (!parsed || parsed <= 0) {
      setWithdrawError('Please enter a valid amount to withdraw.');
      return;
    }
    if (withdrawalsThisMonth >= 2) {
      setWithdrawError('Monthly withdrawal limit reached (maximum 2 withdrawals per calendar month as per cooperative by-laws).');
      return;
    }
    if (parsed > balance - 500) {
      setWithdrawError(`Insufficient funds. Your withdrawal must leave a minimum retained balance of ₦500. Maximum withdrawable: ${fmt(balance - 500)}`);
      return;
    }

    setWithdrawLoading(true);
    await new Promise((r) => setTimeout(r, 1400));

    const ref = `TXN-WTH-${Date.now().toString().slice(-8)}`;
    setLastRef(ref);

    const newTx: RegularTransaction = {
      id: `tx-${Date.now()}`,
      type: 'withdrawal',
      amount: parsed,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reference: ref,
      channel: `Bank Payout (${bankName.split(' ')[0]})`,
      status: 'completed',
      balanceAfter: balance - parsed,
      description: withdrawReason || 'Voluntary Regular Savings Withdrawal',
    };

    setBalance((prev) => prev - parsed);
    setTotalWithdrawn((prev) => prev + parsed);
    setWithdrawalsThisMonth((prev) => prev + 1);
    setTransactions((prev) => [newTx, ...prev]);
    setWithdrawLoading(false);
    setWithdrawSuccess(true);
  };

  // Calculation for projection
  const calculatedFutureBalance = () => {
    const rate = 0.07 / 12;
    let b = balance;
    for (let i = 0; i < projMonths; i++) {
      b = (b + monthlyTopup) * (1 + rate);
    }
    return b;
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchFilter = activeFilter === 'all' || t.type === activeFilter;
    const matchSearch =
      searchQuery === '' ||
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.channel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-white/60 font-medium">Loading savings account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
        <div className="bg-[#0d1527] rounded-2xl shadow-2xl border border-white/10 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            You must be signed in with your cooperative account before accessing or subscribing to a Regular Voluntary Savings account.
          </p>
          <div className="space-y-3">
            <Link
              href="/login?redirect=/save/regular"
              className="block w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              Sign In to Continue
            </Link>
            <Link
              href="/landing"
              className="block w-full py-2.5 px-4 text-white/50 hover:text-white font-medium text-sm transition-colors"
            >
              Return to Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout role="member" memberName={member.name} memberId={member.memberNumber}>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-white/50 mb-1">
              <Link href="/savings-products" className="hover:text-emerald-400 transition-colors">
                Savings Products
              </Link>
              <span>/</span>
              <span className="text-white font-medium">Regular Savings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Regular Savings Account</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                Active • 7.0% p.a.
              </span>
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Your liquid voluntary savings wallet. Deposit anytime, earn quarterly interest, and withdraw with ease.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setDepositAmount('');
                setDepositSuccess(false);
                setShowDepositModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-sm transition-all active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Deposit Funds</span>
            </button>

            <button
              onClick={() => {
                setWithdrawAmount('');
                setWithdrawError('');
                setWithdrawSuccess(false);
                setShowWithdrawModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0d1527] hover:bg-white/[0.06] text-white font-medium text-sm shadow-sm transition-all active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw Cash</span>
            </button>
          </div>
        </div>

        {/* Primary Account Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Balance */}
          <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-500/10 via-card to-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Available Balance</span>
              <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{fmt(balance)}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10/50">
              <span>Account: {accountNumber}</span>
              <span className="text-emerald-600 font-medium">Safe & Insured</span>
            </div>
          </div>

          {/* Card 2: Interest Earned */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1527] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Interest Earned</span>
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">{fmt(interestAccrued)}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10/50">
              <span>Rate: 7.0% p.a.</span>
              <span>Next Credit: Sep 30</span>
            </div>
          </div>

          {/* Card 3: Total Deposited */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1527] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Total Deposited</span>
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{fmt(totalDeposited)}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10/50">
              <span>Voluntary additions</span>
              <span className="text-blue-600 font-medium">No lock-in</span>
            </div>
          </div>

          {/* Card 4: Withdrawal Rules & Usage */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1527] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Monthly Withdrawals</span>
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {withdrawalsThisMonth} <span className="text-sm font-normal text-white/50">/ 2 used</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10/50">
              <span>Min. balance: ₦500</span>
              <span className="text-teal-600 font-medium">{2 - withdrawalsThisMonth} free left</span>
            </div>
          </div>
        </div>

        {/* Cooperative Rules & Interactive Growth Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules Banner */}
          <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-[#0d1527] p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Account Operating Rules</h3>
              </div>
              <p className="text-xs text-white/50 mb-4 leading-relaxed">
                Regular Savings is governed by the Changing Lives Multipurpose Ventures thrift guidelines to preserve liquidity and high dividend yield.
              </p>

              <ul className="space-y-3 text-xs text-white/90">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span><strong>7.0% Annual Interest:</strong> Calculated on daily balances and credited directly every quarter.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span><strong>2 Withdrawals Per Month:</strong> Enjoy fee-free withdrawals twice monthly. Retain at least ₦500.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span><strong>Instant Settlement:</strong> Approved withdrawals credit your verified commercial bank account immediately.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span><strong>No Monthly Penalty:</strong> Voluntary top-ups require no fixed monthly minimum if skipped.</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.06]/60 border border-white/10 text-xs flex items-center justify-between">
              <div>
                <span className="text-white/50 block">Need structured monthly savings?</span>
                <span className="font-medium text-white">See Monthly Contribution (9% p.a.)</span>
              </div>
              <Link href="/save/contributions" className="text-teal-600 hover:text-teal-700 font-semibold underline">
                View
              </Link>
            </div>
          </div>

          {/* Interactive Growth Simulator */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0d1527] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Compound Growth Simulator</span>
                </h3>
                <p className="text-xs text-white/50">
                  Simulate your Regular Savings balance with monthly top-ups at 7.0% annual interest.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-white/50 block">Estimated Future Value</span>
                <span className="text-xl font-bold text-teal-600">{fmt(calculatedFutureBalance())}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-xs font-medium text-white/50 block mb-1.5">
                  Monthly Top-Up: <span className="text-white font-semibold">{fmt(monthlyTopup)}</span>
                </label>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={monthlyTopup}
                  onChange={(e) => setMonthlyTopup(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                <div className="flex justify-between text-[11px] text-white/50 mt-1">
                  <span>₦5,000/mo</span>
                  <span>₦100,000/mo</span>
                  <span>₦200,000/mo</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-white/50 block mb-1.5">
                  Savings Horizon: <span className="text-white font-semibold">{projMonths} Months</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 12, 24, 36].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setProjMonths(m)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        projMonths === m
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white/[0.06]/40 text-white/50 hover:text-white border-white/10'
                      }`}
                    >
                      {m} Mos
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-white/50 block">Total Expected Principal Contributed</span>
                <span className="font-semibold text-white">{fmt(balance + monthlyTopup * projMonths)}</span>
              </div>
              <div>
                <span className="text-white/50 block">Total Interest Accrued</span>
                <span className="font-semibold text-emerald-600">
                  +{fmt(Math.max(0, calculatedFutureBalance() - (balance + monthlyTopup * projMonths)))}
                </span>
              </div>
              <button
                onClick={() => {
                  setDepositAmount(monthlyTopup.toString());
                  setShowDepositModal(true);
                }}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-xs shadow-sm transition-all ml-auto"
              >
                Deposit Now
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History & Filter Table */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1527] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Transaction Ledger</h2>
              <p className="text-xs text-white/50">Complete audit trail of deposits, withdrawals, and interest payouts.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reference or channel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-white/10 bg-background focus:outline-none focus:ring-2 focus:ring-teal-500 w-44 sm:w-56"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center rounded-xl bg-white/[0.06]/60 p-1 border border-white/10 text-xs">
                {(['all', 'deposit', 'withdrawal', 'interest'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                      activeFilter === tab
                        ? 'bg-[#0d1527] text-white shadow-xs'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/50 font-semibold">
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Channel / Details</th>
                  <th className="pb-3 px-4">Reference</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Balance After</th>
                  <th className="pb-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10/60">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-white/50">
                      No transactions found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.06]/30 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              tx.type === 'deposit'
                                ? 'bg-teal-100 text-teal-700'
                                : tx.type === 'withdrawal'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {tx.type === 'deposit' ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : tx.type === 'withdrawal' ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingUp className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-white capitalize">{tx.type}</span>
                            <span className="text-[10px] text-white/50 block truncate max-w-[140px]">
                              {tx.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        <span
                          className={
                            tx.type === 'withdrawal'
                              ? 'text-red-600'
                              : tx.type === 'interest'
                              ? 'text-emerald-600'
                              : 'text-teal-700'
                          }
                        >
                          {tx.type === 'withdrawal' ? '-' : '+'}
                          {fmt(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-white/50 font-medium">{tx.channel}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-white/50">{tx.reference}</td>
                      <td className="py-3.5 px-4 text-white/50">{tx.date}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{fmt(tx.balanceAfter)}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Success</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODAL 1: DEPOSIT FUNDS ── */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0d1527] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-teal-600" />
              <span>Deposit to Regular Savings</span>
            </h3>
            <p className="text-xs text-white/50 mb-4">
              Add funds anytime. Minimum deposit is ₦1,000. Voluntary and liquid.
            </p>

            {depositSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Deposit Successful!</h4>
                  <p className="text-xs text-white/50 mt-1">
                    Your balance has been credited with <strong>{fmt(parseFloat(depositAmount) || 0)}</strong>.
                  </p>
                  <p className="text-[11px] font-mono text-white/50 mt-2">Ref: {lastRef}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Deposit Amount (₦)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    placeholder="e.g. 20,000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 bg-background focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                  <span className="text-[11px] text-white/50 mt-1 block">Min ₦1,000 • No upper limit</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'transfer', label: 'Bank Transfer', icon: Building2 },
                      { id: 'card', label: 'Debit Card', icon: CreditCard },
                      { id: 'ussd', label: 'USSD Code', icon: PhoneCall },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDepositChannel(opt.id as any)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between text-xs transition-all ${
                          depositChannel === opt.id
                            ? 'border-teal-600 bg-teal-50/50 text-teal-800 font-semibold'
                            : 'border-white/10 bg-[#0d1527] text-white/50 hover:text-white'
                        }`}
                      >
                        <opt.icon className="w-4 h-4 mb-2" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {depositChannel === 'transfer' && (
                  <div className="p-3.5 rounded-xl bg-white/[0.06]/60 border border-white/10 text-xs space-y-1.5">
                    <span className="font-semibold text-white block">Dedicated Deposit Account (NUBAN)</span>
                    <div className="flex justify-between text-white/50">
                      <span>Bank:</span>
                      <span className="font-medium text-white">Wema Bank / Moniepoint</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Account Number:</span>
                      <span className="font-mono font-bold text-white tracking-wider">9948201844</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Account Name:</span>
                      <span className="font-medium text-white">CLIMPS - {member.name}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-medium hover:bg-white/[0.06]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={depositLoading}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {depositLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Complete Deposit</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 2: WITHDRAW CASH ── */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0d1527] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
              <span>Withdraw from Regular Savings</span>
            </h3>
            <p className="text-xs text-white/50 mb-4">
              Instant payout to your bank account. Maximum 2 withdrawals per month.
            </p>

            {withdrawSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Withdrawal Queued for Payout!</h4>
                  <p className="text-xs text-white/50 mt-1">
                    ₦{parseFloat(withdrawAmount).toLocaleString('en-NG')} will be settled to your bank account{' '}
                    <strong>({bankName})</strong> shortly.
                  </p>
                  <p className="text-[11px] font-mono text-white/50 mt-2">Ref: {lastRef}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {withdrawError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-white">Withdrawal Amount (₦)</label>
                    <span className="text-[11px] text-white/50">Max: {fmt(Math.max(0, balance - 500))}</span>
                  </div>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    required
                    placeholder="e.g. 15,000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 bg-background focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                  <span className="text-[11px] text-white/50 mt-1 block">
                    Remaining balance after withdrawal must be at least ₦500.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Destination Commercial Bank</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 bg-background"
                  >
                    <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                    <option value="Access Bank Plc">Access Bank Plc</option>
                    <option value="Zenith Bank Plc">Zenith Bank Plc</option>
                    <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                    <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                    <option value="Kuda Microfinance Bank">Kuda Microfinance Bank</option>
                    <option value="OPay Digital Services">OPay Digital Services</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={accountNumInput}
                      onChange={(e) => setAccountNumInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 bg-background font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">Account Name</label>
                    <input
                      type="text"
                      value={accountNameInput}
                      onChange={(e) => setAccountNameInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 bg-background uppercase text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-medium hover:bg-white/[0.06]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={withdrawLoading}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {withdrawLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Confirm Payout</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
