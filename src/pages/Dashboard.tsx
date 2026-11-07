import { apiFetch } from '../lib/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Transaction, Category, SummaryStats } from '../types.ts';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  AlertCircle, 
  PiggyBank, 
  Calendar,
  X,
  Sparkles,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  onAddTransactionSuccess: (message: string) => void;
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'budgets' | 'reports' | 'forecast' | 'profile') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddTransactionSuccess, setActiveTab }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySummary, setCategorySummary] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quick Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      
      // Fetch summary stats
      const statsRes = await apiFetch('/api/stats/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsJson = await statsRes.json();
      if (statsJson.success) setStats(statsJson.summary);

      // Fetch recent transactions (first 5)
      const txRes = await apiFetch('/api/transactions?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const txJson = await txRes.json();
      if (txJson.success) setTransactions(txJson.transactions.slice(0, 5));

      // Fetch categories
      const catRes = await apiFetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const catJson = await catRes.json();
      if (catJson.success) {
        setCategories(catJson.categories);
        if (catJson.categories.length > 0) {
          // Set initial quick add category
          const expenseCats = catJson.categories.filter((c: Category) => c.type === 'expense');
          if (expenseCats.length > 0) {
            setCategoryId(expenseCats[0].id.toString());
          } else {
            setCategoryId(catJson.categories[0].id.toString());
          }
        }
      }

      // Fetch category spending data
      const summaryRes = await apiFetch('/api/stats/category-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const summaryJson = await summaryRes.json();
      if (summaryJson.success) setCategorySummary(summaryJson.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Adjust quick add category dropdown based on selected transaction type
  useEffect(() => {
    if (categories.length > 0) {
      const filtered = categories.filter(c => c.type === type);
      if (filtered.length > 0) {
        setCategoryId(filtered[0].id.toString());
      } else {
        setCategoryId(categories[0].id.toString());
      }
    }
  }, [type, categories]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setFormError(null);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please enter a description.');
      return;
    }
    if (!categoryId) {
      setFormError('Please select a category.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiFetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description.trim(),
          date,
          categoryId: parseInt(categoryId, 10),
          type,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to add transaction.');
      }

      if (json.success) {
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().slice(0, 10));
        setShowAddForm(false);
        onAddTransactionSuccess('Quick transaction added successfully!');
        fetchData(); // reload stats, chart & list!
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(val);
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Gathering your financial workspace...</p>
      </div>
    );
  }

  // Calculate percentages
  const expensePercentage = stats && stats.monthlyIncome > 0 
    ? Math.min(Math.round((stats.monthlyExpense / stats.monthlyIncome) * 100), 100) 
    : 0;

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-sm text-gray-400">
            Welcome back to your real-time financial tracking summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData} 
            className="p-2.5 rounded-xl border border-[#262626] bg-[#111111] text-gray-400 hover:bg-[#161616] hover:text-white transition-all shrink-0 cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {/* AI Smart Forecast & Statement Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-[#111111] to-purple-950/30 p-5 md:p-6 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Statement Intelligence & Forecasting
            </span>
          </div>
          <h3 className="text-base font-display font-bold text-white tracking-tight">
            Have 6-Month Statements, Student Finance Grants, or Portfolios?
          </h3>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Upload your PDF/CSV statements or investment portfolios to see where your money is, predict your upcoming salary/loan drops, calculate your safe daily spend, and find out how much you can set aside!
          </p>
        </div>

        <button
          onClick={() => setActiveTab('forecast')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Launch AI Predictor</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Income Card */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#262626] flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-3.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Income</span>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold text-white tracking-tight">
                {formatCurrency(stats?.totalIncome || 0)}
              </h3>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>All-time accumulated</span>
              </p>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#262626] flex items-start justify-between relative overflow-hidden">
          <div className="space-y-3.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Expenses</span>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold text-white tracking-tight">
                {formatCurrency(stats?.totalExpense || 0)}
              </h3>
              <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>All-time spent</span>
              </p>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <ArrowDownLeft className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#262626] flex items-start justify-between relative overflow-hidden">
          <div className="space-y-3.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Remaining Balance</span>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold text-white tracking-tight">
                {formatCurrency(stats?.balance || 0)}
              </h3>
              <p className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" />
                <span>Available funds</span>
              </p>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Budget Goals Card */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#262626] flex items-start justify-between relative overflow-hidden">
          <div className="space-y-3.5 flex-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Budgets</span>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold text-white tracking-tight">
                {stats?.activeBudgetsCount || 0}
              </h3>
              {stats && stats.exceededBudgetsCount > 0 ? (
                <p className="text-xs text-rose-400 font-semibold flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{stats.exceededBudgetsCount} Exceeded Limits!</span>
                </p>
              ) : (
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>Within targets</span>
                </p>
              )}
            </div>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
            stats && stats.exceededBudgetsCount > 0 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-450' 
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Recent Transactions */}
        <div className="lg:col-span-7 bg-[#111111] p-6 rounded-2xl border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-[#262626]">
              <div>
                <h3 className="text-lg font-display font-bold text-white tracking-tight">
                  Recent Activity
                </h3>
                <p className="text-xs text-gray-500">
                  Your last 5 recorded transactions.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto text-gray-500">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-gray-400">No activity recorded</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Click 'Quick Add' on the top right to start tracking your daily income and spending!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#262626]">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-4 flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      {/* Color badge icon */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${tx.categoryColor}15`, border: `1px solid ${tx.categoryColor}25` }}
                      >
                        <span className="font-semibold text-xs uppercase" style={{ color: tx.categoryColor }}>
                          {tx.categoryName.slice(0, 2)}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span 
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: `${tx.categoryColor}15`, color: tx.categoryColor }}
                          >
                            {tx.categoryName}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {tx.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#262626] bg-[#161616] p-3.5 rounded-xl flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-gray-400 font-medium">Monthly Outflow Rate:</span>
            </div>
            <span className="text-xs font-bold text-indigo-400">
              {stats ? formatCurrency(stats.monthlyExpense) : 'Â£0.00'}
            </span>
          </div>
        </div>

        {/* Right Hand: Monthly Spend Categories Pie Chart */}
        <div className="lg:col-span-5 bg-[#111111] p-6 rounded-2xl border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="pb-5 border-b border-[#262626]">
              <h3 className="text-lg font-display font-bold text-white tracking-tight">
                Spending Structure
              </h3>
              <p className="text-xs text-gray-500">
                Breakdown of expenses this month.
              </p>
            </div>

            {categorySummary.length === 0 ? (
              <div className="py-16 text-center space-y-3 flex-grow flex flex-col justify-center">
                <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto text-gray-500">
                  <PieChart className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-gray-400">No expense logs</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Add some expense items to generate visual category distribution charts.
                </p>
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                {/* Pie Chart container */}
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySummary}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categorySummary.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: '1px solid #262626', 
                          backgroundColor: '#0D0D0D', 
                          color: '#fff',
                          fontSize: '12px' 
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Categories legends */}
                <div className="grid grid-cols-2 gap-3">
                  {categorySummary.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 px-1 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-gray-300 truncate max-w-[100px]">
                        {item.name}
                      </span>
                      <span className="ml-auto font-mono text-gray-400">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#262626] mt-6 text-center">
            <button 
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Analytics & Histograms</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* QUICK ADD OVERLAY MODAL */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-[#0A0A0A]/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#111111] rounded-2xl shadow-2xl border border-[#262626] overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                  <h3 className="font-display font-bold text-white text-base">Quick Record Transaction</h3>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 rounded-lg hover:bg-[#161616] text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuickAdd} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium rounded-xl">
                    {formError}
                  </div>
                )}

                {/* Tab selector for type */}
                <div className="grid grid-cols-2 gap-2 bg-[#0A0A0A] p-1.5 rounded-xl border border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      type === 'expense'
                        ? 'bg-[#1A1A1A] text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      type === 'income'
                        ? 'bg-[#1A1A1A] text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount (Â£)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-transparent text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Starbucks, Grocery store, Office..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-transparent text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-[#111111] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    {categories.filter(c => c.type === type).map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#111111] text-white">
                        {cat.name}
                      </option>
                    ))}
                    {categories.filter(c => c.type === type).length === 0 && (
                      <option disabled value="" className="bg-[#111111] text-white">No custom category added</option>
                    )}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-transparent text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#262626] text-gray-400 hover:bg-[#161616] text-sm font-semibold transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 text-center flex items-center justify-center"
                  >
                    {submitting ? 'Adding...' : 'Save Log'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

