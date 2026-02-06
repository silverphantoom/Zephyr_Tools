'use client';

import { useState, useEffect, useCallback } from 'react';
import { StreakData, DailyStats } from '@/types/streak';
import { Task } from '@/types';

const STREAK_DATA_KEY = 'pm-app-streak-data';
const DAILY_STATS_KEY = 'pm-app-daily-stats';

const getTodayKey = () => new Date().toISOString().split('T')[0];
const getYesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const getDateKey = (date: Date) => date.toISOString().split('T')[0];

const isConsecutiveDay = (date1: string, date2: string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

const isSameDay = (date1: string, date2: string) => {
  return date1 === date2;
};

export function useStreak(tasks: Task[]) {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    completedDates: [],
    totalTasksCompleted: 0,
  });
  const [dailyStats, setDailyStats] = useState<Record<string, DailyStats>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const storedStreak = localStorage.getItem(STREAK_DATA_KEY);
      const storedStats = localStorage.getItem(DAILY_STATS_KEY);
      
      if (storedStreak) {
        setStreakData(JSON.parse(storedStreak));
      }
      
      if (storedStats) {
        setDailyStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(STREAK_DATA_KEY, JSON.stringify(streakData));
  }, [streakData, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(dailyStats));
  }, [dailyStats, isLoaded]);

  // Calculate streak from tasks
  useEffect(() => {
    if (!isLoaded || tasks.length === 0) return;

    const today = getTodayKey();
    const completedTasks = tasks.filter((t) => t.status === 'done' && t.completedAt);
    
    // Group completed tasks by date
    const tasksByDate = completedTasks.reduce((acc, task) => {
      if (!task.completedAt) return acc;
      const dateKey = task.completedAt.split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    // Get dates with completed tasks (sorted)
    const datesWithCompletions = Object.keys(tasksByDate).sort();
    
    // Update streak data
    setStreakData((prev) => {
      let currentStreak = 0;
      let longestStreak = prev.longestStreak;
      let lastCompletedDate = prev.lastCompletedDate;
      
      // Check if we have completions today
      const hasCompletionToday = datesWithCompletions.includes(today);
      const hasCompletionYesterday = datesWithCompletions.includes(getYesterdayKey());
      
      // Calculate current streak
      if (hasCompletionToday) {
        currentStreak = 1;
        lastCompletedDate = today;
        
        // Count backwards
        let checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - 1);
        
        while (true) {
          const dateKey = getDateKey(checkDate);
          if (datesWithCompletions.includes(dateKey)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      } else if (hasCompletionYesterday) {
        // Streak continues if yesterday had completions
        currentStreak = 1;
        lastCompletedDate = getYesterdayKey();
        
        let checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - 2);
        
        while (true) {
          const dateKey = getDateKey(checkDate);
          if (datesWithCompletions.includes(dateKey)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      } else {
        // Check if there's any streak from previous dates
        const yesterday = getYesterdayKey();
        if (prev.lastCompletedDate && isConsecutiveDay(prev.lastCompletedDate, yesterday)) {
          // Streak was broken today but was active yesterday
          currentStreak = 0;
        }
      }
      
      // Update longest streak
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      
      return {
        ...prev,
        currentStreak,
        longestStreak,
        lastCompletedDate,
        completedDates: datesWithCompletions,
        totalTasksCompleted: completedTasks.length,
      };
    });

    // Update daily stats
    setDailyStats((prev) => {
      const updated = { ...prev };
      
      // Update stats for each date
      datesWithCompletions.forEach((date) => {
        if (!updated[date]) {
          updated[date] = {
            date,
            tasksCompleted: 0,
            tasksCreated: 0,
            pomodoroMinutes: 0,
          };
        }
        updated[date].tasksCompleted = tasksByDate[date].length;
      });
      
      return updated;
    });
  }, [tasks, isLoaded]);

  const recordTaskCompletion = useCallback((taskId: string) => {
    const today = getTodayKey();
    
    setStreakData((prev) => {
      // Check if this is the first completion today
      const isFirstCompletionToday = !prev.completedDates.includes(today);
      
      let currentStreak = prev.currentStreak;
      
      if (isFirstCompletionToday) {
        if (!prev.lastCompletedDate || isConsecutiveDay(prev.lastCompletedDate, today) || isSameDay(prev.lastCompletedDate, today)) {
          currentStreak = prev.currentStreak + 1;
        } else {
          currentStreak = 1;
        }
      }
      
      const newCompletedDates = [...prev.completedDates];
      if (!newCompletedDates.includes(today)) {
        newCompletedDates.push(today);
      }
      
      return {
        ...prev,
        currentStreak,
        longestStreak: Math.max(currentStreak, prev.longestStreak),
        lastCompletedDate: today,
        completedDates: newCompletedDates,
        totalTasksCompleted: prev.totalTasksCompleted + 1,
      };
    });
  }, []);

  const getStreakStatus = useCallback(() => {
    const today = getTodayKey();
    const hasCompletedToday = streakData.completedDates.includes(today);
    
    return {
      hasCompletedToday,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      isStreakActive: streakData.currentStreak > 0,
      daysUntilStreakBreak: hasCompletedToday ? 0 : 1,
    };
  }, [streakData]);

  const getWeeklyProgress = useCallback(() => {
    const days: { date: string; completed: boolean; count: number }[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = getDateKey(d);
      
      days.push({
        date: dateKey,
        completed: streakData.completedDates.includes(dateKey),
        count: dailyStats[dateKey]?.tasksCompleted || 0,
      });
    }
    
    return days;
  }, [streakData, dailyStats]);

  const addPomodoroMinutes = useCallback((minutes: number) => {
    const today = getTodayKey();
    
    setDailyStats((prev) => {
      const updated = { ...prev };
      if (!updated[today]) {
        updated[today] = {
          date: today,
          tasksCompleted: 0,
          tasksCreated: 0,
          pomodoroMinutes: 0,
        };
      }
      updated[today].pomodoroMinutes += minutes;
      return updated;
    });
  }, []);

  return {
    streakData,
    dailyStats,
    isLoaded,
    recordTaskCompletion,
    getStreakStatus,
    getWeeklyProgress,
    addPomodoroMinutes,
  };
}
