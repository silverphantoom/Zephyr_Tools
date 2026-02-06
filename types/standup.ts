/**
 * Type definitions for Standup Generator feature
 */

export interface StandupReport {
  generatedAt: string;
  yesterday: StandupItem[];
  today: StandupItem[];
  blockers: StandupItem[];
}

export interface StandupItem {
  taskId: string;
  title: string;
  status: string;
  projectName?: string;
  notes?: string;
}
