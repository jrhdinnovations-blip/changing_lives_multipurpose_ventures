// ============================================================
// CLIMPS Investment Products & Shared Data Store
// ============================================================

export interface InvestmentProductDetail {
  id: string;
  code: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  fullDescription: string;
  minimumInvestment: number;
  maximumInvestment?: number;
  durationMonths: number;
  durationLabel: string;
  projectedReturnRate: number; // e.g. 16 means 16% p.a.
  projectedReturnLabel: string;
  isGuaranteed: boolean;
  returnMethod: string;
  openingDate: string;
  closingDate: string;
  maturityDate: string;
  riskLevel: 'Low' | 'Low–Medium' | 'Medium' | 'Medium–High' | 'High';
  riskInformation: string;
  disclosures: string[];
  eligibility: string;
  totalCapacity: number;
  totalSubscribed: number;
  productStatus: 'open' | 'fully_subscribed' | 'closed' | 'matured' | 'suspended' | 'draft' | 'coming_soon';
  terms: string[];
  benefits: string[];
  featured?: boolean;
  comingSoon?: boolean;
  launchEstimate?: string;
}

export const INVESTMENT_PRODUCTS: InvestmentProductDetail[] = [
  {
    id: 'investors-circle',
    code: 'INV-CIR-2026',
    name: 'CLIMPS Wealth Circle (CWC)',
    tagline: 'A structured wealth-building Circle for eligible CLIMPS members.',
    category: 'Wealth Circle (Regular Investment)',
    description: 'A structured wealth-building Circle for eligible CLIMPS members who satisfy the applicable membership and programme requirements. Provides members with structured wealth-building opportunities under clearly defined terms and conditions.',
    fullDescription: 'The CLIMPS Wealth Circle (CWC) is a structured wealth-building Circle for eligible CLIMPS members who satisfy the applicable membership and programme requirements. It provides members with structured wealth-building opportunities under clearly defined terms and conditions with an Agreed Return of 3.5% monthly. Members enjoy transparent governance, audited financial disclosures, and direct portfolio tracking through the dedicated circle dashboard.',
    minimumInvestment: 50000,
    maximumInvestment: 25000000,
    durationMonths: 12,
    durationLabel: '3 – 24 Months',
    projectedReturnRate: 42.0,
    projectedReturnLabel: '3.5% monthly (Agreed Return)',
    isGuaranteed: false,
    returnMethod: 'Monthly / Quarterly Agreed Return Disbursement',
    openingDate: '2026-01-01',
    closingDate: '2026-12-31',
    maturityDate: '2027-01-01',
    riskLevel: 'Low–Medium',
    riskInformation: 'Underlying investments are secured against audited cooperative asset reserves, receivables, and verified corporate guarantees. Capital is protected through cooperative liquidity reserves.',
    disclosures: [
      '1. Agreed Return: 3.5% monthly return distributed under clearly defined terms and conditions of the Wealth Circle Agreement.',
      'Withdrawal and Liquidation: Requests for partial or full liquidation shall be subject to the applicable notice period and the terms contained in the Wealth Circle Agreement. Early liquidation may affect the return applicable and may attract an administrative charge where expressly provided for in the Agreement.',
      'Comprehensive performance reports are published on the member portal.',
      'Members have voting rights on major capital allocation decisions at member meetings.',
    ],
    eligibility: 'Open to eligible CLIMPS members who satisfy applicable membership and programme requirements.',
    totalCapacity: 150000000,
    totalSubscribed: 98500000,
    productStatus: 'open',
    terms: [
      '1. Agreed Return: 3.5% monthly return under clearly defined terms and conditions.',
      'Withdrawal and Liquidation: Requests for partial or full liquidation shall be subject to the applicable notice period and the terms contained in the Wealth Circle Agreement. Early liquidation may affect the return applicable and may attract an administrative charge where expressly provided for in the Agreement.',
      'Minimum subscription commitment is ₦50,000.',
      'Official digital Certificate of Investment issued upon subscription verification.',
      'Flexible tenure options: 3, 4, 5, 6, 12, or 24 months with automatic rollover choices.',
    ],
    benefits: [
      'Agreed Return of 3.5% monthly on subscribed capital',
      'Dedicated Wealth Circle dashboard & performance tracking',
      'Direct participation in vetted cooperative projects',
      'Priority access to future investment tranches',
    ],
    featured: true,
    comingSoon: false,
  },
  {
    id: 'agri-investment',
    code: 'INV-AGR-2026',
    name: 'Agro-Ventures Fund',
    tagline: 'Commercial agricultural cycles & crop processing.',
    category: 'Agriculture',
    description: 'Finance cooperative agro-processing, poultry, and grain farming cycles with NAIC comprehensive agricultural insurance coverage.',
    fullDescription: 'The Agro-Ventures Fund channels capital directly into secured commercial agricultural cycles operated by certified farm managers under CLIMPS supervision. Investments fund high-demand grain storage, automated broiler production, and oil palm processing with guaranteed off-take contracts and NAIC crop insurance.',
    minimumInvestment: 100000,
    maximumInvestment: 10000000,
    durationMonths: 9,
    durationLabel: '6 – 9 Months Cycle',
    projectedReturnRate: 22.0,
    projectedReturnLabel: '18% – 22% per cycle',
    isGuaranteed: false,
    returnMethod: 'Lump Sum Harvest Payout (Principal + Profit)',
    openingDate: '2026-10-01',
    closingDate: '2026-12-31',
    maturityDate: '2027-07-01',
    riskLevel: 'Medium–High',
    riskInformation: 'Subject to weather and biological risks, mitigated through comprehensive insurance coverage with the Nigerian Agricultural Insurance Corporation (NAIC) and guaranteed industrial off-taker agreements.',
    disclosures: [
      'This product is currently in preparation and slated to launch shortly.',
      'Yield projections are determined by pre-agreed forward contract prices with industrial FMCG buyers.',
      'Losses from insured perils are indemnified up to 90% of invested capital under NAIC policies.',
    ],
    eligibility: 'All registered CLIMPS members (Waitlist open).',
    totalCapacity: 50000000,
    totalSubscribed: 0,
    productStatus: 'coming_soon',
    terms: [
      'Product currently in preparation — subscriptions opening soon.',
      'Cycle duration is 6–9 months from cultivation to off-take settlement.',
      'Photographic and drone farm progress updates provided bi-monthly.',
    ],
    benefits: [
      'Short 9-month investment turnaround',
      'NAIC agricultural insurance coverage',
      'Pre-negotiated industrial off-taker contracts',
      'Direct contribution to national food security',
    ],
    featured: false,
    comingSoon: true,
    launchEstimate: 'Coming Soon',
  },
  {
    id: 'real-estate-fund',
    code: 'INV-REF-2026',
    name: 'Real Estate Growth Fund',
    tagline: 'Commercial property wealth & shared rental yield.',
    category: 'Real Estate',
    description: 'Pool capital with cooperative investors into titled residential estates, shopping plazas, and land banking for rental yields and capital appreciation.',
    fullDescription: 'The CLIMPS Real Estate Growth Fund co-funds vetted commercial real estate and residential infrastructure projects across high-growth corridors. Members earn rental cashflow disbursed bi-annually and share in substantial capital appreciation upon property phase exits or development sales.',
    minimumInvestment: 500000,
    maximumInvestment: 50000000,
    durationMonths: 24,
    durationLabel: '24 – 60 Months',
    projectedReturnRate: 25.0,
    projectedReturnLabel: '20% – 28% p.a.',
    isGuaranteed: false,
    returnMethod: 'Semi-annual Rental Yield + Exit Capital Gain',
    openingDate: '2026-11-01',
    closingDate: '2026-12-31',
    maturityDate: '2028-11-01',
    riskLevel: 'Medium',
    riskInformation: 'Underlying assets consist of physical landed properties with Governor\'s Consent and C of O. Illiquid asset class; early exit is facilitated solely via member-to-member secondary transfer.',
    disclosures: [
      'This product is currently in preparation and will be open for subscription soon.',
      'Projected returns are based on verified market valuations, tenancy rates, and projected capital appreciation.',
      'Physical property inspection days will be scheduled quarterly for registered subscribers.',
    ],
    eligibility: 'Open to all members and vetted Investors Circle applicants (Waitlist open).',
    totalCapacity: 100000000,
    totalSubscribed: 0,
    productStatus: 'coming_soon',
    terms: [
      'Product currently in preparation — subscriptions opening soon.',
      'Bi-annual rental income paid in June and December upon property completion.',
      'Full quarterly surveyor and valuation reports delivered via email.',
    ],
    benefits: [
      'Bi-annual direct rental dividend',
      'Capital gain participation upon property exit',
      'Physical property inspection access',
      'Collateral backing in registered commercial titles',
    ],
    featured: false,
    comingSoon: true,
    launchEstimate: 'Coming Soon',
  },
];

