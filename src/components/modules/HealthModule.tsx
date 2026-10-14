import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Bell, CheckCircle2, Clock, Droplets, 
  Flame, Plus, RotateCcw, HeartPulse, Sparkles, Moon 
} from 'lucide-react';
import { requestNotificationPermission, sendLocalNotification } from '../../utils/notifications';
import { useTranslation } from '../../utils/i18n';

export const HealthModule: React.FC = () => {
  const { 
    mealReminders, toggleMealDone, toggleMealEnabled, updateMealTime,
    waterMl, addWater, resetWater, lang, showToast, activeAccount, openProfileWizard 
  } = useApp();


  const t = useTranslation(lang);

  const handleTestAlert = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      sendLocalNotification(
        lang === 'bn' ? '🥗 খাবারের রিমাইন্ডার সক্রিয়!' : '🥗 Meal & Health Reminder Active!',
        lang === 'bn' ? 'নিয়মিত খাবার ও পানি পানের সার্কেডিয়ান অ্যালার্ট পাবেন।' : 'You will receive timely biological circadian alerts for meals and hydration.'
      );
      showToast(lang === 'bn' ? 'অ্যালার্ট সফলভাবে পরীক্ষা করা হয়েছে!' : 'Notification test alert sent!');
    } else {
      showToast(lang === 'bn' ? 'ব্রাউজারে নোটিফিকেশন অনুমতি পাওয়া যায়নি' : 'Notification permission denied in browser');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gray-950 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-cyan-400 text-xs font-bold font-mono uppercase tracking-wider">
            CIRCADIAN HEALTH
          </span>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 mt-1">
            <Activity className="text-cyan-400 w-6 h-6" />
            <span>{t.healthTitle}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {t.healthSub}
          </p>
        </div>

        <button
          onClick={handleTestAlert}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-bold text-cyan-300 rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <Bell className="w-4 h-4 text-cyan-300" />
          <span>{lang === 'bn' ? 'অ্যালার্ট পরীক্ষা করুন' : 'Test Sound & Alert'}</span>
        </button>
      </div>

      {/* 1.5 Bio-Metrics & Circadian Cadence Overview Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-200">
              {lang === 'bn' ? 'ব্যক্তিগত বায়ো-মেট্রিক্স ও সারকাডিয়ান প্রোফাইল' : 'Personal Bio-Metrics & Circadian Profile'}
            </span>
          </div>

          <button
            onClick={openProfileWizard}
            className="text-xs font-bold text-lime-300 hover:text-lime-200 px-3 py-1.5 rounded-xl bg-gray-900 border border-lime-400/30 hover:border-lime-400 flex items-center gap-1.5 transition-all w-fit"
          >
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span>{lang === 'bn' ? 'বায়ো-মেট্রিক্স অপ্টিমাইজ করুন' : 'Optimize Bio-Profile'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* BMI Metric */}
          <div className="p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800/80 space-y-1">
            <div className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'bn' ? 'বডি ম্যাস (BMI)' : 'Body Mass (BMI)'}</div>
            <div className="font-mono font-bold text-base text-lime-300">
              {activeAccount.profileDetails?.bmi || '22.9'}
            </div>
            <div className="text-[10px] text-gray-400">
              {activeAccount.profileDetails?.bmiCategory || 'Normal Weight'}
            </div>
          </div>

          {/* Weight & Height */}
          <div className="p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800/80 space-y-1">
            <div className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'bn' ? 'ওজন ও উচ্চতা' : 'Weight & Height'}</div>
            <div className="font-mono font-bold text-sm text-gray-200">
              {activeAccount.profileDetails?.weightKg || 70} kg • {activeAccount.profileDetails?.heightCm || 175} cm
            </div>
            <div className="text-[10px] text-cyan-400">
              Target: {activeAccount.profileDetails?.targetWaterMl || 2500} ml/day
            </div>
          </div>

          {/* Circadian Sleep Window */}
          <div className="p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800/80 space-y-1">
            <div className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'bn' ? 'ঘুমের সময়সূচী' : 'Sleep Target'}</div>
            <div className="font-mono font-bold text-sm text-indigo-300">
              {activeAccount.profileDetails?.targetSleepTime || '23:30'} → {activeAccount.profileDetails?.targetWakeTime || '07:30'}
            </div>
            <div className="text-[10px] text-gray-400">
              Optimal Recovery
            </div>
          </div>

          {/* Chronotype */}
          <div className="p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800/80 space-y-1">
            <div className="text-[10px] text-gray-400 uppercase font-mono">{lang === 'bn' ? 'ক্রোনো-টাইপ' : 'Chronotype'}</div>
            <div className="font-mono font-bold text-sm text-amber-300">
              {activeAccount.profileDetails?.chronotype === 'lark' ? '🌅 Morning Lark' : activeAccount.profileDetails?.chronotype === 'owl' ? '🦉 Night Owl' : '⚖️ Balanced'}
            </div>
            <div className="text-[10px] text-gray-400">
              Peak Energy Window
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 CIRCADIAN MEAL REMINDER CARDS */}
      <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800/80 space-y-4">

        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥗</span>
            <div>
              <h3 className="text-sm font-bold text-gray-100">
                {t.mealCadence}
              </h3>
              <p className="text-[11px] text-gray-400">
                {lang === 'bn' ? 'প্রতিটি খাবারের সময় ব্রাউজারে মৃদু অ্যালার্ট পাবেন।' : 'Timely browser & audio alerts for healthy biological nutrition.'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
            Auto-Sync ⏰
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {mealReminders.map(m => (
            <div
              key={m.id}
              className={`p-4 rounded-2xl bg-gray-900 border transition-all space-y-3 flex flex-col justify-between ${
                m.done ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-3xl">{m.icon}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMealDone(m.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        m.done ? 'bg-emerald-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{m.done ? (lang === 'bn' ? 'সম্পন্ন' : 'Logged') : (lang === 'bn' ? 'সম্পন্ন করুন' : 'Mark Done')}</span>
                    </button>
                    <input
                      type="checkbox"
                      checked={m.enabled}
                      onChange={() => toggleMealEnabled(m.id)}
                      title={lang === 'bn' ? 'অ্যালার্ট চালু রাখুন' : 'Enable Alert'}
                      className="accent-lime-300 rounded cursor-pointer w-4 h-4"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <h4 className="font-bold text-gray-100 text-sm">
                    {lang === 'bn' ? m.nameBn : m.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 bg-gray-950 p-1 rounded-lg border border-gray-800 w-fit">
                    <Clock className="w-3.5 h-3.5 text-cyan-300" />
                    <input
                      type="time"
                      value={m.time}
                      onChange={e => updateMealTime(m.id, e.target.value)}
                      className="bg-transparent text-xs font-mono font-bold text-cyan-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 italic line-clamp-1 border-t border-gray-800/80 pt-2">
                {m.advice}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. WATER HYDRATION & RECOVERY METRIC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hydration Tracker */}
        <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4" />
              <span>{t.waterVitality} ({(activeAccount.profileDetails?.targetWaterMl || 2500).toLocaleString()} ml)</span>
            </span>
            <button onClick={resetWater} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />
              <span>{t.resetWater}</span>
            </button>
          </div>

          <div className="text-3xl font-bold font-mono text-cyan-300">
            {waterMl} ml <span className="text-xs text-gray-400 font-normal">/ {(activeAccount.profileDetails?.targetWaterMl || 2500).toLocaleString()} ml</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-800 p-0.5">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((waterMl / (activeAccount.profileDetails?.targetWaterMl || 2500)) * 100))}%` }}
            />
          </div>


          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => addWater(250)}
              className="flex-1 py-2 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 font-bold text-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+250 ml</span>
            </button>
            <button
              onClick={() => addWater(500)}
              className="flex-1 py-2 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 font-bold text-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+500 ml</span>
            </button>
          </div>
        </div>

        {/* Vitality & Habit Streaks */}
        <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              <span>{t.vitalityScore}</span>
            </span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex justify-between items-center">
              <span>💧 {lang === 'bn' ? '৮ গ্লাস পানি পানের অভ্যাস' : '8 Glasses Water Habit'}</span>
              <span className="font-mono text-cyan-300 font-bold">
                {waterMl >= 2000 ? (lang === 'bn' ? '✓ সম্পন্ন' : '✓ Complete') : (lang === 'bn' ? 'চলমান' : 'In Progress')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex justify-between items-center">
              <span>🥪 {lang === 'bn' ? 'সময়মতো সকালের নাস্তা' : 'On-Time Breakfast'}</span>
              <span className="font-mono text-emerald-300 font-bold">
                {mealReminders[0].done ? (lang === 'bn' ? '✓ সম্পন্ন' : '✓ Done') : (lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex justify-between items-center">
              <span>🥗 {lang === 'bn' ? 'সময়মতো দুপুরের খাবার' : 'On-Time Lunch'}</span>
              <span className="font-mono text-emerald-300 font-bold">
                {mealReminders[1].done ? (lang === 'bn' ? '✓ সম্পন্ন' : '✓ Done') : (lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
