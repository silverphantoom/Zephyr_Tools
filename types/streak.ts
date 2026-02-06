/**
 * Type definitions for Streak Counter feature
 */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  completedDates: string[]; // ISO date strings (YYYY-MM-DD)
  totalTasksCompleted: number;
}

export interface DailyStats {
  date: string;
  tasksCompleted: number;
  tasksCreated: number;
  pomodoroMinutes: number;
}
