'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
  Plus,
  Calendar,
  Timer,
  Target,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskModal } from '@/components/TaskModal';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { StreakCounter } from '@/components/StreakCounter';
import { StandupGenerator } from '@/components/StandupGenerator';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/use-tasks';
import { useStreak } from '@/hooks/use-streak';
import { useStandup } from '@/hooks/use-standup';
import { formatDate, isOverdue } from '@/lib/utils';
import { Task } from '@/types';

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

export default function DashboardPage() {
  const { tasks, stats, createTask, updateTask, isLoaded } = useTasks();
  const { streakData, getWeeklyProgress } = useStreak(tasks);
  const { generateStandupReport, copyToClipboard } = useStandup(tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentTasks = tasks.slice(0, 5);
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'done');
  const standupReport = useMemo(() => generateStandupReport(), [generateStandupReport]);
  const weeklyProgress = useMemo(() => getWeeklyProgress(), [getWeeklyProgress]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Overview of your projects and tasks
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </motion.div>

          {/* New Features Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pomodoro Timer */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Focus Timer</h2>
              </div>
              <PomodoroTimer embedded />
            </div>

            {/* Streak Counter */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Productivity Streak</h2>
              </div>
              <StreakCounter streakData={streakData} weeklyProgress={weeklyProgress} />
            </div>

            {/* Daily Standup */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Daily Standup</h2>
              </div>
              <StandupGenerator 
                report={standupReport} 
                onCopy={copyToClipboard}
                onRegenerate={() => {}}
              />
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Tasks</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <ListTodo className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">To Do</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.todo}</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">In Progress</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.inProgress}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.done}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {stats.overdue > 0 && (
            <motion.div
              variants={itemVariants}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200">
                You have <strong>{stats.overdue}</strong> overdue task{stats.overdue !== 1 ? 's' : ''}
              </p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {recentTasks.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No tasks yet. Create your first task!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {recentTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                          className="p-4 flex items-center gap-4"
                        >
                          <button
                            onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              task.status === 'done'
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                            }`}
                          >
                            {task.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <PriorityBadge priority={task.priority} />
                              {task.dueDate && (
                                <span className={`text-xs flex items-center gap-1 ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-slate-500'}`}>
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                          <StatusBadge status={task.status} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Overdue Tasks */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Overdue Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {overdueTasks.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No overdue tasks! You're all caught up.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {overdueTasks.slice(0, 5).map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                          className="p-4 flex items-center gap-4"
                        >
                          <button
                            onClick={() => updateTask(task.id, { status: 'done' })}
                            className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 opacity-0 hover:opacity-100" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{task.title}</p>
                            <p className="text-xs text-red-500 mt-1">Due {formatDate(task.dueDate)}</p>
                          </div>
                          <PriorityBadge priority={task.priority} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={createTask}
      />
    </div>
  );
}
