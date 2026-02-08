'use client';

import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StreakCounter } from '@/components/StreakCounter';
import { useTasks } from '@/hooks/use-tasks';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function StreaksPage() {
  const { tasks } = useTasks();
  const completedToday = tasks.filter(t => t.status === 'done').length;
  const currentStreak = 12;
  const longestStreak = 28;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Streaks</h1>
        <p className="text-slate-600 dark:text-slate-400">Build consistency, earn achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Current Streak</p>
                  <p className="text-4xl font-bold mt-1">{currentStreak} days</p>
                </div>
                <Flame className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Longest Streak</p>
                  <p className="text-4xl font-bold mt-1">{longestStreak} days</p>
                </div>
                <Trophy className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Tasks Today</p>
                  <p className="text-4xl font-bold mt-1">{completedToday}</p>
                </div>
                <Zap className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Activity Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakCounter />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Early Bird', desc: 'Complete 5 tasks before 9am', unlocked: true, icon: '🌅' },
                { name: 'Task Master', desc: 'Complete 100 tasks total', unlocked: true, icon: '✅' },
                { name: 'Week Warrior', desc: '7 day streak', unlocked: true, icon: '🔥' },
                { name: 'Focus King', desc: '20 hours of focus time', unlocked: false, icon: '🎯' },
                { name: 'Team Player', desc: 'Assign 10 tasks to others', unlocked: false, icon: '👥' },
                { name: 'Deadline Crusher', desc: 'Never miss a deadline for 30 days', unlocked: false, icon: '⚡' },
                { name: 'Pomodoro Pro', desc: 'Complete 50 pomodoro sessions', unlocked: true, icon: '🍅' },
                { name: 'Month Master', desc: '30 day streak', unlocked: false, icon: '🏆' },
              ].map((achievement, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-lg border text-center ${
                    achievement.unlocked 
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' 
                      : 'bg-slate-50 border-slate-200 opacity-50 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <p className="font-medium text-sm">{achievement.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{achievement.desc}</p>
                  {achievement.unlocked && (
                    <span className="inline-block mt-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                      Unlocked
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}