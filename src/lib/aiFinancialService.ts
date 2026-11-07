import { GoogleGenAI } from '@google/genai';
import { StatementUploadResult, ForecastPrediction, PortfolioHolding, StatementTransaction } from '../types.ts';

// Server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Standard realistic presets for one-click testing
export const PRESET_STATEMENTS: Record<string, StatementUploadResult> = {
  uni_student: {
    institution: 'Monzo Student & Student Finance England',
    accountType: 'student_current',
    period: 'Past 6 Months (Nov 2025 - Apr 2026)',
    currency: 'GBP',
    totalIncomeDetected: 4180.00,
    totalExpensesDetected: 3340.50,
    netCashFlow: 839.50,
    cashBalanceEstimate: 840.00,
    studentFinance: {
      isStudent: true,
      maintenanceLoanDetected: 3450.00,
      nextDropEstimate: '2026-09-21 (Term 1 Installment: ~£3,450)',
      termPacingPerDay: 18.50,
      statusNotes: 'Student Maintenance Loan disbursement received in January. Term 3 grant covered tuition & campus accommodation.',
    },
    portfolio: {
      totalValue: 380.00,
      totalInvested: 320.00,
      unrealizedGainLoss: 60.00,
      unrealizedGainLossPercentage: 18.75,
      holdings: [
        {
          symbol: 'VUAG',
          name: 'Vanguard S&P 500 ETF (Accumulating)',
          type: 'isa',
          shares: 3.5,
          avgCost: 75.00,
          currentPrice: 88.50,
          value: 309.75,
          gainPercentage: 18.0,
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin Micro-Holdings',
          type: 'crypto',
          shares: 0.001,
          avgCost: 55.00,
          currentPrice: 70.25,
          value: 70.25,
          gainPercentage: 27.7,
        },
      ],
    },
    transactions: [
      { date: '2026-01-12', description: 'Student Finance England Maint Loan', amount: 3450.00, type: 'income', categoryName: 'Salary' },
      { date: '2026-01-15', description: 'University Accommodation Halls Term 2', amount: 1650.00, type: 'expense', categoryName: 'Bills' },
      { date: '2026-01-20', description: 'Blackwells University Textbooks & Supplies', amount: 84.50, type: 'expense', categoryName: 'Education' },
      { date: '2026-01-28', description: 'Tesco Express Weekly Groceries', amount: 42.10, type: 'expense', categoryName: 'Food' },
      { date: '2026-02-05', description: 'Campus Barista Part-Time Shift Pay', amount: 185.00, type: 'income', categoryName: 'Salary' },
      { date: '2026-02-12', description: 'Student 16-25 Railcard National Express', amount: 30.00, type: 'expense', categoryName: 'Transport' },
      { date: '2026-02-14', description: 'Sainsburys Student Meals & Snacks', amount: 56.40, type: 'expense', categoryName: 'Food' },
      { date: '2026-02-20', description: 'Spotify Student Premium Discount', amount: 5.99, type: 'expense', categoryName: 'Bills' },
      { date: '2026-03-01', description: 'Campus Library Cafe & Printers', amount: 14.80, type: 'expense', categoryName: 'Education' },
      { date: '2026-03-05', description: 'Campus Barista Part-Time Shift Pay', amount: 210.00, type: 'income', categoryName: 'Salary' },
      { date: '2026-03-12', description: 'Aldi Bi-Weekly Bulk Groceries', amount: 68.20, type: 'expense', categoryName: 'Food' },
      { date: '2026-03-22', description: 'Students Union Social Night Out', amount: 32.50, type: 'expense', categoryName: 'Entertainment' },
      { date: '2026-04-05', description: 'Campus Barista Part-Time Shift Pay', amount: 195.00, type: 'income', categoryName: 'Salary' },
      { date: '2026-04-10', description: 'PureGym Student Membership', amount: 19.99, type: 'expense', categoryName: 'Healthcare' },
      { date: '2026-04-18', description: 'Amazon Prime Student Delivery', amount: 4.49, type: 'expense', categoryName: 'Shopping' },
      { date: '2026-04-24', description: 'Lidl Supermarket Groceries', amount: 48.70, type: 'expense', categoryName: 'Food' },
    ],
    aiInsight: 'Healthy student financial health. After your major halls accommodation payment (£1,650), your part-time barista earnings (~£195/month) comfortably subsidize your living expenses. You have £840 in remaining maintenance cash buffer. With 130 days until next September loan installment, you can spend £18.50/day safely.',
  },
  young_professional: {
    institution: 'Barclays Premier & Trading 212 ISA',
    accountType: 'mixed',
    period: 'Past 12 Months (May 2025 - Apr 2026)',
    currency: 'GBP',
    totalIncomeDetected: 31200.00,
    totalExpensesDetected: 22450.00,
    netCashFlow: 8750.00,
    cashBalanceEstimate: 4200.00,
    studentFinance: {
      isStudent: false,
      maintenanceLoanDetected: 0,
      statusNotes: 'Graduate Plan 2 Student Loan deduction automated via PAYE paycheck (£115/month).',
    },
    portfolio: {
      totalValue: 14650.00,
      totalInvested: 11800.00,
      unrealizedGainLoss: 2850.00,
      unrealizedGainLossPercentage: 24.15,
      holdings: [
        {
          symbol: 'VWRP',
          name: 'Vanguard FTSE All-World UCITS ETF',
          type: 'etf',
          shares: 110,
          avgCost: 88.00,
          currentPrice: 104.20,
          value: 11462.00,
          gainPercentage: 18.4,
        },
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          type: 'stock',
          shares: 10,
          avgCost: 165.00,
          currentPrice: 215.50,
          value: 2155.00,
          gainPercentage: 30.6,
        },
        {
          symbol: 'CASH',
          name: 'High Yield Cash ISA (4.85% AER)',
          type: 'isa',
          shares: 1,
          avgCost: 1033.00,
          currentPrice: 1033.00,
          value: 1033.00,
          gainPercentage: 4.85,
        },
      ],
    },
    transactions: [
      { date: '2026-01-25', description: 'Tech Solutions Ltd Monthly Net Salary', amount: 2600.00, type: 'income', categoryName: 'Salary' },
      { date: '2026-02-01', description: 'Apartment Rent Residential Landlord', amount: 950.00, type: 'expense', categoryName: 'Bills' },
      { date: '2026-02-02', description: 'Council Tax Band B Direct Debit', amount: 135.00, type: 'expense', categoryName: 'Bills' },
      { date: '2026-02-05', description: 'Octopus Energy Gas & Electricity', amount: 88.50, type: 'expense', categoryName: 'Bills' },
      { date: '2026-02-10', description: 'Trading 212 Monthly ISA Standing Order', amount: 350.00, type: 'expense', categoryName: 'Investments' },
      { date: '2026-02-15', description: 'Tesco Superstore Bi-weekly Groceries', amount: 74.20, type: 'expense', categoryName: 'Food' },
      { date: '2026-02-25', description: 'Tech Solutions Ltd Monthly Net Salary', amount: 2600.00, type: 'income', categoryName: 'Salary' },
      { date: '2026-03-01', description: 'Apartment Rent Residential Landlord', amount: 950.00, type: 'expense', categoryName: 'Bills' },
      { date: '2026-03-10', description: 'Trading 212 Monthly ISA Standing Order', amount: 350.00, type: 'expense', categoryName: 'Investments' },
      { date: '2026-03-16', description: 'Transport for London Oyster Auto Top-Up', amount: 120.00, type: 'expense', categoryName: 'Transport' },
      { date: '2026-03-25', description: 'Tech Solutions Ltd Monthly Net Salary', amount: 2600.00, type: 'income', categoryName: 'Salary' },
      { date: '2026-04-01', description: 'Apartment Rent Residential Landlord', amount: 950.00, type: 'expense', categoryName: 'Bills' },
      { date: '2026-04-10', description: 'Trading 212 Monthly ISA Standing Order', amount: 350.00, type: 'expense', categoryName: 'Investments' },
      { date: '2026-04-15', description: 'Marks & Spencer Food & Groceries', amount: 82.40, type: 'expense', categoryName: 'Food' },
    ],
    aiInsight: 'Excellent saving rate (33.6%). Your index fund portfolio has appreciated by +24.15% (£2,850 gain). Fixed living costs are stable at ~£1,173/month leaving high discretionary headroom to expand your tax-free ISA.',
  },
};

