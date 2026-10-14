import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, Flame, CheckCircle2, Circle, 
  Zap, Wallet, CheckSquare, Activity, Plus,
  Compass, BatteryCharging, Sun, Moon, ArrowUpRight, Award, ShieldCheck, Clock
} from 'lucide-react';
import { parseNaturalLanguage, ParsedNLPResult } from '../../utils/nlp';
import { useTranslation } from '../../utils/i18n';
import { getCircadianPhase, calculateDaysRemaining, calculateProfileCompletion } from '../../utils/profile';

export const DashboardModule: React.FC = () => {
  const { 
    activeAccount, currency, lang, habitStreak, 
    tasks, transactions, waterMl, isFocusMode, setIsFocusMode,
    ruleOf3, toggleRuleOf3, updateRuleOf3Text,
    addTask, addTransaction, showToast, openProfileWizard
  } = useApp();

  const t = useTranslation(lang);
  const [now, setNow] = useState(new Date());
  const [nlpInput, setNlpInput] = useState('');
  const [nlpPreview, setNlpPreview] = useState<ParsedNLPResult | null>(null);
  const [eveningText, setEveningText] = useState(() => localStorage.getItem('nexus_evening_win') || '');
  const [dailyMood, setDailyMood] = useState(() => localStorage.getItem('nexus_daily_mood') || '⚡ Energized');

  // Update clock every 30 seconds for live circadian cadence
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute live bio-metrics & strategic indicators
  const circadian = getCircadianPhase(activeAccount.profileDetails, now);
  const profileStats = calculateProfileCompletion(activeAccount);
  const northStar = activeAccount.profileDetails?.northStarGoal;
  const deadlineInfo = calculateDaysRemaining(activeAccount.profileDetails?.northStarDeadline);

  // Calculate quick KPIs
  const completedTasks = tasks.filter(t => t.done).length;
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(tr => {
    if (tr.type === 'income') totalIncome += tr.amount;
    else totalExpense += tr.amount;
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
    showToast(t.reflectionSaved);
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Welcome & Focus Header */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            <span className="text-[11px] font-mono text-lime-300 uppercase tracking-wider font-bold">
              {activeAccount.role.toUpperCase()} {t.commandCenter}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold font-mono flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>{habitStreak} {t.streak}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 tracking-tight">
            {t.welcomeBack}, {activeAccount.name}!
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {t.dashboardSub}
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
          <span>{isFocusMode ? t.focusModeOn : t.focusModeOff}</span>
        </button>
      </div>

      {/* 2. CIRCADIAN BIOLOGICAL CADENCE & 1-YEAR NORTH STAR COMPASS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Circadian Cadence Arc (7 Cols) */}
        <div className={`lg:col-span-7 p-6 rounded-3xl bg-gradient-to-br ${circadian.bgGradient} border ${circadian.accentBorder} space-y-4 shadow-xl relative overflow-hidden transition-all`}>
          {/* Top Pill & Chronotype */}
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg bg-gray-900/90 border border-gray-800 ${circadian.colorClass}`}>
                <BatteryCharging className="w-4 h-4 animate-pulse" />
              </span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-300">
                {lang === 'bn' ? 'সারকাডিয়ান বায়ো-ক্যাডেন্স' : 'CIRCADIAN BIO-CADENCE'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-900/80 border border-gray-800 text-gray-400">
                {activeAccount.profileDetails?.chronotype === 'lark' ? '🦁 Early Lark' : activeAccount.profileDetails?.chronotype === 'owl' ? '🦉 Night Owl' : '⚖️ Balanced Cadence'}
              </span>
            </div>

            {/* Energy Score Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-950/80 border border-gray-800/80 text-xs font-mono">
              <span className="text-gray-400 text-[10px] uppercase font-bold">{lang === 'bn' ? 'শক্তি' : 'Energy'}:</span>
              <span className={`font-bold ${circadian.colorClass}`}>{circadian.energyLevelPercent}%</span>
            </div>
          </div>

          {/* Phase Title & Biological Advice */}
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-100 flex items-center gap-2">
              <span>{lang === 'bn' ? circadian.phaseNameBn : circadian.phaseNameEn}</span>
            </h3>
            <p className="text-xs text-gray-300 font-medium mt-1 leading-relaxed">
              {lang === 'bn' ? circadian.optimalFocusBn : circadian.optimalFocusEn}
            </p>
          </div>

          {/* 24-Hour Circadian Phase Progress Arc */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>{activeAccount.profileDetails?.targetWakeTime || '07:30'} {lang === 'bn' ? 'জাগরণ' : 'Wake'}</span>
              </span>
              <span className="text-lime-300 font-bold">
                {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')} ({circadian.progressPercent}% {lang === 'bn' ? 'দিন অতিক্রান্ত' : 'of Day'})
              </span>
              <span className="flex items-center gap-1">
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>{activeAccount.profileDetails?.targetSleepTime || '23:30'} {lang === 'bn' ? 'ঘুম' : 'Sleep'}</span>
              </span>
            </div>

            {/* Visual Arc / Track */}
            <div className="w-full h-2.5 rounded-full bg-gray-950/90 border border-gray-800 relative overflow-hidden flex">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-lime-400 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${circadian.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Bio Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-800/60 text-[11px]">
            <div className="p-2 rounded-xl bg-gray-900/60 border border-gray-800/80">
              <div className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'bn' ? 'পানি লক্ষ্য' : 'Water Target'}</div>
              <div className="font-bold font-mono text-cyan-300 mt-0.5">
                {waterMl} / {activeAccount.profileDetails?.targetWaterMl || 2500} ml
              </div>
            </div>
            <div className="p-2 rounded-xl bg-gray-900/60 border border-gray-800/80">
              <div className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'bn' ? 'ফোকাস লক্ষ্য' : 'Focus Target'}</div>
              <div className="font-bold font-mono text-lime-300 mt-0.5">
                {activeAccount.profileDetails?.dailyFocusHoursTarget || 4}h {lang === 'bn' ? 'ডিপ-ওয়ার্ক' : 'Deep Work'}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-gray-900/60 border border-gray-800/80">
              <div className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'bn' ? 'বায়ো-লেভেল' : 'Bio Score'}</div>
              <div className="font-bold font-mono text-amber-300 mt-0.5">
                {profileStats.percentage}% {lang === 'bn' ? 'কমপ্লিট' : 'Ready'}
              </div>
            </div>
          </div>
        </div>

        {/* 1-Year North Star Strategic Compass Card (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900/90 to-gray-950 border border-gray-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-lime-400/10 border border-lime-400/20 text-lime-300">
                  <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '24s' }} />
                </span>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-lime-300">
                    {lang === 'bn' ? '১ বছরের নর্থ স্টার কম্পাস' : '1-YEAR NORTH STAR'}
                  </h3>
                  <div className="text-[10px] text-gray-400">
                    {lang === 'bn' ? 'কৌশলগত দীর্ঘমেয়াদী দিকনির্দেশনা' : 'Strategic Long-term Anchor'}
                  </div>
                </div>
              </div>

              {/* Profile Badge */}
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${profileStats.levelBadgeColor}`}>
                {lang === 'bn' ? profileStats.levelTitleBn : profileStats.levelTitleEn}
              </span>
            </div>

            {/* North Star Content */}
            <div className="mt-4 p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
              {northStar ? (
                <>
                  <div className="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center justify-between">
                    <span>{lang === 'bn' ? 'মূল লক্ষ্য:' : 'Strategic Anchor:'}</span>
                    {deadlineInfo && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${deadlineInfo.isOverdue ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30' : 'bg-lime-950/60 text-lime-300 border border-lime-500/30'}`}>
                        ⏳ {lang === 'bn' ? deadlineInfo.labelBn : deadlineInfo.labelEn}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-100 italic leading-snug">
                    "{northStar}"
                  </p>
                  <p className="text-[11px] text-gray-400 pt-1">
                    {lang === 'bn' 
                      ? 'প্রতিদিনের প্রতিটি সম্পন্ন কাজ ও অভ্যাস আপনাকে এই গন্তব্যের কাছে নিয়ে যাচ্ছে।' 
                      : 'Every completed Rule of 3 task and habit directly compounds toward this horizon.'}
                  </p>
                </>
              ) : (
                <div className="text-center py-2 space-y-2">
                  <p className="text-xs text-gray-300">
                    {lang === 'bn' 
                      ? 'আপনার কোন নর্থ স্টার গোল সেট করা নেই। দীর্ঘমেয়াদী ফোকাসের জন্য এখনই ১টি লক্ষ্য নির্ধারণ করুন।' 
                      : 'No North Star goal defined yet. Align your daily execution with a singular strategic anchor.'}
                  </p>
                  <button
                    onClick={openProfileWizard}
                    className="px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-gray-950 font-bold text-xs transition-all inline-flex items-center gap-1 shadow-sm"
                  >
                    <span>{lang === 'bn' ? 'নর্থ স্টার নির্ধারণ করুন' : 'Define North Star'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Completeness CTA Footer */}
          <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-lime-400" />
              <div className="text-[11px] text-gray-300 font-medium">
                {lang === 'bn' ? 'প্রোফাইল কমপ্লিট:' : 'Bio Profile:'}{' '}
                <span className="font-mono font-bold text-lime-300">{profileStats.percentage}%</span>
              </div>
            </div>

            <button
              onClick={openProfileWizard}
              className="text-xs font-semibold text-lime-300 hover:text-lime-200 transition-colors flex items-center gap-1 group"
            >
              <span>{lang === 'bn' ? 'বায়ো-ক্যাডেন্স এডিট' : 'Bio-Cadence Setup'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. 4 Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tasks */}
        <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800/80 hover:border-lime-400/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t.tasksProgress}
            </span>
            <CheckSquare className="w-4 h-4 text-lime-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-100 mt-2">
            {completedTasks} / {tasks.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {tasks.length - completedTasks} {t.pendingDeadlines}
          </div>
        </div>

        {/* KPI 2: Net Cash Balance */}
        <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800/80 hover:border-emerald-400/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t.netCashBalance}
            </span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-2">
            {currency} {balance.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {currency} {totalExpense.toLocaleString()} {t.totalOutflow}
          </div>
        </div>

        {/* KPI 3: Habit Streak */}
        <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800/80 hover:border-amber-400/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t.consistency}
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-2">
            {habitStreak} {t.streak}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {t.streakSubtitle}
          </div>
        </div>

        {/* KPI 4: Hydration */}
        <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800/80 hover:border-cyan-400/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t.waterVitality}
            </span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-2">
            {waterMl} ml
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {t.waterGoal}
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
                RULE OF 3
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-100 mt-0.5">
              {t.ruleOf3Title}
            </h2>
            <p className="text-xs text-gray-400">
              {t.ruleOf3Sub}
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-gray-900 border border-lime-400/30 text-lime-300">
            {ruleOf3.filter(r => r.done).length} / 3 {lang === 'bn' ? 'সম্পন্ন' : 'Completed'}
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
                  #{idx + 1} {lang === 'bn' ? 'অগ্রাধিকার' : 'Priority'}
                </span>
                <button
                  onClick={() => toggleRuleOf3(item.id)}
                  className={`text-xs px-2.5 py-0.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    item.done ? 'bg-lime-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  <span>{item.done ? (lang === 'bn' ? '✓ সম্পন্ন' : '✓ Done') : (lang === 'bn' ? 'সম্পন্ন করুন' : 'Mark Done')}</span>
                </button>
              </div>
              <input
                type="text"
                value={item.text}
                onChange={e => updateRuleOf3Text(item.id, e.target.value)}
                className={`bg-transparent border-0 text-xs font-medium text-gray-200 focus:outline-none focus:ring-1 focus:ring-lime-300 rounded px-1 w-full ${
                  item.done ? 'line-through text-gray-500' : ''
                }`}
                placeholder={lang === 'bn' ? `অগ্রাধিকার #${idx + 1}...` : `Priority #${idx + 1}...`}
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
                <span>{t.smartCaptureTitle}</span>
                <span className="text-[9px] font-mono bg-lime-400/10 text-lime-300 px-1.5 py-0.5 rounded border border-lime-400/20">AI</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                {t.smartCaptureSub}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleNlpSubmit} className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={nlpInput}
              onChange={handleNlpChange}
              className="field py-3 pl-3.5 pr-24 text-xs font-medium bg-gray-900 border-gray-800 focus:border-lime-300 w-full rounded-2xl"
              placeholder={t.capturePlaceholder}
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-2 bg-lime-300 hover:bg-lime-400 text-gray-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addSmartItem}</span>
            </button>
          </div>

          {/* Real-time Live Preview Pill */}
          {nlpPreview && (
            <div className="text-xs py-2 px-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between animate-in fade-in">
              <span className="font-mono">
                {nlpPreview.type === 'expense' ? (
                  <>
                    <span className="text-rose-400 font-bold">💸 {t.detectedExpense}:</span>{' '}
                    <span className="text-emerald-300 font-bold">{currency} {nlpPreview.amount?.toLocaleString()}</span>{' '}
                    <span className="text-gray-400">({nlpPreview.category})</span>
                  </>
                ) : (
                  <>
                    <span className="text-lime-300 font-bold">✓ {t.detectedTask}:</span>{' '}
                    <span className="text-gray-200">{nlpPreview.text}</span>
                  </>
                )}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {lang === 'bn' ? 'যুক্ত করতে Enter চাপুন ↵' : 'Press Enter ↵ to commit'}
              </span>
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
                {t.eveningTitle}
              </h3>
              <p className="text-[11px] text-gray-400">
                {t.eveningSub}
              </p>
            </div>
          </div>

          {/* Mood Emojis */}
          <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800">
            {['⚡', '🎯', '☕', '😴'].map(m => (
              <button
                key={m}
                onClick={() => { setDailyMood(m); showToast(`${t.howEnergy} ${m}`); }}
                className={`px-2 py-1 rounded text-xs transition-all ${dailyMood === m ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-gray-400 hover:text-white'}`}
                title={m}
              >
                {m}
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
            placeholder={t.eveningPlaceholder}
          />
          <button
            onClick={handleSaveEvening}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1"
          >
            <span>{t.saveReflection}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
