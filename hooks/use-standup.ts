'use client';

import { useMemo, useCallback } from 'react';
import { StandupReport, StandupItem } from '@/types/standup';
import { Task } from '@/types';

export function useStandup(tasks: Task[]) {
  const generateStandupReport = useCallback((): StandupReport => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayKey = today.toISOString().split('T')[0];
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    
    // Get tasks completed yesterday
    const yesterdayCompleted: StandupItem[] = tasks
      .filter((t) => {
        if (t.status !== 'done' || !t.completedAt) return false;
        const completedKey = t.completedAt.split('T')[0];
        return completedKey === yesterdayKey;
      })
      .map((t) => ({
        taskId: t.id,
        title: t.title,
        status: t.status,
        notes: t.description,
      }));
    
    // Get tasks in progress or todo for today
    const todayTasks: StandupItem[] = tasks
      .filter((t) => {
        if (t.status === 'done') return false;
        // Include tasks that are in progress or have due date today
        if (t.status === 'in-progress') return true;
        if (t.dueDate) {
          const dueKey = t.dueDate.split('T')[0];
          return dueKey === todayKey || new Date(t.dueDate) < today;
        }
        return t.status === 'todo';
      })
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .map((t) => ({
        taskId: t.id,
        title: t.title,
        status: t.status,
        notes: t.description,
      }));
    
    // Identify potential blockers (overdue high priority tasks)
    const blockers: StandupItem[] = tasks
      .filter((t) => {
        if (t.status === 'done') return false;
        if (t.priority === 'urgent') return true;
        if (t.dueDate) {
          const dueDate = new Date(t.dueDate);
          return dueDate < today && t.priority === 'high';
        }
        return false;
      })
      .map((t) => ({
        taskId: t.id,
        title: t.title,
        status: t.status,
        notes: t.dueDate ? `Overdue since ${t.dueDate.split('T')[0]}` : 'High priority task',
      }));
    
    return {
      generatedAt: new Date().toISOString(),
      yesterday: yesterdayCompleted,
      today: todayTasks,
      blockers,
    };
  }, [tasks]);

  const generateStandupText = useCallback((): string => {
    const report = generateStandupReport();
    
    let text = '📅 **Daily Standup**\n\n';
    
    // Yesterday
    text += '**✅ Yesterday I completed:**\n';
    if (report.yesterday.length === 0) {
      text += '- No tasks completed yesterday\n';
    } else {
      report.yesterday.forEach((item) => {
        text += `- ${item.title}\n`;
      });
    }
    text += '\n';
    
    // Today
    text += '**📋 Today I am working on:**\n';
    if (report.today.length === 0) {
      text += '- No active tasks\n';
    } else {
      report.today.forEach((item) => {
        const status = item.status === 'in-progress' ? '🔄' : '⏳';
        text += `- ${status} ${item.title}\n`;
      });
    }
    text += '\n';
    
    // Blockers
    text += '**🚧 Blockers:**\n';
    if (report.blockers.length === 0) {
      text += '- No blockers 🎉\n';
    } else {
      report.blockers.forEach((item) => {
        text += `- ⚠️ ${item.title}`;
        if (item.notes) text += ` (${item.notes})`;
        text += '\n';
      });
    }
    
    return text;
  }, [generateStandupReport]);

  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    try {
      const text = generateStandupText();
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }, [generateStandupText]);

  return {
    generateStandupReport,
    generateStandupText,
    copyToClipboard,
  };
}
