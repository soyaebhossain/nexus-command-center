import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Account, Task, RuleOf3Item, Transaction, MealReminder, CalendarEvent,
  CurrencySymbol, LanguageCode, ModuleId, RoleKey, UserProfileDetails 
} from '../types';

import { getStoragePrefix, loadLocalData, saveLocalData, syncWithBackend } from '../utils/storage';
import { playChime, playCelebrationArpeggio } from '../utils/audio';
import { sendLocalNotification } from '../utils/notifications';

interface AppContextType {
  accounts: Account[];
  activeAccountId: string;
  activeAccount: Account;
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeModule: ModuleId;
  setActiveModule: (m: ModuleId) => void;
  enabledModules: ModuleId[];
  toggleModuleEnabled: (m: ModuleId) => void;
  enableAllModules: () => void;
  isFocusMode: boolean;
  setIsFocusMode: (f: boolean) => void;
  tasks: Task[];
  addTask: (text: string, priority?: 'high' | 'medium' | 'low', dueTime?: string) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  ruleOf3: RuleOf3Item[];
  toggleRuleOf3: (id: number) => void;
  updateRuleOf3Text: (id: number, text: string) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'> & { date?: string }) => void;
  deleteTransaction: (id: number) => void;
  setAllTransactions: (list: Transaction[]) => void;
  monthlyBudget: number;
  setMonthlyBudget: (amt: number) => void;
  habitStreak: number;
  incrementStreak: () => void;
  mealReminders: MealReminder[];
  toggleMealDone: (id: string) => void;
  toggleMealEnabled: (id: string) => void;
  updateMealTime: (id: string, time: string) => void;
  nextMeal: MealReminder | null;
  waterMl: number;
  addWater: (ml: number) => void;
  resetWater: () => void;
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (ev: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: number) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Modals
  isAccountModalOpen: boolean;
  openAccountModal: () => void;
  closeAccountModal: () => void;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  isSearchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  isProfileWizardOpen: boolean;
  openProfileWizard: () => void;
  closeProfileWizard: () => void;
  switchAccount: (id: string) => void;
  createAccount: (name: string, avatar: string, role: RoleKey, pin?: string, details?: Partial<UserProfileDetails>) => void;
  deleteAccount: (id: string) => void;
  updateAccountName: (name: string) => void;
  updateProfileDetails: (details: Partial<UserProfileDetails>) => void;
  loadDemoData: () => void;
  factoryReset: () => void;
}

const defaultAccounts: Account[] = [
  {
    id: 'acc_default',
    name: 'Md. Soyaeb Hossain',
    avatar: '👤',
    role: 'universal',
    createdAt: new Date().toISOString(),
    profileDetails: {
      age: 26,
      gender: 'male',
      heightCm: 175,
      weightKg: 70,
      bmi: 22.9,
      bmiCategory: 'Normal',
      targetWaterMl: 2500,
      targetSleepTime: '23:30',
      targetWakeTime: '07:30',
      chronotype: 'lark',
      profession: 'Solutions Architect & Tech Lead',
      workStyle: 'hybrid',
      dailyFocusHoursTarget: 5,
      monthlyIncome: 85000,
      savingsTargetPercent: 25,
      emergencyFundMonths: 6,
      northStarGoal: 'Scale Al-Ameen IT infrastructure & achieve peak circadian health',
      northStarDeadline: '2026-12-31'
    }
  }
];


const defaultMeals: MealReminder[] = [
  { id: 'breakfast', name: 'Breakfast', nameBn: 'সকালের নাস্তা', icon: '🥪', time: '08:30', enabled: true, done: false, advice: 'পুষ্টিকর নাস্তা খেয়ে দিনটি চমৎকারভাবে শুরু করুন!' },
  { id: 'lunch', name: 'Lunch', nameBn: 'দুপুরের খাবার', icon: '🥗', time: '13:30', enabled: true, done: false, advice: 'কাজের বিরতি নিয়ে দুপুরের খাবার সেরে নিন।' },
  { id: 'snack', name: 'Afternoon Tea', nameBn: 'বিকেলের চা ও নাস্তা', icon: '☕', time: '17:30', enabled: true, done: false, advice: 'একটু চা/কফি পান করে শরীর সতেজ করুন।' },
  { id: 'dinner', name: 'Dinner', nameBn: 'রাতের খাবার', icon: '🍲', time: '20:45', enabled: true, done: false, advice: 'হালকা রাতের খাবার খেয়ে শরীরকে বিশ্রাম দিন।' }
];

const defaultCalendarEvents: CalendarEvent[] = [
  { id: 1, title: 'Quarterly Executive Review', date: '2026-10-18', time: '11:00', type: 'meeting' },
  { id: 2, title: 'Electricity & Internet Bill Due', date: '2026-10-22', time: '18:00', type: 'bill' },
  { id: 3, title: 'System Architecture Exam', date: '2026-10-25', time: '10:00', type: 'exam' },
  { id: 4, title: 'Family Weekend Dinner', date: '2026-10-30', time: '20:00', type: 'family' }
];

