/**
 * Type definitions for Pomodoro Timer feature
 */

export interface PomodoroSession {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  completed: boolean;
  createdAt: string;
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};
