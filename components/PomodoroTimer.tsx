'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer,
  Settings,
  Coffee,
  Armchair,
  X,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePomodoro } from '@/hooks/use-pomodoro';
import { TimerMode, PomodoroSettings } from '@/types/pomodoro';
import { cn } from '@/lib/utils';

interface PomodoroTimerProps {
  embedded?: boolean;
  onTaskSelect?: () => void;
  selectedTaskId?: string | null;
  selectedTaskTitle?: string | null;
}

const modeConfig: Record<TimerMode, { label: string; color: string; icon: React.ElementType }> = {
  work: { label: 'Focus', color: 'text-indigo-600', icon: Timer },
  shortBreak: { label: 'Short Break', color: 'text-emerald-600', icon: Coffee },
  longBreak: { label: 'Long Break', color: 'text-sky-600', icon: Armchair },
};

export function PomodoroTimer({ 
  embedded = false, 
  onTaskSelect,
  selectedTaskId,
  selectedTaskTitle,
}: PomodoroTimerProps) {
  const {
    isRunning,
    mode,
    formattedTime,
    completedSessions,
    settings,
    activeTaskTitle,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    switchMode,
    getTotalFocusTimeToday,
  } = usePomodoro();
  
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Update local settings when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handle start with selected task
  const handleStart = () => {
    if (selectedTaskId) {
      startTimer(selectedTaskId, selectedTaskTitle || undefined);
    } else {
      startTimer();
    }
  };

  const ModeIcon = modeConfig[mode].icon;
  const progress = mode === 'work' 
    ? ((settings.workDuration * 60 - parseTime(formattedTime)) / (settings.workDuration * 60)) * 100
    : mode === 'shortBreak'
    ? ((settings.shortBreakDuration * 60 - parseTime(formattedTime)) / (settings.shortBreakDuration * 60)) * 100
    : ((settings.longBreakDuration * 60 - parseTime(formattedTime)) / (settings.longBreakDuration * 60)) * 100;

  const todayFocusTime = getTotalFocusTimeToday();

  if (embedded) {
    return (
      <div className="relative">
        <Card className={cn(
          "overflow-hidden transition-all duration-300",
          mode === 'work' && "border-indigo-200 dark:border-indigo-800",
          mode === 'shortBreak' && "border-emerald-200 dark:border-emerald-800",
          mode === 'longBreak' && "border-sky-200 dark:border-sky-800"
        )}>
          <CardContent className="p-4">
            {/* Header with mode selector */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ 
                    color: mode === 'work' ? '#6366f1' : mode === 'shortBreak' ? '#10b981' : '#0ea5e9'
                  }}
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  <ModeIcon className="w-4 h-4" />
                  {modeConfig[mode].label}
                </motion.div>
                {completedSessions > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    • {completedSessions} sessions today
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-4">
              <motion.div
                key={formattedTime}
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "text-4xl font-mono font-bold tracking-wider",
                  mode === 'work' && "text-indigo-600 dark:text-indigo-400",
                  mode === 'shortBreak' && "text-emerald-600 dark:text-emerald-400",
                  mode === 'longBreak' && "text-sky-600 dark:text-sky-400"
                )}
              >
                {formattedTime}
              </motion.div>
              
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    mode === 'work' && "bg-indigo-500",
                    mode === 'shortBreak' && "bg-emerald-500",
                    mode === 'longBreak' && "bg-sky-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Active task indicator */}
            <AnimatePresence>
              {(activeTaskTitle || selectedTaskTitle) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-indigo-700 dark:text-indigo-300 truncate">
                      {activeTaskTitle || selectedTaskTitle}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  className="gap-2"
                  size="sm"
                >
                  <Play className="w-4 h-4" />
                  Start
                </Button>
              ) : (
                <Button
                  onClick={pauseTimer}
                  variant="secondary"
                  className="gap-2"
                  size="sm"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              
              <button
                onClick={resetTimer}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
              </button>
              
              <button
                onClick={skipTimer}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Skip"
              >
                <SkipForward className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Mode switcher */}
            <div className="flex items-center justify-center gap-1 mt-3">
              {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition-colors",
                    mode === m
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {m === 'work' ? 'Focus' : m === 'shortBreak' ? 'Short' : 'Long'}
                </button>
              ))}
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <SettingsPanel
                  settings={localSettings}
                  onUpdate={setLocalSettings}
                  onClose={() => setShowSettings(false)}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full page version would go here
  return null;
}

function SettingsPanel({ 
  settings, 
  onUpdate, 
  onClose 
}: { 
  settings: PomodoroSettings; 
  onUpdate: (s: PomodoroSettings) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute inset-x-0 top-full mt-2 z-50"
    >
      <Card className="border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Timer Settings</CardTitle>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <DurationInput
              label="Focus"
              value={settings.workDuration}
              onChange={(v) => onUpdate({ ...settings, workDuration: v })}
              color="indigo"
            />
            <DurationInput
              label="Short Break"
              value={settings.shortBreakDuration}
              onChange={(v) => onUpdate({ ...settings, shortBreakDuration: v })}
              color="emerald"
            />
            <DurationInput
              label="Long Break"
              value={settings.longBreakDuration}
              onChange={(v) => onUpdate({ ...settings, longBreakDuration: v })}
              color="sky"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Sessions before long break</span>
            <input
              type="number"
              value={settings.sessionsBeforeLongBreak}
              onChange={(e) => onUpdate({ ...settings, sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })}
              className="w-16 px-2 py-1 text-center border rounded"
              min={1}
              max={10}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DurationInput({ 
  label, 
  value, 
  onChange,
  color 
}: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void;
  color: 'indigo' | 'emerald' | 'sky';
}) {
  const colorClasses = {
    indigo: 'border-indigo-200 focus:border-indigo-500',
    emerald: 'border-emerald-200 focus:border-emerald-500',
    sky: 'border-sky-200 focus:border-sky-500',
  };

  return (
    <div className="text-center">
      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 1)}
        className={cn(
          "w-full px-2 py-1.5 text-center text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1",
          colorClasses[color]
        )}
        min={1}
        max={120}
      />
      <span className="text-xs text-slate-400">min</span>
    </div>
  );
}

function parseTime(timeStr: string): number {
  const [mins, secs] = timeStr.split(':').map(Number);
  return mins * 60 + secs;
}
