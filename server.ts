import cors from 'cors';
import express from 'express';
import path from 'path';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { seedDefaultCategories } from './src/db/seed.ts';
import { db } from './src/db/index.ts';
import { users, categories, transactions, budgets } from './src/db/schema.ts';
import { eq, and, desc, isNull, or, sql } from 'drizzle-orm';
import { parseStatementWithAI, predictForecastWithAI, PRESET_STATEMENTS } from './src/lib/aiFinancialService.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(cors({
    origin: [
      'https://cpint2410.github.io',
      'http://localhost:5173'
   ]
  }));

  // Middleware with expanded limit for document/PDF statement uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Seed default categories on startup
  await seedDefaultCategories();

  // Helper to fetch the database user ID corresponding to the Firebase Auth UID
  async function getDbUser(uid: string) {
    const result = await db.select().from(users).where(eq(users.uid, uid));
    if (result.length === 0) {
      throw new Error('User profile not synchronized in database.');
    }
    return result[0];
  }

  // --- API ROUTES ---

  // 1. Sync User Profile (called upon login / frontend init)
  app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const firebaseUser = req.user!;
      const email = firebaseUser.email || '';
      const name = firebaseUser.name || '';
      const uid = firebaseUser.uid;

      const dbUser = await getOrCreateUser(uid, email, name);
      res.json({ success: true, user: dbUser });
    } catch (error: any) {
      console.error('Error in /api/users/sync:', error);
      res.status(500).json({ error: error.message || 'Failed to synchronize user.' });
    }
  });

  // Get current DB user profile
  app.get('/api/users/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      res.json({ success: true, user: dbUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Edit current DB user profile (e.g. change name)
  app.put('/api/users/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const { name } = req.body;
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required.' });
      }

      const updated = await db.update(users)
        .set({ name: name.trim() })
        .where(eq(users.id, dbUser.id))
        .returning();

      res.json({ success: true, user: updated[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Categories CRUD
  // Get categories (system defaults + user specific)
  app.get('/api/categories', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      
      const allCategories = await db.select()
        .from(categories)
        .where(
          or(
            isNull(categories.userId),
            eq(categories.userId, dbUser.id)
          )
        );

      res.json({ success: true, categories: allCategories });
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories.' });
    }
  });

  // Create custom category
  app.post('/api/categories', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const { name, type, color } = req.body;

      if (!name || !type || !color) {
        return res.status(400).json({ error: 'Name, type, and color are required.' });
      }

      if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ error: 'Type must be either "income" or "expense".' });
      }

      const result = await db.insert(categories)
        .values({
          name: name.trim(),
          type,
          color,
          userId: dbUser.id,
        })
        .returning();

      res.json({ success: true, category: result[0] });
    } catch (error: any) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category.' });
    }
  });

  // 3. Transactions CRUD
  // Get all transactions for current user with optional filters
  app.get('/api/transactions', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const { categoryId, type, search, startDate, endDate, sortBy } = req.query;

      // Start building query
      let conditions = [eq(transactions.userId, dbUser.id)];

      if (categoryId) {
        conditions.push(eq(transactions.categoryId, parseInt(categoryId as string, 10)));
      }
      if (type) {
        conditions.push(eq(transactions.type, type as 'income' | 'expense'));
      }
      if (startDate) {
        conditions.push(sql`${transactions.date} >= ${startDate as string}`);
      }
      if (endDate) {
        conditions.push(sql`${transactions.date} <= ${endDate as string}`);
      }
      if (search) {
        conditions.push(sql`LOWER(${transactions.description}) LIKE ${'%' + (search as string).toLowerCase() + '%'}`);
      }

      let orderClause = desc(transactions.date);
      if (sortBy === 'amount_desc') {
        orderClause = desc(transactions.amount);
      } else if (sortBy === 'amount_asc') {
        orderClause = sql`${transactions.amount} ASC`;
      } else if (sortBy === 'date_asc') {
        orderClause = sql`${transactions.date} ASC`;
      }

      const txList = await db.select({
        id: transactions.id,
        amount: transactions.amount,
        currency: transactions.currency,
        description: transactions.description,
        date: transactions.date,
        type: transactions.type,
        createdAt: transactions.createdAt,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(orderClause);

      res.json({ success: true, transactions: txList });
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions.' });
    }
  });

  // Create Transaction
  app.post('/api/transactions', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const { amount, currency = 'GBP', description, date, categoryId, type } = req.body;

      if (amount === undefined || amount === null || !description || !date || !categoryId || !type) {
        return res.status(400).json({ error: 'All fields (amount, description, date, categoryId, type) are required.' });
      }

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number.' });
      }

      // Check category exists and is valid
      const catCheck = await db.select().from(categories).where(eq(categories.id, categoryId));
      if (catCheck.length === 0) {
        return res.status(400).json({ error: 'Selected category does not exist.' });
      }

      const result = await db.insert(transactions)
        .values({
          userId: dbUser.id,
          categoryId,
          amount: parseFloat(amount),
          currency,
          description: description.trim(),
          date,
          type,
        })
        .returning();

      // Return the transaction with categories included
      const fullTx = {
        ...result[0],
        categoryName: catCheck[0].name,
        categoryColor: catCheck[0].color,
      };

      res.json({ success: true, transaction: fullTx });
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to record transaction.' });
    }
  });

  // Update Transaction
  app.put('/api/transactions/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const txId = parseInt(req.params.id, 10);
      const { amount, currency = 'GBP', description, date, categoryId, type } = req.body;

      // Verify ownership
      const txCheck = await db.select().from(transactions).where(and(eq(transactions.id, txId), eq(transactions.userId, dbUser.id)));
      if (txCheck.length === 0) {
        return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
      }

      if (amount === undefined || amount === null || !description || !date || !categoryId || !type) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number.' });
      }

      const catCheck = await db.select().from(categories).where(eq(categories.id, categoryId));
      if (catCheck.length === 0) {
        return res.status(400).json({ error: 'Selected category does not exist.' });
      }

      const result = await db.update(transactions)
        .set({
          categoryId,
          amount: parseFloat(amount),
          description: description.trim(),
          currency,
          date,
          type,
        })
        .where(eq(transactions.id, txId))
        .returning();

      const fullTx = {
        ...result[0],
        categoryName: catCheck[0].name,
        categoryColor: catCheck[0].color,
      };

      res.json({ success: true, transaction: fullTx });
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Failed to update transaction.' });
    }
  });

  // Delete Transaction
  app.delete('/api/transactions/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const txId = parseInt(req.params.id, 10);

      // Verify ownership
      const txCheck = await db.select().from(transactions).where(and(eq(transactions.id, txId), eq(transactions.userId, dbUser.id)));
      if (txCheck.length === 0) {
        return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
      }

      await db.delete(transactions).where(eq(transactions.id, txId));
      res.json({ success: true, message: 'Transaction deleted successfully.' });
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Failed to delete transaction.' });
    }
  });

  // 4. Budgets CRUD
  // Get monthly budgets for current user, calculating how much has been spent so far in that month
  app.get('/api/budgets', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const { month } = req.query; // YYYY-MM
      
      const targetMonth = month ? (month as string) : new Date().toISOString().slice(0, 7);

      // Get all budgets for target month
      const userBudgets = await db.select({
        id: budgets.id,
        categoryId: budgets.categoryId,
        limitAmount: budgets.limitAmount,
        month: budgets.month,
        categoryName: categories.name,
        categoryColor: categories.color,
      })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
      .where(and(eq(budgets.userId, dbUser.id), eq(budgets.month, targetMonth)));

      // Calculate spending per category for this month
      // Format of date in transactions table is YYYY-MM-DD, so we can filter by transactions starting with targetMonth
      const monthExpenses = await db.select({
        categoryId: transactions.categoryId,
        totalSpent: sql<number>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, dbUser.id),
          eq(transactions.type, 'expense'),
          sql`SUBSTRING(${transactions.date} FROM 1 FOR 7) = ${targetMonth}`
        )
      )
      .groupBy(transactions.categoryId);

      // Build spent map
      const spentMap: Record<number, number> = {};
      monthExpenses.forEach(exp => {
        spentMap[exp.categoryId] = Number(exp.totalSpent || 0);
      });

      // Combine budget with spending
      const budgetsWithSpent = userBudgets.map(b => ({
        ...b,
        spent: spentMap[b.categoryId] || 0,
        percentage: b.limitAmount > 0 ? Math.round(((spentMap[b.categoryId] || 0) / b.limitAmount) * 100) : 0,
      }));

      res.json({ success: true, budgets: budgetsWithSpent, targetMonth });
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
      res.status(500).json({ error: 'Failed to fetch budgets.' });
    }
  });

  // Add or Update Budget (Upsert)
  app.post('/api/budgets', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const { categoryId, limitAmount, month } = req.body;

      if (!categoryId || limitAmount === undefined || limitAmount === null || !month) {
        return res.status(400).json({ error: 'Category, limit amount, and month are required.' });
      }

      const limit = parseFloat(limitAmount);
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ error: 'Budget limit must be a positive number.' });
      }

      // Check category
      const catCheck = await db.select().from(categories).where(eq(categories.id, categoryId));
      if (catCheck.length === 0) {
        return res.status(400).json({ error: 'Category does not exist.' });
      }

      // Check if budget already exists for this category + month
      const existing = await db.select().from(budgets).where(
        and(
          eq(budgets.userId, dbUser.id),
          eq(budgets.categoryId, categoryId),
          eq(budgets.month, month)
        )
      );

      let result;
      if (existing.length > 0) {
        // Update existing budget
        result = await db.update(budgets)
          .set({ limitAmount: limit })
          .where(eq(budgets.id, existing[0].id))
          .returning();
      } else {
        // Insert new budget
        result = await db.insert(budgets)
          .values({
            userId: dbUser.id,
            categoryId,
            limitAmount: limit,
            month,
          })
          .returning();
      }

      res.json({ success: true, budget: result[0] });
    } catch (error: any) {
      console.error('Error adding/updating budget:', error);
      res.status(500).json({ error: 'Failed to record budget.' });
    }
  });

  // Delete Budget
  app.delete('/api/budgets/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const budgetId = parseInt(req.params.id, 10);

      const budgetCheck = await db.select().from(budgets).where(and(eq(budgets.id, budgetId), eq(budgets.userId, dbUser.id)));
      if (budgetCheck.length === 0) {
        return res.status(404).json({ error: 'Budget not found or unauthorized.' });
      }

      await db.delete(budgets).where(eq(budgets.id, budgetId));
      res.json({ success: true, message: 'Budget deleted successfully.' });
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      res.status(500).json({ error: 'Failed to delete budget.' });
    }
  });

  // 5. Statistics Summaries
  // Overview metrics (Total Income, Total Expenses, Remaining Balance, Active budgets warning count)
  app.get('/api/stats/summary', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const { month } = req.query; // YYYY-MM
      
      const targetMonth = month ? (month as string) : new Date().toISOString().slice(0, 7);

      // Get all transactions for user
      const allTx = await db.select().from(transactions).where(eq(transactions.userId, dbUser.id));

      let totalIncome = 0;
      let totalExpense = 0;
      let monthlyIncome = 0;
      let monthlyExpense = 0;

      allTx.forEach(tx => {
        const val = Number(tx.amount || 0);
        if (tx.type === 'income') {
          totalIncome += val;
          if (tx.date.startsWith(targetMonth)) {
            monthlyIncome += val;
          }
        } else if (tx.type === 'expense') {
          totalExpense += val;
          if (tx.date.startsWith(targetMonth)) {
            monthlyExpense += val;
          }
        }
      });

      // Get user budgets and their warning status
      const userBudgets = await db.select().from(budgets).where(and(eq(budgets.userId, dbUser.id), eq(budgets.month, targetMonth)));
      
      // Calculate spent per category
      const monthExpenses = await db.select({
        categoryId: transactions.categoryId,
        totalSpent: sql<number>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, dbUser.id),
          eq(transactions.type, 'expense'),
          sql`SUBSTRING(${transactions.date} FROM 1 FOR 7) = ${targetMonth}`
        )
      )
      .groupBy(transactions.categoryId);

      const spentMap: Record<number, number> = {};
      monthExpenses.forEach(exp => {
        spentMap[exp.categoryId] = Number(exp.totalSpent || 0);
      });

      let exceededBudgetsCount = 0;
      userBudgets.forEach(b => {
        const spent = spentMap[b.categoryId] || 0;
        if (spent > b.limitAmount) {
          exceededBudgetsCount++;
        }
      });

      res.json({
        success: true,
        summary: {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          monthlyIncome,
          monthlyExpense,
          monthlyBalance: monthlyIncome - monthlyExpense,
          exceededBudgetsCount,
          activeBudgetsCount: userBudgets.length,
        }
      });
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
    }
  });

  // Spendings by category (e.g. for Pie Chart)
  app.get('/api/stats/category-summary', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const { month, type } = req.query; // YYYY-MM
      
      const targetMonth = month ? (month as string) : new Date().toISOString().slice(0, 7);
      const filterType = type ? (type as 'income' | 'expense') : 'expense';

      const results = await db.select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        value: sql<number>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, dbUser.id),
          eq(transactions.type, filterType),
          sql`SUBSTRING(${transactions.date} FROM 1 FOR 7) = ${targetMonth}`
        )
      )
      .groupBy(transactions.categoryId, categories.name, categories.color);

      res.json({
        success: true,
        data: results.map(r => ({
          name: r.categoryName,
          value: Number(r.value || 0),
          color: r.categoryColor,
          categoryId: r.categoryId,
        }))
      });
    } catch (error: any) {
      console.error('Error calculating category summary:', error);
      res.status(500).json({ error: 'Failed to load category summaries.' });
    }
  });

  // Monthly income vs expense history (e.g. for Bar / Line charts)
  app.get('/api/stats/monthly-history', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);

      // Group transactions by month (YYYY-MM) and transaction type
      const results = await db.select({
        month: sql<string>`SUBSTRING(${transactions.date} FROM 1 FOR 7)`,
        type: transactions.type,
        total: sql<number>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .where(eq(transactions.userId, dbUser.id))
      .groupBy(sql`SUBSTRING(${transactions.date} FROM 1 FOR 7)`, transactions.type)
      .orderBy(sql`SUBSTRING(${transactions.date} FROM 1 FOR 7) ASC`);

      // Transform array into grouped object by month: { '2026-05': { income: 500, expense: 200 } }
      const historyMap: Record<string, { month: string; income: number; expense: number; savings: number }> = {};
      
      results.forEach(r => {
        const m = r.month;
        if (!historyMap[m]) {
          historyMap[m] = { month: m, income: 0, expense: 0, savings: 0 };
        }
        if (r.type === 'income') {
          historyMap[m].income = Number(r.total || 0);
        } else {
          historyMap[m].expense = Number(r.total || 0);
        }
        historyMap[m].savings = historyMap[m].income - historyMap[m].expense;
      });

      // Sort and take last 12 months
      const list = Object.values(historyMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);

      res.json({ success: true, history: list });
    } catch (error: any) {
      console.error('Error calculating monthly history:', error);
      res.status(500).json({ error: 'Failed to load historical analytics.' });
    }
  });

  // 6. Batch Import Transactions (e.g. from parsed statement)
  app.post('/api/transactions/batch-import', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const { transactions: rawList } = req.body;

      if (!Array.isArray(rawList) || rawList.length === 0) {
        return res.status(400).json({ error: 'No transactions provided for import.' });
      }

      // Fetch all existing categories for this user + system defaults
      const existingCategories = await db.select().from(categories).where(
        or(isNull(categories.userId), eq(categories.userId, dbUser.id))
      );

      const categoryMap = new Map<string, number>();
      existingCategories.forEach((c) => {
        categoryMap.set(c.name.toLowerCase(), c.id);
      });

      let defaultExpenseCatId = existingCategories.find((c) => c.type === 'expense')?.id || 1;
      let defaultIncomeCatId = existingCategories.find((c) => c.type === 'income')?.id || 1;

      const toInsert: any[] = [];
      for (const item of rawList) {
        const amt = parseFloat(item.amount);
        if (isNaN(amt) || amt <= 0) continue;

        const txType: 'income' | 'expense' = item.type === 'income' ? 'income' : 'expense';
        const catName = (item.categoryName || (txType === 'income' ? 'Salary' : 'Bills')).trim();
        const catLower = catName.toLowerCase();

        let categoryId = categoryMap.get(catLower);
        if (!categoryId) {
          // Create custom category for the user
          const newCat = await db.insert(categories)
            .values({
              name: catName,
              type: txType,
              color: item.suggestedColor || (txType === 'income' ? '#22c55e' : '#6366f1'),
              userId: dbUser.id,
            })
            .returning();
          categoryId = newCat[0].id;
          categoryMap.set(catLower, categoryId);
        }

        toInsert.push({
          userId: dbUser.id,
          categoryId: categoryId || (txType === 'income' ? defaultIncomeCatId : defaultExpenseCatId),
          amount: amt,
          description: (item.description || 'Statement Record').trim(),
          date: item.date || new Date().toISOString().slice(0, 10),
          type: txType,
        });
      }

      if (toInsert.length > 0) {
        await db.insert(transactions).values(toInsert);
      }

      res.json({
        success: true,
        importedCount: toInsert.length,
        message: `Successfully imported ${toInsert.length} transactions into your records!`,
      });
    } catch (error: any) {
      console.error('Error in /api/transactions/batch-import:', error);
      res.status(500).json({ error: error.message || 'Failed to import statement transactions.' });
    }
  });

  // 7. AI Statement & Portfolio Parser Endpoint
  app.post('/api/ai/parse-statement', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { fileBase64, mimeType, fileName, rawText, preset } = req.body;
      const result = await parseStatementWithAI({
        fileBase64,
        mimeType,
        fileName,
        rawText,
        preset,
      });

      res.json({ success: true, result });
    } catch (error: any) {
      console.error('Error in /api/ai/parse-statement:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze statement.' });
    }
  });

  // 8. AI Next-Month Predictor & Financial Forecaster
  app.post('/api/ai/predict-forecast', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getDbUser(req.user!.uid);
      const { statementContext, studentMode } = req.body;

      // Fetch user's historical transactions from database (up to 200 recent)
      const userTxs = await db.select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        type: transactions.type,
        categoryName: categories.name,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, dbUser.id))
      .orderBy(desc(transactions.date))
      .limit(200);

      const prediction = await predictForecastWithAI({
        transactions: userTxs,
        userProfile: dbUser,
        statementContext,
        studentMode: Boolean(studentMode),
      });

      res.json({ success: true, prediction });
    } catch (error: any) {
      console.error('Error in /api/ai/predict-forecast:', error);
      res.status(500).json({ error: error.message || 'Failed to generate financial prediction.' });
    }
  });

  // 9. Presets listing
  app.get('/api/ai/presets', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const presets = Object.keys(PRESET_STATEMENTS).map((key) => {
        const item = PRESET_STATEMENTS[key];
        return {
          id: key,
          institution: item.institution,
          accountType: item.accountType,
          period: item.period,
          totalIncome: item.totalIncomeDetected,
          totalExpense: item.totalExpensesDetected,
          transactionCount: item.transactions.length,
          hasStudentFinance: Boolean(item.studentFinance?.isStudent),
          portfolioValue: item.portfolio?.totalValue || 0,
        };
      });
      res.json({ success: true, presets });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // --- VITE DEV / PRODUCTION MIDDLEWARE ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
