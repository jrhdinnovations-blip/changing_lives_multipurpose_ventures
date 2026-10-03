// ============================================================
// CLIMPS TypeScript Types — mirrors Supabase schema
// ============================================================

export type SavingsProductCategory =
  | 'monthly_contribution'
  | 'regular_savings';

export type SavingsAccountStatus = 'active' | 'closed' | 'suspended' | 'pending';
export type SavingsEnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'member' | 'borrower';
export type MembershipStatus = 'pending' | 'under_review' | 'approved' | 'active' | 'suspended' | 'inactive';
export type ContributionStatus = 'paid' | 'partially_paid' | 'unpaid' | 'overdue';
export type SavingsGoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type LoanStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'overdue' | 'completed' | 'restructured' | 'cancelled';
export type InvestmentStatus = 'pending' | 'active' | 'matured' | 'cancelled';
export type InvestmentProductStatus = 'draft' | 'open' | 'fully_subscribed' | 'closed' | 'matured' | 'suspended';
export type TransactionType = 'contribution' | 'savings_deposit' | 'savings_withdrawal' | 'loan_disbursement' | 'loan_repayment' | 'investment_subscription' | 'investment_return' | 'investment_maturity' | 'penalty' | 'charge' | 'adjustment' | 'refund' | 'reversal';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed' | 'cancelled';
export type ComplaintStatus = 'submitted' | 'open' | 'in_review' | 'resolved' | 'closed';
export type RepaymentStatus = 'upcoming' | 'paid' | 'partially_paid' | 'overdue';
export type NotificationType = 'contribution_due' | 'contribution_overdue' | 'payment_received' | 'loan_submitted' | 'loan_approved' | 'loan_rejected' | 'loan_repayment_due' | 'loan_overdue' | 'investment_accepted' | 'investment_maturity' | 'investment_matured' | 'new_investment' | 'complaint_update' | 'announcement' | 'general';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  userId: string;
  memberNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  phone: string;
  email: string;
  address?: string;
  state?: string;
  lga?: string;
  occupation?: string;
  employer?: string;
  nokName?: string;
  nokRelationship?: string;
  nokPhone?: string;
  nokAddress?: string;
  idType?: string;
  idNumber?: string;
  membershipStatus: MembershipStatus;
  membershipDate?: string;
  monthlyContributionAmount: number;
  totalSavings: number;
  totalContributions: number;
  activeLoanBalance: number;
  investmentPortfolioValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  contributionMonth: number;
  contributionYear: number;
  expectedAmount: number;
  amountPaid: number;
  outstandingAmount: number;
  paymentDate?: string;
  paymentMethod?: string;
  transactionReference?: string;
  contributionStatus: ContributionStatus;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  memberId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  frequency: string;
  goalStatus: SavingsGoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsProduct {
  id: string;
  name: string;
  category: SavingsProductCategory;
  description?: string;
  minContribution: number;
  contributionFrequency?: string;
  interestRate?: number;
  duration?: string;
  withdrawalRules?: string;
  eligibility?: string;
  benefits?: string[];
  terms?: string;
  isActive: boolean;
  isMandatory: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsAccount {
  id: string;
  memberId: string;
  productId?: string;
  accountNumber: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  status: SavingsAccountStatus;
  openedAt: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  // joined
  product?: SavingsProduct;
}

export interface SavingsEnrollment {
  memberId: string;
  productId: string;
  amount: number;
  frequency: string;
  startDate: string;
  termsAccepted: boolean;
}

export interface LoanProduct {
  id: string;
  name: string;
  productCode?: string;
  description?: string;
  minimumAmount: number;
  maximumAmount?: number;
  interestRate: number;
  interestMethod: string;
  durationMonths: number;
  repaymentFrequency: string;
  eligibilityCriteria?: string;
  guarantorRequired: boolean;
  processingFeePercent: number;
  latePaymentPenalty: number;
  isActive: boolean;
  createdAt: string;
}

export interface Loan {
  id: string;
  loanNumber: string;
  memberId: string;
  loanProductId?: string;
  applicationId?: string;
  principal: number;
  interestAmount: number;
  totalRepayable: number;
  amountRepaid: number;
  outstandingBalance: number;
  repaymentAmount: number;
  repaymentFrequency: string;
  disbursementDate?: string;
  startDate?: string;
  maturityDate?: string;
  nextRepaymentDate?: string;
  loanStatus: LoanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRepaymentSchedule {
  id: string;
  loanId: string;
  instalmentNumber: number;
  dueDate: string;
  expectedAmount: number;
  amountPaid: number;
  paymentDate?: string;
  scheduleStatus: RepaymentStatus;
  createdAt: string;
}

export interface InvestmentProduct {
  id: string;
  name: string;
  productCode?: string;
  category?: string;
  description?: string;
  minimumInvestment: number;
  maximumInvestment?: number;
  durationMonths: number;
  projectedReturnRate: number;
  returnMethod: string;
  openingDate?: string;
  closingDate?: string;
  maturityDate?: string;
  riskInformation?: string;
  eligibility?: string;
  totalCapacity?: number;
  totalSubscribed: number;
  productStatus: InvestmentProductStatus;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  investmentNumber: string;
  memberId: string;
  productId?: string;
  amountInvested: number;
  projectedReturn?: number;
  actualReturn: number;
  currentValue?: number;
  investmentDate: string;
  maturityDate?: string;
  investmentStatus: InvestmentStatus;
  createdAt: string;
  updatedAt: string;
  // joined
  product?: InvestmentProduct;
}

export interface Transaction {
  id: string;
  transactionRef: string;
  memberId?: string;
  transactionType: TransactionType;
  amount: number;
  isDebit: boolean;
  description: string;
  paymentMethod?: string;
  relatedLoanId?: string;
  relatedInvestmentId?: string;
  relatedContributionId?: string;
  txStatus: TransactionStatus;
  recordedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface MemberDashboardStats {
  totalSavings: number;
  totalContributions: number;
  activeLoanBalance: number;
  investmentPortfolioValue: number;
  currentMonthContributionStatus: ContributionStatus | null;
  outstandingContributions: number;
  totalInvestmentReturns: number;
}

export interface AdminDashboardStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  pendingApprovals: number;
  totalSavings: number;
  monthlyContributions: number;
  outstandingContributions: number;
  activeLoans: number;
  totalDisbursedThisMonth: number;
  outstandingLoanBalance: number;
  overdueLoans: number;
  repaymentsThisMonth: number;
  totalInvestments: number;
  activeInvestments: number;
  maturedThisMonth: number;
  returnsProcessedThisMonth: number;
}
