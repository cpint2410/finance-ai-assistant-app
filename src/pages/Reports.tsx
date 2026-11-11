import { apiFetch } from '../lib/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { CategorySummary, MonthlyHistory } from '../types.ts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart4, 
  TrendingDown, 
  LineChart, 
  Calendar, 
  RefreshCw,
  TrendingUpDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  AreaChart, 
  Area,
  Line,
  ComposedChart
} from 'recharts';

export const Reports: React.FC = () => {
  const { token } = useAuth();
  
  // Controls
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [reportType, setReportType] = useState<'expense' | 'income'>('expense');

  // Datasets
  const [categoryData, setCategoryData] = useState<CategorySummary[]>([]);
  const [historyData, setHistoryData] = useState<MonthlyHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      
      // Fetch category totals for specified month & type
      const catRes = await apiFetch(`/api/stats/category-summary?month=${month}&type=${reportType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const catJson = await catRes.json();
      if (catJson.success) setCategoryData(catJson.data);

      // Fetch historical monthly income vs expenses (last 12 months)
      const histRes = await apiFetch('/api/stats/monthly-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const histJson = await histRes.json();
      if (histJson.success) setHistoryData(histJson.history);

    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [token, month, reportType]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(val);
  };

  // Calculate sum of values
  const totalValue = categoryData.reduce((acc, curr) => acc + curr.value, 0);

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111111]/95 backdrop-blur-md text-white p-3.5 border border-[#262626] rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="font-bold font-mono text-indigo-400">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Financial Intelligence Reports
          </h2>
          <p className="text-sm text-gray-400">
            Compare monthly outflow trends and analyze category balance distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month selector */}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#262626] bg-[#111111] text-xs font-semibold text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          />
          <button
            onClick={fetchReportData}
            className="p-2.5 rounded-xl border border-[#262626] text-gray-400 hover:bg-[#161616] hover:text-white transition-all cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOP CHARTS: Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pie Chart Card */}
        <div className="lg:col-span-7 bg-[#111111] p-6 rounded-2xl border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#262626] gap-3">
              <div>
                <h3 className="text-lg font-display font-bold text-white tracking-tight">
                  Category Weight Analysis
                </h3>
                <p className="text-xs text-gray-500">
                  Weight allocation for {month}
                </p>
              </div>

              {/* Type Switcher tabs */}
              <div className="grid grid-cols-2 gap-1 bg-[#0A0A0A] p-1 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => setReportType('expense')}
                  className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                    reportType === 'expense'
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setReportType('income')}
                  className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                    reportType === 'income'
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Incomes
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-gray-500 text-xs font-medium">Crunching weights...</p>
              </div>
            ) : categoryData.length === 0 ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto text-gray-500">
                  <PieIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-gray-400">No transactions recorded</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Record some {reportType} logs in this month to enable graphical weight distribution reports!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Responsive Pie Chart Container */}
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list details */}
                <div className="divide-y divide-[#262626]">
                  {categoryData.map((item, index) => {
                    const percentage = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0;
                    return (
                      <div key={index} className="py-3 flex items-center justify-between gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-300 truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-6 font-mono text-right shrink-0">
                          <span className="text-gray-500">{percentage}%</span>
                          <span className="text-white">{formatCurrency(item.value)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#262626] p-4 bg-[#0A0A0A]/30 rounded-xl mt-6 flex justify-between items-center">
            <span className="text-xs text-gray-400 font-semibold">Total Monthly Flow:</span>
            <span className="text-sm font-extrabold text-white">{formatCurrency(totalValue)}</span>
          </div>
        </div>

        {/* Historical Savings Curve Card */}
        <div className="lg:col-span-5 bg-[#111111] p-6 rounded-2xl border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="pb-5 border-b border-[#262626]">
              <h3 className="text-lg font-display font-bold text-white tracking-tight">
                Net Capital Gain Curve
              </h3>
              <p className="text-xs text-gray-500">
                Accumulated savings trend (last 12 months)
              </p>
            </div>

            {historyData.length === 0 ? (
              <div className="py-24 text-center space-y-3 flex-grow flex flex-col justify-center">
                <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto text-gray-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-gray-400">No savings history</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Start logging both income and expense items to build historical savings curves.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Area Chart Container */}
                <div className="h-64 w-full flex items-center justify-center mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#737373" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#737373" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(v) => `£${v}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111111', borderColor: '#262626', borderRadius: '12px' }}
                        itemStyle={{ color: '#ffffff' }}
                        labelStyle={{ color: '#a3a3a3' }}
                        formatter={(value: any) => [formatCurrency(Number(value)), 'Net Savings']} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="savings" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#savingsGrad)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Historical highlights</h4>
                  {historyData.slice(-3).map((hist, index) => (
                    <div key={index} className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-400 font-mono">{hist.month}</span>
                      <span className={`font-bold ${hist.savings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {hist.savings >= 0 ? '+' : ''}{formatCurrency(hist.savings)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#262626] mt-6 text-center text-xs text-gray-500 font-medium">
            💡 Remaining savings are automatically added to your cumulative available balance.
          </div>
        </div>

      </div>

      {/* BOTTOM CHART: COMPARATIVE HISTOGRAM BAR CHART */}
      <div className="bg-[#111111] p-6 rounded-2xl border border-[#262626]">
        <div className="pb-5 border-b border-[#262626] mb-6">
          <h3 className="text-lg font-display font-bold text-white tracking-tight">
            Historical Comparative Histogram
          </h3>
          <p className="text-xs text-gray-500">
            Compare monthly inflows against outflows side-by-side (last 12 months)
          </p>
        </div>

        {historyData.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto text-gray-500">
              <BarChart4 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-gray-400">No comparative statistics</h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Historical statistics require at least one transaction to be recorded.
            </p>
          </div>
        ) : (
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                <XAxis 
                  dataKey="month" 
                  stroke="#737373" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#737373" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `£${v}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#262626', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#a3a3a3' }}
                  formatter={(value: any) => [formatCurrency(Number(value))]} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }} />
                <Bar dataKey="income" name="Monthly Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Monthly Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
};

