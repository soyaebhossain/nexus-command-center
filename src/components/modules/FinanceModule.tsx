import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, TrendingUp, TrendingDown, Scale, Target, 
  Download, PlusCircle, Trash2, Edit3, ShieldCheck, Database, 
  ArrowDownRight, ArrowUpRight, PieChart as PieIcon
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { useTranslation } from '../../utils/i18n';

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface CategoryMeta {
  color: string;
  nameEn: string;
  nameBn: string;
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  'বাড়ি ভাড়া ও ইউটিলিটি': { color: '#06b6d4', nameEn: 'Housing & Utilities', nameBn: 'বাড়ি ভাড়া ও ইউটিলিটি' },
  'Housing': { color: '#06b6d4', nameEn: 'Housing & Utilities', nameBn: 'বাড়ি ভাড়া ও ইউটিলিটি' },
  'খাদ্য ও বাজার': { color: '#10b981', nameEn: 'Food & Groceries', nameBn: 'খাদ্য ও বাজার' },
  'Food': { color: '#10b981', nameEn: 'Food & Groceries', nameBn: 'খাদ্য ও বাজার' },
  'স্বাস্থ্য ও চিকিৎসা': { color: '#f43f5e', nameEn: 'Healthcare & Medical', nameBn: 'স্বাস্থ্য ও চিকিৎসা' },
  'Healthcare': { color: '#f43f5e', nameEn: 'Healthcare & Medical', nameBn: 'স্বাস্থ্য ও চিকিৎসা' },
  'যাতায়াত ও পরিবহন': { color: '#f59e0b', nameEn: 'Transportation', nameBn: 'যাতায়াত ও পরিবহন' },
  'Transportation': { color: '#f59e0b', nameEn: 'Transportation', nameBn: 'যাতায়াত ও পরিবহন' },
  'বিনোদন ও রেস্তোরাঁ': { color: '#ec4899', nameEn: 'Dining & Entertainment', nameBn: 'বিনোদন ও রেস্তোরাঁ' },
  'Entertainment': { color: '#ec4899', nameEn: 'Dining & Entertainment', nameBn: 'বিনোদন ও রেস্তোরাঁ' },
  'শিক্ষা ও বই': { color: '#8b5cf6', nameEn: 'Learning & Skills', nameBn: 'শিক্ষা ও বই' },
  'Learning': { color: '#8b5cf6', nameEn: 'Learning & Skills', nameBn: 'শিক্ষা ও বই' },
  'দেনা ও কিস্তি': { color: '#ef4444', nameEn: 'Debt & EMI', nameBn: 'দেনা ও কিস্তি' },
  'Debt/EMI': { color: '#ef4444', nameEn: 'Debt & EMI', nameBn: 'দেনা ও কিস্তি' },
  'পরিবার ও সন্তান': { color: '#14b8a6', nameEn: 'Family & Household', nameBn: 'পরিবার ও সন্তান' },
  'Family': { color: '#14b8a6', nameEn: 'Family & Household', nameBn: 'পরিবার ও সন্তান' },
  'অন্যান্য': { color: '#64748b', nameEn: 'Other Expenses', nameBn: 'অন্যান্য' },
  'Other': { color: '#64748b', nameEn: 'Other Expenses', nameBn: 'অন্যান্য' }
};

const DISTINCT_COLORS = [
  '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#ec4899', 
  '#8b5cf6', '#3b82f6', '#14b8a6', '#eab308', '#64748b'
];

