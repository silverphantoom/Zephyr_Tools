'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Copy,
  Check,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/use-tasks';
import { useStandup } from '@/hooks/use-standup';
import { formatDate, isToday, isOverdue } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

export default function StandupPage() {
  const { tasks, isLoaded } = useTasks();
  const { generateStandupReport, generateStandupText, copyToClipboard } = useStandup(tasks);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'text'>('preview');

  const report = useMemo(() => generateStandupReport(), [generateStandupReport]);
  const standupText = useMemo(() => generateStandupText(), [generateStandupText]);

  const handleCopy = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([standupText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `standup-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const hasContent = report.yesterday.length > 0 || report.today.length > 0 || report.blockers.length > 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Daily Standup</h1>
                <p className="text-slate-600 dark:text-slate-400">Auto-generated from your task data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopy}
                variant={copied ? 'secondary' : 'primary'}
                className="gap-2"
                disabled={!hasContent}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                variant="secondary"
                className="gap-2"
                disabled={!hasContent}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Tab Switcher */}
          <motion.div variants={itemVariants} className="flex gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === 'preview'
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              Visual Preview
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === 'text'
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              Text Format
            </button>
          </motion.div>

          {/* Content */}
          <motion.div variants={itemVariants}>
            {activeTab === 'preview' ? (
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-100 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      Standup Report — {formatDate(new Date().toISOString())}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {!hasContent ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-10 h-10 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No tasks to report yet</h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        Start working on tasks and mark them as done. Your standup report will be automatically generated based on your activity.
                      </p>
                    </div>
                  ) : (
                    <>
                      <StandupSection
                        icon={CheckCircle2}
                        title="✅ Yesterday I completed"
                        items={report.yesterday}
                        color="emerald"
                        emptyMessage="No tasks completed yesterday. That's okay — every day is a fresh start!"
                      />

                      <StandupSection
                        icon={Clock}
                        title="📋 Today I am working on"
                        items={report.today}
                        color="indigo"
                        emptyMessage="No active tasks. Consider picking up something from your backlog!"
                      />

                      <StandupSection
                        icon={AlertTriangle}
                        title="🚧 Blockers"
                        items={report.blockers}
                        color="red"
                        emptyMessage="No blockers! Smooth sailing ahead 🎉"
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-500">Markdown Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                    {standupText}
                  </pre>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
            <StatCard
              label="Completed Yesterday"
              value={report.yesterday.length}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              label="In Progress Today"
              value={report.today.length}
              icon={Clock}
              color="indigo"
            />
            <StatCard
              label="Blockers"
              value={report.blockers.length}
              icon={AlertTriangle}
              color="red"
            />
          </motion.div>
        </motion.div>
    </div>
  );
}

interface StandupSectionProps {
  icon: React.ElementType;
  title: string;
  items: { title: string; status: string; notes?: string }[];
  color: 'emerald' | 'indigo' | 'red';
  emptyMessage: string;
}

function StandupSection({ icon: Icon, title, items, color, emptyMessage }: StandupSectionProps) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      border: 'border-emerald-100 dark:border-emerald-800',
      text: 'text-emerald-800 dark:text-emerald-200',
      icon: 'text-emerald-500',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/10',
      border: 'border-indigo-100 dark:border-indigo-800',
      text: 'text-indigo-800 dark:text-indigo-200',
      icon: 'text-indigo-500',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/10',
      border: 'border-red-100 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-500',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={cn("rounded-xl border p-5", colors.bg, colors.border)}>
      <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", colors.text)}>
        <Icon className={cn("w-5 h-5", colors.icon)} />
        {title}
      </h3>
      
      {items.length === 0 ? (
        <p className="text-slate-500 italic pl-7">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 pl-2"
            >
              <span className="text-slate-400 mt-1">•</span>
              <div>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{item.title}</p>
                {item.notes && (
                  <p className="text-sm text-slate-500 mt-0.5">{item.notes}</p>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color 
}: { 
  label: string; 
  value: number; 
  icon: React.ElementType; 
  color: 'emerald' | 'indigo' | 'red';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  };

  return (
    <Card className={colorClasses[color]}>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs opacity-80">{label}</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </CardContent>
    </Card>
  );
}
