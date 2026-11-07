export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  userId: number | null;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  createdAt?: string;
}

export interface Budget {
  id: number;
  categoryId: number;
  limitAmount: number;
  month: string; // YYYY-MM
  categoryName: string;
  categoryColor: string;
  spent: number;
  percentage: number;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  exceededBudgetsCount: number;
  activeBudgetsCount: number;
}

export interface CategorySummary {
  name: string;
  value: number;
  color: string;
  categoryId: number;
}

export interface MonthlyHistory {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto' | 'isa' | 'index_fund' | 'savings';
  shares: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  gainPercentage: number;
}

export interface StatementTransaction {
  id?: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryName: string;
  suggestedColor?: string;
  selected?: boolean;
}

export interface StatementUploadResult {
  institution: string;
  accountType: 'student_finance' | 'student_current' | 'checking' | 'investment_portfolio' | 'mixed';
  period: string;
  currency: string;
  totalIncomeDetected: number;
  totalExpensesDetected: number;
  netCashFlow: number;
  cashBalanceEstimate: number;
  studentFinance?: {
    isStudent: boolean;
    maintenanceLoanDetected: number;
    nextDropEstimate?: string;
    termPacingPerDay?: number;
    statusNotes?: string;
  };
  portfolio?: {
    totalValue: number;
    totalInvested: number;
    unrealizedGainLoss: number;
    unrealizedGainLossPercentage: number;
    holdings: PortfolioHolding[];
  };
  transactions: StatementTransaction[];
  aiInsight: string;
}

export interface ForecastPrediction {
  targetMonth: string;
  predictedIncome: number;
  incomeConfidence: 'High' | 'Moderate' | 'Variable';
  incomeSources: {
    name: string;
    amount: number;
    expectedDate: string;
    category: string;
    isGuaranteed: boolean;
  }[];
  estimatedExpenses: number;
  expenseCategories: {
    category: string;
    amount: number;
    isFixed: boolean;
    trendNote: string;
  }[];
  projectedNetCashFlow: number;
  safeToSpend: {
    monthlyDiscretionary: number;
    weeklyBudget: number;
    dailyBudget: number;
  };
  recommendedSetAside: {
    totalAmount: number;
    emergencyReserve: number;
    investmentsOrSavings: number;
    strategyAdvice: string;
  };
  studentFinancePlan?: {
    daysUntilNextLoanDrop: number;
    nextExpectedDisbursement: number;
    safeDailyBurnRate: number;
    hallRentCoverage: string;
    studentTips: string[];
  };
  investmentOutlook?: {
    totalHoldingsValue: number;
    projectedMonthlyDividendYield: number;
    projectedAnnualGrowth: number;
    diversificationScore: string;
    allocationAdvice: string;
  };
  aiActionItems: string[];
  aiSummary: string;
}