export const FinanceModule: React.FC = () => {
  const { 
    currency, transactions, addTransaction, deleteTransaction, 
    monthlyBudget, setMonthlyBudget, lang, showToast, loadDemoData 
  } = useApp();

  const t = useTranslation(lang);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(lang === 'bn' ? 'খাদ্য ও বাজার' : 'Food & Groceries');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [desc, setDesc] = useState('');

  // Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;
  const expenseCatMap: Record<string, number> = {};

  transactions.forEach(tr => {
    if (tr.type === 'income') {
      totalIncome += tr.amount;
    } else {
      totalExpense += tr.amount;
      const catName = tr.category || (lang === 'bn' ? 'অন্যান্য' : 'Other');
      expenseCatMap[catName] = (expenseCatMap[catName] || 0) + tr.amount;
    }
  });

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;
  const budgetPercent = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0;

  const expenseCategories = Object.keys(expenseCatMap);

  const getCatColor = (cat: string, index: number) => {
    if (CATEGORY_MAP[cat]) return CATEGORY_MAP[cat].color;
    for (const [k, v] of Object.entries(CATEGORY_MAP)) {
      if (cat.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(cat.toLowerCase())) {
        return v.color;
      }
    }
    return DISTINCT_COLORS[index % DISTINCT_COLORS.length];
  };

  // Render Doughnut Chart with distinct colors for each category
  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const labels = expenseCategories.length > 0 ? expenseCategories : [lang === 'bn' ? 'কোনো ব্যয় নেই' : 'No Expense'];
    const dataValues = expenseCategories.length > 0 ? expenseCategories.map(c => expenseCatMap[c]) : [1];
    const bgColors = expenseCategories.length > 0 ? expenseCategories.map((c, idx) => getCatColor(c, idx)) : ['#1f2430'];

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: dataValues,
          backgroundColor: bgColors,
          borderColor: '#0c0e14',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: expenseCategories.length > 0,
            callbacks: {
              label: (item) => {
                const val = item.raw as number;
                const pct = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;
                return ` ${currency} ${val.toLocaleString()} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [transactions, currency, lang, totalExpense]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount);
    if (!parsedAmt || parsedAmt <= 0) return;

    addTransaction({
      type,
      amount: parsedAmt,
      category,
      desc: desc.trim() || `${category}`
    });

    setAmount('');
    setDesc('');
  };

  const handleEditBudget = () => {
    const val = prompt(
      lang === 'bn' ? 'চলতি মাসের বাজেট লিমিট নির্ধারণ করুন (টাকা):' : 'Set your monthly budget cap:',
      monthlyBudget.toString()
    );
    if (val !== null) {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        setMonthlyBudget(num);
      }
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast(lang === 'bn' ? 'এক্সপোর্ট করার মতো কোনো লেনদেন নেই' : 'No transactions to export');
      return;
    }
    const headers = ['ID', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Date'];
    const rows = transactions.map(tr => [tr.id, tr.type, tr.category, `"${tr.desc.replace(/"/g, '""')}"`, tr.amount, currency, tr.date]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `nexus_finance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(lang === 'bn' ? 'ফিন্যান্স CSV এক্সপোর্ট সফল হয়েছে!' : 'Finance CSV exported successfully!');
  };

  const categoryOptions = lang === 'bn' ? [
    'খাদ্য ও বাজার',
    'বাড়ি ভাড়া ও ইউটিলিটি',
    'স্বাস্থ্য ও চিকিৎসা',
    'যাতায়াত ও পরিবহন',
    'বিনোদন ও রেস্তোরাঁ',
    'শিক্ষা ও বই',
    'দেনা ও কিস্তি',
    'পরিবার ও সন্তান',
    'অন্যান্য'
  ] : [
    'Food & Groceries',
    'Housing & Utilities',
    'Healthcare & Medical',
    'Transportation',
    'Dining & Entertainment',
    'Learning & Skills',
    'Debt & EMI',
    'Family & Household',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gray-950 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-lime-300 text-xs font-bold font-mono uppercase tracking-wider">
            PERSONAL FINANCE & WEALTH MANAGEMENT
          </span>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 mt-1">
            <Wallet className="text-lime-300 w-6 h-6" />
            <span>{t.financeTitle}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {t.financeSub}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-bold text-lime-300 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4 text-lime-300" />
          <span>{t.exportCsv}</span>
        </button>
      </div>

      {/* 2. THE EXACT USER-REQUESTED TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Add Transaction Form (5 Columns) */}
        <div className="panel p-6 lg:col-span-5 space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2 text-gray-100">
            <PlusCircle className="text-lime-300 w-4 h-4" />
            <span>{lang === 'bn' ? 'লেনদেন যুক্ত করুন' : 'Add Transaction'}</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    type === 'expense'
                      ? 'border-rose-500/60 bg-rose-500/10 text-rose-300 shadow-sm'
                      : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ব্যয়' : 'Expense'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    type === 'income'
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 shadow-sm'
                      : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'আয়' : 'Income'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-medium">{t.amountPlaceholder}</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-lime-300 font-bold text-sm">{currency}</span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="field pl-8 text-sm font-mono"
                  placeholder="e.g. 2500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-medium">{t.category}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="field text-xs font-medium"
                required
              >
                {categoryOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-medium">{lang === 'bn' ? 'তারিখ' : 'Date'}</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="field text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-medium">{lang === 'bn' ? 'বিবরণ' : 'Description'}</label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="e.g. Grocery supplies"
                  className="field text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>+ {lang === 'bn' ? 'লেনদেন সম্পন্ন করুন' : 'Commit Transaction'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Expense by Category with Distinct Colors (7 Columns) */}
        <div className="panel p-6 lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-100">
                <PieIcon className="text-lime-300 w-4 h-4" />
                <span>{lang === 'bn' ? 'ব্যয় বিভাজন (খাতভিত্তিক)' : 'Expense by Category'}</span>
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 bg-gray-800 text-gray-300 rounded-full font-mono border border-gray-700">
                {expenseCategories.length} {lang === 'bn' ? 'টি খাত' : 'Categories'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
              {/* Doughnut Chart Canvas with Center Total Text */}
              <div className="md:col-span-5 flex items-center justify-center relative h-52">
                <canvas ref={canvasRef}></canvas>
                <div className="absolute text-center pointer-events-none">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    {lang === 'bn' ? 'সর্বমোট ব্যয়' : 'TOTAL EXPENSE'}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-gray-100 font-mono">
                    {currency} {totalExpense.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Category Breakdown List with Colorful Dots and Distinct Underline Bars */}
              <div className="md:col-span-7 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {expenseCategories.length === 0 ? (
                  <div className="text-xs text-gray-500 py-10 text-center">
                    {lang === 'bn' ? 'কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি।' : 'No expense records found.'}
                  </div>
                ) : (
                  expenseCategories.map((cat, idx) => {
                    const val = expenseCatMap[cat];
                    const pct = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;
                    const color = getCatColor(cat, idx);

                    return (
                      <div
                        key={cat}
                        className="p-2.5 rounded-xl bg-gray-950/70 border border-gray-800/80 hover:border-gray-700 transition-all space-y-1.5"
                        style={{ borderLeft: `3px solid ${color}` }}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                            />
                            <span className="font-semibold text-gray-200 truncate">{cat}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-bold text-gray-200">{currency} {val.toLocaleString()}</span>
                            <span
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                              style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}40` }}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* Distinct Colored Underline Progress Bar */}
                        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800/80">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: color,
                              boxShadow: `0 0 6px ${color}60`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer of Category Card Matching Screenshot */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-gray-800/80 text-xs gap-2">
            <div className="flex items-center gap-1.5 text-lime-300">
              <ShieldCheck className="w-4 h-4 text-lime-300 shrink-0" />
              <span>
                {savingsRate >= 35 
                  ? (lang === 'bn' ? `উত্তম আর্থিক স্বাস্থ্য: ৩৫%+ সঞ্চয় মার্জিন নিশ্চিত (${savingsRate}%)` : `Prime financial health: Over 35% net savings margin maintained (${savingsRate}%)`)
                  : (lang === 'bn' ? `চলতি সঞ্চয় অনুপাত: ${savingsRate}%` : `Current savings margin: ${savingsRate}%`)}
              </span>
            </div>
            <button
              type="button"
              onClick={loadDemoData}
              className="text-lime-300 hover:text-lime-400 hover:underline font-medium text-xs flex items-center gap-1 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নমুনা ডাটা লোড করুন' : 'Load Sample Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MONTHLY BUDGET CAP & OVERSPEND ALERT BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-400/10 text-lime-300 flex items-center justify-center border border-lime-400/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  {t.monthlyBudgetCap}
                </h3>
                <button
                  onClick={handleEditBudget}
                  className="text-[11px] text-lime-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{t.editBudget}</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {lang === 'bn' ? 'টার্গেট:' : 'Target:'} <span className="font-bold text-gray-200">{currency} {monthlyBudget.toLocaleString()}</span> | {lang === 'bn' ? 'ব্যয়:' : 'Spent:'} <span className="font-bold text-rose-400">{currency} {totalExpense.toLocaleString()}</span> ({budgetPercent}%)
              </p>
            </div>
          </div>

          {/* Dynamic Status Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono border flex items-center gap-1.5 ${
            budgetPercent >= 100 
              ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse'
              : budgetPercent >= 80
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
          }`}>
            <span>
              {budgetPercent >= 100 
                ? (lang === 'bn' ? '⚠️ বাজেট অতিক্রম করেছে!' : '⚠️ Over Budget Limit!')
                : budgetPercent >= 80
                ? (lang === 'bn' ? '⚡ সতর্কবার্তা: ৮০%+ ব্যয়' : '⚡ Warning: 80%+ Spent')
                : (lang === 'bn' ? '✅ বাজেট নিয়ন্ত্রণে রয়েছে' : '✅ Budget Safe')}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetPercent >= 100 
                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : budgetPercent >= 80
                ? 'bg-gradient-to-r from-amber-400 to-rose-400'
                : 'bg-gradient-to-r from-emerald-400 to-lime-400'
            }`}
            style={{ width: `${Math.min(100, budgetPercent)}%` }}
          />
        </div>
      </div>

      {/* 4. 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.income}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {currency} {totalIncome.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.expense}</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {currency} {totalExpense.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.netCashBalance}</span>
            <Scale className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-2xl font-bold font-mono mt-2 ${balance >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
            {currency} {balance.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{lang === 'bn' ? 'সঞ্চয়ের হার' : 'Savings Rate'}</span>
            <Target className="w-4 h-4 text-lime-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-lime-300 mt-2">
            {savingsRate}%
          </div>
        </div>
      </div>

      {/* 5. RECENT TRANSACTIONS LEDGER */}
      <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <h3 className="text-sm font-bold text-gray-100">{t.recentTransactions}</h3>
          <span className="text-xs font-mono text-gray-400">{transactions.length} {lang === 'bn' ? 'টি এন্ট্রি' : 'records'}</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-xs">
            {t.noTransactions}
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(tr => (
              <div
                key={tr.id}
                className="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    tr.type === 'income' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'
                  }`}>
                    {tr.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-200">{tr.desc}</h4>
                    <span className="text-[10px] text-gray-400">{tr.category} • {tr.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold text-sm ${
                    tr.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tr.type === 'income' ? '+' : '-'}{currency} {tr.amount.toLocaleString()}
                  </span>

                  <button
                    onClick={() => deleteTransaction(tr.id)}
                    className="text-gray-500 hover:text-rose-400 p-1"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
