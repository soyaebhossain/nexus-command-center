import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Sparkles, Activity, ShieldCheck, HeartPulse, 
  Droplets, Moon, Sun, Briefcase, Wallet, Target, 
  Check, ArrowRight, Award, Zap, HelpCircle, Coffee,
  Flame, BookOpen, Clock, Dumbbell, Compass, Sunrise,
  Layers, RefreshCw
} from 'lucide-react';
import { 
  calculateBMI, calculateWaterTarget, calculateSleepDuration, 
  calculateProfileCompletion, BMIEstimate,
  calculateBMR, calculateTDEE, calculateCaffeineCurfew,
  calculateFastingWindow, calculateZone2HR, calculateUltradianBlocks
} from '../../utils/profile';
import { playCelebrationArpeggio, playChime } from '../../utils/audio';

type TabKey = 'bio' | 'circadian' | 'career' | 'finance' | 'goal';

export const ProfileWizardModal: React.FC = () => {
  const { 
    isProfileWizardOpen, closeProfileWizard, activeAccount, 
    updateProfileDetails, currency, lang, showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('bio');

  // Form states initialized from current account's profileDetails
  const current = activeAccount.profileDetails || {};

  const [age, setAge] = useState<number | ''>(current.age || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(current.gender || 'male');
  const [heightCm, setHeightCm] = useState<number | ''>(current.heightCm || '');
  const [weightKg, setWeightKg] = useState<number | ''>(current.weightKg || '');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very_active'>(current.activityLevel || 'moderate');

  const [sleepTime, setSleepTime] = useState<string>(current.targetSleepTime || '23:30');
  const [wakeTime, setWakeTime] = useState<string>(current.targetWakeTime || '07:30');
  const [chronotype, setChronotype] = useState<'lark' | 'owl' | 'balanced'>(current.chronotype || 'balanced');
  const [fastingProtocol, setFastingProtocol] = useState<'none' | '12_12' | '14_10' | '16_8'>(current.fastingProtocol || '14_10');
  const [morningLight, setMorningLight] = useState<number | ''>(current.morningLightMinutesTarget || 15);

  const [profession, setProfession] = useState<string>(current.profession || '');
  const [workStyle, setWorkStyle] = useState<'remote' | 'hybrid' | 'onsite'>(current.workStyle || 'hybrid');
  const [dailyFocusHours, setDailyFocusHours] = useState<number | ''>(current.dailyFocusHoursTarget || 4);
  const [zone2Target, setZone2Target] = useState<number | ''>(current.weeklyZone2MinutesTarget || 150);

  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>(current.monthlyIncome || '');
  const [savingsTarget, setSavingsTarget] = useState<number | ''>(current.savingsTargetPercent || 20);
  const [emergencyMonths, setEmergencyMonths] = useState<number | ''>(current.emergencyFundMonths || 6);

  const [northStar, setNorthStar] = useState<string>(current.northStarGoal || '');
  const [northStarDate, setNorthStarDate] = useState<string>(current.northStarDeadline || '');

  // Reset form when activeAccount changes
  useEffect(() => {
    const p = activeAccount.profileDetails || {};
    setAge(p.age || '');
    setGender(p.gender || 'male');
    setHeightCm(p.heightCm || '');
    setWeightKg(p.weightKg || '');
    setActivityLevel(p.activityLevel || 'moderate');
    setSleepTime(p.targetSleepTime || '23:30');
    setWakeTime(p.targetWakeTime || '07:30');
    setChronotype(p.chronotype || 'balanced');
    setFastingProtocol(p.fastingProtocol || '14_10');
    setMorningLight(p.morningLightMinutesTarget || 15);
    setProfession(p.profession || '');
    setWorkStyle(p.workStyle || 'hybrid');
    setDailyFocusHours(p.dailyFocusHoursTarget || 4);
    setZone2Target(p.weeklyZone2MinutesTarget || 150);
    setMonthlyIncome(p.monthlyIncome || '');
    setSavingsTarget(p.savingsTargetPercent || 20);
    setEmergencyMonths(p.emergencyFundMonths || 6);
    setNorthStar(p.northStarGoal || '');
    setNorthStarDate(p.northStarDeadline || '');
  }, [activeAccount]);

  if (!isProfileWizardOpen) return null;

  // Real-time scientific calculations
  const parsedWeight = typeof weightKg === 'number' ? weightKg : 0;
  const parsedHeight = typeof heightCm === 'number' ? heightCm : 0;
  const parsedAge = typeof age === 'number' ? age : 26;
  const parsedFocusHours = typeof dailyFocusHours === 'number' ? dailyFocusHours : 4;

  const bmiInfo: BMIEstimate | null = calculateBMI(parsedWeight, parsedHeight);
  const bmr = calculateBMR(parsedWeight, parsedHeight, parsedAge, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const waterTarget = calculateWaterTarget(parsedWeight);
  const sleepHours = calculateSleepDuration(sleepTime, wakeTime);

  const caffeine = calculateCaffeineCurfew(sleepTime);
  const fasting = calculateFastingWindow(wakeTime, fastingProtocol);
  const zone2HR = calculateZone2HR(parsedAge);
  const ultradian = calculateUltradianBlocks(parsedFocusHours);

  // Compute hypothetical account to determine live profile completeness
  const tempAccount = {
    ...activeAccount,
    profileDetails: {
      ...current,
      age: typeof age === 'number' ? age : undefined,
      gender,
      heightCm: parsedHeight > 0 ? parsedHeight : undefined,
      weightKg: parsedWeight > 0 ? parsedWeight : undefined,
      activityLevel,
      bmr,
      tdee,
      targetWaterMl: waterTarget,
      targetSleepTime: sleepTime,
      targetWakeTime: wakeTime,
      chronotype,
      caffeineCurfewTime: caffeine.curfewTime,
      fastingProtocol,
      fastingWindowStart: fasting.start,
      fastingWindowEnd: fasting.end,
      morningLightMinutesTarget: typeof morningLight === 'number' ? morningLight : undefined,
      weeklyZone2MinutesTarget: typeof zone2Target === 'number' ? zone2Target : undefined,
      targetZone2HR: zone2HR,
      profession: profession.trim() || undefined,
      workStyle,
      dailyFocusHoursTarget: typeof dailyFocusHours === 'number' ? dailyFocusHours : undefined,
      ultradianCyclesTarget: Math.round(ultradian.blocks90min),
      monthlyIncome: typeof monthlyIncome === 'number' ? monthlyIncome : undefined,
      savingsTargetPercent: typeof savingsTarget === 'number' ? savingsTarget : undefined,
      emergencyFundMonths: typeof emergencyMonths === 'number' ? emergencyMonths : undefined,
      northStarGoal: northStar.trim() || undefined,
      northStarDeadline: northStarDate || undefined
    }
  };

  const completion = calculateProfileCompletion(tempAccount);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const details = {
      age: typeof age === 'number' ? age : undefined,
      gender,
      heightCm: parsedHeight > 0 ? parsedHeight : undefined,
      weightKg: parsedWeight > 0 ? parsedWeight : undefined,
      activityLevel,
      bmr,
      tdee,
      bmi: bmiInfo?.bmi,
      bmiCategory: bmiInfo?.categoryEn,
      targetWaterMl: waterTarget,
      targetSleepTime: sleepTime,
      targetWakeTime: wakeTime,
      chronotype,
      caffeineCurfewTime: caffeine.curfewTime,
      fastingProtocol,
      fastingWindowStart: fasting.start,
      fastingWindowEnd: fasting.end,
      morningLightMinutesTarget: typeof morningLight === 'number' ? morningLight : 15,
      weeklyZone2MinutesTarget: typeof zone2Target === 'number' ? zone2Target : 150,
      targetZone2HR: zone2HR,
      profession: profession.trim() || undefined,
      workStyle,
      dailyFocusHoursTarget: typeof dailyFocusHours === 'number' ? dailyFocusHours : undefined,
      ultradianCyclesTarget: Math.round(ultradian.blocks90min),
      monthlyIncome: typeof monthlyIncome === 'number' ? monthlyIncome : undefined,
      savingsTargetPercent: typeof savingsTarget === 'number' ? savingsTarget : undefined,
      emergencyFundMonths: typeof emergencyMonths === 'number' ? emergencyMonths : undefined,
      northStarGoal: northStar.trim() || undefined,
      northStarDeadline: northStarDate || undefined
    };

    updateProfileDetails(details);

    if (completion.percentage >= 100) {
      playCelebrationArpeggio();
      showToast(lang === 'bn' ? '🎉 অভিনন্দন! আপনার প্রোফাইল ১০০% সম্পন্ন হয়েছে! All-Star Master আনলক হয়েছে।' : '🎉 Outstanding! Profile is 100% complete! All-Star Master status unlocked.');
    } else {
      playChime();
      showToast(lang === 'bn' ? `প্রোফাইল আপডেট হয়েছে (${completion.percentage}% সম্পন্ন)` : `Bio-Profile updated (${completion.percentage}% complete)`);
    }

    closeProfileWizard();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#0c0e14] border border-gray-800 rounded-3xl p-5 sm:p-7 space-y-5 max-h-[94vh] overflow-y-auto shadow-2xl">
        
        {/* Header Bar */}
        <div className="flex justify-between items-start border-b border-gray-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-lime-300 text-[11px] font-mono font-bold tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span>RESEARCH-GRADE HUMAN PERFORMANCE STUDIO</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-100 flex items-center gap-2.5">
              <span>{activeAccount.avatar}</span>
              <span>{lang === 'bn' ? 'বায়ো-মেট্রিক্স ও সায়েন্টিফিক প্রোফাইল অপ্টিমাইজেশন' : 'Bio-Cadence & Scientific Profile Studio'}</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'আন্তর্জাতিক গবেষণাপত্র (Mifflin-St Jeor, Salk Institute, Drake et al., Kleitman BRAC) অনুযায়ী তৈরি ব্যক্তিগত কমান্ড সেন্টার।'
                : 'Evidence-based profile blueprint backed by peer-reviewed research in chronobiology, metabolic rate, and cognitive performance.'}
            </p>
          </div>

          <button onClick={closeProfileWizard} className="text-gray-400 hover:text-white p-1 rounded-xl hover:bg-gray-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Profile Completion Progress Widget */}
        <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2.5 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-lime-400 shrink-0" />
              <span className="text-xs font-bold text-gray-200">
                {lang === 'bn' ? 'প্রোফাইল সমাপ্তি স্কোর:' : 'Bio-Optimization Score:'}
              </span>
              <span className="text-xs font-mono font-extrabold text-lime-300">
                {completion.percentage}%
              </span>
            </div>

            <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${completion.levelBadgeColor}`}>
              {lang === 'bn' ? completion.levelTitleBn : completion.levelTitleEn}
            </span>
          </div>

          {/* Animated Progress Track */}
          <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                completion.percentage >= 100
                  ? 'bg-gradient-to-r from-lime-400 to-emerald-400'
                  : completion.percentage >= 70
                  ? 'bg-gradient-to-r from-yellow-400 to-lime-400'
                  : 'bg-gradient-to-r from-sky-400 to-blue-500'
              }`}
              style={{ width: `${completion.percentage}%` }}
            />
          </div>

          {/* Actionable Missing Milestone Reminder */}
          {completion.percentage < 100 && (
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
              <span className="text-lime-400 font-semibold">{lang === 'bn' ? '১০০% করতে বাকি:' : 'To reach 100%:'}</span>
              <span className="truncate">
                {lang === 'bn' ? completion.missingItemsBn.slice(0, 3).join(', ') : completion.missingItemsEn.slice(0, 3).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* 5 Evidence-Based Pillar Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-800 overflow-x-auto scrollbar-none pb-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('bio')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'bio'
                ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-lime-400" />
            <span>{lang === 'bn' ? '১. মেটাবলিজম ও শরীর' : '1. Metabolic & Bio'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('circadian')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'circadian'
                ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'bn' ? '২. সারকাডিয়ান ও নিউট্রিশন' : '2. Circadian & Sleep'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('career')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'career'
                ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? '৩. আল্ট্রাডিয়ান ফোকাস ও কার্ডিও' : '3. Focus & Cardio'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'finance'
                ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? '৪. আর্থিক ব্লুপ্রিন্ট' : '4. Finance Blueprint'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goal')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'goal'
                ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'bn' ? '৫. নর্থ স্টার লক্ষ্য' : '5. North Star Compass'}</span>
          </button>
        </div>

        {/* TAB 1: METABOLIC BASELINE & BIO-HEALTH */}
        {activeTab === 'bio' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-gray-400 bg-gray-900/50 p-2.5 rounded-xl border border-gray-800">
              <span className="flex items-center gap-1.5 font-mono text-lime-300">
                <BookOpen className="w-3.5 h-3.5 text-lime-400" />
                <span>RESEARCH PAPER: Mifflin-St Jeor Equation (Am J Clin Nutr 1990)</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">ADA Clinical Gold Standard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'বয়স (বছর)' : 'Age (Years)'}</label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={age}
                  onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 26"
                  className="field text-xs py-2 w-full font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'লিঙ্গ' : 'Gender'}</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="field text-xs py-2 w-full"
                >
                  <option value="male">{lang === 'bn' ? 'পুরুষ (Male)' : 'Male'}</option>
                  <option value="female">{lang === 'bn' ? 'নারী (Female)' : 'Female'}</option>
                  <option value="other">{lang === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'উচ্চতা (সেমি)' : 'Height (cm)'}</label>
                <input
                  type="number"
                  min={80}
                  max={250}
                  value={heightCm}
                  onChange={e => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 175"
                  className="field text-xs py-2 w-full font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'ওজন (কেজি)' : 'Weight (kg)'}</label>
                <input
                  type="number"
                  min={25}
                  max={250}
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 70"
                  className="field text-xs py-2 w-full font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'দৈনিক শারীরিক সক্রিয়তা' : 'Activity Level'}</label>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value as any)}
                  className="field text-xs py-2 w-full"
                >
                  <option value="sedentary">🛋️ {lang === 'bn' ? 'ডেস্ক জব (Sedentary)' : 'Sedentary (1.2x)'}</option>
                  <option value="light">🚶 {lang === 'bn' ? 'হালকা ব্যায়াম (Light)' : 'Light (1.375x)'}</option>
                  <option value="moderate">⚡ {lang === 'bn' ? 'পরিমিত ব্যায়াম (Moderate)' : 'Moderate (1.55x)'}</option>
                  <option value="very_active">🏋️ {lang === 'bn' ? 'উচ্চ ব্যায়াম (Active)' : 'Very Active (1.725x)'}</option>
                </select>
              </div>
            </div>

            {/* Calculated Metabolic & Physiological Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: BMR & TDEE */}
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>{lang === 'bn' ? 'মেটাবলিক রেট (BMR / TDEE)' : 'Metabolic Energy'}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-500/30">Mifflin-St Jeor</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'bn' ? 'বিএমআর (বিশ্রামে খরচ)' : 'BMR (Base)'}</div>
                    <div className="text-lg font-mono font-bold text-orange-300">{bmr} <span className="text-xs text-gray-500">kcal</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'bn' ? 'টিডিইই (সারাদিনে ব্যয়)' : 'TDEE (Active)'}</div>
                    <div className="text-lg font-mono font-bold text-lime-300">{tdee} <span className="text-xs text-gray-500">kcal</span></div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 pt-1">
                  {lang === 'bn' ? 'শরীরের কোষীয় ভারসাম্য বজায় রাখতে দৈনিক শক্তির মোট চাহিদা।' : 'Caloric burn baseline to maintain metabolic equilibrium.'}
                </p>
              </div>

              {/* Card 2: Interactive BMI */}
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                    <span>{lang === 'bn' ? 'বডি ম্যাস ইনডেক্স (BMI)' : 'BMI Baseline'}</span>
                  </span>
                  {bmiInfo && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${bmiInfo.badgeBg}`}>
                      {lang === 'bn' ? bmiInfo.categoryBn : bmiInfo.categoryEn}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-mono font-extrabold text-lime-300 pt-1">
                  {bmiInfo ? bmiInfo.bmi : '--'}
                </div>
                <p className="text-[10px] text-gray-400">
                  {bmiInfo ? (lang === 'bn' ? bmiInfo.adviceBn : bmiInfo.adviceEn) : (lang === 'bn' ? 'উচ্চতা ও ওজন ইনপুট দিন।' : 'Input height & weight.')}
                </p>
              </div>

              {/* Card 3: Water Hydration Target */}
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'দৈনিক পানি লক্ষ্য' : 'Hydration Target'}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">35ml / kg</span>
                </div>
                <div className="text-2xl font-mono font-extrabold text-cyan-300 pt-1">
                  {waterTarget} <span className="text-xs font-normal text-gray-400">ml / day</span>
                </div>
                <p className="text-[10px] text-gray-400">
                  {lang === 'bn' ? 'রক্ত সঞ্চালন ও মস্তিষ্কের কার্যক্ষমতার জন্য সুষম পানির লক্ষ্যমাত্রা।' : 'Optimizes cerebral blood flow and cellular detoxification.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CIRCADIAN RECOVERY & CHRONO-NUTRITION */}
        {activeTab === 'circadian' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-gray-400 bg-gray-900/50 p-2.5 rounded-xl border border-gray-800">
              <span className="flex items-center gap-1.5 font-mono text-indigo-300">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>RESEARCH: Panda et al. (Cell Metabolism) & Drake et al. (JCSM 2013)</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Sleep & Fasting Architecture</span>
            </div>

            {/* Sleep Window & Chronotype Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 text-[11px]">{lang === 'bn' ? 'ঘুমানোর সময় (Bedtime)' : 'Target Bedtime'}</label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={e => setSleepTime(e.target.value)}
                  className="field text-xs py-2 w-full font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-[11px]">{lang === 'bn' ? 'জেগে ওঠার সময় (Wake time)' : 'Target Wake Time'}</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={e => setWakeTime(e.target.value)}
                  className="field text-xs py-2 w-full font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-[11px]">{lang === 'bn' ? 'ক্রোনো-টাইপ (Chronotype)' : 'Peak Chronotype'}</label>
                <select
                  value={chronotype}
                  onChange={e => setChronotype(e.target.value as any)}
                  className="field text-xs py-2 w-full"
                >
                  <option value="lark">🌅 {lang === 'bn' ? 'মর্নিং লার্ক (সকালে এনার্জি)' : 'Early Lark (Morning Peak)'}</option>
                  <option value="owl">🦉 {lang === 'bn' ? 'নাইট আউল (রাতে ফোকাস)' : 'Night Owl (Evening Peak)'}</option>
                  <option value="balanced">⚖️ {lang === 'bn' ? 'ভারসাম্যপূর্ণ (Balanced)' : 'Balanced Routine'}</option>
                </select>
              </div>
            </div>

            {/* Fasting & Light Protocol Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-gray-400 block mb-1 text-xs">
                  {lang === 'bn' ? 'টাইম-রেস্ট্রিক্টেড ইটিং / ফাস্টিং প্রটোকল' : 'Time-Restricted Eating (TRE) Protocol'}
                </label>
                <select
                  value={fastingProtocol}
                  onChange={e => setFastingProtocol(e.target.value as any)}
                  className="field text-xs py-2 w-full"
                >
                  <option value="none">{lang === 'bn' ? 'সাধারণ খাদ্যগ্রহণ (কোন নির্দিষ্ট ফাস্টিং নেই)' : 'Unrestricted Eating Window'}</option>
                  <option value="12_12">🥗 {lang === 'bn' ? '১২:১২ সারকাডিয়ান ব্যালেন্স (১২ ঘণ্টা খাওয়া, ১২ ঘণ্টা ফাস্টিং)' : '12:12 Circadian Balance (12h Fasting)'}</option>
                  <option value="14_10">⚡ {lang === 'bn' ? '১৪:১০ মেটাবলিক ফোকাস (১৪ ঘণ্টা ফাস্টিং, ১০ ঘণ্টা খাওয়া)' : '14:10 Metabolic Focus (14h Fasting)'}</option>
                  <option value="16_8">🔥 {lang === 'bn' ? '১৬:৮ অটোফেজি বুস্ট (১৬ ঘণ্টা ফাস্টিং, ৮ ঘণ্টা খাওয়া)' : '16:8 Autophagy Protocol (16h Fasting)'}</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-xs">
                  {lang === 'bn' ? 'সকালের সূর্যালোক এক্সপোজার লক্ষ্য (মিনিট)' : 'Morning Sunlight Lux Target (Minutes)'}
                </label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={morningLight}
                  onChange={e => setMorningLight(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 15"
                  className="field text-xs py-2 w-full font-mono"
                />
              </div>
            </div>

            {/* Scientific Calculation Preview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Caffeine Curfew Card */}
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'bn' ? 'ক্যাফেইন কার্ফু' : 'Caffeine Curfew'}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">Drake et al.</span>
                </div>
                <div className="text-2xl font-mono font-extrabold text-amber-300 pt-1">
                  {caffeine.curfewTime}
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {lang === 'bn' 
                    ? 'ক্যাফেইনের ৫-৬ ঘণ্টা হাফ-লাইফ থাকে। গভীর স্লো-ওয়েভ ডেল্টা ঘুম বাঁচাতে এই সময়ের পর কফি বন্ধ রাখুন।' 
                    : 'Caffeine has a 5–6h half-life. Cut intake 9.5h before bedtime to safeguard restorative deep sleep.'}
                </p>
              </div>

              {/* Fasting Feeding Window */}
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-lime-400" />
                    <span>{lang === 'bn' ? 'খাওয়া ও ফাস্টিং উইন্ডো' : 'Feeding Window'}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime-950/60 text-lime-300 border border-lime-500/30">Panda 2019</span>
                </div>
                <div className="text-base font-mono font-bold text-lime-300 pt-1">
                  {fastingProtocol === 'none' ? 'Unrestricted' : `${fasting.start} — ${fasting.end}`}
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {fastingProtocol === 'none'
                    ? (lang === 'bn' ? 'নির্দিষ্ট সময়ের সীমাবদ্ধতা নেই।' : 'No time-restricted boundary.')
                    : (lang === 'bn' 
                        ? `${fasting.fastHours} ঘণ্টা উপবাস এবং ${fasting.feedHours} ঘণ্টার মধ্যে পরিমিত খাবার গ্রহণের সময়সূচী।` 
                        : `${fasting.fastHours}h cellular recovery & ${fasting.feedHours}h daylight digestion window.`)}
                </p>
              </div>

              {/* Morning Sunlight Card */}
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Sunrise className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{lang === 'bn' ? 'মর্নিং সানলাইট' : 'Sunlight Sync'}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-950/60 text-yellow-300 border border-yellow-500/30">Huberman SCN</span>
                </div>
                <div className="text-2xl font-mono font-extrabold text-yellow-300 pt-1">
                  {morningLight || 15} <span className="text-xs font-normal text-gray-400">mins outdoor</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {lang === 'bn' 
                    ? 'ঘুম ভাঙার ৩০-৬০ মিনিটের মধ্যে ১০,০০০+ লাক্স আলো চোখের রেটিনায় পড়লে মেলাটোনিন টাইমার সঠিক থাকে।' 
                    : '10,000+ lux sunlight triggers retinal ipRGCs to sync cortisol and lock the 16h melatonin clock.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ULTRADIAN FOCUS & CARDIO LONGEVITY */}
        {activeTab === 'career' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-gray-400 bg-gray-900/50 p-2.5 rounded-xl border border-gray-800">
              <span className="flex items-center gap-1.5 font-mono text-cyan-300">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>RESEARCH: Kleitman BRAC (Ultradian) & JAMA Cardiology (Mandsager 2018)</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Cognitive & Mitochondrial Base</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'নির্দিষ্ট পেশা বা পদবী' : 'Specific Profession / Title'}</label>
                <input
                  type="text"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  placeholder={lang === 'bn' ? 'উদা: Solutions Architect, Medical Lead' : 'e.g. Solutions Architect, Tech Lead'}
                  className="field text-xs py-2 w-full"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'কাজের পরিবেশ' : 'Work Environment'}</label>
                <select
                  value={workStyle}
                  onChange={e => setWorkStyle(e.target.value as any)}
                  className="field text-xs py-2 w-full"
                >
                  <option value="remote">🏡 {lang === 'bn' ? 'রিমোট (বাসা থেকে কাজ)' : 'Remote (Work From Home)'}</option>
                  <option value="hybrid">🏢 {lang === 'bn' ? 'হাইব্রিড (অফিস ও বাসা)' : 'Hybrid (Office + Remote)'}</option>
                  <option value="onsite">🚶 {lang === 'bn' ? 'অন-সাইট (সরাসরি ফিল্ড / অফিস)' : 'On-site Office'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 text-xs">
                  {lang === 'bn' ? 'দৈনিক ডিপ-ফোকাস কাজের লক্ষ্য (ঘণ্টা)' : 'Daily Deep-Work Target (Hours)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={dailyFocusHours}
                  onChange={e => setDailyFocusHours(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 4 or 5"
                  className="field text-xs py-2 w-full font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-xs">
                  {lang === 'bn' ? 'সাপ্তাহিক জোন ২ কার্ডিও লক্ষ্য (মিনিট)' : 'Weekly Zone 2 Cardio (Minutes)'}
                </label>
                <input
                  type="number"
                  min={30}
                  max={600}
                  value={zone2Target}
                  onChange={e => setZone2Target(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 150"
                  className="field text-xs py-2 w-full font-mono"
                />
              </div>
            </div>

            {/* Scientific Calculation Preview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Ultradian Blocks Card */}
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-lime-400" />
                    <span>{lang === 'bn' ? '৯০ মিনিটের আল্ট্রাডিয়ান সাইকেল' : 'Ultradian 90-Min Cycles'}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime-950/60 text-lime-300 border border-lime-500/30">Kleitman BRAC</span>
                </div>
                <div className="text-2xl font-mono font-extrabold text-lime-300 pt-1">
                  {ultradian.blocks90min} <span className="text-xs font-normal text-gray-400">sprints / day</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {lang === 'bn'
                    ? 'মস্তিষ্ক সর্বোচ্চ ৯০ মিনিট গভীর মনোযোগ ধরে রাখতে পারে। প্রতিটি ব্লকের পর ১৫-২০ মিনিট কগনিটিভ রিচার্জ অপরিহার্য।'
                    : 'Human brain endurance cycles in 90-min ultradian peaks. Schedule 15-20 min restorative breaks between blocks.'}
                </p>
              </div>

              {/* Zone 2 Heart Rate Range Card */}
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'টার্গেট জোন ২ হার্ট রেট' : 'Zone 2 Heart Rate Target'}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">Attia Longevity</span>
                </div>
                <div className="text-2xl font-mono font-extrabold text-cyan-300 pt-1">
                  {zone2HR.min} – {zone2HR.max} <span className="text-xs font-normal text-gray-400">BPM</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {lang === 'bn'
                    ? 'মাইটোকন্ড্রিয়াল ডেনসিটি ও দীর্ঘায়ুর জন্য প্রতি সপ্তাহে ১৫০ মিনিট এই হার্ট রেটে অ্যারোবিক ট্রেনিং করুন।'
                    : '150 min/wk in this zone stimulates mitochondrial biogenesis, lactate clearance, and cardiorespiratory health.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FINANCIAL BLUEPRINT & RUNWAY */}
        {activeTab === 'finance' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-gray-400 bg-gray-900/50 p-2.5 rounded-xl border border-gray-800">
              <span className="flex items-center gap-1.5 font-mono text-emerald-300">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>RESEARCH: Trinity Study & Global 50/30/20 Wealth Blueprint</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Financial Antifragility</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 text-xs">
                  {lang === 'bn' ? `মাসিক আয় বেসলাইন (${currency})` : `Monthly Baseline Income (${currency})`}
                </label>
                <input
                  type="number"
                  min={0}
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 85000"
                  className="field text-xs py-2 w-full font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'সঞ্চয় লক্ষ্যমাত্রা (% Target)' : 'Savings Target (% of Income)'}</label>
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={savingsTarget}
                  onChange={e => setSavingsTarget(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 25"
                  className="field text-xs py-2 w-full font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'ইমার্জেন্সি ফান্ড বাফার' : 'Emergency Fund Buffer'}</label>
                <select
                  value={emergencyMonths}
                  onChange={e => setEmergencyMonths(Number(e.target.value))}
                  className="field text-xs py-2 w-full font-mono"
                >
                  <option value={3}>{lang === 'bn' ? '৩ মাসের জীবনযাত্রা খরচ' : '3 Months Expenses'}</option>
                  <option value={6}>{lang === 'bn' ? '৬ মাসের নিরাপত্তা বাফার' : '6 Months Security'}</option>
                  <option value={12}>{lang === 'bn' ? '১২ মাসের পূর্ণ সুরক্ষা' : '12 Months Freedom Fund'}</option>
                </select>
              </div>
            </div>

            {/* 50/30/20 Rule Live Breakdown */}
            {typeof monthlyIncome === 'number' && monthlyIncome > 0 && (
              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
                <span className="text-xs font-mono uppercase font-bold text-lime-300">
                  {lang === 'bn' ? 'আন্তর্জাতিক ৫০/৩০/২০ বাজেট ফ্রেমওয়ার্ক:' : 'Global 50/30/20 Budget Blueprint:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                    <div className="text-gray-400 text-[10px] uppercase font-mono">{lang === 'bn' ? '৫০% প্রয়োজনীয় ব্যয় (Needs)' : '50% Core Needs'}</div>
                    <div className="font-mono font-bold text-gray-200 mt-1">{currency} {Math.round(monthlyIncome * 0.5).toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                    <div className="text-gray-400 text-[10px] uppercase font-mono">{lang === 'bn' ? '৩০% শখ ও লাইফস্টাইল (Wants)' : '30% Lifestyle'}</div>
                    <div className="font-mono font-bold text-amber-300 mt-1">{currency} {Math.round(monthlyIncome * 0.3).toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                    <div className="text-gray-400 text-[10px] uppercase font-mono">{lang === 'bn' ? '২০% সঞ্চয় ও বিনিয়োগ (Savings)' : '20% Wealth & Savings'}</div>
                    <div className="font-mono font-bold text-lime-300 mt-1">{currency} {Math.round(monthlyIncome * 0.2).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: 1-YEAR NORTH STAR STRATEGIC COMPASS */}
        {activeTab === 'goal' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-gray-400 bg-gray-900/50 p-2.5 rounded-xl border border-gray-800">
              <span className="flex items-center gap-1.5 font-mono text-lime-300">
                <BookOpen className="w-3.5 h-3.5 text-lime-400" />
                <span>RESEARCH: Gollwitzer Implementation Intentions (Am Psychol 1999)</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Strategic Goal Architecture</span>
            </div>

            <div>
              <label className="text-gray-400 block mb-1 text-xs font-bold">
                {lang === 'bn' ? '১ বছরের একক প্রধান নর্থ স্টার লক্ষ্য (The #1 Priority Strategic Anchor)' : '1-Year North Star Goal (The #1 Priority Strategic Anchor)'}
              </label>
              <textarea
                value={northStar}
                onChange={e => setNorthStar(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'উদা: এই বছরের মধ্যে ২০ কেজি ওজন কমিয়ে ফিট হওয়া এবং আল-আমিন আইটির মূল প্ল্যাটফর্ম সফলভাবে সম্প্রসারণ করা...'
                    : 'e.g. Scale Al-Ameen IT infrastructure, achieve peak circadian health, and generate 100K active users.'
                }
                className="w-full h-28 p-3.5 rounded-2xl bg-[#090b0f] border border-gray-800 text-xs sm:text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'লক্ষ্য অর্জনের চূড়ান্ত সময়সীমা' : 'Target Milestone Deadline'}</label>
              <input
                type="date"
                value={northStarDate}
                onChange={e => setNorthStarDate(e.target.value)}
                className="field text-xs py-2 w-full font-mono"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800 text-xs text-gray-400 leading-relaxed">
              💡 {lang === 'bn'
                ? 'গবেষণা অনুযায়ী, যারা তাদের দীর্ঘমেয়াদী ১টি নর্থ স্টার লক্ষ্য নির্দিষ্ট ডেডলাইনসহ লিখে রাখে, তাদের লক্ষ্য পূরণের সম্ভাবনা ৪২% বৃদ্ধি পায়।'
                : 'Empirical studies show individuals who anchor daily tasks to a clear 1-Year North Star milestone achieve 42% higher completion fidelity.'}
            </div>
          </div>
        )}

        {/* Bottom Actions & Privacy Footnote */}
        <div className="border-t border-gray-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />
            <span>{lang === 'bn' ? '১০০% লোকাল প্রাইভেসি: বায়োমেট্রিক্স কেবল আপনার ডিভাইসেই এনক্রিপ্টেড।' : '100% Client-Side Privacy: Bio-metrics stored strictly on your local device.'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={closeProfileWizard}
              className="px-4 py-2 rounded-xl border border-gray-800 hover:bg-gray-900 text-xs text-gray-400 hover:text-white transition-colors"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none bg-lime-400 hover:bg-lime-300 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Check className="w-4 h-4 text-gray-950" />
              <span>{lang === 'bn' ? 'সংরক্ষণ ও প্রোফাইল আপডেট' : 'Save Bio-Profile & Metrics'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
