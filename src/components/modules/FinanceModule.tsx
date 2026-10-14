import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, TrendingUp, TrendingDown, Scale, Target, 
  Download, Plus, Trash2, Edit3 
} from 'lucide-react';
import { useTranslation } from '../../utils/i18n';

const EXPENSE_CATEGORIES_EN = [
  'Housing', 'Food', 'Transportation', 'Utilities', 
  'Healthcare', 'Learning', 'Entertainment', 'Debt/EMI', 'Other'
];

const EXPENSE_CATEGORIES_BN = [
  'বাসা ভাড়া', 'খাবার ও বাজার', 'যাতায়াত', 'বিল ও ইউটিলিটি', 
  'চিকিৎসা', 'শিক্ষা', 'বিনোদন', 'ঋণ / ইএমআই', 'অন্যান্য'
];

export const FinanceModule: React.FC = () => {
  const { 
    currency, transactions, addTransaction, deleteTransaction, 
    monthlyBudget, setMonthlyBudget, lang, showToast 
  } = useApp();

  const t = useTranslation(lang);
  const categories = lang === 'bn' ? EXPENSE_CATEGORIES_BN : EXPENSE_CATEGORIES_EN;

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[1]); // Default Food
  const [desc, setDesc] = useState('');

  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(tr => {
    if (tr.type === 'income') totalIncome += tr.amount;
    else totalExpense += tr.amount;
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

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gray-950 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-lime-300 text-xs font-bold font-mono uppercase tracking-wider">
            FINANCE & WEALTH
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

      {/* 3. 4 KPI CARDS */}
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

      {/* 4. TRANSACTION ENTRY FORM */}
      <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-lime-300" />
          <span>{t.addTransaction}</span>
        </h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-2 flex bg-gray-900 border border-gray-800 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white' : 'text-gray-400'
              }`}
            >
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                type === 'income' ? 'bg-emerald-500 text-white' : 'text-gray-400'
              }`}
            >
              {t.income}
            </button>
          </div>

          <input
            type="number"
            step="any"
            required
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={t.amountPlaceholder}
            className="field sm:col-span-2 py-2.5 font-mono"
          />

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="field sm:col-span-3 py-2.5"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder={t.descPlaceholder}
            className="field sm:col-span-4 py-2.5"
          />

          <button
            type="submit"
            className="sm:col-span-1 bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold py-2.5 rounded-xl transition-all"
          >
            {lang === 'bn' ? 'যুক্ত' : 'Add'}
          </button>
        </form>
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
