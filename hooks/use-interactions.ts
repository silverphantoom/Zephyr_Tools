'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Interaction, InteractionType } from '@/types/crm';
import { generateId, isWithinDays } from '@/lib/utils';
import { isToday, isTomorrow, isPast, parseISO } from 'date-fns';

const INTERACTIONS_STORAGE_KEY = 'pm-app-interactions';

// Sample initial data
const sampleInteractions: Interaction[] = [
  {
    id: 'interaction-1',
    customerId: 'customer-1',
    type: 'call',
    date: new Date(Date.now() - 86400000 * 30).toISOString(),
    notes: 'Scheduled annual maintenance visit. Customer confirmed availability.',
    followUpDate: null,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'interaction-2',
    customerId: 'customer-3',
    type: 'meeting',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    notes: 'Home visit to measure garage opening. Discussed carriage house style options. Customer liked the Amarr Classica samples.',
    followUpDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'interaction-3',
    customerId: 'customer-3',
    type: 'email',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Sent detailed quote for Amarr Classica 3000 with windows. Included installation timeline and warranty info.',
    followUpDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'interaction-4',
    customerId: 'customer-6',
    type: 'call',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: 'Discussed pricing for 4-door package. Builder wants to proceed but needs to finalize closing dates with homebuyers.',
    followUpDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'interaction-5',
    customerId: 'customer-4',
    type: 'visit',
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    notes: 'Emergency repair call. Replaced damaged panel and realigned track. Door operational.',
    followUpDate: null,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'interaction-6',
    customerId: 'customer-7',
    type: 'call',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    notes: 'Initial inquiry about noisy door. Scheduled estimate for Friday.',
    followUpDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'interaction-7',
    customerId: 'customer-2',
    type: 'email',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Confirmed completion of spring replacements at all 3 properties. Invoice attached.',
    followUpDate: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'interaction-8',
    customerId: 'customer-1',
    type: 'note',
    date: new Date(Date.now() - 86400000 * 60).toISOString(),
    notes: 'Annual maintenance completed. Replaced weather stripping and lubricated all moving parts. Door in excellent condition.',
    followUpDate: new Date(Date.now() + 86400000 * 300).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

export function useInteractions() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(INTERACTIONS_STORAGE_KEY);
      if (stored) {
        setInteractions(JSON.parse(stored));
      } else {
        setInteractions(sampleInteractions);
        localStorage.setItem(INTERACTIONS_STORAGE_KEY, JSON.stringify(sampleInteractions));
      }
    } catch (error) {
      console.error('Error loading interactions from localStorage:', error);
      setInteractions(sampleInteractions);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(INTERACTIONS_STORAGE_KEY, JSON.stringify(interactions));
  }, [interactions, isLoaded]);

  // CRUD Operations
  const createInteraction = useCallback((interactionData: Omit<Interaction, 'id' | 'createdAt'>): Interaction => {
    const newInteraction: Interaction = {
      ...interactionData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setInteractions((prev) => [newInteraction, ...prev]);
    return newInteraction;
  }, []);

  const updateInteraction = useCallback((id: string, updates: Partial<Interaction>): Interaction | null => {
    let updatedInteraction: Interaction | null = null;
    setInteractions((prev) =>
      prev.map((interaction) => {
        if (interaction.id === id) {
          updatedInteraction = { ...interaction, ...updates };
          return updatedInteraction;
        }
        return interaction;
      })
    );
    return updatedInteraction;
  }, []);

  const deleteInteraction = useCallback((id: string) => {
    setInteractions((prev) => prev.filter((interaction) => interaction.id !== id));
  }, []);

  // Get interactions by customer
  const getInteractionsByCustomer = useCallback((customerId: string) => {
    return interactions
      .filter((i) => i.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [interactions]);

  // Get last interaction for a customer
  const getLastInteraction = useCallback((customerId: string): Interaction | undefined => {
    return interactions
      .filter((i) => i.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [interactions]);

  // Get upcoming follow-ups
  const upcomingFollowUps = useMemo(() => {
    const now = new Date();
    return interactions
      .filter((i) => {
        if (!i.followUpDate) return false;
        const followUp = parseISO(i.followUpDate);
        // Include today and future follow-ups, exclude completed past ones
        return isToday(followUp) || (!isPast(followUp) || isToday(followUp));
      })
      .sort((a, b) => {
        if (!a.followUpDate || !b.followUpDate) return 0;
        return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime();
      });
  }, [interactions]);

  // Get follow-ups for a specific customer
  const getFollowUpsByCustomer = useCallback((customerId: string) => {
    const now = new Date();
    return interactions
      .filter((i) => {
        if (i.customerId !== customerId || !i.followUpDate) return false;
        const followUp = parseISO(i.followUpDate);
        return isToday(followUp) || (!isPast(followUp) || isToday(followUp));
      })
      .sort((a, b) => {
        if (!a.followUpDate || !b.followUpDate) return 0;
        return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime();
      });
  }, [interactions]);

  // Get today's follow-ups count
  const todaysFollowUpsCount = useMemo(() => {
    return interactions.filter((i) => {
      if (!i.followUpDate) return false;
      return isToday(parseISO(i.followUpDate));
    }).length;
  }, [interactions]);

  // Get recent interactions (last 30 days)
  const recentInteractions = useMemo(() => {
    return interactions
      .filter((i) => isWithinDays(i.date, 30))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [interactions]);

  return {
    interactions,
    isLoaded,
    upcomingFollowUps,
    todaysFollowUpsCount,
    recentInteractions,
    createInteraction,
    updateInteraction,
    deleteInteraction,
    getInteractionsByCustomer,
    getLastInteraction,
    getFollowUpsByCustomer,
  };
}