const defaultSampleTransactions: Transaction[] = [
  { id: 1, type: 'income', category: 'Salary', amount: 65000, desc: 'Monthly Executive Compensation', date: '2026-10-01' },
  { id: 2, type: 'expense', category: 'বাড়ি ভাড়া ও ইউটিলিটি', amount: 18000, desc: 'Apartment rent & maintenance', date: '2026-10-02' },
  { id: 3, type: 'expense', category: 'খাদ্য ও বাজার', amount: 12500, desc: 'Fresh groceries & market supply', date: '2026-10-05' },
  { id: 4, type: 'expense', category: 'স্বাস্থ্য ও চিকিৎসা', amount: 4500, desc: 'Routine checkup & vitamins', date: '2026-10-07' },
  { id: 5, type: 'expense', category: 'যাতায়াত ও পরিবহন', amount: 3800, desc: 'Monthly fuel & metro pass', date: '2026-10-09' },
  { id: 6, type: 'expense', category: 'বিনোদন ও রেস্তোরাঁ', amount: 2500, desc: 'Weekend dining & cafe', date: '2026-10-12' }
];

const ALL_MODULES: ModuleId[] = ['dashboard', 'tasks', 'triage', 'finance', 'health', 'planner', 'calendar', 'learning'];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const loaded = loadLocalData<Account[]>('nexus_accounts', defaultAccounts);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      return defaultAccounts;
    }
    return loaded;
  });
  const [activeAccountId, setActiveAccountId] = useState<string>(() => localStorage.getItem('nexus_active_account_id') || 'acc_default');

  const [currency, setCurrencyState] = useState<CurrencySymbol>(() => (localStorage.getItem('nexus_currency') as CurrencySymbol) || '৳');
  const [lang, setLangState] = useState<LanguageCode>(() => (localStorage.getItem('nexus_lang') as LanguageCode) || 'bn');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [enabledModules, setEnabledModules] = useState<ModuleId[]>(() => {
    const loaded = loadLocalData<ModuleId[]>('nexus_enabled_modules', ALL_MODULES);
    if (Array.isArray(loaded) && !loaded.includes('triage')) {
      return [...loaded, 'triage'];
    }
    return loaded;
  });

  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProfileWizardOpen, setIsProfileWizardOpen] = useState(false);


  const prefix = getStoragePrefix(activeAccountId);

  // Per-account state
  const [tasks, setTasks] = useState<Task[]>(() => loadLocalData(prefix + 'tasks', [
    { id: 1, text: 'Master modern TypeScript & React architecture', priority: 'high', category: 'Dev', dueDate: new Date().toISOString().split('T')[0], done: false }
  ]));
  const [ruleOf3, setRuleOf3] = useState<RuleOf3Item[]>(() => loadLocalData(prefix + 'rule_of_3', [
    { id: 1, text: 'Review core life priorities', done: false },
    { id: 2, text: 'Log monthly budget & expenses', done: false },
    { id: 3, text: 'Maintain circadian meal & water intake', done: false }
  ]));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadLocalData(prefix + 'transactions', defaultSampleTransactions));
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(() => parseFloat(localStorage.getItem(prefix + 'monthly_budget') || '50000'));
  const [habitStreak, setHabitStreak] = useState<number>(() => parseInt(localStorage.getItem(prefix + 'habit_streak') || '1'));
  const [mealReminders, setMealReminders] = useState<MealReminder[]>(() => loadLocalData(prefix + 'meal_reminders', defaultMeals));
  const [waterMl, setWaterMl] = useState<number>(() => parseInt(localStorage.getItem(prefix + 'water') || '1250'));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => loadLocalData(prefix + 'calendar_events', defaultCalendarEvents));

  const activeAccount: Account = (accounts && accounts.length > 0)
    ? (accounts.find(a => a.id === activeAccountId) || accounts[0])
    : defaultAccounts[0];


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const setCurrency = (c: CurrencySymbol) => {
    setCurrencyState(c);
    localStorage.setItem('nexus_currency', c);
    showToast(`Currency set to ${c}`);
  };

  const setLang = (l: LanguageCode) => {
    setLangState(l);
    localStorage.setItem('nexus_lang', l);
    showToast(l === 'bn' ? 'ভাষা বাংলায় পরিবর্তিত হয়েছে' : 'Language switched to English');
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    showToast(`Theme: ${next.toUpperCase()}`);
  };

  const toggleModuleEnabled = (m: ModuleId) => {
    setEnabledModules(prev => {
      const next = prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m];
      if (next.length === 0) return prev; // Keep at least one
      saveLocalData('nexus_enabled_modules', next);
      return next;
    });
  };

  const enableAllModules = () => {
    setEnabledModules(ALL_MODULES);
    saveLocalData('nexus_enabled_modules', ALL_MODULES);
    showToast('All 7 modules enabled');
  };

  // Sync to local storage and backend
  useEffect(() => {
    saveLocalData(prefix + 'tasks', tasks);
    saveLocalData(prefix + 'rule_of_3', ruleOf3);
    saveLocalData(prefix + 'transactions', transactions);
    localStorage.setItem(prefix + 'monthly_budget', monthlyBudget.toString());
    localStorage.setItem(prefix + 'habit_streak', habitStreak.toString());
    saveLocalData(prefix + 'meal_reminders', mealReminders);
    localStorage.setItem(prefix + 'water', waterMl.toString());
    saveLocalData(prefix + 'calendar_events', calendarEvents);

    // Hybrid background sync with backend server
    syncWithBackend(activeAccountId, {
      tasks,
      ruleOf3,
      transactions,
      monthlyBudget,
      habitStreak,
      mealReminders,
      waterMl,
      calendarEvents
    });
  }, [tasks, ruleOf3, transactions, monthlyBudget, habitStreak, mealReminders, waterMl, calendarEvents, activeAccountId, prefix]);

  const addTask = (text: string, priority: 'high' | 'medium' | 'low' = 'medium', dueTime?: string) => {
    const newTask: Task = {
      id: Date.now(),
      text,
      priority,
      category: 'Work',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime,
      done: false
    };
    setTasks(prev => [newTask, ...prev]);
    playChime(850);
    showToast(lang === 'bn' ? `কাজ যুক্ত হয়েছে: "${text}"` : `Task added: "${text}"`);
    incrementStreak();
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const next = !t.done;
        if (next) {
          playCelebrationArpeggio();
          showToast(lang === 'bn' ? 'অভিনন্দন! কাজ সম্পন্ন হয়েছে 🎉' : 'Task completed! Keep shining!');
        }
        return { ...t, done: next };
      }
      return t;
    }));
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('Task removed');
  };

  const toggleRuleOf3 = (id: number) => {
    setRuleOf3(prev => prev.map(r => {
      if (r.id === id) {
        const next = !r.done;
        if (next) {
          playCelebrationArpeggio();
          showToast(lang === 'bn' ? 'Rule of 3 কাজ সম্পন্ন!' : 'Rule of 3 priority conquered!');
        }
        return { ...r, done: next };
      }
      return r;
    }));
  };

  const updateRuleOf3Text = (id: number, text: string) => {
    setRuleOf3(prev => prev.map(r => r.id === id ? { ...r, text } : r));
  };

  const addTransaction = (t: Omit<Transaction, 'id'> & { date?: string }) => {
    const newTr: Transaction = {
      ...t,
      id: Date.now(),
      date: t.date || new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [newTr, ...prev]);
    playChime(t.type === 'income' ? 1050 : 650);
    showToast(t.type === 'income' ? `+ Income logged: ${currency}${t.amount}` : `- Expense logged: ${currency}${t.amount}`);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction removed');
  };

  const setAllTransactions = (list: Transaction[]) => {
    setTransactions(list);
  };

  const setMonthlyBudget = (amt: number) => {
    setMonthlyBudgetState(amt);
    showToast(`Monthly budget set to ${currency}${amt}`);
  };

  const incrementStreak = () => {
    setHabitStreak(prev => prev + 1);
  };

  const toggleMealDone = (id: string) => {
    setMealReminders(prev => prev.map(m => {
      if (m.id === id) {
        const next = !m.done;
        if (next) playChime(950);
        return { ...m, done: next };
      }
      return m;
    }));
  };

  const toggleMealEnabled = (id: string) => {
    setMealReminders(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const updateMealTime = (id: string, time: string) => {
    setMealReminders(prev => prev.map(m => m.id === id ? { ...m, time } : m));
  };

  const addWater = (ml: number) => {
    setWaterMl(prev => Math.min(4000, prev + ml));
    playChime(1100);
    showToast(`+${ml}ml water logged! Stay hydrated.`);
  };

  const resetWater = () => {
    setWaterMl(0);
    showToast('Water target reset');
  };

  const addCalendarEvent = (ev: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = {
      ...ev,
      id: Date.now()
    };
    setCalendarEvents(prev => [...prev, newEv]);
    playChime(920);
    showToast(`Event added: "${ev.title}"`);
  };

  const deleteCalendarEvent = (id: number) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    showToast('Event removed');
  };

  const switchAccount = (id: string) => {
    setActiveAccountId(id);
    localStorage.setItem('nexus_active_account_id', id);
    const newPrefix = getStoragePrefix(id);
    setTasks(loadLocalData(newPrefix + 'tasks', []));
    setRuleOf3(loadLocalData(newPrefix + 'rule_of_3', []));
    setTransactions(loadLocalData(newPrefix + 'transactions', []));
    setMonthlyBudgetState(parseFloat(localStorage.getItem(newPrefix + 'monthly_budget') || '50000'));
    setHabitStreak(parseInt(localStorage.getItem(newPrefix + 'habit_streak') || '1'));
    setMealReminders(loadLocalData(newPrefix + 'meal_reminders', defaultMeals));
    setWaterMl(parseInt(localStorage.getItem(newPrefix + 'water') || '1250'));
    setCalendarEvents(loadLocalData(newPrefix + 'calendar_events', defaultCalendarEvents));
    playChime(980);
    showToast(`Switched workspace`);
  };

  const createAccount = (name: string, avatar: string, role: RoleKey, pin?: string, details?: Partial<UserProfileDetails>) => {
    const newAcc: Account = {
      id: 'acc_' + Date.now(),
      name,
      avatar,
      role,
      pin,
      createdAt: new Date().toISOString(),
      profileDetails: details
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    saveLocalData('nexus_accounts', updated);
    switchAccount(newAcc.id);
    showToast(`New profile created: "${name}"`);
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      showToast('Cannot delete the only remaining profile');
      return;
    }
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    saveLocalData('nexus_accounts', updated);
    switchAccount(updated[0].id);
    showToast('Profile deleted');
  };

  const updateAccountName = (name: string) => {
    if (!name.trim()) return;
    const updated = accounts.map(a => a.id === activeAccountId ? { ...a, name: name.trim() } : a);
    setAccounts(updated);
    saveLocalData('nexus_accounts', updated);
    showToast('Profile name updated');
  };

  const updateProfileDetails = (details: Partial<UserProfileDetails>) => {
    const updated = accounts.map(a => {
      if (a.id === activeAccountId) {
        const mergedDetails: UserProfileDetails = {
          ...(a.profileDetails || {}),
          ...details
        };
        return { ...a, profileDetails: mergedDetails };
      }
      return a;
    });
    setAccounts(updated);
    saveLocalData('nexus_accounts', updated);
    showToast(lang === 'bn' ? 'প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে' : 'Profile bio-cadence details saved');
  };

  const loadDemoData = () => {
    setTransactions(defaultSampleTransactions);
    setMonthlyBudgetState(50000);
    setHabitStreak(14);
    setCalendarEvents(defaultCalendarEvents);
    playCelebrationArpeggio();
    showToast(lang === 'bn' ? 'ডেমো ডাটা সফলভাবে লোড হয়েছে!' : 'Demo showcase data loaded!');
  };

  const factoryReset = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত সব ডাটা মুছে ফেলতে চান?' : 'Are you sure you want to reset all data?')) {
      localStorage.clear();
      setTransactions([]);
      setTasks([]);
      setCalendarEvents([]);
      setWaterMl(0);
      setHabitStreak(1);
      showToast('All workspace data reset');
      window.location.reload();
    }
  };

  const nextMeal = mealReminders.find(m => m.enabled && !m.done) || null;

  return (
    <AppContext.Provider value={{
      accounts, activeAccountId, activeAccount, currency, setCurrency,
      lang, setLang, theme, toggleTheme, activeModule, setActiveModule,
      enabledModules, toggleModuleEnabled, enableAllModules,
      isFocusMode, setIsFocusMode, tasks, addTask, toggleTask, deleteTask,
      ruleOf3, toggleRuleOf3, updateRuleOf3Text, transactions, addTransaction,
      deleteTransaction, setAllTransactions, monthlyBudget, setMonthlyBudget, habitStreak, incrementStreak,
      mealReminders, toggleMealDone, toggleMealEnabled, updateMealTime, nextMeal,
      waterMl, addWater, resetWater, calendarEvents, addCalendarEvent, deleteCalendarEvent,
      toastMessage, showToast,
      isAccountModalOpen, openAccountModal: () => setIsAccountModalOpen(true), closeAccountModal: () => setIsAccountModalOpen(false),
      isSettingsModalOpen, openSettingsModal: () => setIsSettingsModalOpen(true), closeSettingsModal: () => setIsSettingsModalOpen(false),
      isSearchModalOpen, openSearchModal: () => setIsSearchModalOpen(true), closeSearchModal: () => setIsSearchModalOpen(false),
      isProfileWizardOpen, openProfileWizard: () => setIsProfileWizardOpen(true), closeProfileWizard: () => setIsProfileWizardOpen(false),
      switchAccount, createAccount, deleteAccount, updateAccountName, updateProfileDetails, loadDemoData, factoryReset
    }}>
      {children}
    </AppContext.Provider>

  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
