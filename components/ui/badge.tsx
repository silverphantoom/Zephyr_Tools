'use client';

import { cn } from '@/lib/utils';
import { Priority, Status, PRIORITY_COLORS, STATUS_COLORS } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
}

export function Badge({ children, className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'default' && 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        variant === 'outline' && 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const colors = PRIORITY_COLORS[priority];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const colors = STATUS_COLORS[status];
  const label = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
  }[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      {label}
    </span>
  );
}
