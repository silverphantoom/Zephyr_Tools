'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Coffee,
  Armchair,
  Settings,
  History,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePomodoro } from '@/hooks/use-pomodoro';
import { useTasks } from '@/hooks/use-tasks';
import { TimerMode, PomodoroSettings } from '@/types/pomodoro';
import { cn, formatDate } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const modeConfig: Record<TimerMode, { label: string; description: string; color: string; bgColor: string; icon: React.ElementType }> = {
  work: { 
    label: 'Focus Time', 
    description: 'Stay focused and productive',
    color: 'text-indigo-600 dark:text-indigo-400', 
    bgColor: 'bg-indigo-500',
    icon: Timer,
  },
  shortBreak: { 
    label: 'Short Break', 
    description: 'Take a quick breather',
    color: 'text-emerald-600 dark:text-emerald-400', 
    bgColor: 'bg-emerald-500',
    icon: Coffee,
  },
  longBreak: { 
    label: 'Long Break', 
    description: 'Recharge your energy',
    color: 'text-sky-600 dark:text-sky-400', 
    bgColor: 'bg-sky-500',
    icon: Armchair,
  },
};

export default function FocusPage() {
  const { tasks, isLoaded: tasksLoaded } = useTasks();
  const {
    isRunning,
    mode,
    timeLeft,
    formattedTime,
    completedSessions,
    settings,
    sessions,
    activeTaskId,
    activeTaskTitle,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    switchMode,
    updateSettings,
    getTodaysSessions,
    getTotalFocusTimeToday,
    isLoaded: pomodoroLoaded,
  } = usePomodoro();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const activeTasks = useMemo(() => 
    tasks.filter((t) => t.status !== 'done'),
    [tasks]
  );

  const todaysSessions = getTodaysSessions();
  const totalFocusTime = getTotalFocusTimeToday();

  const progress = useMemo(() => {
    const total = mode === 'work' 
      ? settings.workDuration * 60 
      : mode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, mode, settings]);

  if (!tasksLoaded || !pomodoroLoaded) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const ModeIcon = modeConfig[mode].icon;

  const handleStart = () => {
    if (selectedTaskId) {
      const task = tasks.find((t) => t.id === selectedTaskId);
      startTimer(selectedTaskId, task?.title);
    } else {
      startTimer();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Focus Timer</h1>
                <p className="text-slate-600 dark:text-slate-400">Stay productive with Pomodoro technique</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Timer */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className={cn(
                "overflow-hidden transition-all duration-500",
                mode === 'work' && "border-indigo-200 dark:border-indigo-800 shadow-indigo-500/10",
                mode === 'shortBreak' && "border-emerald-200 dark:border-emerald-800 shadow-emerald-500/10",
                mode === 'longBreak' && "border-sky-200 dark:border-sky-800 shadow-sky-500/10"
              )}>
                <CardContent className="p-8">
                  {/* Mode Selector */}
                  <div className="flex justify-center gap-2 mb-8">
                    {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                          mode === m
                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg"
                            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        {m === 'work' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                      </button>
                    ))}
                  </div>

                  {/* Timer Display */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="relative inline-block"
                    >
                      {/* Circular Progress */}
                      <div className="relative w-64 h-64 mx-auto">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-slate-100 dark:text-slate-800"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className={modeConfig[mode].color}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: progress / 100 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{
                              strokeDasharray: "283",
                              strokeDashoffset: 283 - (283 * progress) / 100,
                            }}
                          />
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <motion.div
                            key={formattedTime}
                            initial={{ scale: 0.9, opacity: 0.5 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn(
                              "text-6xl font-mono font-bold tracking-wider",
                              modeConfig[mode].color
                            )}
                          >
                            {formattedTime}
                          </motion.div>
                          <p className="text-slate-400 mt-2">{modeConfig[mode].description}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Active Task */}
                  {activeTaskId && (
                    <div className="text-center mb-6 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mx-8">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                          Focusing on: {activeTaskTitle}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={resetTimer}
                      className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-5 h-5 text-slate-400" />
                    </button>

                    {!isRunning ? (
                      <Button
                        onClick={handleStart}
                        size="lg"
                        className={cn(
                          "gap-2 px-8 py-6 text-lg shadow-lg",
                          mode === 'work' && "shadow-indigo-500/30",
                          mode === 'shortBreak' && "shadow-emerald-500/30",
                          mode === 'longBreak' && "shadow-sky-500/30"
                        )}
                      >
                        <Play className="w-6 h-6" />
                        Start Focus
                      </Button>
                    ) : (
                      <Button
                        onClick={pauseTimer}
                        variant="secondary"
                        size="lg"
                        className="gap-2 px-8 py-6 text-lg"
                      >
                        <Pause className="w-6 h-6" />
                        Pause
                      </Button>
                    )}

                    <button
                      onClick={skipTimer}
                      className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title="Skip"
                    >
                      <SkipForward className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  {/* Sessions completed */}
                  {completedSessions > 0 && (
                    <div className="text-center mt-6">
                      <p className="text-sm text-slate-500">
                        Completed today: {' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {completedSessions} session{completedSessions !== 1 ? 's' : ''}
                        </span>
                        {' '}•{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
                        </span>
                        {' '}focused
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Settings Panel */}
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <TimerSettings 
                    settings={settings} 
                    onUpdate={updateSettings}
                    onClose={() => setShowSettings(false)}
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Task Selector */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    Select Task
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={selectedTaskId || ''}
                    onChange={(e) => setSelectedTaskId(e.target.value || null)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  >
                    <option value="">No specific task (free focus)</option>
                    {activeTasks.map((task) => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-2">
                    Select a task to associate your focus session with it.
                  </p>
                </CardContent>
              </Card>

              {/* Today's Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Today&apos;s Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{todaysSessions.length}</p>
                      <p className="text-xs text-slate-500">Sessions</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalFocusTime}</p>
                      <p className="text-xs text-slate-500">Minutes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-500" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todaysSessions.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No sessions today yet</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {todaysSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {session.taskTitle || 'Free focus session'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDate(session.startTime)}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-slate-500">{session.duration}m</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </div>
  );
}

function TimerSettings({ 
  settings, 
  onUpdate, 
  onClose 
}: { 
  settings: PomodoroSettings; 
  onUpdate: (s: Partial<PomodoroSettings>) => void;
  onClose: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Timer Settings</CardTitle>
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">Done</button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <DurationSetting
            label="Focus Duration"
            value={settings.workDuration}
            onChange={(v) => onUpdate({ workDuration: v })}
            color="indigo"
          />
          <DurationSetting
            label="Short Break"
            value={settings.shortBreakDuration}
            onChange={(v) => onUpdate({ shortBreakDuration: v })}
            color="emerald"
          />
          <DurationSetting
            label="Long Break"
            value={settings.longBreakDuration}
            onChange={(v) => onUpdate({ longBreakDuration: v })}
            color="sky"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-300">Sessions before long break</p>
            <p className="text-sm text-slate-400">After how many focus sessions to take a long break</p>
          </div>
          <input
            type="number"
            value={settings.sessionsBeforeLongBreak}
            onChange={(e) => onUpdate({ sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })}
            className="w-16 px-3 py-2 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            min={1}
            max={10}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DurationSetting({ 
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
  return (
    <div className="text-center">
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{label}</label>
      <div className="flex items-center justify-center">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          -
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 1)}
          className="w-16 mx-2 text-center font-mono text-lg bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          min={1}
          max={120}
        />
        <button
          onClick={() => onChange(Math.min(120, value + 1))}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          +
        </button>
      </div>
      <span className="text-xs text-slate-400">minutes</span>
    </div>
  );
}
