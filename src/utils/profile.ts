import { Account, UserProfileDetails } from '../types';

export interface BMIEstimate {
  bmi: number;
  categoryEn: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  categoryBn: 'স্বাভাবিকের চেয়ে কম' | 'আদর্শ ও সুঠাম' | 'অতিরিক্ত ওজন' | 'স্থূলতা';
  color: string;
  badgeBg: string;
  adviceEn: string;
  adviceBn: string;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIEstimate | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  if (bmi < 18.5) {
    return {
      bmi,
      categoryEn: 'Underweight',
      categoryBn: 'স্বাভাবিকের চেয়ে কম',
      color: 'text-sky-400',
      badgeBg: 'bg-sky-950/60 border-sky-500/40 text-sky-300',
      adviceEn: 'Incorporate nutrient-dense calories and strength training for optimal vitality.',
      adviceBn: 'পুষ্টিকর খাদ্য গ্রহণ ও পেশী বৃদ্ধির জন্য স্ট্রেন্থ ট্রেনিংয়ের ওপর গুরুত্ব দিন।'
    };
  } else if (bmi <= 24.9) {
    return {
      bmi,
      categoryEn: 'Normal',
      categoryBn: 'আদর্শ ও সুঠাম',
      color: 'text-lime-400',
      badgeBg: 'bg-lime-950/60 border-lime-500/40 text-lime-300',
      adviceEn: 'Optimal metabolic baseline! Maintain consistent hydration and circadian sleep.',
      adviceBn: 'চমৎকার স্বাস্থ্য ভিত্তি! নিয়মিত পানি পান ও সময়মতো ঘুম বজায় রাখুন।'
    };
  } else if (bmi <= 29.9) {
    return {
      bmi,
      categoryEn: 'Overweight',
      categoryBn: 'অতিরিক্ত ওজন',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      adviceEn: 'Incorporate daily 30-min brisk walks and a high-protein, balanced meal cadence.',
      adviceBn: 'প্রতিদিন অন্তত ৩০ মিনিট দ্রুত হাঁটা ও পরিমিত সুষম খাদ্যাভ্যাস বজায় রাখুন।'
    };
  } else {
    return {
      bmi,
      categoryEn: 'Obese',
      categoryBn: 'স্থূলতা',
      color: 'text-rose-400',
      badgeBg: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
      adviceEn: 'Prioritize structured cardio, low-glycemic foods, and sleep debt recovery.',
      adviceBn: 'পরিমিত ক্যালোরি গ্রহণ, নিয়মিত শরীরচর্চা ও পর্যাপ্ত গভীর ঘুমের ওপর নজর দিন।'
    };
  }
}

// 1. Basal Metabolic Rate (BMR) - Mifflin-St Jeor (American Journal of Clinical Nutrition 1990)
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female' | 'other' = 'male'): number {
  if (!weightKg || !heightCm || !age || weightKg <= 0 || heightCm <= 0 || age <= 0) return 1650;
  if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

