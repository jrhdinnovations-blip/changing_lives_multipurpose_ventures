export interface ServicePillar {
  id: 'save' | 'invest' | 'borrow';
  order: number;
  verb: string;
  noun: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  calculatorHref: string;
  stat: string;
  statLabel: string;
  theme: {
    primaryColor: string;
    gradient: string;
    accentColor: string;
    iconBg: string;
    badgeBg: string;
    badgeText: string;
    border: string;
  };
}

export const SERVICE_PILLARS: ServicePillar[] = [
  {
    id: 'save',
    order: 1,
    verb: 'SAVE',
    noun: 'Savings Products',
    title: 'Build Your Safety Net',
    tagline: '4% monthly return on disciplined thrift',
    description: 'Disciplined monthly contributions (₦5,000 – ₦200,000 monthly) earning 4% monthly interest when retained for at least 1 full year.',
    features: [
      '4% monthly interest (48% p.a.)',
      'Minimum 1-year tenure to retain interest',
      'Flexible limits: ₦5,000 min to ₦200,000 max',
      'Up to 300% loan multiplier eligibility',
    ],
    ctaLabel: 'Explore Savings',
    ctaHref: '/savings-products',
    secondaryCtaLabel: 'Start Saving',
    secondaryCtaHref: '/save/start',
    calculatorHref: '/save/calculator',
    stat: '4% /mo',
    statLabel: 'Monthly Interest',
    theme: {
      primaryColor: 'blue',
      gradient: 'from-blue-600 to-blue-800',
      accentColor: 'bg-blue-100 text-blue-700',
      iconBg: 'bg-blue-500/20',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-blue-300',
      border: 'border-blue-200',
    },
  },
  {
    id: 'invest',
    order: 2,
    verb: 'GROW',
    noun: 'CLIMPS Wealth Circle (CWC)',
    title: 'Structured Wealth-Building',
    tagline: '3.5% monthly agreed return',
    description: 'A structured wealth-building Circle for eligible CLIMPS members who satisfy the applicable membership and programme requirements. Provides members with structured wealth-building opportunities under clearly defined terms and conditions.',
    features: [
      '3.5% monthly agreed return',
      'Structured 3 to 24 month wealth cycles',
      'Governed by Wealth Circle Agreement',
      'Monthly returns deposited directly to wallet',
    ],
    ctaLabel: 'Explore Wealth Circle',
    ctaHref: '/investors-circle',
    secondaryCtaLabel: 'Join Now',
    secondaryCtaHref: '/investors-circle',
    calculatorHref: '/investors-circle',
    stat: '3.5% /mo',
    statLabel: 'Agreed Return',
    theme: {
      primaryColor: 'emerald',
      gradient: 'from-emerald-600 to-emerald-800',
      accentColor: 'bg-emerald-100 text-emerald-700',
      iconBg: 'bg-emerald-500/20',
      badgeBg: 'bg-emerald-600',
      badgeText: 'text-emerald-300',
      border: 'border-emerald-200',
    },
  },
  {
    id: 'borrow',
    order: 3,
    verb: 'BORROW',
    noun: 'Loan Products',
    title: 'Access Funds Fast',
    tagline: '10% monthly rate',
    description: 'Fast express credit at 10% monthly interest with swift approval. Whether for business working capital, education, or emergencies — we have you covered.',
    features: [
      '10% monthly interest rate',
      'Approval within 24 hours',
      'Transparent schedule with no hidden fees',
      'Flexible tenure tailored to repayment capacity',
    ],
    ctaLabel: 'Explore Loans',
    ctaHref: '/loan-products',
    secondaryCtaLabel: 'Apply for Loan',
    secondaryCtaHref: '/loan-application',
    calculatorHref: '/loan-products#calculator',
    stat: '10% /mo',
    statLabel: 'Monthly Interest',
    theme: {
      primaryColor: 'amber',
      gradient: 'from-amber-600 to-orange-700',
      accentColor: 'bg-amber-100 text-amber-700',
      iconBg: 'bg-amber-500/20',
      badgeBg: 'bg-amber-600',
      badgeText: 'text-amber-300',
      border: 'border-amber-200',
    },
  },
];