// Helper calculations for investment returns
export function calculateInvestmentReturn(
  principal: number,
  annualRate: number,
  durationMonths: number,
  calculationMethod: 'simple' | 'compound' = 'simple'
): {
  principal: number;
  projectedReturn: number;
  maturityValue: number;
  monthlyReturn: number;
  maturityDate: string;
} {
  const years = durationMonths / 12;
  let projectedReturn = 0;

  if (calculationMethod === 'compound') {
    // Annual compound interest
    const maturityValue = principal * Math.pow(1 + annualRate / 100, years);
    projectedReturn = maturityValue - principal;
  } else {
    // Simple interest
    projectedReturn = principal * (annualRate / 100) * years;
  }

  const maturityValue = principal + projectedReturn;
  const monthlyReturn = projectedReturn / durationMonths;

  const d = new Date();
  d.setMonth(d.getMonth() + durationMonths);
  const maturityDate = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    principal,
    projectedReturn: Math.round(projectedReturn * 100) / 100,
    maturityValue: Math.round(maturityValue * 100) / 100,
    monthlyReturn: Math.round(monthlyReturn * 100) / 100,
    maturityDate,
  };
}

export function formatNaira(amount: number): string {
  return '₦' + amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNairaCompact(amount: number): string {
  if (amount >= 1000000) {
    return '₦' + (amount / 1000000).toFixed(1) + 'M';
  }
  if (amount >= 1000) {
    return '₦' + (amount / 1000).toFixed(0) + 'K';
  }
  return '₦' + amount.toLocaleString('en-NG');
}
