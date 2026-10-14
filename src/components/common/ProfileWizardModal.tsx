import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Sparkles, Activity, ShieldCheck, HeartPulse, 
  Droplets, Moon, Sun, Briefcase, Wallet, Target, 
  Check, ArrowRight, Award, Zap, HelpCircle
} from 'lucide-react';
import { 
  calculateBMI, calculateWaterTarget, calculateSleepDuration, 
  calculateProfileCompletion, BMIEstimate 
} from '../../utils/profile';
import { playCelebrationArpeggio, playChime } from '../../utils/audio';

export const ProfileWizardModal: React.FC = () => {
  const { 
    isProfileWizardOpen, closeProfileWizard, activeAccount, 
    updateProfileDetails, currency, lang, showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bio' | 'career' | 'finance' | 'goal'>('bio');

  // Form states initialized from current account's profileDetails
  const current = activeAccount.profileDetails || {};

  const [age, setAge] = useState<number | ''>(current.age || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(current.gender || 'male');
  const [heightCm, setHeightCm] = useState<number | ''>(current.heightCm || '');
  const [weightKg, setWeightKg] = useState<number | ''>(current.weightKg || '');
  const [sleepTime, setSleepTime] = useState<string>(current.targetSleepTime || '23:30');
  const [wakeTime, setWakeTime] = useState<string>(current.targetWakeTime || '07:30');
  const [chronotype, setChronotype] = useState<'lark' | 'owl' | 'balanced'>(current.chronotype || 'balanced');

  const [profession, setProfession] = useState<string>(current.profession || '');
  const [workStyle, setWorkStyle] = useState<'remote' | 'hybrid' | 'onsite'>(current.workStyle || 'hybrid');
  const [dailyFocusHours, setDailyFocusHours] = useState<number | ''>(current.dailyFocusHoursTarget || 4);

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
    setSleepTime(p.targetSleepTime || '23:30');
    setWakeTime(p.targetWakeTime || '07:30');
    setChronotype(p.chronotype || 'balanced');
    setProfession(p.profession || '');
    setWorkStyle(p.workStyle || 'hybrid');
    setDailyFocusHours(p.dailyFocusHoursTarget || 4);
    setMonthlyIncome(p.monthlyIncome || '');
    setSavingsTarget(p.savingsTargetPercent || 20);
    setEmergencyMonths(p.emergencyFundMonths || 6);
    setNorthStar(p.northStarGoal || '');
    setNorthStarDate(p.northStarDeadline || '');
  }, [activeAccount]);

  if (!isProfileWizardOpen) return null;

  // Real-time calculations
  const parsedWeight = typeof weightKg === 'number' ? weightKg : 0;
  const parsedHeight = typeof heightCm === 'number' ? heightCm : 0;
  const bmiInfo: BMIEstimate | null = calculateBMI(parsedWeight, parsedHeight);
  const waterTarget = calculateWaterTarget(parsedWeight);
  const sleepHours = calculateSleepDuration(sleepTime, wakeTime);

  // Hypothetical temporary account to compute live completion percentage
  const tempAccount = {
    ...activeAccount,
    profileDetails: {
      ...current,
      age: typeof age === 'number' ? age : undefined,
      gender,
      heightCm: parsedHeight > 0 ? parsedHeight : undefined,
      weightKg: parsedWeight > 0 ? parsedWeight : undefined,
      targetSleepTime: sleepTime,
      targetWakeTime: wakeTime,
      chronotype,
      profession: profession.trim() || undefined,
      workStyle,
      dailyFocusHoursTarget: typeof dailyFocusHours === 'number' ? dailyFocusHours : undefined,
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
      bmi: bmiInfo?.bmi,
      bmiCategory: bmiInfo?.categoryEn,
      targetWaterMl: waterTarget,
      targetSleepTime: sleepTime,
      targetWakeTime: wakeTime,
      chronotype,
      profession: profession.trim() || undefined,
      workStyle,
      dailyFocusHoursTarget: typeof dailyFocusHours === 'number' ? dailyFocusHours : undefined,
      monthlyIncome: typeof monthlyIncome === 'number' ? monthlyIncome : undefined,
      savingsTargetPercent: typeof savingsTarget === 'number' ? savingsTarget : undefined,
      emergencyFundMonths: typeof emergencyMonths === 'number' ? emergencyMonths : undefined,
      northStarGoal: northStar.trim() || undefined,
      northStarDeadline: northStarDate || undefined
    };

    updateProfileDetails(details);

    if (completion.percentage >= 100) {
      playCelebrationArpeggio();
      showToast(lang === 'bn' ? '🎉 অভিনন্দন! আপনার প্রোফাইল ১০০% সম্পূর্ণ হয়েছে! All-Star Master আনলক হয়েছে।' : '🎉 Brilliant! Your profile is 100% complete! All-Star Master status unlocked.');
    } else {
      playChime();
      showToast(lang === 'bn' ? `প্রোফাইল আপডেট হয়েছে (${completion.percentage}% সম্পন্ন)` : `Profile updated (${completion.percentage}% complete)`);
    }

    closeProfileWizard();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#0c0e14] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
        
        {/* Header Bar */}
        <div className="flex justify-between items-start border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-lime-300 text-xs font-mono font-bold tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span>HIGH PERFORMANCE LIFE OPTIMIZATION</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-100 flex items-center gap-2.5">
              <span>{activeAccount.avatar}</span>
              <span>{lang === 'bn' ? 'প্রোফাইল অপ্টিমাইজেশন ও ১০০% সমাপ্তি' : '100% Profile Bio-Cadence Wizard'}</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {lang === 'bn'
                ? 'আপনার স্বাস্থ্য, ঘুম, পুষ্টি ও আর্থিক মেট্রিক্স সম্পূর্ণ করে একটি বিশ্বমানের পার্সোনালাইজড লাইফস্টাইল তৈরি করুন।'
                : 'Configure circadian health, BMI, sleep windows, and financial blueprint to unlock 100% All-Star profile perks.'}
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
                {lang === 'bn' ? 'প্রোফাইল সম্পূর্ণতা স্কোর:' : 'Profile Strength Score:'}
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

        {/* 4 Pillar Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-800 overflow-x-auto scrollbar-none pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('bio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'bio'
                ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? '১. বায়ো-হেল্থ ও ঘুম' : '1. Bio-Health & Sleep'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('career')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'career'
                ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? '২. পেশা ও ফোকাস' : '2. Career & Focus'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'finance'
                ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? '৩. আর্থিক ব্লুপ্রিন্ট' : '3. Finance Blueprint'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'goal'
                ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? '৪. নর্থ স্টার লক্ষ্য' : '4. North Star Goal'}</span>
          </button>
        </div>

        {/* Tab 1: Bio-Health & Circadian */}
        {activeTab === 'bio' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'উচ্চতা (সেমি / cm)' : 'Height (cm)'}</label>
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
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'ওজন (কেজি / kg)' : 'Weight (kg)'}</label>
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
            </div>

            {/* Real-time Interactive BMI Card */}
            {bmiInfo ? (
              <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-gray-200">
                      {lang === 'bn' ? 'স্বয়ংক্রিয় বডি ম্যাস ইনডেক্স (BMI):' : 'Calculated Body Mass Index (BMI):'}
                    </span>
                    <span className="text-sm font-mono font-extrabold text-lime-300">{bmiInfo.bmi}</span>
                  </div>

                  <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${bmiInfo.badgeBg}`}>
                    {lang === 'bn' ? bmiInfo.categoryBn : bmiInfo.categoryEn}
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  💡 {lang === 'bn' ? bmiInfo.adviceBn : bmiInfo.adviceEn}
                </p>

                {/* Daily Water Target recommendation */}
                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'সায়েন্টিফিক দৈনিক পানির লক্ষ্য (Weight × 35ml):' : 'Personalized Daily Hydration Target:'}</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-300">{waterTarget} ml</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800 text-[11px] text-gray-500 italic flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-gray-400" />
                <span>{lang === 'bn' ? 'উচ্চতা ও ওজন ইনপুট দিলে আপনার স্বয়ংক্রিয় BMI ও পানির টার্গেট এখানে প্রদর্শিত হবে।' : 'Enter height & weight above to auto-calculate BMI score and personalized hydration baseline.'}</span>
              </div>
            )}

            {/* Circadian Sleep & Wake Window */}
            <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-xs font-bold text-gray-200 flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'bn' ? 'সারকাডিয়ান স্লিপ উইন্ডো (Circadian Recovery)' : 'Circadian Sleep & Wake Target'}</span>
                </span>
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {sleepHours} {lang === 'bn' ? 'ঘণ্টা ঘুম' : 'Hours'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 text-[11px]">{lang === 'bn' ? 'ঘুমোনোর সময় (Bedtime)' : 'Target Bedtime'}</label>
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
            </div>
          </div>
        )}

        {/* Tab 2: Career & Deep Work */}
        {activeTab === 'career' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'নির্দিষ্ট পেশা বা পদবী' : 'Specific Profession / Title'}</label>
                <input
                  type="text"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  placeholder={lang === 'bn' ? 'উদা: ফুল-স্ট্যাক ইঞ্জিনিয়ার, বিজনেস লিড' : 'e.g. Solutions Architect, Medical Student'}
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

            <div>
              <label className="text-gray-400 block mb-1 text-xs">
                {lang === 'bn' ? 'দৈনিক ডিপ-ফোকাস কাজের লক্ষ্য (ঘণ্টা/দিন)' : 'Daily Deep-Work Focus Target (Hours / Day)'}
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={dailyFocusHours}
                onChange={e => setDailyFocusHours(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 4 or 6"
                className="field text-xs py-2 w-full font-mono"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                {lang === 'bn'
                  ? 'গবেষণা অনুযায়ী দিনে ৪-৫ ঘণ্টা গভীর মনোযোগে কাজ মানুষের সর্বোচ্চ জ্ঞানীয় উৎপাদনশীলতা দেয়।'
                  : 'Cognitive science shows 4–5 hours of distraction-free deep work yields maximum daily output.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Finance Blueprint */}
        {activeTab === 'finance' && (
          <div className="space-y-4 animate-in fade-in">
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
                  placeholder="e.g. 20"
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
                  <option value={6}>{lang === 'bn' ? '৬ মাসের নিরাপত্তা বাফার' : '6 Months Expenses'}</option>
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
                  <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800">
                    <div className="text-gray-400 text-[10px] uppercase font-mono">{lang === 'bn' ? '৫০% প্রয়োজনীয় ব্যয় (Needs)' : '50% Core Needs'}</div>
                    <div className="font-mono font-bold text-gray-200 mt-1">{currency} {Math.round(monthlyIncome * 0.5).toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800">
                    <div className="text-gray-400 text-[10px] uppercase font-mono">{lang === 'bn' ? '৩০% শখ ও লাইফস্টাইল (Wants)' : '30% Lifestyle'}</div>
                    <div className="font-mono font-bold text-amber-300 mt-1">{currency} {Math.round(monthlyIncome * 0.3).toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800">
                    <div className="text-gray-400 text-[10px] uppercase font-mono">{lang === 'bn' ? '২০% সঞ্চয় ও বিনিয়োগ (Savings)' : '20% Wealth & Savings'}</div>
                    <div className="font-mono font-bold text-lime-300 mt-1">{currency} {Math.round(monthlyIncome * 0.2).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: 1-Year North Star Goal */}
        {activeTab === 'goal' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="text-gray-400 block mb-1 text-xs font-bold">
                {lang === 'bn' ? '১ বছরের একক প্রধান নর্থ স্টার লক্ষ্য (The #1 Priority)' : '1-Year North Star Goal (The #1 Priority)'}
              </label>
              <textarea
                value={northStar}
                onChange={e => setNorthStar(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'উদা: এই বছরের মধ্যে ২০ কেজি ওজন কমিয়ে ফিট হওয়া এবং নতুন টেক আর্কিটেকচার প্ল্যাটফর্ম সফলভাবে লঞ্চ করা...'
                    : 'e.g. Scale Al-Ameen IT infrastructure, achieve 68kg healthy weight, and publish 2 research publications.'
                }
                className="w-full h-28 p-3.5 rounded-2xl bg-[#090b0f] border border-gray-800 text-xs sm:text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 text-xs">{lang === 'bn' ? 'লক্ষ্য অর্জনের শেষ তারিখ' : 'Target Milestone Deadline'}</label>
              <input
                type="date"
                value={northStarDate}
                onChange={e => setNorthStarDate(e.target.value)}
                className="field text-xs py-2 w-full font-mono"
              />
            </div>
          </div>
        )}

        {/* Bottom Actions & Privacy Footnote */}
        <div className="border-t border-gray-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />
            <span>{lang === 'bn' ? '১০০% লোকাল প্রাইভেসি: ডাটা শুধু আপনার ডিভাইসেই এনক্রিপ্টেড।' : '100% Client-Side Privacy: Stored strictly on your device.'}</span>
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
