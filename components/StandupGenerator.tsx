'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StandupReport } from '@/types/standup';
import { cn } from '@/lib/utils';

interface StandupGeneratorProps {
  report: StandupReport;
  onCopy: () => Promise<boolean>;
  onRegenerate: () => void;
}

export function StandupGenerator({ report, onCopy, onRegenerate }: StandupGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleCopy = async () => {
    const success = await onCopy();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasContent = report.yesterday.length > 0 || report.today.length > 0 || report.blockers.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            Daily Standup
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="space-y-4">
              {!hasContent ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks found to generate standup.</p>
                  <p className="text-sm mt-1">Start working on tasks to see your standup report!</p>
                </div>
              ) : (
                <>
                  {/* Yesterday */}
                  <StandupSection
                    icon={CheckCircle2}
                    title="Yesterday"
                    subtitle="Completed tasks"
                    items={report.yesterday}
                    color="emerald"
                    emptyMessage="No tasks completed yesterday"
                  />

                  {/* Today */}
                  <StandupSection
                    icon={Clock}
                    title="Today"
                    subtitle="In progress & planned"
                    items={report.today}
                    color="indigo"
                    emptyMessage="No active tasks"
                  />

                  {/* Blockers */}
                  <StandupSection
                    icon={AlertTriangle}
                    title="Blockers"
                    subtitle="Issues & overdue items"
                    items={report.blockers}
                    color="red"
                    emptyMessage="No blockers 🎉"
                  />
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCopy}
                  className="flex-1 gap-2"
                  variant={copied ? 'secondary' : 'primary'}
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
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={onRegenerate}
                  variant="secondary"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

interface StandupSectionProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  items: { title: string; status: string; notes?: string }[];
  color: 'emerald' | 'indigo' | 'red';
  emptyMessage: string;
}

function StandupSection({ icon: Icon, title, subtitle, items, color, emptyMessage }: StandupSectionProps) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-500',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-700 dark:text-indigo-300',
      icon: 'text-indigo-500',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-500',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={cn("rounded-xl border p-3", colors.bg, colors.border)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", colors.icon)} />
        <span className={cn("font-medium text-sm", colors.text)}>{title}</span>
        <span className="text-xs text-slate-400">• {subtitle}</span>
        {items.length > 0 && (
          <span className={cn("ml-auto text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-800", colors.text)}>
            {items.length}
          </span>
        )}
      </div>
      
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 italic pl-6">{emptyMessage}</p>
      ) : (
        <ul className="space-y-1.5 pl-6">
          {items.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-sm text-slate-700 dark:text-slate-300"
            >
              • {item.title}
              {item.notes && (
                <span className="text-xs text-slate-400 ml-1">({item.notes})</span>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
