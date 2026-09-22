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
  productStatus: 'open' | 'fully_subscribed' | 'closed' | 'matured' | 'suspended' | 'draft';
  terms: string[];
  benefits: string[];
  featured?: boolean;
}

export const INVESTMENT_PRODUCTS: InvestmentProductDetail[] = [
  {
    id: 'cooperative-shares',
    code: 'INV-SHR-2026',
    name: 'Cooperative Equity Shares',
    tagline: 'Own a piece. Earn annual dividends.',
    category: 'Equity & Shares',
    description: 'Purchase shares in CLIMPS Cooperative and earn annual dividends from the society\'s net trading surplus. Enjoy voting rights at AGMs.',
    fullDescription: 'Cooperative Equity Shares represent direct member equity ownership in Changing Lives Multipurpose Ventures (CLIMPS). Shareholders participate in annual profit distribution (surplus dividends) determined at the Annual General Meeting. Shareholding also grants full voting rights and equity appreciation over time as the cooperative’s asset base expands across retail, logistics, and micro-credit operations.',
    minimumInvestment: 25000,
    maximumInvestment: 5000000,
    durationMonths: 12,
    durationLabel: '12 Months (Renewable AGM)',
    projectedReturnRate: 16.5,
    projectedReturnLabel: '14% – 18% p.a.',
    isGuaranteed: false,
    returnMethod: 'Annual AGM Surplus Dividend',
    openingDate: '2026-01-15',
    closingDate: '2026-11-30',
    maturityDate: '2026-12-31',
    riskLevel: 'Low',
    riskInformation: 'Backed by the cooperative statutory reserve and diversified real assets. Capital is not redeemable on demand without 90 days notice, but shares can be transferred to existing members or designated next of kin.',
    disclosures: [
      'Dividend declaration depends on the audited operational surplus approved at the AGM.',
      'Projected returns are calculated from previous three years historical surplus averages.',
      'Equity shares represent institutional membership ownership and carry AGM voting privileges.',
    ],
    eligibility: 'Open to all verified CLIMPS cooperative members with complete KYC.',
    totalCapacity: 50000000,
    totalSubscribed: 36500000,
    productStatus: 'open',
    terms: [
      'Minimum share unit subscription is ₦25,000.',
      'Dividends are credited annually directly into the member’s savings account.',
      'Share certificates are generated digitally and verifiable on the portal.',
      'Transfer or liquidation requires submission to the Supervisory Committee.',
    ],
    benefits: [
      'Annual surplus dividend payout',
      'AGM voting rights and policy participation',
      'Transferable to verified next of kin',
      'Bonus allocations during capital reserve bonuses',
    ],
    featured: true,
  },
  {
    id: 'fixed-investment',
    code: 'INV-FIX-2026',
    name: 'Fixed Income Investment Plan',
    tagline: 'Predictable returns. Contractually protected.',
    category: 'Fixed Income',
    description: 'Commit a lump sum for a defined duration and lock in guaranteed contractual returns paid at maturity or monthly.',
    fullDescription: 'The Fixed Income Investment Plan is engineered for conservative members seeking predictable cash flow without market volatility. Your principal is deployed into secured cooperative receivables and asset financing with strict collateralisation. Choose between monthly interest disbursements or compounded maturity payout.',
    minimumInvestment: 50000,
    maximumInvestment: 10000000,
    durationMonths: 12,
    durationLabel: '6 – 24 Months',
    projectedReturnRate: 15.0,
    projectedReturnLabel: '15.0% p.a. Fixed',
    isGuaranteed: true,
    returnMethod: 'Fixed Contractual Return (Monthly or Maturity)',
    openingDate: '2026-01-01',
    closingDate: '2026-12-31',
    maturityDate: '2027-01-01',
    riskLevel: 'Low',
    riskInformation: 'Secured by CLIMPS asset portfolio and backed by loan collateral reserves. Early termination before tenure attracts a 2.5% administration penalty.',
    disclosures: [
      'The fixed rate of 15% p.a. is contractually agreed and guaranteed for the selected tenure.',
      'Early liquidation requires a 14-day formal processing window.',
      'Investment certificates are legally binding promissory instruments.',
    ],
    eligibility: 'All active cooperative members in good standing.',
    totalCapacity: 100000000,
    totalSubscribed: 82000000,
    productStatus: 'open',
    terms: [
      'Tenure options: 6, 12, 18, or 24 months.',
      'Monthly payout option available for amounts of ₦500,000 and above.',
      'Automatic reinvestment (rollover) option upon maturity.',
      'Zero management or maintenance fees charged to investor.',
    ],
    benefits: [
      'Guaranteed contractual return rate',
      'Flexible payout frequency (monthly or maturity)',
      'Option for automatic maturity rollover',
      'Formal legal investment certificate issued',
    ],
    featured: true,
  },
  {
    id: 'real-estate-fund',
    code: 'INV-REF-2026',
    name: 'Real Estate Growth Fund',
    tagline: 'Commercial property wealth. Shared rental yield.',
    category: 'Real Estate',
    description: 'Pool capital with cooperative investors into titled residential estates, shopping plazas, and land banking for rental yields and capital appreciation.',
    fullDescription: 'The CLIMPS Real Estate Growth Fund co-funds vetted commercial real estate and residential infrastructure projects across high-growth corridors. Members earn rental cashflow disbursed bi-annually and share in substantial capital appreciation upon property phase exits or development sales.',
    minimumInvestment: 100000,
    maximumInvestment: 25000000,
    durationMonths: 24,
    durationLabel: '12 – 36 Months',
    projectedReturnRate: 20.0,
    projectedReturnLabel: '18% – 22% p.a.',
    isGuaranteed: false,
    returnMethod: 'Semi-annual Rental Yield + Exit Capital Gain',
    openingDate: '2026-02-01',
    closingDate: '2026-10-31',
    maturityDate: '2028-02-01',
    riskLevel: 'Medium',
    riskInformation: 'Underlying assets consist of physical landed properties with Governor\'s Consent and C of O. Illiquid asset class; early exit is facilitated solely via member-to-member secondary transfer.',
    disclosures: [
      'Projected returns are based on verified market valuations, tenancy rates, and projected capital appreciation.',
      'Rental yield fluctuations may occur depending on tenant occupancy.',
      'Physical property inspection days are scheduled quarterly for registered subscribers.',
    ],
    eligibility: 'Open to all members and vetted Investors Circle applicants.',
    totalCapacity: 75000000,
    totalSubscribed: 54000000,
    productStatus: 'open',
    terms: [
      'Minimum commitment is ₦100,000 per tranche.',
      'Bi-annual rental income paid in June and December.',
      'Capital exit occurs upon project completion or at the expiration of 24 months.',
      'Full quarterly surveyor and valuation reports delivered via email.',
    ],
    benefits: [
      'Bi-annual direct rental dividend',
      'Capital gain participation upon property exit',
      'Physical property inspection access',
      'Collateral backing in registered commercial titles',
    ],
    featured: true,
  },
  {
    id: 'agri-investment',
    code: 'INV-AGR-2026',
    name: 'Agro-Ventures Cycle Note',
    tagline: 'Farm the future. Harvest predictable yields.',
    category: 'Agriculture',
    description: 'Finance cooperative agro-processing, poultry, and grain farming cycles with NAIC comprehensive agricultural insurance coverage.',
    fullDescription: 'The Agro-Ventures Cycle Note channels capital directly into secured commercial agricultural cycles operated by certified farm managers under CLIMPS supervision. Investments fund high-demand grain storage, automated broiler production, and oil palm processing with guaranteed off-take contracts and NAIC crop insurance.',
    minimumInvestment: 50000,
    maximumInvestment: 5000000,
    durationMonths: 9,
    durationLabel: '6 – 9 Months Cycle',
    projectedReturnRate: 22.0,
    projectedReturnLabel: '20% – 24% per cycle',
    isGuaranteed: false,
    returnMethod: 'Lump Sum Harvest Payout (Principal + Profit)',
    openingDate: '2026-03-01',
    closingDate: '2026-08-31',
    maturityDate: '2026-12-15',
    riskLevel: 'Medium–High',
    riskInformation: 'Subject to weather and biological risks, mitigated through comprehensive insurance coverage with the Nigerian Agricultural Insurance Corporation (NAIC) and guaranteed industrial off-taker agreements.',
    disclosures: [
      'Yield projections are determined by pre-agreed forward contract prices with industrial FMCG buyers.',
      'Actual harvest dates may fluctuate by ±14 days depending on crop maturity and drying cycles.',
      'Losses from insured perils are indemnified up to 90% of invested capital.',
    ],
    eligibility: 'All registered CLIMPS members.',
    totalCapacity: 40000000,
    totalSubscribed: 38000000,
    productStatus: 'open',
    terms: [
      'Cycle duration is strictly 9 months from cultivation to off-take settlement.',
      'No early withdrawals permitted due to biological farm production cycles.',
      'Photographic and drone farm progress updates provided bi-monthly.',
    ],
    benefits: [
      'Short 9-month investment turnaround',
      'NAIC agricultural insurance coverage',
      'Pre-negotiated industrial off-taker contracts',
      'Direct contribution to national food security',
    ],
  },
  {
    id: 'sme-investment',
    code: 'INV-SME-2026',
    name: 'SME Commercial Credit Fund',
    tagline: 'Fuel local enterprise. Share in cashflow profits.',
    category: 'SME Lending',
    description: 'Co-fund short-term working capital loans to verified cooperative merchant traders, artisans, and supply chain vendors.',
    fullDescription: 'The SME Commercial Credit Fund empowers creditworthy cooperative entrepreneurs needing 30 to 90 day inventory financing and purchase order execution. The fund charges disciplined interest margins, returning quarterly profits to participating investors while maintaining a strict 120% collateralization ratio.',
    minimumInvestment: 75000,
    maximumInvestment: 15000000,
    durationMonths: 12,
    durationLabel: '12 Months',
    projectedReturnRate: 18.0,
    projectedReturnLabel: '16% – 20% p.a.',
    isGuaranteed: false,
    returnMethod: 'Quarterly Profit Sharing Distribution',
    openingDate: '2026-01-01',
    closingDate: '2026-11-15',
    maturityDate: '2027-01-15',
    riskLevel: 'Medium',
    riskInformation: 'Borrowers provide post-dated cheques, member guarantors, and movable collateral. Default provision reserve is funded at 3% to absorb late repayments.',
    disclosures: [
      'Projected returns reflect net interest margins after deducting credit collection and loan servicing costs.',
      'Quarterly statements detailing fund portfolio health and NPL ratios are provided.',
    ],
    eligibility: 'All verified cooperative members.',
    totalCapacity: 60000000,
    totalSubscribed: 60000000,
    productStatus: 'fully_subscribed',
    terms: [
      'Capital is locked for a minimum of 12 months.',
      'Quarterly interest distributions paid directly to savings account.',
      'Reinvestment option for quarterly dividends into additional fund units.',
    ],
    benefits: [
      'Quarterly cashflow disbursements',
      'Over-collateralized commercial lending portfolio',
      'Direct stimulation of local retail commerce',
      'Transparent portfolio performance reporting',
    ],
  },
  {
    id: 'treasury-notes',
    code: 'INV-TBY-2026',
    name: 'Sovereign Treasury Notes',
    tagline: 'Zero default risk. Institutional yields.',
    category: 'Government Securities',
    description: 'Gain institutional access to Nigerian Treasury Bills and FGN Bonds pooled by CLIMPS investment desk for maximum returns.',
    fullDescription: 'The Sovereign Treasury Notes vehicle aggregates cooperative retail funds into high-volume institutional bidding windows at the Central Bank of Nigeria (CBN). Enjoy the ultimate sovereign security of Federal Government obligations with wholesale yields typically reserved for banks and pension funds.',
    minimumInvestment: 20000,
    maximumInvestment: 20000000,
    durationMonths: 12,
    durationLabel: '6 or 12 Months',
    projectedReturnRate: 14.5,
    projectedReturnLabel: '13% – 16% p.a.',
    isGuaranteed: true,
    returnMethod: 'Discounted Upfront or Maturity Yield',
    openingDate: '2026-01-01',
    closingDate: '2026-12-31',
    maturityDate: '2027-01-01',
    riskLevel: 'Low',
    riskInformation: 'Backed by the full faith and credit of the Federal Government of Nigeria. Zero sovereign default record on local currency obligations.',
    disclosures: [
      'Yield rates are locked in at auction dates and remain fixed throughout the holding tenure.',
      'Tenure matches CBN official issue cycles (182-day or 364-day notes).',
    ],
    eligibility: 'All members and public applicants.',
    totalCapacity: 150000000,
    totalSubscribed: 98000000,
    productStatus: 'open',
    terms: [
      'Tenures: 182 days or 364 days.',
      'Option to receive interest upfront at subscription or compounded at maturity.',
      'Redeemable on secondary market with 48 hours notice.',
    ],
    benefits: [
      'Sovereign risk grade (Federal Government backed)',
      'Wholesale institutional rate access',
      'Upfront interest payout option',
      'High liquidity on secondary market',
    ],
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
