import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, Flame, CheckCircle2, Circle, ArrowRight, 
  Moon, Zap, Wallet, CheckSquare, Activity, Plus
} from 'lucide-react';
import { parseNaturalLanguage, ParsedNLPResult } from '../../utils/nlp';

export const DashboardModule: React.FC = () => {
  const { 
    activeAccount, currency, lang, habitStreak, 
    tasks, transactions, waterMl, isFocusMode, setIsFocusMode,
    ruleOf3, toggleRuleOf3, updateRuleOf3Text,
    addTask, addTransaction, showToast
  } = useApp();

  const [nlpInput, setNlpInput] = useState('');
  const [nlpPreview, setNlpPreview] = useState<ParsedNLPResult | null>(null);
  const [eveningText, setEveningText] = useState(() => localStorage.getItem('nexus_evening_win') || '');
  const [dailyMood, setDailyMood] = useState(() => localStorage.getItem('nexus_daily_mood') || '⚡ Energized');

  // Calculate quick KPIs
  const completedTasks = tasks.filter(t => t.done).length;
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpense += t.amount;
  });
  const balance = totalIncome - totalExpense;

  const handleNlpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNlpInput(val);
    setNlpPreview(parseNaturalLanguage(val, currency));
  };

  const handleNlpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpInput.trim() || !nlpPreview) return;

    if (nlpPreview.type === 'expense') {
      addTransaction({
        type: 'expense',
        amount: nlpPreview.amount || 0,
        category: nlpPreview.category || 'Other',
        desc: nlpPreview.desc || nlpInput
      });
    } else {
      addTask(nlpPreview.text || nlpInput, nlpPreview.priority || 'medium');
    }

    setNlpInput('');
    setNlpPreview(null);
  };

  const handleSaveEvening = () => {
    if (!eveningText.trim()) return;
    localStorage.setItem('nexus_evening_win', eveningText);
    localStorage.setItem('nexus_daily_mood', dailyMood);
    showToast(lang === 'bn' ? 'সন্ধ্যার আত্মপর্যালোচনা সংরক্ষিত হয়েছে!' : 'Evening reflection saved!');
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Welcome & Focus Header */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            <span className="text-[11px] font-mono text-lime-300 uppercase tracking-wider font-bold">
              {activeAccount.role.toUpperCase()} COMMAND CENTER
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold font-mono flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>{habitStreak} Days Streak</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 tracking-tight">
            {lang === 'bn' ? `শুভ সময়, ${activeAccount.name}!` : `Welcome back, ${activeAccount.name}!`}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {lang === 'bn' 
              ? 'দৈনিক অগ্রাধিকার, আর্থিক স্বচ্ছতা এবং পুষ্টিকর অভ্যাসের ব্যক্তিগত কমান্ড সেন্টার।' 
              : 'Unified life cockpit: tracking clarity, finances, and circadian vitality.'}
          </p>
        </div>

        {/* Focus Mode Toggle */}
        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
            isFocusMode 
              ? 'bg-lime-400 text-gray-950 shadow-lime-400/20' 
              : 'bg-gray-900 border border-gray-800 text-lime-300 hover:border-lime-400/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isFocusMode ? (lang === 'bn' ? '⚡ ফোকাস মোড: সক্রিয়' : '⚡ Focus Mode: ON') : (lang === 'bn' ? '⚡ ফোকাস মোড' : '⚡ Daily Essentials')}</span>
        </button>
      </div>

      {/* 2. 4 Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tasks */}
        <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800/80 hover:border-lime-400/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {lang === 'bn' ? 'কাজের অগ্রগতি' : 'Tasks & Progress'}
            </span>
            <CheckSquare className="w-4 h-4 text-lime-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-100 mt-2">
            {completedTasks} / {tasks.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {tasks.length - completedTasks} {lang === 'bn' ? 'টি কাজ বাকি' : 'pending deadlines'}
          </div>
        </div>

        {/* KPI 2: Net Cash Balance */}
        <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800/80 hover:border-emerald-400/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {lang === 'bn' ? 'নেট ক্যাশ ব্যালেন্স' : 'Net Cash Balance'}
            </span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-2">
            {currency} {balance.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {currency} {totalExpense.toLocaleString()} {lang === 'bn' ? 'চলতি খরচ' : 'total outflow'}
          </div>
        </div>

        {/* KPI 3: Habit Streak */}
        <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800/80 hover:border-amber-400/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {lang === 'bn' ? 'ধারাবাহিক স্ট্রিক' : 'Habit Momentum'}
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-2">
            {habitStreak} Days 🔥
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {lang === 'bn' ? 'প্রতিদিন অভ্যাসের সক্রিয়তা' : 'Consistency is victory'}
          </div>
        </div>

        {/* KPI 4: Hydration */}
        <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800/80 hover:border-cyan-400/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {lang === 'bn' ? 'দৈনিক হাইড্রেশন' : 'Daily Hydration'}
            </span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-2">
            {waterMl} ml
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {Math.round((waterMl / 2500) * 100)}% {lang === 'bn' ? 'টার্গেট পূরণ' : 'of 2,500 ml target'}
          </div>
        </div>
      </div>

      {/* 3. MORNING RULE OF 3 */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-lime-950/20 via-gray-950 to-gray-950 border border-lime-400/30 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase font-bold text-lime-300 tracking-wider">
                DAILY CLARITY • RULE OF 3
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-100 mt-0.5">
              {lang === 'bn' ? 'আজকের ৩টি প্রধান লক্ষ্য (Rule of 3)' : "Today's 3 Critical Priorities (Rule of 3)"}
            </h2>
            <p className="text-xs text-gray-400">
              {lang === 'bn' ? 'সারাদিন বিজয়ী হতে এই ৩টি কাজ সবার আগে সম্পন্ন করুন।' : 'Win the day by conquering these 3 non-negotiables before anything else.'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-gray-900 border border-lime-400/30 text-lime-300">
            {ruleOf3.filter(r => r.done).length} / 3 {lang === 'bn' ? 'সম্পন্ন' : 'Conquered'}
          </span>
        </div>

        {/* 3 Priority Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ruleOf3.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl bg-gray-900/90 border transition-all space-y-2 ${
                item.done ? 'border-lime-400/40 bg-lime-950/15' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  item.done ? 'bg-lime-400 text-gray-950' : 'bg-gray-800 text-gray-400'
                }`}>
                  #{idx + 1} Priority
                </span>
                <button
                  onClick={() => toggleRuleOf3(item.id)}
                  className={`text-xs px-2.5 py-0.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    item.done ? 'bg-lime-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  <span>{item.done ? '✓ Done' : 'Mark Done'}</span>
                </button>
              </div>
              <input
                type="text"
                value={item.text}
                onChange={e => updateRuleOf3Text(item.id, e.target.value)}
                className={`bg-transparent border-0 text-xs font-medium text-gray-200 focus:outline-none focus:ring-1 focus:ring-lime-300 rounded px-1 w-full ${
                  item.done ? 'line-through text-gray-500' : ''
                }`}
                placeholder={`Priority #${idx + 1}...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. SMART NATURAL LANGUAGE (NLP) QUICK CAPTURE */}
      <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800/90 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-400/10 text-lime-300 flex items-center justify-center border border-lime-400/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
                <span>{lang === 'bn' ? 'স্মার্ট কুইক ক্যাপচার' : 'Smart Natural Language Capture'}</span>
                <span className="text-[9px] font-mono bg-lime-400/10 text-lime-300 px-1.5 py-0.5 rounded border border-lime-400/20">AI Heuristic</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                {lang === 'bn' ? 'মুখে বলার মতো লিখুন—খরচ বা প্রায়োরিটি কাজ স্বয়ংক্রিয়ভাবে শনাক্ত হবে।' : 'Type expenses or tasks naturally—automatically categorized and saved.'}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            Examples: <span className="text-lime-300">"কাচ্চি ৩৫০"</span> • <span className="text-cyan-300">"উবার ১২০"</span> • <span className="text-amber-300">"সন্ধ্যায় মিটিং"</span>
          </div>
        </div>

        <form onSubmit={handleNlpSubmit} className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={nlpInput}
              onChange={handleNlpChange}
              className="field py-3 pl-3.5 pr-24 text-xs font-medium bg-gray-900 border-gray-800 focus:border-lime-300 w-full rounded-2xl"
              placeholder={lang === 'bn' ? "যেমন: 'দুপুরে কাচ্চি ৩৫০ টাকা' বা 'কাল বিকাল ৪টায় মিটিং'..." : "e.g. 'Lunch 350 bdt' or 'Meeting tomorrow at 4pm'..."}
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-2 bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
          </div>

          {/* Real-time Live Preview Pill */}
          {nlpPreview && (
            <div className="text-xs py-2 px-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between animate-in fade-in">
              <span className="font-mono">
                {nlpPreview.type === 'expense' ? (
                  <>
                    <span className="text-rose-400 font-bold">💸 Expense:</span>{' '}
                    <span className="text-emerald-300 font-bold">{currency} {nlpPreview.amount?.toLocaleString()}</span>{' '}
                    <span className="text-gray-400">({nlpPreview.category})</span>
                  </>
                ) : (
                  <>
                    <span className="text-lime-300 font-bold">✓ Task:</span>{' '}
                    <span className="text-gray-200">{nlpPreview.text}</span>
                  </>
                )}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Press Enter ↵ to commit</span>
            </div>
          )}
        </form>
      </div>

      {/* 5. EVENING REFLECTION & DAILY WIN */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/20 via-gray-950 to-gray-950 border border-purple-500/20 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌙</span>
            <div>
              <h3 className="text-sm font-bold text-gray-100">
                {lang === 'bn' ? 'সন্ধ্যার আত্মপর্যালোচনা ও দিনের প্রাপ্তি' : 'Evening Reflection & Daily Win'}
              </h3>
              <p className="text-[11px] text-gray-400">
                {lang === 'bn' ? 'দিনের শেষে নিজের প্রাপ্তি ও কৃতজ্ঞতা লিপিবদ্ধ করুন।' : 'Close your day with intentional gratitude and habit satisfaction.'}
              </p>
            </div>
          </div>

          {/* Mood Emojis */}
          <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800">
            {['⚡ Energized', '🎯 Productive', '☕ Balanced', '😴 Exhausted'].map(m => (
              <button
                key={m}
                onClick={() => { setDailyMood(m); showToast(`Mood logged: ${m}`); }}
                className={`px-2 py-1 rounded text-xs transition-all ${dailyMood === m ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-gray-400 hover:text-white'}`}
                title={m}
              >
                {m.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={eveningText}
            onChange={e => setEveningText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveEvening()}
            className="field flex-1 text-xs py-2.5 bg-gray-900 border-gray-800 rounded-xl"
            placeholder={lang === 'bn' ? "আজকের সবচেয়ে বড় প্রাপ্তি বা শিক্ষা কী ছিল?..." : "Write today's biggest win or lesson learned..."}
          />
          <button
            onClick={handleSaveEvening}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1"
          >
            <span>Save Win</span>
          </button>
        </div>
      </div>
    </div>
  );
};
