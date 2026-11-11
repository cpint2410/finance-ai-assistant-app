import { apiFetch } from '../lib/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Transaction, Category } from '../types.ts';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Sparkles, 
  Calendar, 
  Check,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionsProps {
  onNotify: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ onNotify }) => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showFilters, setShowFilters] = useState(false);

  // Modals & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Transaction | null>(null);

  // Form Field State
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('GBP');

  const currencyOptions = [
    { code: 'GBP', name: 'British Pound', symbol: '\u00A3' },
    { code: 'USD', name: 'US Dollar', symbol: '\u0024' },
    { code: 'EUR', name: 'Euro', symbol: '\u20AC' },
    { code: 'INR', name: 'Indian Rupee', symbol: '\u20B9' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: '\u0024' },
    { code: 'AUD', name: 'Australian Dollar', symbol: '\u0024' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '\u00A5' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: '\u0024' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: '\u0024' },
  ];
  const [description, setDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Category Creation Form State
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');
  const [catColor, setCatColor] = useState('#6366f1'); // Indigo default
  const [catSubmitting, setCatSubmitting] = useState(false);

  const colorsPreset = [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#a855f7', // Purple
  ];

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (type) queryParams.append('type', type);
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (sortBy) queryParams.append('sortBy', sortBy);

      const response = await apiFetch(`/api/transactions?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const response = await apiFetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token, search, type, categoryId, startDate, endDate, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, [token]);

  // Handle open modal for creating
  const handleOpenAddModal = () => {
    setEditingTx(null);
    setAmount('');
    setCurrency('GBP');
    setDescription('');
    setFormType('expense');
    setDate(new Date().toISOString().slice(0, 10));
    setFormError(null);
    
    // Choose first expense category if available
    const expenseCats = categories.filter(c => c.type === 'expense');
    if (expenseCats.length > 0) {
      setFormCategoryId(expenseCats[0].id.toString());
    } else if (categories.length > 0) {
      setFormCategoryId(categories[0].id.toString());
    }
    
    setShowModal(true);
  };

  // Adjust Form Category when Type shifts
  useEffect(() => {
    if (categories.length > 0) {
      const filtered = categories.filter(c => c.type === formType);
      if (filtered.length > 0) {
        setFormCategoryId(filtered[0].id.toString());
      } else {
        setFormCategoryId(categories[0].id.toString());
      }
    }
  }, [formType, categories]);

  // Handle open modal for editing
  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setAmount(tx.amount.toString());
    setCurrency(tx.currency || 'GBP');
    setDescription(tx.description);
    setFormType(tx.type);
    setFormCategoryId(tx.categoryId.toString());
    setDate(tx.date);
    setFormError(null);
    setShowModal(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setFormError(null);
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Please enter a positive transaction amount.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please specify a description.');
      return;
    }
    if (!formCategoryId) {
      setFormError('Please select a valid category.');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingTx ? `/api/transactions/${editingTx.id}` : '/api/transactions';
      const method = editingTx ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountNum,
          currency,
          description: description.trim(),
          date,
          categoryId: parseInt(formCategoryId, 10),
          type: formType,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save transaction.');
      }

      if (json.success) {
        onNotify(
          editingTx ? 'Transaction updated successfully!' : 'New transaction recorded!',
          'success'
        );
        setShowModal(false);
        fetchTransactions();
      }
    } catch (err: any) {
      setFormError(err.message || 'Error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTx = async () => {
    if (!token || !showDeleteConfirm) return;
    try {
      const response = await apiFetch(`/api/transactions/${showDeleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await response.json();
      if (response.ok && json.success) {
        onNotify('Transaction deleted successfully.', 'success');
        setShowDeleteConfirm(null);
        fetchTransactions();
      } else {
        onNotify(json.error || 'Failed to delete transaction.', 'error');
      }
    } catch (err) {
      onNotify('An error occurred.', 'error');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!catName.trim()) {
      onNotify('Category name is required.', 'error');
      return;
    }

    try {
      setCatSubmitting(true);
      const response = await apiFetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: catName.trim(),
          type: catType,
          color: catColor,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to create category.');
      }

      if (json.success) {
        onNotify(`Custom category "${json.category.name}" created!`, 'success');
        setCatName('');
        setShowCatModal(false);
        fetchCategories();
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to save category.', 'error');
    } finally {
      setCatSubmitting(false);
    }
  };

  const formatCurrency = (val: number, currencyCode = 'GBP') => {
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currencyCode,
      }).format(val);
    } catch {
      return `${currencyCode} ${val.toFixed(2)}`;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Tab Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Transaction Manager
          </h2>
          <p className="text-sm text-gray-400">
            Create, update, delete and search your logs with modular search filters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Create Custom Category */}
          <button
            onClick={() => setShowCatModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#262626] text-indigo-400 hover:bg-[#161616] font-semibold text-xs cursor-pointer transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Category</span>
          </button>

          {/* Add Transaction */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* SEARCH, SORT & FILTER BAR */}
      <div className="bg-[#111111] rounded-2xl border border-[#262626] p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search text box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#262626] bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex gap-2">
            {/* Toggle filter drawer */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                showFilters 
                  ? 'bg-[#1A1A1A] border-[#262626] text-indigo-400' 
                  : 'border-[#262626] text-gray-400 hover:bg-[#161616]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <ArrowUpDown className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-2.5 rounded-xl border border-[#262626] bg-[#111111] text-xs font-semibold text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer appearance-none"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Filters Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#262626] pt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Flow Type Toggle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-[#111111] text-xs text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expense Only</option>
                  </select>
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-[#111111] text-xs text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-transparent text-xs text-gray-300 focus:outline-none"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-transparent text-xs text-gray-300 focus:outline-none"
                  />
                </div>

              </div>

              {/* Reset button */}
              <div className="flex justify-end pt-3">
                <button
                  onClick={() => {
                    setSearch('');
                    setType('');
                    setCategoryId('');
                    setStartDate('');
                    setEndDate('');
                    setSortBy('date_desc');
                  }}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TRANSACTIONS LIST TABLE */}
      <div className="bg-[#111111] rounded-2xl border border-[#262626] overflow-hidden">
        
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-500 text-xs font-medium">Filtering database indices...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto text-gray-500">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-gray-400">No transactions match your search</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your filters, searching for something else, or recording a new transaction using the 'Add Entry' button on the top-right.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262626] bg-[#161616] text-xs text-gray-450 font-bold uppercase tracking-wider">
                  <th className="py-4.5 px-6">Description / Detail</th>
                  <th className="py-4.5 px-6">Category</th>
                  <th className="py-4.5 px-6">Date</th>
                  <th className="py-4.5 px-6 text-right">Amount</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626] text-sm">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#161616] group transition-all">
                    {/* Desc */}
                    <td className="py-4 px-6 font-medium text-white max-w-xs truncate">
                      {tx.description}
                    </td>

                    {/* Category color badge */}
                    <td className="py-4 px-6">
                      <span 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${tx.categoryColor}15`, color: tx.categoryColor }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tx.categoryColor }} />
                        {tx.categoryName}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-gray-450 font-medium font-mono text-xs">
                      {tx.date}
                    </td>

                    {/* Amount */}
                    <td className={`py-4 px-6 text-right font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                    </td>

                    {/* Edit/Delete actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(tx)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-[#161616] transition-colors cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(tx)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-[#161616] transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* RECORD/EDIT TRANSACTION OVERLAY MODAL */}
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
                  <h3 className="font-display font-bold text-white text-base">
                    {editingTx ? 'Modify Transaction' : 'Record New Transaction'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-[#161616] text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium rounded-xl">
                    {formError}
                  </div>
                )}

                {/* Tab selector for type */}
                <div className="grid grid-cols-2 gap-2 bg-[#0A0A0A] p-1.5 rounded-xl border border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      formType === 'expense'
                        ? 'bg-[#1A1A1A] text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('income')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      formType === 'income'
                        ? 'bg-[#1A1A1A] text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Amount ({currencyOptions.find(c => c.code === currency)?.symbol || '\u00A3'})
                  </label>
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

                {/* Currency Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-[#111111] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    {currencyOptions.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Sainsbury's, Office Rent, Dividends..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-transparent text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-[#111111] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    {categories.filter(c => c.type === formType).map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#111111] text-white">
                        {cat.name}
                      </option>
                    ))}
                    {categories.filter(c => c.type === formType).length === 0 && (
                      <option disabled value="" className="bg-[#111111] text-white">No category added for {formType}</option>
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
                    {submitting ? 'Saving...' : 'Save Log'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE CATEGORY MODAL */}
      <AnimatePresence>
        {showCatModal && (
          <div className="fixed inset-0 bg-[#0A0A0A]/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#111111] rounded-2xl shadow-2xl border border-[#262626] overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4.5 h-4.5 text-indigo-400" />
                  <h3 className="font-display font-bold text-white text-base">Create Custom Category</h3>
                </div>
                <button
                  onClick={() => setShowCatModal(false)}
                  className="p-1 rounded-lg hover:bg-[#161616] text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="p-6 space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category Name</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Subscriptions, Side-Hustle, Health..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#262626] bg-transparent text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Type toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                  <div className="grid grid-cols-2 gap-2 bg-[#0A0A0A] p-1 rounded-xl border border-[#262626]">
                    <button
                      type="button"
                      onClick={() => setCatType('expense')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                        catType === 'expense'
                          ? 'bg-[#1A1A1A] text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Expense Category
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatType('income')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                        catType === 'income'
                          ? 'bg-[#1A1A1A] text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Income Category
                    </button>
                  </div>
                </div>

                {/* Color presets selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Palette Color</label>
                  <div className="flex flex-wrap gap-2.5">
                    {colorsPreset.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCatColor(color)}
                        className="w-7 h-7 rounded-full shrink-0 border border-black/10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer relative"
                        style={{ backgroundColor: color }}
                      >
                        {catColor === color && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCatModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#262626] text-gray-400 hover:bg-[#161616] text-sm font-semibold transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={catSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 text-center flex items-center justify-center"
                  >
                    {catSubmitting ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE DIALOG */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-[#0A0A0A]/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#111111] rounded-2xl shadow-2xl border border-[#262626] p-6 space-y-6"
            >
              <div className="space-y-2 text-center">
                <h3 className="font-display font-bold text-white text-lg">Delete Transaction?</h3>
                <p className="text-xs text-gray-400">
                  Are you absolutely sure you want to delete <span className="font-semibold text-gray-200">"{showDeleteConfirm.description}"</span> of <span className="font-mono font-bold text-rose-400">{formatCurrency(showDeleteConfirm.amount, showDeleteConfirm.currency)}</span>? This action is permanent.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#262626] text-gray-400 hover:bg-[#161616] text-xs font-semibold transition-all cursor-pointer"
                >
                  No, Keep it
                </button>
                <button
                  onClick={handleDeleteTx}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Yes, Delete Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

