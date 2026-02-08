'use client';

import { motion } from 'framer-motion';
import {
  Flame,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StreakData } from '@/types/streak';

interface StreakCounterProps {
  streakData: StreakData;
  weeklyProgress: { date: string; completed: boolean; count: number }[];
}

const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function StreakCounter({ streakData, weeklyProgress }: StreakCounterProps) {
  const { currentStreak, longestStreak, totalTasksCompleted } = streakData;
  
  // Calculate flame intensity based on streak
  const flameIntensity = currentStreak >= 7 ? 'animate-pulse' : currentStreak >= 3 ? '' : 'opacity-80';
  const flameColor = currentStreak >= 7 ? 'text-orange-500' : currentStreak >= 3 ? 'text-amber-500' : 'text-slate-400';
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className={cn("w-5 h-5", flameColor, flameIntensity)} />
            Streak Counter
          </CardTitle>
          {currentStreak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "px-2 py-0.5 text-xs font-bold rounded-full",
                currentStreak >= 7 
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
              )}
            >
              {currentStreak} day{currentStreak !== 1 ? 's' : ''}
            </motion.div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main streak display */}
        <div className="flex items-center justify-center py-2">
          <div className="text-center">
            <motion.div
              key={currentStreak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "text-5xl font-bold",
                currentStreak > 0 ? "text-orange-500" : "text-slate-300 dark:text-slate-600"
              )}
            >
              {currentStreak}
            </motion.div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {currentStreak === 0 
                ? "Start your streak today!"
                : currentStreak === 1
                ? "Day streak started!"
                : "Day streak 🔥"}
            </p>
          </div>
        </div>

        {/* Weekly progress */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Last 7 days</p>
          <div className="flex justify-between">
            {weeklyProgress.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                    day.completed
                      ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}
                  title={`${day.date}: ${day.count} tasks completed`}
                >
                  {day.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs"
                    >
                      🔥
                    </motion.div>
                  )}
                </div>
                <span className="text-xs text-slate-400">{dayNames[new Date(day.date).getDay()]}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <StatItem
            icon={Trophy}
            value={longestStreak}
            label="Best"
            color="amber"
          />
          <StatItem
            icon={Target}
            value={totalTasksCompleted}
            label="Done"
            color="emerald"
          />
          <StatItem
            icon={Calendar}
            value={streakData.completedDates.length}
            label="Active"
            color="indigo"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ElementType; 
  value: number; 
  label: string;
  color: 'amber' | 'emerald' | 'indigo';
}) {
  const colorClasses = {
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  };

  return (
    <div className="text-center">
      <Icon className={cn("w-4 h-4 mx-auto mb-1", colorClasses[color])} />
      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
