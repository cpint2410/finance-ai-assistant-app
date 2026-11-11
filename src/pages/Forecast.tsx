import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { StatementUploadResult, ForecastPrediction, PortfolioHolding, StatementTransaction } from '../types.ts';
import { 
  UploadCloud, 
  Sparkles, 
  TrendingUp, 
  GraduationCap, 
  Wallet, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  PieChart as PieIcon, 
  Coins, 
  Download, 
  Layers, 
  HelpCircle,
  Sliders,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface ForecastProps {
  onNotify: (text: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

type UserPersona = 'student' | 'investor' | 'general';

export const Forecast: React.FC<ForecastProps> = ({ onNotify }) => {
  const { token } = useAuth();
  
  // Persona mode
  const [persona, setPersona] = useState<UserPersona>('student');
  
  // Upload and parsing states
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statementData, setStatementData] = useState<StatementUploadResult | null>(null);
  const [selectedTxIds, setSelectedTxIds] = useState<Set<number>>(new Set());
  const [importingTxs, setImportingTxs] = useState(false);
  
  // Paste text modal state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // AI Forecasting states
  const [forecasting, setForecasting] = useState(false);
  const [prediction, setPrediction] = useState<ForecastPrediction | null>(null);

  // Scenario Simulator interactive adjustments
  const [simIncomeAdj, setSimIncomeAdj] = useState<number>(0);
  const [simExpenseAdj, setSimExpenseAdj] = useState<number>(0);

  // Format currency helper
  const formatGBP = (val: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(val);
  };

  // Initial load: Fetch default forecast from existing transactions
  useEffect(() => {
    handleGenerateForecast(false);
  }, [persona]);

  // Handle Preset Selection (Uni Student or Young Professional)
  const handleLoadPreset = async (presetKey: string) => {
    if (!token) return;
    try {
      setUploading(true);
      const res = await apiFetch('/api/ai/parse-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ preset: presetKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load demo statement.');

      setStatementData(data.result);
      // Select all extracted transactions by default
      const allIndices = new Set<number>(data.result.transactions.map((_: any, idx: number) => idx));
      setSelectedTxIds(allIndices);

      onNotify(`Loaded ${data.result.institution} statement with ${data.result.transactions.length} records!`, 'success');

      // Automatically trigger forecast with this statement context
      generateForecastWithContext(data.result);
    } catch (err: any) {
      onNotify(err.message || 'Error loading demo statement', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle File Upload (PDF, CSV, image, txt)
  const processFile = async (file: File) => {
    if (!token) return;
    try {
      setUploading(true);
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const result = reader.result as string;
          let fileBase64 = '';
          let rawText = '';
          const mimeType = file.type || 'text/plain';

          if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            fileBase64 = result.split(',')[1];
          } else {
            rawText = result;
          }

          const res = await apiFetch('/api/ai/parse-statement', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileBase64,
              mimeType,
              fileName: file.name,
              rawText,
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to process statement file.');

          setStatementData(data.result);
          const allIndices = new Set<number>(data.result.transactions.map((_: any, idx: number) => idx));
          setSelectedTxIds(allIndices);

          onNotify(`AI parsed statement: ${data.result.transactions.length} transactions extracted!`, 'success');
          generateForecastWithContext(data.result);
        } catch (innerErr: any) {
          onNotify(innerErr.message || 'Failed to parse file.', 'error');
        } finally {
          setUploading(false);
        }
      };

      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    } catch (err: any) {
      setUploading(false);
      onNotify(err.message || 'Error reading statement file', 'error');
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Submit Pasted Text
  const handlePasteSubmit = async () => {
    if (!pastedText.trim() || !token) return;
    try {
      setUploading(true);
      setShowPasteModal(false);
      const res = await apiFetch('/api/ai/parse-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rawText: pastedText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse pasted text.');

      setStatementData(data.result);
      const allIndices = new Set<number>(data.result.transactions.map((_: any, idx: number) => idx));
      setSelectedTxIds(allIndices);

      onNotify(`Extracted ${data.result.transactions.length} transactions from text!`, 'success');
      generateForecastWithContext(data.result);
    } catch (err: any) {
      onNotify(err.message || 'Could not parse text.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Trigger Forecast Prediction
  const handleGenerateForecast = async (showToast: boolean = true) => {
    if (!token) return;
    try {
      setForecasting(true);
      const res = await apiFetch('/api/ai/predict-forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          statementContext: statementData,
          studentMode: persona === 'student',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate forecast.');

      setPrediction(data.prediction);
      if (showToast) {
        onNotify('AI next-month prediction refreshed with the latest data!', 'success');
      }
    } catch (err: any) {
      console.error('Error in forecasting:', err);
      if (showToast) {
        onNotify(err.message || 'Error generating forecast.', 'error');
      }
    } finally {
      setForecasting(false);
    }
  };

  const generateForecastWithContext = async (context: StatementUploadResult) => {
    if (!token) return;
    try {
      setForecasting(true);
      const res = await apiFetch('/api/ai/predict-forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          statementContext: context,
          studentMode: persona === 'student' || Boolean(context.studentFinance?.isStudent),
        }),
      });
      const data = await res.json();
      if (data.success && data.prediction) {
        setPrediction(data.prediction);
      }
    } catch (err) {
      console.error('Forecast with context failed:', err);
    } finally {
      setForecasting(false);
    }
  };

  // Import Extracted Transactions to Database
  const handleBatchImport = async () => {
    if (!token || !statementData || statementData.transactions.length === 0) return;
    const selectedList = statementData.transactions.filter((_, idx) => selectedTxIds.has(idx));
    if (selectedList.length === 0) {
      onNotify('Please select at least one transaction to import.', 'warning');
      return;
    }

    try {
      setImportingTxs(true);
      const res = await apiFetch('/api/transactions/batch-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ transactions: selectedList }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import transactions.');

      onNotify(`🎉 ${data.importedCount} transactions imported directly into your dashboard!`, 'success');
      // Deselect imported
      setSelectedTxIds(new Set());
    } catch (err: any) {
      onNotify(err.message || 'Failed to import transactions.', 'error');
    } finally {
      setImportingTxs(false);
    }
  };

  const toggleTxSelection = (index: number) => {
    const next = new Set(selectedTxIds);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedTxIds(next);
  };

  const selectAllTxs = () => {
    if (!statementData) return;
    if (selectedTxIds.size === statementData.transactions.length) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(statementData.transactions.map((_, i) => i)));
    }
  };

  // Calculate simulated numbers
  const simulatedIncome = (prediction?.predictedIncome || 0) + simIncomeAdj;
  const simulatedExpense = Math.max(0, (prediction?.estimatedExpenses || 0) + simExpenseAdj);
  const simulatedNet = simulatedIncome - simulatedExpense;
  const simulatedSetAside = Math.max(0, Number((simulatedNet * 0.55).toFixed(2)));
  const simulatedDiscretionary = Math.max(0, simulatedNet - simulatedSetAside);
  const simulatedDailySpend = Number((simulatedDiscretionary / 30).toFixed(2));

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Title & Persona Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-[#262626] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              AI Intelligence Engine
            </span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Statements & Predictive AI Hub
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mt-1">
            Upload bank statements, student finance awards, or investment portfolios from the past 6-12 months. Our AI maps where your money is and forecasts next month's salary, expected bills, safe daily spend, and recommended savings.
          </p>
        </div>

        {/* Persona Segmented Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-[#111111] p-1 rounded-xl border border-[#262626] flex items-center">
            <button
              onClick={() => setPersona('student')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                persona === 'student'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Uni Student / Loans</span>
            </button>
            <button
              onClick={() => setPersona('investor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                persona === 'investor'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Investor / Stocks</span>
            </button>
            <button
              onClick={() => setPersona('general')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                persona === 'general'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>General Worker</span>
            </button>
          </div>

          <button
            onClick={() => handleGenerateForecast(true)}
            disabled={forecasting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] text-gray-200 border border-[#262626] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Re-run forecast"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${forecasting ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{forecasting ? 'Forecasting...' : 'Re-Predict'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: STATEMENT UPLOAD & QUICK DEMO PRESETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Dropzone (7 Cols) */}
        <div className="lg:col-span-7 bg-[#111111] p-6 rounded-2xl border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-display font-bold text-white tracking-tight flex items-center gap-2">
                  <UploadCloud className="w-4.5 h-4.5 text-indigo-400" />
                  Upload Statement or Portfolio
                </h3>
                <p className="text-xs text-gray-500">
                  Upload PDF bank statements, CSV transaction sheets, or screenshots from the past 6 to 12 months.
                </p>
              </div>
              <button
                onClick={() => setShowPasteModal(true)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                Paste text / CSV
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-[#262626] hover:border-gray-600 bg-[#0A0A0A]/60'
              }`}
            >
              {uploading ? (
                <div className="py-8 space-y-3">
                  <div className="w-9 h-9 border-3 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white">Gemini AI is parsing statement structures...</p>
                  <p className="text-xs text-gray-500">Extracting income, university loan installments, expenditures & portfolios...</p>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white hover:text-indigo-400 cursor-pointer underline">
                      <span>Click to upload file</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.csv,.png,.jpg,.jpeg,.txt"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <span className="text-gray-400 text-xs"> or drag and drop here</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Supports PDF bank statements, CSV exports, Monzo, Barclays, Student Finance England letters, Trading 212 & Vanguard portfolios.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick statement demo helper */}
          <div className="mt-4 pt-4 border-t border-[#262626] flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Don't have a file ready? Load realistic sample:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleLoadPreset('uni_student')}
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg bg-[#161616] hover:bg-indigo-950/40 border border-[#262626] text-[11px] font-semibold text-indigo-300 transition-all cursor-pointer flex items-center gap-1"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Uni Student (6 Mo)</span>
              </button>
              <button
                onClick={() => handleLoadPreset('young_professional')}
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg bg-[#161616] hover:bg-emerald-950/40 border border-[#262626] text-[11px] font-semibold text-emerald-300 transition-all cursor-pointer flex items-center gap-1"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Investor / ISA (1 Yr)</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Insight Box & Persona Advice (5 Cols) */}
        <div className="lg:col-span-5 bg-[#111111] p-6 rounded-2xl border border-[#262626] flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {persona === 'student' ? 'Student Finance & Term Health' : persona === 'investor' ? 'Portfolio & Investment Health' : 'Income & Spending Stability'}
                </h3>
                <span className="text-[11px] text-gray-500">Universal financial analysis</span>
              </div>
            </div>

            {statementData?.aiInsight ? (
              <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">AI Statement Breakdown</span>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  {statementData.aiInsight}
                </p>
              </div>
            ) : (
              <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">How This Helps You</span>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  {persona === 'student'
                    ? 'University students receive lumpy lump-sum maintenance payments 3 times a year. Our engine tracks your term pacing so you never run out of money before your next Student Finance drop.'
                    : persona === 'investor'
                    ? 'Retail investors hold assets across cash ISAs, ETFs, and crypto. Our engine monitors your portfolio yield, net gains, and guides regular dollar-cost averaging.'
                    : 'Analyze past 6-12 months of paychecks, calculate fixed commitments against living expenses, and find your true safe daily spending limit.'}
                </p>
              </div>
            )}

            {/* Quick summary badges */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#161616] p-3 rounded-xl border border-[#262626]">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Statement Period</span>
                <p className="text-xs font-semibold text-white mt-1 truncate">
                  {statementData?.period || 'Past 6-12 Months'}
                </p>
              </div>
              <div className="bg-[#161616] p-3 rounded-xl border border-[#262626]">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Detected Account</span>
                <p className="text-xs font-semibold text-indigo-400 mt-1 truncate">
                  {statementData?.institution || 'Awaiting Upload'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#262626] flex items-center justify-between text-[11px] text-gray-500">
            <span>Powered by Gemini 3.8 Flash</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Zero client keys exposed
            </span>
          </div>
        </div>

      </div>

      {/* SECTION 2: AI NEXT-MONTH FORECAST & PREDICTION ("PREDICT SALARY, EXPENDITURE, SAFE-TO-SPEND") */}
      {prediction && (
        <div className="bg-[#111111] p-6 lg:p-8 rounded-2xl border border-indigo-500/30 shadow-xl shadow-indigo-950/20 space-y-8 relative overflow-hidden">
          
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

          {/* Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-display font-extrabold text-white tracking-tight">
                  Forecast for {prediction.targetMonth}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  AI Predicted
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                {prediction.aiSummary}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Confidence</span>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${
                    prediction.incomeConfidence === 'High' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <span className="text-xs font-semibold text-white">{prediction.incomeConfidence}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Primary Predictive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Predicted Income */}
            <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#262626] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Predicted Income</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold font-mono text-emerald-400">
                  {formatGBP(prediction.predictedIncome)}
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 truncate">
                  {prediction.incomeSources[0]?.name || 'Expected Paycheck / Loan Drop'}
                </p>
              </div>
              <div className="pt-2 border-t border-[#262626]/60 flex items-center justify-between text-[11px] text-gray-500">
                <span>Est. Date:</span>
                <span className="font-semibold text-gray-300">{prediction.incomeSources[0]?.expectedDate || 'Early Month'}</span>
              </div>
            </div>

            {/* Card 2: Estimated Expenses */}
            <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#262626] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Estimated Expenses</span>
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold font-mono text-white">
                  {formatGBP(prediction.estimatedExpenses)}
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  Housing, bills, groceries & living
                </p>
              </div>
              <div className="pt-2 border-t border-[#262626]/60 flex items-center justify-between text-[11px] text-gray-500">
                <span>Fixed vs Variable:</span>
                <span className="font-semibold text-gray-300">
                  ~{Math.round((prediction.estimatedExpenses * 0.6) / prediction.estimatedExpenses * 100)}% Fixed
                </span>
              </div>
            </div>

            {/* Card 3: Safe to Spend (Discretionary) */}
            <div className="bg-[#0A0A0A] p-5 rounded-xl border border-indigo-500/20 bg-indigo-950/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-400 uppercase">
                <span>Safe to Spend</span>
                <Coins className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold font-mono text-indigo-400">
                  {formatGBP(prediction.safeToSpend.dailyBudget)}
                  <span className="text-xs font-normal text-gray-400 ml-1">/ day</span>
                </h4>
                <p className="text-[11px] text-gray-300 mt-1">
                  {formatGBP(prediction.safeToSpend.weeklyBudget)} / week allowance
                </p>
              </div>
              <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[11px] text-gray-400">
                <span>Guilt-free total:</span>
                <span className="font-semibold text-white">{formatGBP(prediction.safeToSpend.monthlyDiscretionary)}</span>
              </div>
            </div>

            {/* Card 4: Recommended to Set Aside */}
            <div className="bg-[#0A0A0A] p-5 rounded-xl border border-purple-500/20 bg-purple-950/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-purple-400 uppercase">
                <span>Set Aside (Savings/ISA)</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold font-mono text-purple-300">
                  {formatGBP(prediction.recommendedSetAside.totalAmount)}
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  {formatGBP(prediction.recommendedSetAside.emergencyReserve)} reserve + {formatGBP(prediction.recommendedSetAside.investmentsOrSavings)} ISA/invest
                </p>
              </div>
              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-gray-400">
                <span>Cash flow buffer:</span>
                <span className="font-semibold text-white">
                  +{formatGBP(prediction.projectedNetCashFlow)}
                </span>
              </div>
            </div>

          </div>

          {/* Student Finance Specific Section (If student) */}
          {(persona === 'student' || prediction.studentFinancePlan) && (
            <div className="bg-[#0A0A0A] p-6 rounded-xl border border-indigo-500/20 space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white tracking-tight">
                  University Student Survival & Maintenance Plan
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Safe Daily Burn Rate</span>
                  <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {formatGBP(prediction.studentFinancePlan?.safeDailyBurnRate || 18.50)} / day
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Follow this to finish the academic term without entering your overdraft.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Halls / Accommodation Check</span>
                  <p className="text-xs font-semibold text-gray-200 mt-1.5 leading-relaxed">
                    {prediction.studentFinancePlan?.hallRentCoverage || 'Accommodation covered by maintenance loan grant.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Next Scheduled Drop</span>
                  <p className="text-xl font-bold font-mono text-indigo-400 mt-1">
                    ~{formatGBP(prediction.studentFinancePlan?.nextExpectedDisbursement || 3450)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Scheduled for upcoming academic term.
                  </p>
                </div>
              </div>

              {prediction.studentFinancePlan?.studentTips && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-indigo-400">Uni Money Saving Hacks:</span>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {prediction.studentFinancePlan.studentTips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-gray-300 bg-[#161616] p-2.5 rounded-lg border border-[#262626] flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Investment Portfolio Outlook (If investor or holdings present) */}
          {(persona === 'investor' || statementData?.portfolio?.holdings?.length! > 0) && (
            <div className="bg-[#0A0A0A] p-6 rounded-xl border border-emerald-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Investment Portfolio & Asset Health
                  </h4>
                </div>
                {statementData?.portfolio?.unrealizedGainLoss !== undefined && (
                  <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                    statementData.portfolio.unrealizedGainLoss >= 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {statementData.portfolio.unrealizedGainLoss >= 0 ? '+' : ''}
                    {formatGBP(statementData.portfolio.unrealizedGainLoss)} ({statementData.portfolio.unrealizedGainLossPercentage.toFixed(1)}%)
                  </span>
                )}
              </div>

              {/* Holdings list */}
              {statementData?.portfolio?.holdings && statementData.portfolio.holdings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {statementData.portfolio.holdings.map((h, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-white px-2 py-0.5 rounded bg-[#1A1A1A]">
                          {h.symbol}
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-gray-500">
                          {h.type}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-300 truncate">{h.name}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-[#262626] text-xs">
                        <span className="font-mono font-bold text-white">{formatGBP(h.value)}</span>
                        <span className={`font-mono text-[11px] font-semibold ${h.gainPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {h.gainPercentage >= 0 ? '+' : ''}{h.gainPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] text-xs text-gray-400">
                  <p>Upload a portfolio export or select the 'Investor / ISA' preset above to view live asset breakdown, dividend forecasts, and capital allocation advice.</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION: SCENARIO SIMULATOR ("WHAT-IF") */}
          <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Interactive "What-If" Scenario Simulator
                </h4>
              </div>
              <button
                onClick={() => { setSimIncomeAdj(0); setSimExpenseAdj(0); }}
                className="text-[11px] text-gray-500 hover:text-white underline cursor-pointer"
              >
                Reset sliders
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Test how picking up extra part-time work or reducing spending alters your safe daily spend and set-aside amount next month.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Slider 1: Income Adjustment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400">Income Shift (e.g. Extra shifts / overtime)</span>
                  <span className={`font-mono ${simIncomeAdj >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simIncomeAdj >= 0 ? '+' : ''}{formatGBP(simIncomeAdj)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-500"
                  max="1000"
                  step="50"
                  value={simIncomeAdj}
                  onChange={(e) => setSimIncomeAdj(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Slider 2: Expense Adjustment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400">Expense Shift (e.g. Higher rent / cutting food spend)</span>
                  <span className={`font-mono ${simExpenseAdj > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {simExpenseAdj >= 0 ? '+' : ''}{formatGBP(simExpenseAdj)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-400"
                  max="600"
                  step="25"
                  value={simExpenseAdj}
                  onChange={(e) => setSimExpenseAdj(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Live Simulated Result Banner */}
            <div className="mt-4 p-4 rounded-xl bg-[#161616] border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Simulated Cash Flow</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  Income: <span className="text-emerald-400 font-mono">{formatGBP(simulatedIncome)}</span> | Expenses: <span className="text-rose-400 font-mono">{formatGBP(simulatedExpense)}</span>
                </p>
              </div>

              <div className="flex gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Safe Daily Spend</span>
                  <p className="text-base font-bold font-mono text-indigo-400">
                    {formatGBP(simulatedDailySpend)} / day
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Can Set Aside</span>
                  <p className="text-base font-bold font-mono text-purple-300">
                    {formatGBP(simulatedSetAside)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommended Action Items */}
          {prediction.aiActionItems && prediction.aiActionItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                🎯 Top Priority Action Items for Next Month
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {prediction.aiActionItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SECTION 3: EXTRACTED STATEMENT TRANSACTIONS & ONE-CLICK IMPORT */}
      {statementData && (
        <div className="bg-[#111111] p-6 lg:p-8 rounded-2xl border border-[#262626] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-display font-bold text-white tracking-tight">
                  Parsed Statement Activity ({statementData.transactions.length} records)
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Extracted from <span className="font-semibold text-white">{statementData.institution}</span> ({statementData.period}). Select items and import into your permanent records with one click!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={selectAllTxs}
                className="px-3 py-1.5 rounded-lg border border-[#262626] text-xs font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                {selectedTxIds.size === statementData.transactions.length ? 'Deselect All' : 'Select All'}
              </button>

              <button
                onClick={handleBatchImport}
                disabled={importingTxs || selectedTxIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{importingTxs ? 'Importing...' : `Import ${selectedTxIds.size} Selected`}</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-[#262626]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0A] text-gray-500 uppercase font-bold border-b border-[#262626]">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedTxIds.size === statementData.transactions.length && statementData.transactions.length > 0}
                      onChange={selectAllTxs}
                      className="rounded accent-indigo-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {statementData.transactions.map((tx, idx) => {
                  const isSelected = selectedTxIds.has(idx);
                  return (
                    <tr 
                      key={idx} 
                      onClick={() => toggleTxSelection(idx)}
                      className={`hover:bg-[#161616] cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTxSelection(idx)}
                          className="rounded accent-indigo-600 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-400">{tx.date}</td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate">{tx.description}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E1E1E] text-gray-300 border border-[#333]">
                          {tx.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'income' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatGBP(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PASTE TEXT MODAL */}
      <AnimatePresence>
        {showPasteModal && (
          <div className="fixed inset-0 bg-[#0A0A0A]/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#111111] rounded-2xl border border-[#262626] shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <h3 className="font-display font-bold text-white text-base">
                Paste Statement or CSV Rows
              </h3>
              <p className="text-xs text-gray-400">
                Copy and paste lines directly from your bank or student finance export:
              </p>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`2026-01-12, Student Finance England Maint Loan, 3450.00, credit\n2026-01-15, University Accommodation Halls Term 2, 1650.00, debit\n2026-01-28, Tesco Express Groceries, 42.10, debit`}
                className="w-full p-3 rounded-xl border border-[#262626] bg-[#0A0A0A] text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#262626] text-xs font-semibold text-gray-400 hover:bg-[#161616]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
                >
                  Analyze Text
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

