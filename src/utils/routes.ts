import { ModuleId } from '../types';

export interface RouteConfig {
  id: ModuleId;
  path: string;
  aliases: string[];
  titleEn: string;
  titleBn: string;
}

export const ROUTE_CONFIGS: Record<ModuleId, RouteConfig> = {
  dashboard: {
    id: 'dashboard',
    path: '/',
    aliases: ['/daily-flow', '/dashboard'],
    titleEn: 'Daily Flow',
    titleBn: 'দৈনিক প্রবাহ'
  },
  tasks: {
    id: 'tasks',
    path: '/tasks',
    aliases: ['/tasks-focus', '/focus'],
    titleEn: 'Tasks & Focus',
    titleBn: 'কাজ ও ফোকাস'
  },
  triage: {
    id: 'triage',
    path: '/daily-email',
    aliases: ['/email', '/inbox', '/triage'],
    titleEn: 'Daily Email',
    titleBn: 'ডেইলি ইমেইল'
  },
  finance: {
    id: 'finance',
    path: '/finance',
    aliases: ['/finance-budget', '/budget'],
    titleEn: 'Finance & Budget',
    titleBn: 'অর্থ ও বাজেট'
  },
  health: {
    id: 'health',
    path: '/health',
    aliases: ['/health-meals', '/meals'],
    titleEn: 'Health & Meals',
    titleBn: 'স্বাস্থ্য ও আহার'
  },
  planner: {
    id: 'planner',
    path: '/planner',
    aliases: ['/life-planner', '/goals'],
    titleEn: 'Life Planner',
    titleBn: 'জীবন পরিকল্পনা'
  },
  calendar: {
    id: 'calendar',
    path: '/calendar',
    aliases: ['/events', '/schedule'],
    titleEn: 'Calendar',
    titleBn: 'ক্যালেন্ডার'
  },
  learning: {
    id: 'learning',
    path: '/learning',
    aliases: ['/learning-skills', '/skills'],
    titleEn: 'Learning & Skills',
    titleBn: 'শিক্ষা ও ক্যারিয়ার'
  }
};

export function getModuleFromUrl(pathname = '', hash = ''): ModuleId {
  const cleanPath = (pathname || '/').toLowerCase().replace(/\/$/, '') || '/';
  const cleanHash = (hash || '').toLowerCase().replace(/^#\/?/, '').replace(/\/$/, '');

  const target = cleanHash ? `/${cleanHash}` : cleanPath;

  for (const key of Object.keys(ROUTE_CONFIGS) as ModuleId[]) {
    const config = ROUTE_CONFIGS[key];
    if (config.path === target || config.aliases.includes(target)) {
      return config.id;
    }
  }

  return 'dashboard';
}

export function getRoutePath(id: ModuleId): string {
  return ROUTE_CONFIGS[id]?.path || '/';
}
