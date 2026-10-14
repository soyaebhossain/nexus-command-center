import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, TrendingUp, TrendingDown, Scale, Target, 
  Download, Plus, Trash2, Edit3 
} from 'lucide-react';
import { downloadJSON } from '../../utils/storage';

const EXPENSE_CATEGORIES = [
  'Housing', 'Food', 'Transportation', 'Utilities', 
  'Healthcare', 'Learning', 'Entertainment', 'Debt/EMI', 'Other'
];

export const FinanceModule: React.FC = () => {
  const { 
    currency, transactions, addTransaction, deleteTransaction, 
    monthlyBudget, setMonthlyBudget, lang, showToast 
  } = useApp();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [desc, setDesc] = useState('');

  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpense += t.amount;
  });
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  // Monthly Budget Cap Calculations
  const budgetPercent = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount);
    if (!parsedAmt || parsedAmt <= 0) return;

    addTransaction({
      type,
      amount: parsedAmt,
      category,
      desc: desc.trim() || `${category} entry`
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
      showToast('No transactions to export');
      return;
    }
    const headers = ['ID', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Date'];
    const rows = transactions.map(t => [t.id, t.type, t.category, `"${t.desc.replace(/"/g, '""')}"`, t.amount, currency, t.date]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `nexus_finance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Finance CSV exported successfully!');
  };

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
            <span>{lang === 'bn' ? 'আয়, ব্যয়, সঞ্চয় ও মাসিক বাজেট' : 'Income, Expenses & Wealth Management'}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {lang === 'bn' ? 'আর্থিক স্বচ্ছতা ও শৃঙ্খলা নিশ্চিত করতে আয়-ব্যয়ের বাস্তব চিত্র পর্যবেক্ষণ করুন।' : 'Real-time cashflow analysis, expense category breakdown, and monthly budget limits.'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-bold text-lime-300 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4 text-lime-300" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 2. MONTHLY BUDGET CAP & OVERSPEND ALERT BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-400/10 text-lime-300 flex items-center justify-center border border-lime-400/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  {lang === 'bn' ? 'মাসিক বাজেট লক্ষ্য (Monthly Budget Cap)' : 'Monthly Budget Cap Target'}
                </h3>
                <button
                  onClick={handleEditBudget}
                  className="text-[11px] text-lime-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Target</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Target: <span className="font-bold text-gray-200">{currency} {monthlyBudget.toLocaleString()}</span> | Spent: <span className="font-bold text-rose-400">{currency} {totalExpense.toLocaleString()}</span> ({budgetPercent}%)
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
                ? (lang === 'bn' ? '⚡ সতর্কবার্তা: ৮০%+ ব্যয়' : '⚡ Warning: 80%+ Budget Spent')
                : (lang === 'bn' ? '✅ বাজেট নিয়ন্ত্রণে রয়েছে' : '✅ On Track (Safe)')}
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

      {/* 3. 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {currency} {totalIncome.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Expense</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {currency} {totalExpense.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Balance</span>
            <Scale className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-2">
            {currency} {balance.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Savings Margin</span>
            <span className="text-xs font-bold font-mono text-lime-300">{savingsRate}%</span>
          </div>
          <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-lime-400 h-full rounded-full" style={{ width: `${Math.min(100, savingsRate)}%` }} />
          </div>
        </div>
      </div>

      {/* 4. TRANSACTION ENTRY & LEDGER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Entry Form */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-lime-300" />
            <span>Record Transaction (লেনদেন যুক্ত করুন)</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
            <div>
              <label className="text-gray-400 block mb-1">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    type === 'expense' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-gray-900 text-gray-400 border border-gray-800'
                  }`}
                >
                  Expense (খরচ)
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    type === 'income' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-900 text-gray-400 border border-gray-800'
                  }`}
                >
                  Income (আয়)
                </button>
              </div>
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Amount ({currency})</label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="field text-xs py-2 font-mono w-full"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="field text-xs py-2 w-full"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Note / Description</label>
              <input
                type="text"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="e.g. Grocery bazaar / Coffee meeting"
                className="field text-xs py-2 w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold rounded-xl transition-all"
            >
              Add to Ledger
            </button>
          </form>
        </div>

        {/* Transaction History Table */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-100">
              Recent Transactions ({transactions.length})
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">Real-time ledger</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <div className="text-xs text-gray-500 py-8 text-center">No transactions recorded yet.</div>
            ) : (
              transactions.map(t => (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-gray-900 border border-gray-800 flex justify-between items-center text-xs hover:border-gray-700 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-gray-200">{t.desc}</div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {t.category} • {t.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{currency} {t.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="text-gray-500 hover:text-rose-400 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
