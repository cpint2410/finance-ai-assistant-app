import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Budget, Category } from '../types.ts';
import { 
  PiggyBank, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BudgetsProps {
  onNotify: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Budgets: React.FC<BudgetsProps> = ({ onNotify }) => {
  const { token } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Month selector (defaults to current month: YYYY-MM)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  // Add/Edit Budget Form State
  const [showModal, setShowModal] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete budget state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchBudgets = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/budgets?month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBudgets(data.budgets);
      }
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Only select expense categories
        const expenseCategories = data.categories.filter((c: Category) => c.type === 'expense');
        setCategories(expenseCategories);
        if (expenseCategories.length > 0) {
          setCategoryId(expenseCategories[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [token, month]);

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setFormError(null);
    const amountNum = parseFloat(limitAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Please enter a valid positive budget limit.');
      return;
    }
    if (!categoryId) {
      setFormError('Please select an expense category.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: parseInt(categoryId, 10),
          limitAmount: amountNum,
          month,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to set budget.');
      }

      if (json.success) {
        onNotify('Budget limit updated successfully!', 'success');
        setLimitAmount('');
        setShowModal(false);
        fetchBudgets();
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!token || !deleteId) return;
    try {
      const response = await fetch(`/api/budgets/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await response.json();
      if (response.ok && json.success) {
        onNotify('Budget plan deleted.', 'success');
        setDeleteId(null);
        fetchBudgets();
      } else {
        onNotify(json.error || 'Failed to delete budget.', 'error');
      }
    } catch (err) {
      onNotify('An error occurred.', 'error');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(val);
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Budget Planner
          </h2>
          <p className="text-sm text-gray-400">
            Establish category limits and track monthly progress dynamically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month picker selection */}
          <div className="relative">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#262626] bg-[#111111] text-xs font-semibold text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setFormError(null);
              setLimitAmount('');
              if (categories.length > 0) setCategoryId(categories[0].id.toString());
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* BUDGET PROGRESS METRICS */}
      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-xs font-medium font-display">Mapping out budget forecasts...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="py-20 text-center bg-[#111111] rounded-2xl border border-[#262626] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto text-gray-500">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-gray-400">No budgets established for {month}</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Setting budget targets is one of the strongest methods to control outflow. Tap 'Set Budget' above to establish your limits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const isExceeded = budget.spent > budget.limitAmount;
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#111111] p-6 rounded-2xl border flex flex-col justify-between space-y-5 transition-all ${
                  isExceeded 
                    ? 'border-rose-500/30 bg-rose-500/5' 
                    : 'border-[#262626]'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${budget.categoryColor}15` }}
                    >
                      <PiggyBank className="w-5 h-5" style={{ color: budget.categoryColor }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {budget.categoryName} Budget
                      </h4>
                      <p className="text-xs text-gray-500 font-medium">
                        Target for {budget.month}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteId(budget.id)}
                    className="p-1.5 rounded-lg hover:bg-[#161616] text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete budget limit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Spent details */}
                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <div className="text-sm">
                      <span className="font-bold text-gray-200">{formatCurrency(budget.spent)}</span>
                      <span className="text-gray-500 font-medium text-xs"> / {formatCurrency(budget.limitAmount)}</span>
                    </div>
                    <span className={`text-xs font-bold font-mono ${isExceeded ? 'text-rose-400' : 'text-indigo-400'}`}>
                      {budget.percentage}%
                    </span>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-[#0A0A0A] overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isExceeded ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Exceeded indicator notice */}
                {isExceeded && (
                  <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-semibold text-rose-300">
                      You exceeded your {budget.categoryName} budget by {formatCurrency(budget.spent - budget.limitAmount)}!
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SET/UPDATE BUDGET DIALOG MODAL */}
      <AnimatePresence>
        {showModal && (
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
                  <h3 className="font-display font-bold text-white text-base">Plan Category Budget</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-[#161616] text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBudget} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium rounded-xl">
                    {formError}
                  </div>
                )}

                {/* Category Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expense Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-[#111111] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#111111] text-white">
                        {cat.name}
                      </option>
                    ))}
                    {categories.length === 0 && (
                      <option disabled value="" className="bg-[#111111] text-white">No custom expense categories found</option>
                    )}
                  </select>
                </div>

                {/* Limit amount */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Budget Limit (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={limitAmount}
                    onChange={(e) => setLimitAmount(e.target.value)}
                    placeholder="300.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-transparent text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                {/* Target Month Indicator */}
                <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Month target:</span>
                  <span className="text-xs font-bold text-gray-200 font-mono">{month}</span>
                </div>

                <p className="text-[10px] text-gray-500">
                  * Note: If a budget limit is already registered for this category and month, saving will update the budget with this new limit amount.
                </p>

                {/* Submit button */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#262626] text-gray-400 hover:bg-[#161616] text-sm font-semibold transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 text-center flex items-center justify-center"
                  >
                    {submitting ? 'Setting...' : 'Establish Limit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE BUDGET */}
      <AnimatePresence>
        {deleteId !== null && (
          <div className="fixed inset-0 bg-[#0A0A0A]/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#111111] rounded-2xl shadow-2xl border border-[#262626] p-6 space-y-6"
            >
              <div className="space-y-2 text-center">
                <h3 className="font-display font-bold text-white text-lg">Remove Budget Limit?</h3>
                <p className="text-xs text-gray-400">
                  Are you sure you want to remove this category budget plan? This will stop progress tracking for this month.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#262626] text-gray-400 hover:bg-[#161616] text-xs font-semibold transition-all cursor-pointer"
                >
                  Keep Target
                </button>
                <button
                  onClick={handleDeleteBudget}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Yes, Remove Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