/**
 * Parse an uploaded statement (PDF, image, CSV, text) using Gemini 3.8 Flash,
 * with fallback to local parsing or presets.
 */
export async function parseStatementWithAI(params: {
  fileBase64?: string;
  mimeType?: string;
  fileName?: string;
  rawText?: string;
  preset?: string;
}): Promise<StatementUploadResult> {
  const { fileBase64, mimeType, rawText, preset } = params;

  // If a preset was selected, return immediately
  if (preset && PRESET_STATEMENTS[preset]) {
    return PRESET_STATEMENTS[preset];
  }

  // If Gemini API key is available, attempt multimodal / text extraction
  if (process.env.GEMINI_API_KEY && (fileBase64 || rawText)) {
    try {
      const prompt = `You are a financial parsing expert. The user has uploaded a bank statement, credit card bill, investment portfolio export, or student finance maintenance grant document (covering the past 6 to 12 months, or recent period).

Analyze the document with high accuracy. The user may be a university student (with Student Finance loans, maintenance grants, accommodation fees, part-time jobs) or an investor (with stocks, ETFs, crypto, ISAs) or a working professional.

Extract and return a strict JSON object with this exact structure:
{
  "institution": "Name of bank or broker (e.g. Monzo, Barclays, Student Finance England, Trading 212, Vanguard)",
  "accountType": "one of: 'student_finance' | 'student_current' | 'checking' | 'investment_portfolio' | 'mixed'",
  "period": "Estimated date range found (e.g. 'Nov 2025 - Apr 2026')",
  "currency": "GBP or detected currency code",
  "totalIncomeDetected": number (sum of credits/deposits),
  "totalExpensesDetected": number (sum of debits/payments),
  "netCashFlow": number (income - expense),
  "cashBalanceEstimate": number (final balance or estimated remaining funds),
  "studentFinance": {
    "isStudent": boolean,
    "maintenanceLoanDetected": number,
    "nextDropEstimate": "Description or next term date if student finance is found",
    "termPacingPerDay": number (how much they can safely spend daily until next loan drop),
    "statusNotes": "Summary of student grants, bursaries, or accommodation deductions"
  },
  "portfolio": {
    "totalValue": number,
    "totalInvested": number,
    "unrealizedGainLoss": number,
    "unrealizedGainLossPercentage": number,
    "holdings": [
      {
        "symbol": "ticker or short code e.g. VUAG, AAPL, BTC",
        "name": "full asset name",
        "type": "one of: 'stock' | 'etf' | 'crypto' | 'isa' | 'index_fund' | 'savings'",
        "shares": number,
        "avgCost": number,
        "currentPrice": number,
        "value": number,
        "gainPercentage": number
      }
    ]
  },
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Clean merchant or item description",
      "amount": positive number,
      "type": "'income' or 'expense'",
      "categoryName": "one of: 'Food', 'Transport', 'Bills', 'Shopping', 'Healthcare', 'Education', 'Entertainment', 'Travel', 'Salary', 'Investments', 'Gifts & Other'"
    }
  ],
  "aiInsight": "2-3 insightful sentences summarizing where their money went, student finance status if applicable, portfolio health, and money-saving tip."
}

Ensure all extracted numbers are valid floats, dates are YYYY-MM-DD (estimate year if only month/day provided), and transactions are deduplicated. Return ONLY valid JSON.`;

      let contents: any;
      if (fileBase64 && mimeType) {
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: fileBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        };
      } else {
        contents = `${prompt}\n\nHere is the raw text / CSV data:\n\n${rawText}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You extract bank statements, student finance awards, and investment portfolios into strict JSON.',
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return parsed as StatementUploadResult;
      }
    } catch (err) {
      console.error('Error invoking Gemini for statement parsing, falling back to heuristic parser:', err);
    }
  }

  // Heuristic Fallback Parser for raw CSV / text
  if (rawText) {
    return parseTextHeuristic(rawText);
  }

  // Default to uni_student preset if nothing was provided
  return PRESET_STATEMENTS.uni_student;
}

/**
 * Heuristic parser for CSV or plain text statements
 */
function parseTextHeuristic(text: string): StatementUploadResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const txs: StatementTransaction[] = [];
  let totalIncome = 0;
  let totalExpense = 0;
  let isStudent = false;

  for (const line of lines) {
    // Check if line resembles CSV: date, description, amount
    const parts = line.split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length >= 2) {
      const lineLower = line.toLowerCase();
      if (lineLower.includes('student') || lineLower.includes('loan') || lineLower.includes('tuition')) {
        isStudent = true;
      }

      // Look for a number
      let amount = 0;
      let date = new Date().toISOString().slice(0, 10);
      let desc = '';

      for (const p of parts) {
        const cleaned = p.replace(/[£$€,\s]/g, '');
        if (!isNaN(Number(cleaned)) && cleaned.length > 0 && Math.abs(Number(cleaned)) > 0.05) {
          amount = Math.abs(Number(cleaned));
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(p) || /^\d{2}\/\d{2}\/\d{4}$/.test(p)) {
          date = p.includes('/') ? p.split('/').reverse().join('-') : p;
        } else if (p.length > 2 && !desc) {
          desc = p;
        }
      }

      if (amount > 0 && desc) {
        const isInc = lineLower.includes('credit') || lineLower.includes('deposit') || lineLower.includes('salary') || lineLower.includes('grant') || lineLower.includes('loan');
        const type = isInc ? 'income' : 'expense';
        
        let categoryName = 'Bills';
        if (type === 'income') {
          categoryName = 'Salary';
        } else if (lineLower.includes('food') || lineLower.includes('tesco') || lineLower.includes('sainsbury') || lineLower.includes('uber') || lineLower.includes('deliveroo')) {
          categoryName = 'Food';
        } else if (lineLower.includes('bus') || lineLower.includes('train') || lineLower.includes('rail') || lineLower.includes('metro')) {
          categoryName = 'Transport';
        } else if (lineLower.includes('uni') || lineLower.includes('book') || lineLower.includes('tuition') || lineLower.includes('course')) {
          categoryName = 'Education';
        } else if (lineLower.includes('invest') || lineLower.includes('vanguard') || lineLower.includes('trading')) {
          categoryName = 'Investments';
        }

        if (type === 'income') totalIncome += amount;
        else totalExpense += amount;

        txs.push({
          date,
          description: desc,
          amount,
          type,
          categoryName,
        });
      }
    }
  }

  return {
    institution: isStudent ? 'Student Finance & Campus Bank' : 'Primary Bank Account',
    accountType: isStudent ? 'student_current' : 'checking',
    period: 'Recent Statements',
    currency: 'GBP',
    totalIncomeDetected: Number(totalIncome.toFixed(2)),
    totalExpensesDetected: Number(totalExpense.toFixed(2)),
    netCashFlow: Number((totalIncome - totalExpense).toFixed(2)),
    cashBalanceEstimate: Math.max(0, Number((totalIncome - totalExpense).toFixed(2))),
    studentFinance: {
      isStudent,
      maintenanceLoanDetected: isStudent ? totalIncome : 0,
      nextDropEstimate: isStudent ? 'Next term scheduled installment' : undefined,
      termPacingPerDay: isStudent ? 22.00 : undefined,
      statusNotes: isStudent ? 'Student income detected in statement deposits.' : 'Standard personal account.',
    },
    portfolio: {
      totalValue: 0,
      totalInvested: 0,
      unrealizedGainLoss: 0,
      unrealizedGainLossPercentage: 0,
      holdings: [],
    },
    transactions: txs.slice(0, 50),
    aiInsight: `Processed ${txs.length} transactions from statement records. Total income detected: £${totalIncome.toFixed(2)}, total expenditure: £${totalExpense.toFixed(2)}.`,
  };
}

/**
 * Predict next month's salary/income, total expenditure, and calculate how much can be spent and set aside.
 */
export async function predictForecastWithAI(params: {
  transactions: any[];
  userProfile?: any;
  statementContext?: StatementUploadResult;
  studentMode?: boolean;
}): Promise<ForecastPrediction> {
  const { transactions, statementContext, studentMode } = params;

  // Next target month
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const targetMonthStr = nextMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Compute baseline metrics from existing transactions
  let totalIncomePast = 0;
  let totalExpensePast = 0;
  const expenseByCategory: Record<string, number> = {};
  const incomeSourcesMap: Record<string, number> = {};

  transactions.forEach((tx) => {
    const amt = Number(tx.amount || 0);
    if (tx.type === 'income') {
      totalIncomePast += amt;
      const key = tx.description || 'Income';
      incomeSourcesMap[key] = (incomeSourcesMap[key] || 0) + amt;
    } else {
      totalExpensePast += amt;
      const cat = tx.categoryName || 'Other';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amt;
    }
  });

  // Calculate monthly average (approx over 3-6 months or at least 1 month)
  const monthCount = Math.max(1, new Set(transactions.map((t) => (t.date || '').slice(0, 7))).size);
  const avgMonthlyIncome = transactions.length > 0 ? totalIncomePast / monthCount : (statementContext?.totalIncomeDetected || 2200);
  const avgMonthlyExpense = transactions.length > 0 ? totalExpensePast / monthCount : (statementContext?.totalExpensesDetected || 1600);

  // If Gemini API is available, generate an intelligent, grounded forecast
  if (process.env.GEMINI_API_KEY) {
    try {
      const summaryPayload = {
        transactionCount: transactions.length,
        avgMonthlyIncome,
        avgMonthlyExpense,
        topExpenses: Object.entries(expenseByCategory).slice(0, 8),
        incomeSources: Object.entries(incomeSourcesMap).slice(0, 5),
        statementContext: statementContext
          ? {
              institution: statementContext.institution,
              accountType: statementContext.accountType,
              studentFinance: statementContext.studentFinance,
              portfolio: statementContext.portfolio,
            }
          : null,
        isStudent: studentMode || statementContext?.studentFinance?.isStudent || false,
        targetMonth: targetMonthStr,
      };

      const prompt = `You are an elite personal finance and forecasting engine.
Based on the following financial history and uploaded statement data:
${JSON.stringify(summaryPayload, null, 2)}

Provide a forward-looking financial forecast for the upcoming month: "${targetMonthStr}".
Crucial requirements from user:
1. Predict their salary / income for next month (e.g. regular wage or Student Finance installment if they are a uni student).
2. Estimate total expenditures for next month, breaking down essentials (rent, bills, groceries) vs variable expenses.
3. Determine precisely how much they can safely spend (discretionary spending per day and per week) so they don't overspend or go into overdraft.
4. Determine how much they should "set aside" (into emergency savings or investment portfolios/ISAs).
5. If they are a university student or receive student finance, calculate their safe daily burn rate until their next student finance drop and offer realistic uni student survival tips.
6. If they have investment portfolios (stocks, crypto, ISA), give an actionable outlook on their holdings and monthly dividend/growth expectations.

Respond with strict JSON matching this structure:
{
  "targetMonth": "${targetMonthStr}",
  "predictedIncome": number,
  "incomeConfidence": "'High' | 'Moderate' | 'Variable'",
  "incomeSources": [
    {
      "name": "e.g. Student Finance Loan Installment, Tech Salary, Campus Job",
      "amount": number,
      "expectedDate": "e.g. 5th of ${targetMonthStr}",
      "category": "Salary",
      "isGuaranteed": boolean
    }
  ],
  "estimatedExpenses": number,
  "expenseCategories": [
    {
      "category": "e.g. Bills / Accommodation, Food & Groceries, Transport, Entertainment",
      "amount": number,
      "isFixed": boolean,
      "trendNote": "e.g. Stable monthly recurring expense"
    }
  ],
  "projectedNetCashFlow": number (predictedIncome - estimatedExpenses),
  "safeToSpend": {
    "monthlyDiscretionary": number,
    "weeklyBudget": number,
    "dailyBudget": number
  },
  "recommendedSetAside": {
    "totalAmount": number,
    "emergencyReserve": number,
    "investmentsOrSavings": number,
    "strategyAdvice": "Practical rationale on why to set this amount aside"
  },
  "studentFinancePlan": {
    "daysUntilNextLoanDrop": number,
    "nextExpectedDisbursement": number,
    "safeDailyBurnRate": number,
    "hallRentCoverage": "Explanation of whether maintenance loan covers rent",
    "studentTips": ["tip 1", "tip 2", "tip 3"]
  },
  "investmentOutlook": {
    "totalHoldingsValue": number,
    "projectedMonthlyDividendYield": number,
    "projectedAnnualGrowth": number,
    "diversificationScore": "e.g. Strong / Balanced / High Beta",
    "allocationAdvice": "e.g. Dollar-cost average into diversified broad index fund"
  },
  "aiActionItems": [
    "3-4 prioritized action items for the upcoming month"
  ],
  "aiSummary": "2-3 supportive, empowering sentences summarizing their money trajectory next month."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are a warm, highly analytical personal finance forecaster for students, retail investors, and workers.',
        },
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text.trim()) as ForecastPrediction;
      }
    } catch (err) {
      console.error('Error invoking Gemini for forecast prediction:', err);
    }
  }

  // Heuristic rule-based fallback predictor
  const predictedInc = Number((avgMonthlyIncome > 0 ? avgMonthlyIncome : 2100).toFixed(2));
  const estimatedExp = Number((avgMonthlyExpense > 0 ? avgMonthlyExpense : 1550).toFixed(2));
  const netCash = Number((predictedInc - estimatedExp).toFixed(2));
  const setAside = Math.max(50, Number((Math.max(0, netCash) * 0.6).toFixed(2)));
  const discretionary = Math.max(100, Number((Math.max(0, netCash) - setAside).toFixed(2)));

  return {
    targetMonth: targetMonthStr,
    predictedIncome: predictedInc,
    incomeConfidence: studentMode ? 'Moderate' : 'High',
    incomeSources: [
      {
        name: studentMode ? 'Student Finance & Part-time Wages' : 'Primary Salary / Earnings',
        amount: predictedInc,
        expectedDate: `1st-5th of ${targetMonthStr}`,
        category: 'Salary',
        isGuaranteed: !studentMode,
      },
    ],
    estimatedExpenses: estimatedExp,
    expenseCategories: [
      { category: 'Accommodation & Bills', amount: Number((estimatedExp * 0.55).toFixed(2)), isFixed: true, trendNote: 'Primary housing commitment' },
      { category: 'Food & Groceries', amount: Number((estimatedExp * 0.25).toFixed(2)), isFixed: false, trendNote: 'Supermarkets & daily meals' },
      { category: 'Transport & Commute', amount: Number((estimatedExp * 0.10).toFixed(2)), isFixed: true, trendNote: 'Rail & local travel' },
      { category: 'Discretionary / Social', amount: Number((estimatedExp * 0.10).toFixed(2)), isFixed: false, trendNote: 'Flexible leisure' },
    ],
    projectedNetCashFlow: netCash,
    safeToSpend: {
      monthlyDiscretionary: discretionary,
      weeklyBudget: Number((discretionary / 4.3).toFixed(2)),
      dailyBudget: Number((discretionary / 30).toFixed(2)),
    },
    recommendedSetAside: {
      totalAmount: setAside,
      emergencyReserve: Number((setAside * 0.5).toFixed(2)),
      investmentsOrSavings: Number((setAside * 0.5).toFixed(2)),
      strategyAdvice: 'Build a 3-month living expense buffer first, then allocate remaining surplus to a tax-free ISA or index fund.',
    },
    studentFinancePlan: studentMode
      ? {
          daysUntilNextLoanDrop: 120,
          nextExpectedDisbursement: 3450,
          safeDailyBurnRate: 18.50,
          hallRentCoverage: 'Loan installment covers 85% of term accommodation with £520 surplus for textbooks and groceries.',
          studentTips: [
            'Cook batch meals with flatmates to keep daily food spend under £6/day.',
            'Activate your 16-25 Railcard discount on your Oyster card for 34% off off-peak tube travel.',
            'Always verify student discounts via UNiDAYS or Student Beans before buying gear or subscriptions.',
          ],
        }
      : undefined,
    investmentOutlook: statementContext?.portfolio?.totalValue
      ? {
          totalHoldingsValue: statementContext.portfolio.totalValue,
          projectedMonthlyDividendYield: Number((statementContext.portfolio.totalValue * 0.002).toFixed(2)),
          projectedAnnualGrowth: 8.5,
          diversificationScore: 'Balanced Index Allocation',
          allocationAdvice: 'Automate a fixed monthly transfer into low-cost global equity index funds.',
        }
      : undefined,
    aiActionItems: [
      `Lock in £${setAside} into your savings or investment pot on payday before spending.`,
      `Keep your daily flexible spending capped at £${(discretionary / 30).toFixed(2)}/day to stay within budget.`,
      `Review recurring monthly subscriptions to trim £25-£40 of inactive services.`,
    ],
    aiSummary: `Your forecast for ${targetMonthStr} anticipates £${predictedInc} in incoming cash flow against £${estimatedExp} in living expenses. By setting aside £${setAside}, you can comfortably enjoy £${(discretionary / 4.3).toFixed(2)}/week in guilt-free spending!`,
  };
}
