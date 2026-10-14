import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Account, Task, RuleOf3Item, Transaction, Debt, MealReminder, Habit, 
  CurrencySymbol, LanguageCode, ModuleId, RoleKey 
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
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: number) => void;
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
  switchAccount: (id: string) => void;
  createAccount: (name: string, avatar: string, role: RoleKey, pin?: string) => void;
  deleteAccount: (id: string) => void;
}

const defaultAccounts: Account[] = [
  {
    id: 'acc_default',
    name: 'Md. Soyaeb Hossain',
    avatar: '👤',
    role: 'universal',
    createdAt: new Date().toISOString()
  }
];

const defaultMeals: MealReminder[] = [
  { id: 'breakfast', name: 'Breakfast', nameBn: 'সকালের নাস্তা', icon: '🥪', time: '08:30', enabled: true, done: false, advice: 'পুষ্টিকর নাস্তা খেয়ে দিনটি চমৎকারভাবে শুরু করুন!' },
  { id: 'lunch', name: 'Lunch', nameBn: 'দুপুরের খাবার', icon: '🥗', time: '13:30', enabled: true, done: false, advice: 'কাজের বিরতি নিয়ে দুপুরের খাবার সেরে নিন।' },
  { id: 'snack', name: 'Afternoon Tea', nameBn: 'বিকেলের চা ও নাস্তা', icon: '☕', time: '17:30', enabled: true, done: false, advice: 'একটু চা/কফি পান করে শরীর সতেজ করুন।' },
  { id: 'dinner', name: 'Dinner', nameBn: 'রাতের খাবার', icon: '🍲', time: '20:45', enabled: true, done: false, advice: 'হালকা রাতের খাবার খেয়ে শরীরকে বিশ্রাম দিন।' }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => loadLocalData('nexus_accounts', defaultAccounts));
  const [activeAccountId, setActiveAccountId] = useState<string>(() => localStorage.getItem('nexus_active_account_id') || 'acc_default');
  const [currency, setCurrencyState] = useState<CurrencySymbol>(() => (localStorage.getItem('nexus_currency') as CurrencySymbol) || '৳');
  const [lang, setLangState] = useState<LanguageCode>(() => (localStorage.getItem('nexus_lang') as LanguageCode) || 'bn');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadLocalData(prefix + 'transactions', []));
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(() => parseFloat(localStorage.getItem(prefix + 'monthly_budget') || '50000'));
  const [habitStreak, setHabitStreak] = useState<number>(() => parseInt(localStorage.getItem(prefix + 'habit_streak') || '1'));
  const [mealReminders, setMealReminders] = useState<MealReminder[]>(() => loadLocalData(prefix + 'meal_reminders', defaultMeals));
  const [waterMl, setWaterMl] = useState<number>(() => parseInt(localStorage.getItem(prefix + 'water') || '1250'));

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
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

  // Sync to local storage and backend
  useEffect(() => {
    saveLocalData(prefix + 'tasks', tasks);
    saveLocalData(prefix + 'rule_of_3', ruleOf3);
    saveLocalData(prefix + 'transactions', transactions);
    localStorage.setItem(prefix + 'monthly_budget', monthlyBudget.toString());
    localStorage.setItem(prefix + 'habit_streak', habitStreak.toString());
    saveLocalData(prefix + 'meal_reminders', mealReminders);
    localStorage.setItem(prefix + 'water', waterMl.toString());

    // Hybrid background sync with backend server
    syncWithBackend(activeAccountId, {
      tasks,
      ruleOf3,
      transactions,
      monthlyBudget,
      habitStreak,
      mealReminders,
      waterMl
    });
  }, [tasks, ruleOf3, transactions, monthlyBudget, habitStreak, mealReminders, waterMl, activeAccountId, prefix]);

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
        if (next) playChime(950);
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
    setRuleOf3(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, done: !item.done } : item);
      const allDone = updated.every(item => item.done);
      if (allDone) {
        playCelebrationArpeggio();
        showToast(lang === 'bn' ? '🏆 অসাধারণ! ৩টি প্রধান লক্ষ্যই অর্জিত হয়েছে!' : '🏆 Brilliant! All 3 daily priorities conquered!');
      } else {
        playChime(900);
      }
      return updated;
    });
    incrementStreak();
  };

  const updateRuleOf3Text = (id: number, text: string) => {
    setRuleOf3(prev => prev.map(item => item.id === id ? { ...item, text } : item));
  };

  const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
    const newTrans: Transaction = {
      ...t,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [newTrans, ...prev]);
    playChime(t.type === 'income' ? 1050 : 750);
    showToast(`${currency} ${t.amount.toLocaleString()} (${t.category}) logged!`);
    incrementStreak();
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction removed');
  };

  const setMonthlyBudget = (amt: number) => {
    setMonthlyBudgetState(amt);
    showToast(`Monthly budget set to ${currency} ${amt.toLocaleString()}`);
  };

  const incrementStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem(prefix + 'last_active_date');
    if (lastDate !== today) {
      setHabitStreak(prev => prev + 1);
      localStorage.setItem(prefix + 'last_active_date', today);
    }
  };

  const toggleMealDone = (id: string) => {
    setMealReminders(prev => prev.map(m => {
      if (m.id === id) {
        const next = !m.done;
        if (next) {
          playChime(1050);
          showToast(lang === 'bn' ? `${m.nameBn} সম্পন্ন হয়েছে!` : `${m.name} completed!`);
          incrementStreak();
        }
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
    showToast(`Reminder time updated to ${time}`);
  };

  const addWater = (ml: number) => {
    setWaterMl(prev => Math.min(5000, prev + ml));
    playChime(1100);
    showToast(`+${ml} ml Hydration logged!`);
    incrementStreak();
  };

  const resetWater = () => setWaterMl(0);

  // Calculate Next Upcoming Meal
  const nextMeal = React.useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let upcoming: MealReminder | null = null;
    let minDiff = Infinity;

    mealReminders.forEach(m => {
      if (!m.enabled) return;
      const [h, min] = m.time.split(':').map(Number);
      const mealMinutes = h * 60 + min;
      const diff = mealMinutes - currentMinutes;
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        upcoming = m;
      }
    });

    return upcoming || mealReminders[0];
  }, [mealReminders]);

  // Account Operations
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
    playChime(980);
    showToast(lang === 'bn' ? `স্পেস পরিবর্তন: ${activeAccount.name}` : `Switched workspace`);
  };

  const createAccount = (name: string, avatar: string, role: RoleKey, pin?: string) => {
    const newAcc: Account = {
      id: 'acc_' + Date.now(),
      name,
      avatar,
      role,
      pin,
      createdAt: new Date().toISOString()
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

  return (
    <AppContext.Provider value={{
      accounts, activeAccountId, activeAccount, currency, setCurrency,
      lang, setLang, theme, toggleTheme, activeModule, setActiveModule,
      isFocusMode, setIsFocusMode, tasks, addTask, toggleTask, deleteTask,
      ruleOf3, toggleRuleOf3, updateRuleOf3Text, transactions, addTransaction,
      deleteTransaction, monthlyBudget, setMonthlyBudget, habitStreak, incrementStreak,
      mealReminders, toggleMealDone, toggleMealEnabled, updateMealTime, nextMeal,
      waterMl, addWater, resetWater, toastMessage, showToast,
      isAccountModalOpen, openAccountModal: () => setIsAccountModalOpen(true), closeAccountModal: () => setIsAccountModalOpen(false),
      isSettingsModalOpen, openSettingsModal: () => setIsSettingsModalOpen(true), closeSettingsModal: () => setIsSettingsModalOpen(false),
      isSearchModalOpen, openSearchModal: () => setIsSearchModalOpen(true), closeSearchModal: () => setIsSearchModalOpen(false),
      switchAccount, createAccount, deleteAccount
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
