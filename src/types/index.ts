export type RoleKey = 'student' | 'professional' | 'freelancer' | 'business' | 'teacher' | 'family' | 'universal';

export type CurrencySymbol = '৳' | '$' | '€' | '£';

export type LanguageCode = 'bn' | 'en';

export interface UserProfileDetails {
  // Circadian & Bio-Health Metrics
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

  // Professional Persona
  profession?: string;
  workStyle?: 'remote' | 'hybrid' | 'onsite';
  dailyFocusHoursTarget?: number;

  // Financial Blueprint
  monthlyIncome?: number;
  savingsTargetPercent?: number; // e.g. 20%
  emergencyFundMonths?: number; // e.g. 6 months

  // 1-Year North Star Goal
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

