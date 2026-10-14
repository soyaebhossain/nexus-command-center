export type RoleKey = 'student' | 'professional' | 'freelancer' | 'business' | 'teacher' | 'family' | 'universal';

export type CurrencySymbol = '৳' | '$' | '€' | '£';

export type LanguageCode = 'bn' | 'en';

export interface UserProfileDetails {
  // Circadian & Bio-Health Metrics (Huberman, Walker, Panda)
  age?: number;
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  bmiCategory?: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  targetWaterMl?: number;
  targetSleepTime?: string; // e.g. "23:00"
  targetWakeTime?: string; // e.g. "07:00"
  chronotype?: 'lark' | 'owl' | 'balanced';

  // Metabolic & Chrono-Nutrition (Mifflin-St Jeor 1990, Panda Cell Metabolism)
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active';
  bmr?: number; // Basal Metabolic Rate (kcal)
  tdee?: number; // Total Daily Energy Expenditure (kcal)
  caffeineCurfewTime?: string; // Drake et al. 2013 sleep half-life curfew (e.g. "13:30")
  fastingProtocol?: 'none' | '12_12' | '14_10' | '16_8'; // Time-Restricted Feeding
  fastingWindowStart?: string;
  fastingWindowEnd?: string;

  // Cardiovascular & Recovery Baseline (Attia, JAMA Cardiology, Huberman)
  morningLightMinutesTarget?: number; // Morning SCN photon sync (mins)
  weeklyZone2MinutesTarget?: number; // Zone 2 mitochondrial volume (mins/week)
  targetZone2HR?: { min: number; max: number };

  // Professional Persona & Ultradian Cadence (Kleitman BRAC, Newport)
  profession?: string;
  workStyle?: 'remote' | 'hybrid' | 'onsite';
  dailyFocusHoursTarget?: number;
  ultradianCyclesTarget?: number; // 90-minute deep work blocks

  // Financial Blueprint (Trinity Study, 50/30/20 Rule)
  monthlyIncome?: number;
  savingsTargetPercent?: number; // e.g. 20%
  emergencyFundMonths?: number; // e.g. 6 months

  // 1-Year North Star Strategic Compass (Gollwitzer Implementation Intentions)
  northStarGoal?: string;
  northStarDeadline?: string;
}

export interface Account {
  id: string;
  name: string;
  avatar: string;
  role: RoleKey;
  pin?: string;
  createdAt: string;
  profileDetails?: UserProfileDetails;
}


export interface Task {
  id: number;
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  dueDate: string;
  dueTime?: string;
  done: boolean;
  notified?: boolean;
}

export interface RuleOf3Item {
  id: number;
  text: string;
  done: boolean;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  desc: string;
  date: string;
}

export interface Debt {
  id: number;
  person: string;
  amount: number;
  type: 'give' | 'get'; // give = দেনা (payable), get = পাওনা (receivable)
  dueDate: string;
  cleared: boolean;
}

export interface MealReminder {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  time: string;
  enabled: boolean;
  done: boolean;
  advice: string;
}

export interface Habit {
  id: number;
  name: string;
  target: string;
  streak: number;
  done: boolean;
}

export interface Goal {
  id: number;
  title: string;
  horizon: '1-Year' | '3-Year' | 'Strategic';
  category: string;
  progress: number;
  deadline: string;
}

export interface Course {
  id: number;
  name: string;
  platform: string;
  totalHours: number;
  hoursCompleted: number;
  completed: boolean;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
  type: 'task' | 'exam' | 'bill' | 'meeting' | 'family';
  note?: string;
}

export type ModuleId = 
  | 'dashboard'
  | 'planner'
  | 'calendar'
  | 'tasks'
  | 'triage'
  | 'finance'
  | 'learning'
  | 'health';