// 2. Total Daily Energy Expenditure (TDEE) - Physical Activity Multipliers
export function calculateTDEE(bmr: number, activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' = 'moderate'): number {
  if (!bmr || bmr <= 0) return 2200;
  const multipliers: Record<string, number> = {
    sedentary: 1.2,     // Desk work, negligible training
    light: 1.375,       // Light exercise 1-3 days/week
    moderate: 1.55,     // Moderate exercise 3-5 days/week
    very_active: 1.725  // Hard physical training 6-7 days/week
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

// 3. Caffeine Curfew - Drake et al. (2013, Journal of Clinical Sleep Medicine)
// Caffeine 5-6 hour half-life, 10-12 hour clearance window
export function calculateCaffeineCurfew(sleepTime?: string): { curfewTime: string; hoursPrior: number; citation: string } {
  if (!sleepTime) return { curfewTime: '14:00', hoursPrior: 9.5, citation: 'Drake et al., J Clin Sleep Med 2013' };
  const [sH, sM] = sleepTime.split(':').map(Number);
  if (isNaN(sH)) return { curfewTime: '14:00', hoursPrior: 9.5, citation: 'Drake et al., J Clin Sleep Med 2013' };

  let totalCurfewMin = sH * 60 + (sM || 0) - Math.round(9.5 * 60);
  if (totalCurfewMin < 0) totalCurfewMin += 24 * 60;

  const h = Math.floor(totalCurfewMin / 60);
  const m = totalCurfewMin % 60;
  return {
    curfewTime: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    hoursPrior: 9.5,
    citation: 'Drake et al., J Clin Sleep Med 2013'
  };
}

// 4. Time-Restricted Eating (TRE) Window - Dr. Satchin Panda (Cell Metabolism, Salk Institute)
export function calculateFastingWindow(wakeTime?: string, protocol: 'none' | '12_12' | '14_10' | '16_8' = '14_10'): {
  start: string;
  end: string;
  fastHours: number;
  feedHours: number;
  citation: string;
} {
  const wakeH = wakeTime ? parseInt(wakeTime.split(':')[0], 10) || 7 : 7;
  const wakeM = wakeTime ? parseInt(wakeTime.split(':')[1], 10) || 30 : 30;
  const wakeMinutes = wakeH * 60 + wakeM;

  let delayFromWake = 120; // 2 hours after waking
  let feedHours = 10;
  let fastHours = 14;

  if (protocol === '16_8') {
    delayFromWake = 240; // 4 hours after waking
    feedHours = 8;
    fastHours = 16;
  } else if (protocol === '12_12') {
    delayFromWake = 60; // 1 hour after waking
    feedHours = 12;
    fastHours = 12;
  } else if (protocol === 'none') {
    return {
      start: '08:00',
      end: '21:00',
      fastHours: 0,
      feedHours: 13,
      citation: 'Unrestricted Baseline'
    };
  }

  const startMin = (wakeMinutes + delayFromWake) % 1440;
  const endMin = (startMin + feedHours * 60) % 1440;

  const startH = Math.floor(startMin / 60);
  const startM = startMin % 60;
  const endH = Math.floor(endMin / 60);
  const endM = endMin % 60;

  return {
    start: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
    end: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
    fastHours,
    feedHours,
    citation: 'Panda et al., Cell Metabolism (Salk Inst.)'
  };
}

// 5. Zone 2 Target Heart Rate - Dr. Peter Attia / AHA Cardiorespiratory Longevity
export function calculateZone2HR(age: number): { min: number; max: number; citation: string } {
  const userAge = age > 0 ? age : 28;
  const maxHR = 220 - userAge;
  return {
    min: Math.round(maxHR * 0.65),
    max: Math.round(maxHR * 0.75),
    citation: 'Attia / AHA Mitochondrial Base'
  };
}

// 6. Ultradian Focus Cadence - Nathaniel Kleitman BRAC (Basic Rest-Activity Cycle)
export function calculateUltradianBlocks(dailyFocusHours: number): { blocks90min: number; totalMinutes: number; citation: string } {
  const hours = dailyFocusHours > 0 ? dailyFocusHours : 4;
  const totalMinutes = Math.round(hours * 60);
  const blocks90min = Math.round((totalMinutes / 90) * 10) / 10;
  return {
    blocks90min,
    totalMinutes,
    citation: 'Kleitman 90-Min Ultradian BRAC'
  };
}

export function calculateWaterTarget(weightKg: number): number {
  if (!weightKg || weightKg <= 0) return 2500;
  // Standard physiological guideline: ~35ml per kg of body weight
  const ml = weightKg * 35;
  return Math.round(ml / 100) * 100;
}

export function calculateSleepDuration(sleepTime?: string, wakeTime?: string): number {
  if (!sleepTime || !wakeTime) return 8;
  const [sH, sM] = sleepTime.split(':').map(Number);
  const [wH, wM] = wakeTime.split(':').map(Number);
  if (isNaN(sH) || isNaN(wH)) return 8;

  let startMinutes = sH * 60 + (sM || 0);
  let endMinutes = wH * 60 + (wM || 0);

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60; // Next day
  }

  const durationHours = (endMinutes - startMinutes) / 60;
  return Math.round(durationHours * 10) / 10;
}

export interface ProfileCompletionStats {
  percentage: number;
  level: 'novice' | 'focused' | 'advanced' | 'master';
  levelTitleEn: string;
  levelTitleBn: string;
  levelBadgeColor: string;
  completedItemsCount: number;
  totalItemsCount: number;
  missingItemsEn: string[];
  missingItemsBn: string[];
}

export function calculateProfileCompletion(account?: Account): ProfileCompletionStats {
  if (!account) {
    return {
      percentage: 0,
      level: 'novice',
      levelTitleEn: 'Basic Setup',
      levelTitleBn: 'প্রাথমিক প্রোফাইল',
      levelBadgeColor: 'text-gray-400 border-gray-700 bg-gray-900',
      completedItemsCount: 0,
      totalItemsCount: 9,
      missingItemsEn: ['Name', 'Role'],
      missingItemsBn: ['নাম', 'পেশা/রোল']
    };
  }

  const p = account.profileDetails || {};

  const checklist: { 
    id: string; 
    done: boolean; 
    weight: number; 
    labelEn: string; 
    labelBn: string; 
  }[] = [
    // 1. Identity baseline (15%)
    { id: 'name', done: Boolean(account.name && account.name.trim().length > 0), weight: 10, labelEn: 'Profile Name & Avatar', labelBn: 'নাম ও প্রোফাইল ছবি' },
    { id: 'role', done: Boolean(account.role), weight: 5, labelEn: 'Persona & Role Architecture', labelBn: 'মূল ভূমিকা / রোল' },
    
    // 2. Metabolic & Bio-Health Baseline (Mifflin-St Jeor 1990) (15%)
    { id: 'bioMetrics', done: Boolean(p.heightCm && p.weightKg && p.age && p.heightCm > 0 && p.weightKg > 0), weight: 15, labelEn: 'Age, Height & Weight (BMI/BMR)', labelBn: 'বয়স, উচ্চতা ও ওজন (BMI/BMR)' },
    
    // 3. Circadian & Sleep Window (Walker / Drake 2013) (15%)
    { id: 'sleepCircadian', done: Boolean(p.targetSleepTime && p.targetWakeTime), weight: 15, labelEn: 'Circadian Sleep & Caffeine Curfew', labelBn: 'সারকাডিয়ান ঘুম ও ক্যাফেইন কার্ফু' },

    // 4. Time-Restricted Feeding / Metabolic Cadence (Panda 2019) (10%)
    { id: 'metabolicCadence', done: Boolean(p.activityLevel || p.fastingProtocol), weight: 10, labelEn: 'Activity Level & Fasting Protocol', labelBn: 'শারীরিক গতিশীলতা ও ফাস্টিং প্রটোকল' },

    // 5. Cardiorespiratory & Light Exposure (Attia / Huberman) (10%)
    { id: 'cardioMitochondrial', done: Boolean(p.weeklyZone2MinutesTarget || p.morningLightMinutesTarget), weight: 10, labelEn: 'Zone 2 Cardio & Morning Sunlight', labelBn: 'জোন ২ কার্ডিও ও মর্নিং সানলাইট' },

    // 6. Professional Persona & Ultradian Cadence (Kleitman BRAC) (15%)
    { id: 'professionWork', done: Boolean(p.profession && (p.dailyFocusHoursTarget || p.workStyle)), weight: 15, labelEn: 'Profession & 90-Min Ultradian Target', labelBn: 'পেশা ও ৯০ মিনিটের আল্ট্রাডিয়ান লক্ষ্য' },

    // 7. Financial Resilience (Trinity Study / 50-30-20) (10%)
    { id: 'financeBlueprint', done: Boolean(p.monthlyIncome && p.savingsTargetPercent), weight: 10, labelEn: 'Income & Savings Velocity', labelBn: 'মাসিক আয় ও সঞ্চয়ের হার' },

    // 8. 1-Year North Star Strategic Compass (Gollwitzer) (10%)
    { id: 'northStar', done: Boolean(p.northStarGoal && p.northStarGoal.trim().length > 0), weight: 10, labelEn: '1-Year North Star Strategic Compass', labelBn: '১ বছরের মূল নর্থ স্টার কম্পাস' }
  ];

  let earnedPercentage = 0;
  let completedCount = 0;
  const missingEn: string[] = [];
  const missingBn: string[] = [];

  for (const item of checklist) {
    if (item.done) {
      earnedPercentage += item.weight;
      completedCount++;
    } else {
      missingEn.push(item.labelEn);
      missingBn.push(item.labelBn);
    }
  }

  earnedPercentage = Math.min(100, Math.max(0, earnedPercentage));

  let level: 'novice' | 'focused' | 'advanced' | 'master' = 'novice';
  let levelTitleEn = 'Bronze • Novice';
  let levelTitleBn = 'ব্রোঞ্জ • প্রাথমিক';
  let levelBadgeColor = 'text-amber-400 border-amber-500/30 bg-amber-950/20';

  if (earnedPercentage >= 100) {
    level = 'master';
    levelTitleEn = '🏆 All-Star Master (100%)';
    levelTitleBn = '🏆 অল-স্টার মাস্টার (১০০%)';
    levelBadgeColor = 'text-lime-300 border-lime-400/50 bg-lime-950/40 shadow-sm shadow-lime-400/20';
  } else if (earnedPercentage >= 70) {
    level = 'advanced';
    levelTitleEn = '🥇 Gold • High Performer';
    levelTitleBn = '🥇 গোল্ড • হাই-পারফরমার';
    levelBadgeColor = 'text-yellow-300 border-yellow-400/40 bg-yellow-950/30';
  } else if (earnedPercentage >= 40) {
    level = 'focused';
    levelTitleEn = '🥈 Silver • Optimized';
    levelTitleBn = '🥈 সিলভার • অপ্টিমাইজড';
    levelBadgeColor = 'text-sky-300 border-sky-400/40 bg-sky-950/30';
  }

  return {
    percentage: earnedPercentage,
    level,
    levelTitleEn,
    levelTitleBn,
    levelBadgeColor,
    completedItemsCount: completedCount,
    totalItemsCount: checklist.length,
    missingItemsEn: missingEn,
    missingItemsBn: missingBn
  };
}

export interface CircadianPhaseInfo {
  phaseKey: 'morning_peak' | 'midday_slump' | 'afternoon_drive' | 'evening_winddown' | 'night_recovery';
  phaseNameEn: string;
  phaseNameBn: string;
  taglineEn: string;
  taglineBn: string;
  optimalFocusEn: string;
  optimalFocusBn: string;
  energyLevelPercent: number;
  colorClass: string;
  bgGradient: string;
  accentBorder: string;
  progressPercent: number; // 0 - 100 representing position in 24hr cycle
}

export function getCircadianPhase(details?: UserProfileDetails, nowDate: Date = new Date()): CircadianPhaseInfo {
  const currentHours = nowDate.getHours();
  const currentMinutes = nowDate.getMinutes();
  const currentTotalMin = currentHours * 60 + currentMinutes;
  const progressPercent = Math.round((currentTotalMin / 1440) * 100);

  // Parse wake and sleep times with safe fallbacks
  let wakeH = 7;
  let wakeM = 30;
  let sleepH = 23;
  let sleepM = 30;

  if (details?.targetWakeTime) {
    const [h, m] = details.targetWakeTime.split(':').map(Number);
    if (!isNaN(h)) { wakeH = h; wakeM = m || 0; }
  }
  if (details?.targetSleepTime) {
    const [h, m] = details.targetSleepTime.split(':').map(Number);
    if (!isNaN(h)) { sleepH = h; sleepM = m || 0; }
  }

  // Adjust for chronotype if custom times aren't explicitly customized
  if (!details?.targetWakeTime && details?.chronotype === 'lark') {
    wakeH = 6; wakeM = 0; sleepH = 22; sleepM = 0;
  } else if (!details?.targetWakeTime && details?.chronotype === 'owl') {
    wakeH = 9; wakeM = 0; sleepH = 1; sleepM = 30;
  }

  const wakeTotalMin = wakeH * 60 + wakeM;
  let sleepTotalMin = sleepH * 60 + sleepM;
  if (sleepTotalMin <= wakeTotalMin) {
    sleepTotalMin += 1440; // Past midnight
  }

  let normalizedCurrentMin = currentTotalMin;
  if (normalizedCurrentMin < wakeTotalMin && currentTotalMin < 360) {
    normalizedCurrentMin += 1440;
  }

  const minSinceWake = normalizedCurrentMin - wakeTotalMin;

  // Phase classification based on circadian chronobiology
  if (minSinceWake < 0 || normalizedCurrentMin >= sleepTotalMin) {
    return {
      phaseKey: 'night_recovery',
      phaseNameEn: 'Rest & Cellular Recovery',
      phaseNameBn: 'গভীর সারকাডিয়ান ঘুম ও রিকভারি',
      taglineEn: 'Restorative Sleep • Synaptic Pruning',
      taglineBn: 'শারীরবৃত্তীয় পুনরুদ্ধার ও গভীর ঘুম',
      optimalFocusEn: 'Unplug completely. Allow circadian cellular repair and memory consolidation.',
      optimalFocusBn: 'ডিভাইস থেকে দূরে থাকুন। গভীর ঘুমের মাধ্যমে শরীরের শক্তি ও কোষ পুনরুদ্ধার করুন।',
      energyLevelPercent: 20,
      colorClass: 'text-indigo-400',
      bgGradient: 'from-indigo-950/30 via-gray-950 to-gray-950',
      accentBorder: 'border-indigo-500/30',
      progressPercent
    };
  } else if (minSinceWake <= 330) { // Up to 5.5 hours after waking
    return {
      phaseKey: 'morning_peak',
      phaseNameEn: 'Peak Focus & Deep Work',
      phaseNameBn: 'সকালের পিক ফোকাস ও ডিপ-ওয়ার্ক',
      taglineEn: 'Cortisol Primed • Highest Cognitive Bandwidth',
      taglineBn: 'সর্বোচ্চ মনোযোগ ও সিদ্ধান্ত গ্রহণের সময়',
      optimalFocusEn: 'Execute high-complexity tasks, system architecture, and strategic deep work.',
      optimalFocusBn: 'জটিল কাজ, কোডিং, স্ট্র্যাটেজি ও সবচেয়ে গুরুত্বপূর্ণ অগ্রাধিকারগুলো সম্পন্ন করুন।',
      energyLevelPercent: 94,
      colorClass: 'text-lime-400',
      bgGradient: 'from-lime-950/30 via-gray-950 to-gray-950',
      accentBorder: 'border-lime-400/40',
      progressPercent
    };
  } else if (minSinceWake <= 480) { // 5.5 to 8 hours after waking (post-lunch dip)
    return {
      phaseKey: 'midday_slump',
      phaseNameEn: 'Post-Prandial Dip & Admin',
      phaseNameBn: 'দুপুরের রিকভারি ও হালকা কাজ',
      taglineEn: 'Digestive Shift • Core Temp Dip',
      taglineBn: 'হজম প্রক্রিয়া ও হালকা বিশ্রামের সময়',
      optimalFocusEn: 'Low-cognitive email triage, admin tasks, hydration, and a brisk 10-min walk.',
      optimalFocusBn: 'ইমেইল ট্রায়াজ, হালকা রুটিন কাজ, পানি পান এবং ১০ মিনিটের হালকা হাঁটাচলা।',
      energyLevelPercent: 55,
      colorClass: 'text-amber-400',
      bgGradient: 'from-amber-950/30 via-gray-950 to-gray-950',
      accentBorder: 'border-amber-400/40',
      progressPercent
    };
  } else if (minSinceWake <= 750) { // 8 to 12.5 hours after waking
    return {
      phaseKey: 'afternoon_drive',
      phaseNameEn: 'Afternoon Second Wind',
      phaseNameBn: 'বিকেলের সেকেন্ড উইন্ড ও স্প্রিন্ট',
      taglineEn: 'Physical & Execution Surge',
      taglineBn: 'কাজের দ্বিতীয় পর্যায় ও শারীরিক গতিশীলতা',
      optimalFocusEn: 'Meetings, task sprints, collaborative reviews, and physical training.',
      optimalFocusBn: 'মিটিং, স্প্রিন্ট টাস্ক সম্পন্নকরণ, দলগত সমন্বয় এবং ফিটনেস ওয়ার্কআউট।',
      energyLevelPercent: 82,
      colorClass: 'text-cyan-400',
      bgGradient: 'from-cyan-950/30 via-gray-950 to-gray-950',
      accentBorder: 'border-cyan-400/40',
      progressPercent
    };
  } else { // Wind down prior to sleep
    return {
      phaseKey: 'evening_winddown',
      phaseNameEn: 'Evening Melatonin Wind-down',
      phaseNameBn: 'সন্ধ্যার মেলাটোনিন ট্রানজিশন ও রিল্যাক্স',
      taglineEn: 'Dim Light • Parasympathetic Activation',
      taglineBn: 'স্ক্রিন টাইম কমানো ও পরদিনের প্রস্তুতি',
      optimalFocusEn: 'Evening reflection, dim warm lights, log daily wins, plan tomorrow\'s Rule of 3.',
      optimalFocusBn: 'দিনের সফলতার মূল্যায়ন, মৃদু আলো, এবং আগামীকালের ৩টি প্রধান কাজের পরিকল্পনা।',
      energyLevelPercent: 42,
      colorClass: 'text-purple-400',
      bgGradient: 'from-purple-950/30 via-gray-950 to-gray-950',
      accentBorder: 'border-purple-400/40',
      progressPercent
    };
  }
}

export function calculateDaysRemaining(deadlineStr?: string): { days: number; isOverdue: boolean; labelEn: string; labelBn: string } | null {
  if (!deadlineStr) return null;
  const target = new Date(deadlineStr);
  if (isNaN(target.getTime())) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      isOverdue: true,
      labelEn: `${Math.abs(diffDays)}d overdue`,
      labelBn: `${Math.abs(diffDays)} দিন অতিক্রান্ত`
    };
  } else if (diffDays === 0) {
    return {
      days: 0,
      isOverdue: false,
      labelEn: 'Due Today',
      labelBn: 'আজ শেষ দিন'
    };
  } else {
    return {
      days: diffDays,
      isOverdue: false,
      labelEn: `${diffDays} days remaining`,
      labelBn: `${diffDays} দিন বাকি`
    };
  }
}

