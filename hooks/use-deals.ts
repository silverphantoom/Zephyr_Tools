'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Deal, DealStage } from '@/types/crm';
import { generateId } from '@/lib/utils';

const DEALS_STORAGE_KEY = 'pm-app-deals';

// Sample initial data for Red Clay Garage Services
const sampleDeals: Deal[] = [
  {
    id: 'deal-1',
    customerId: 'customer-3',
    title: 'New Garage Door Installation',
    value: 3500,
    stage: 'proposal',
    expectedClose: new Date(Date.now() + 86400000 * 14).toISOString(),
    notes: 'Customer wants carriage house style door. Quote sent for Amarr Classica.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'deal-2',
    customerId: 'customer-7',
    title: 'Garage Door Repair & Tune-up',
    value: 450,
    stage: 'lead',
    expectedClose: new Date(Date.now() + 86400000 * 5).toISOString(),
    notes: 'Noisy door, likely needs roller replacement and track adjustment.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'deal-3',
    customerId: 'customer-6',
    title: 'New Construction - 4 Door Package',
    value: 12000,
    stage: 'negotiation',
    expectedClose: new Date(Date.now() + 86400000 * 30).toISOString(),
    notes: 'Custom home build on Moores Mill. Builder wants premium insulated doors.',
    createdAt: new Date(Date.now() - 86400000 * 21).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'deal-4',
    customerId: 'customer-4',
    title: 'Commercial Roll-up Door Replacement',
    value: 2800,
    stage: 'contacted',
    expectedClose: new Date(Date.now() + 86400000 * 10).toISOString(),
    notes: 'Unit 12 door damaged. Needs 10x10 commercial roll-up with motor.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'deal-5',
    customerId: 'customer-2',
    title: 'Spring Replacement - 3 Properties',
    value: 750,
    stage: 'closed-won',
    expectedClose: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Completed spring replacements at 3 rental properties.',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'deal-6',
    customerId: 'customer-1',
    title: 'Annual Maintenance Contract',
    value: 299,
    stage: 'closed-won',
    expectedClose: new Date(Date.now() - 86400000 * 30).toISOString(),
    notes: 'Renewed annual maintenance plan for 2025.',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'deal-7',
    customerId: 'customer-8',
    title: 'Commercial Overhead Door',
    value: 4500,
    stage: 'closed-lost',
    expectedClose: new Date(Date.now() - 86400000 * 90).toISOString(),
    notes: 'Business closed before project could move forward.',
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: 'deal-8',
    customerId: 'customer-2',
    title: 'Opener Installation - 2 Units',
    value: 1200,
    stage: 'proposal',
    expectedClose: new Date(Date.now() + 86400000 * 7).toISOString(),
    notes: 'Tenant requested smart openers with WiFi connectivity.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(DEALS_STORAGE_KEY);
      if (stored) {
        setDeals(JSON.parse(stored));
      } else {
        setDeals(sampleDeals);
        localStorage.setItem(DEALS_STORAGE_KEY, JSON.stringify(sampleDeals));
      }
    } catch (error) {
      console.error('Error loading deals from localStorage:', error);
      setDeals(sampleDeals);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(DEALS_STORAGE_KEY, JSON.stringify(deals));
  }, [deals, isLoaded]);

  // CRUD Operations
  const createDeal = useCallback((dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Deal => {
    const newDeal: Deal = {
      ...dealData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDeals((prev) => [newDeal, ...prev]);
    return newDeal;
  }, []);

  const updateDeal = useCallback((id: string, updates: Partial<Deal>): Deal | null => {
    let updatedDeal: Deal | null = null;
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id === id) {
          updatedDeal = {
            ...deal,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedDeal;
        }
        return deal;
      })
    );
    return updatedDeal;
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setDeals((prev) => prev.filter((deal) => deal.id !== id));
  }, []);

  const moveDeal = useCallback((dealId: string, newStage: DealStage) => {
    updateDeal(dealId, { stage: newStage });
  }, [updateDeal]);

  // Get deals by various criteria
  const getDealsByCustomer = useCallback((customerId: string) => {
    return deals.filter((d) => d.customerId === customerId);
  }, [deals]);

  const getDealsByStage = useCallback((stage: DealStage) => {
    return deals.filter((d) => d.stage === stage);
  }, [deals]);

  const getDealById = useCallback((id: string): Deal | undefined => {
    return deals.find((d) => d.id === id);
  }, [deals]);

  // Calculate stats
  const stats = useMemo(() => {
    const openDeals = deals.filter((d) => !['closed-won', 'closed-lost'].includes(d.stage));
    const closedWon = deals.filter((d) => d.stage === 'closed-won');
    const closedLost = deals.filter((d) => d.stage === 'closed-lost');
    
    const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
    const closedWonValue = closedWon.reduce((sum, d) => sum + d.value, 0);
    const closedLostValue = closedLost.reduce((sum, d) => sum + d.value, 0);
    
    const totalClosed = closedWon.length + closedLost.length;
    const conversionRate = totalClosed > 0 
      ? Math.round((closedWon.length / totalClosed) * 100) 
      : 0;

    return {
      totalDeals: deals.length,
      openDeals: openDeals.length,
      closedWon: closedWon.length,
      closedLost: closedLost.length,
      pipelineValue,
      closedWonValue,
      closedLostValue,
      conversionRate,
    };
  }, [deals]);

  // Group deals by stage for pipeline view
  const dealsByStage = useMemo(() => {
    return {
      lead: deals.filter((d) => d.stage === 'lead'),
      contacted: deals.filter((d) => d.stage === 'contacted'),
      proposal: deals.filter((d) => d.stage === 'proposal'),
      negotiation: deals.filter((d) => d.stage === 'negotiation'),
      'closed-won': deals.filter((d) => d.stage === 'closed-won'),
      'closed-lost': deals.filter((d) => d.stage === 'closed-lost'),
    };
  }, [deals]);

  // Get upcoming deals (expected close in next 30 days)
  const upcomingDeals = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return deals
      .filter((d) => {
        if (!d.expectedClose || ['closed-won', 'closed-lost'].includes(d.stage)) return false;
        const closeDate = new Date(d.expectedClose);
        return closeDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => {
        if (!a.expectedClose || !b.expectedClose) return 0;
        return new Date(a.expectedClose).getTime() - new Date(b.expectedClose).getTime();
      });
  }, [deals]);

  return {
    deals,
    isLoaded,
    stats,
    dealsByStage,
    upcomingDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    moveDeal,
    getDealsByCustomer,
    getDealsByStage,
    getDealById,
  };
}
