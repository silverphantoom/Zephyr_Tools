'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Kanban,
  Sun,
  Moon,
  Monitor,
  Timer,
  Zap,
  ClipboardList,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'To-Do List', href: '/todos', icon: CheckSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Kanban', href: '/kanban', icon: Kanban },
  { name: 'CRM', href: '/crm', icon: Users },
];

const coolFeatures = [
  { name: 'Focus Timer', href: '/focus', icon: Timer },
  { name: 'Standup', href: '/standup', icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themeIcon = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }[theme];

  const ThemeIcon = themeIcon;

  const nextTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const next = themes[(currentIndex + 1) % themes.length];
    setTheme(next);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100">PM App</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Project Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Main
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-indigo-600 dark:text-indigo-400' : '')} />
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* Cool Features Section */}
        <div className="mt-6">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Cool Features
          </p>
          {coolFeatures.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 dark:from-indigo-900/20 dark:to-purple-900/20 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center",
                    isActive 
                      ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  )}>
                    <Icon className="w-3 h-3" />
                  </div>
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-r-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between"
          onClick={nextTheme}
        >
          <span className="flex items-center gap-2">
            <ThemeIcon className="w-4 h-4" />
            Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
          <span className="text-xs text-slate-400">
            {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </Button>
      </div>
    </aside>
  );
}
