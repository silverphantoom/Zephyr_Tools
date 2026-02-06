'use client';

import { useState, useCallback, useEffect } from 'react';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  htmlLink: string;
  isAllDay: boolean;
}

interface RawCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  htmlLink: string;
  isAllDay: boolean;
}

const STORAGE_KEY = 'pm-app-calendar-events';
const SYNCED_TASKS_KEY = 'pm-app-synced-tasks';

// Demo events for static export mode
const getDemoEvents = (): CalendarEvent[] => {
  const today = new Date();
  return [
    {
      id: 'demo-1',
      title: 'Team Standup',
      description: 'Daily standup meeting with the development team',
      startDate: addDays(today, 1),
      endDate: addDays(today, 1),
      location: 'Conference Room A',
      htmlLink: '#',
      isAllDay: false,
    },
    {
      id: 'demo-2',
      title: 'Project Review',
      description: 'Quarterly project review with stakeholders',
      startDate: addDays(today, 3),
      endDate: addDays(today, 3),
      location: 'Zoom',
      htmlLink: '#',
      isAllDay: false,
    },
    {
      id: 'demo-3',
      title: 'Sprint Planning',
      description: 'Plan the next sprint cycle',
      startDate: addDays(today, 5),
      endDate: addDays(today, 5),
      location: 'War Room',
      htmlLink: '#',
      isAllDay: true,
    },
    {
      id: 'demo-4',
      title: 'Client Meeting',
      description: 'Review progress with the client',
      startDate: addDays(today, 7),
      endDate: addDays(today, 7),
      location: 'Office',
      htmlLink: '#',
      isAllDay: false,
    },
  ];
};

export function useGoogleCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load events from API or localStorage
  const fetchEvents = useCallback(async (daysAhead: number = 30) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      const response = await fetch(`/api/calendar/events?days=${daysAhead}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.events) {
          const parsedEvents = data.events.map((e: RawCalendarEvent) => ({
            ...e,
            startDate: new Date(e.startDate),
            endDate: new Date(e.endDate),
          }));
          setEvents(parsedEvents);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.events));
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      }

      // API failed, try localStorage
      const storedEvents = localStorage.getItem(STORAGE_KEY);
      if (storedEvents) {
        const parsed: RawCalendarEvent[] = JSON.parse(storedEvents);
        setEvents(parsed.map(e => ({
          ...e,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
        })));
        setError('Using cached events. Calendar API unavailable.');
      } else {
        // No cached events, use demo mode
        const demoEvents = getDemoEvents();
        setEvents(demoEvents);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoEvents.map(e => ({
          ...e,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate.toISOString(),
        }))));
        setError('Demo mode: Calendar API not configured.');
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      
      // Fallback to localStorage or demo
      const storedEvents = localStorage.getItem(STORAGE_KEY);
      if (storedEvents) {
        const parsed: RawCalendarEvent[] = JSON.parse(storedEvents);
        setEvents(parsed.map(e => ({
          ...e,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
        })));
      } else {
        const demoEvents = getDemoEvents();
        setEvents(demoEvents);
      }
      setError('Failed to connect to calendar.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync a task due date to calendar
  const syncTaskToCalendar = useCallback(async (task: {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    priority?: string;
  }): Promise<boolean> => {
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
        }),
      });

      if (response.ok) {
        // Mark task as synced
        const syncedTasks = JSON.parse(localStorage.getItem(SYNCED_TASKS_KEY) || '[]');
        if (!syncedTasks.includes(task.id)) {
          syncedTasks.push(task.id);
          localStorage.setItem(SYNCED_TASKS_KEY, JSON.stringify(syncedTasks));
        }
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error syncing task to calendar:', err);
      return false;
    }
  }, []);

  // Check if a task is synced
  const isTaskSynced = useCallback((taskId: string): boolean => {
    const syncedTasks = JSON.parse(localStorage.getItem(SYNCED_TASKS_KEY) || '[]');
    return syncedTasks.includes(taskId);
  }, []);

  // Get events for a specific date
  const getEventsForDay = useCallback((date: Date) => {
    return events.filter(event => isSameDay(event.startDate, date));
  }, [events]);

  // Get upcoming events (next N events)
  const getUpcomingEvents = useCallback((limit: number = 10) => {
    const now = new Date();
    return events
      .filter(event => event.startDate >= now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, limit);
  }, [events]);

  // Get events for the next N days
  const getEventsForNextDays = useCallback((days: number) => {
    const now = new Date();
    const future = addDays(now, days);
    return events
      .filter(event => event.startDate >= now && event.startDate <= future)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [events]);

  // Refresh events
  const refreshEvents = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Load events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    isAuthenticated,
    fetchEvents,
    getEventsForDay,
    getUpcomingEvents,
    getEventsForNextDays,
    refreshEvents,
    syncTaskToCalendar,
    isTaskSynced,
  };
}
