'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PomodoroSession, PomodoroSettings, TimerMode, DEFAULT_POMODORO_SETTINGS } from '@/types/pomodoro';
import { generateId } from '@/lib/utils';

const POMODORO_SESSIONS_KEY = 'pm-app-pomodoro-sessions';
const POMODORO_SETTINGS_KEY = 'pm-app-pomodoro-settings';

export function usePomodoro() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const storedSessions = localStorage.getItem(POMODORO_SESSIONS_KEY);
      const storedSettings = localStorage.getItem(POMODORO_SETTINGS_KEY);
      
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }
      
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_POMODORO_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading pomodoro data:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(POMODORO_SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(POMODORO_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, isLoaded]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    if (mode === 'work') {
      // Log completed session
      const session: PomodoroSession = {
        id: generateId(),
        taskId: activeTaskId,
        taskTitle: activeTaskTitle,
        startTime: startTimeRef.current?.toISOString() || new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: settings.workDuration,
        completed: true,
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [session, ...prev]);
      
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      // Determine next mode
      if (newCompletedSessions % settings.sessionsBeforeLongBreak === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
      
      if (settings.autoStartBreaks) {
        setIsRunning(true);
        startTimeRef.current = new Date();
      }
    } else {
      // Break is over, back to work
      setMode('work');
      setTimeLeft(settings.workDuration * 60);
      
      if (settings.autoStartPomodoros) {
        setIsRunning(true);
        startTimeRef.current = new Date();
      }
    }
  }, [mode, completedSessions, settings, activeTaskId, activeTaskTitle]);

  const startTimer = useCallback((taskId?: string, taskTitle?: string) => {
    if (taskId) {
      setActiveTaskId(taskId);
      setActiveTaskTitle(taskTitle || null);
    }
    setIsRunning(true);
    startTimeRef.current = new Date();
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(settings.workDuration * 60);
    setActiveTaskId(null);
    setActiveTaskTitle(null);
  }, [settings.workDuration]);

  const skipTimer = useCallback(() => {
    setIsRunning(false);
    handleTimerComplete();
  }, [handleTimerComplete]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    switch (newMode) {
      case 'work':
        setTimeLeft(settings.workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(settings.shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(settings.longBreakDuration * 60);
        break;
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // Update current timer if not running
      if (!isRunning) {
        switch (mode) {
          case 'work':
            setTimeLeft(updated.workDuration * 60);
            break;
          case 'shortBreak':
            setTimeLeft(updated.shortBreakDuration * 60);
            break;
          case 'longBreak':
            setTimeLeft(updated.longBreakDuration * 60);
            break;
        }
      }
      return updated;
    });
  }, [isRunning, mode]);

  const getTodaysSessions = useCallback(() => {
    const today = new Date().toDateString();
    return sessions.filter((s) => new Date(s.startTime).toDateString() === today);
  }, [sessions]);

  const getTotalFocusTimeToday = useCallback(() => {
    return getTodaysSessions().reduce((total, s) => total + s.duration, 0);
  }, [getTodaysSessions]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    isRunning,
    mode,
    timeLeft,
    formattedTime: formatTime(timeLeft),
    completedSessions,
    activeTaskId,
    activeTaskTitle,
    settings,
    sessions,
    isLoaded,
    
    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    switchMode,
    updateSettings,
    
    // Stats
    getTodaysSessions,
    getTotalFocusTimeToday,
    formatTime,
  };
}
