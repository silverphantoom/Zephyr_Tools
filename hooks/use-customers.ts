'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Customer, CustomerStatus, CRMStats } from '@/types/crm';
import { generateId } from '@/lib/utils';

const CUSTOMERS_STORAGE_KEY = 'pm-app-customers';

// Sample initial data for Red Clay Garage Services
const sampleCustomers: Customer[] = [
  {
    id: 'customer-1',
    name: 'John Smith',
    company: '',
    email: 'john.smith@email.com',
    phone: '(334) 555-0101',
    status: 'active',
    tags: ['Homeowner', 'Annual Maintenance'],
    address: '123 Lee Road, Auburn, AL',
    notes: 'Annual maintenance client. Has 2-car garage with insulated door.',
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'customer-2',
    name: 'Sarah Johnson',
    company: 'Johnson Properties LLC',
    email: 'sarah@johnsonprops.com',
    phone: '(334) 555-0102',
    status: 'active',
    tags: ['Commercial', 'Property Manager'],
    address: '456 Commerce St, Auburn, AL',
    notes: 'Manages 12 rental properties. Regular repair work.',
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'customer-3',
    name: 'Mike Davis',
    company: '',
    email: 'mdavis@email.com',
    phone: '(334) 555-0103',
    status: 'prospect',
    tags: ['Homeowner', 'New Install'],
    address: '789 Magnolia Ave, Auburn, AL',
    notes: 'Called for quote on new garage door installation. Interested in carriage house style.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'customer-4',
    name: 'Auburn Storage Solutions',
    company: 'Auburn Storage Solutions',
    email: 'maintenance@auburnstorage.com',
    phone: '(334) 555-0104',
    status: 'active',
    tags: ['Commercial', 'Emergency'],
    address: '321 Industrial Blvd, Auburn, AL',
    notes: 'Storage facility with 24 roll-up doors. Priority client for emergency repairs.',
    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'customer-5',
    name: 'Jennifer Wilson',
    company: '',
    email: 'jwilson@email.com',
    phone: '(334) 555-0105',
    status: 'inactive',
    tags: ['Homeowner', 'Repair'],
    address: '555 College St, Auburn, AL',
    notes: 'Repaired spring in 2023. Has not needed service since.',
    createdAt: new Date(Date.now() - 86400000 * 400).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 200).toISOString(),
  },
  {
    id: 'customer-6',
    name: 'Robert Taylor',
    company: 'Taylor Builders',
    email: 'robert@taylorbuilders.com',
    phone: '(334) 555-0106',
    status: 'active',
    tags: ['Builder', 'New Install', 'Referral'],
    address: '888 Construction Way, Opelika, AL',
    notes: 'Custom home builder. Installs doors on new construction. Multiple referrals.',
    createdAt: new Date(Date.now() - 86400000 * 200).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'customer-7',
    name: 'Lisa Brown',
    company: '',
    email: 'lbrown@email.com',
    phone: '(334) 555-0107',
    status: 'prospect',
    tags: ['Homeowner', 'Repair'],
    address: '222 Shug Jordan Pkwy, Auburn, AL',
    notes: 'Called about noisy garage door. Scheduled for estimate.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'customer-8',
    name: 'David Martinez',
    company: 'Martinez Auto Repair',
    email: 'david@martinezauto.com',
    phone: '(334) 555-0108',
    status: 'former',
    tags: ['Commercial', 'Repair'],
    address: '999 Mechanic St, Auburn, AL',
    notes: 'Business closed in 2024. May reopen at new location.',
    createdAt: new Date(Date.now() - 86400000 * 500).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (stored) {
        setCustomers(JSON.parse(stored));
      } else {
        setCustomers(sampleCustomers);
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(sampleCustomers));
      }
    } catch (error) {
      console.error('Error loading customers from localStorage:', error);
      setCustomers(sampleCustomers);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  }, [customers, isLoaded]);

  // CRUD Operations
  const createCustomer = useCallback((customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>): Customer | null => {
    let updatedCustomer: Customer | null = null;
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id === id) {
          updatedCustomer = {
            ...customer,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedCustomer;
        }
        return customer;
      })
    );
    return updatedCustomer;
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
  }, []);

  const getCustomerById = useCallback((id: string): Customer | undefined => {
    return customers.find((c) => c.id === id);
  }, [customers]);

  // Filtering and sorting
  const getCustomersByStatus = useCallback((status: CustomerStatus) => {
    return customers.filter((c) => c.status === status);
  }, [customers]);

  const getCustomersByTag = useCallback((tag: string) => {
    return customers.filter((c) => c.tags.includes(tag));
  }, [customers]);

  const searchCustomers = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return customers.filter((c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.company.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(query) ||
      c.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }, [customers]);

  // Statistics
  const stats = useMemo<CRMStats>(() => {
    const activeCustomers = customers.filter((c) => c.status === 'active').length;
    const prospects = customers.filter((c) => c.status === 'prospect').length;
    
    return {
      totalCustomers: customers.length,
      activeCustomers,
      prospects,
      pipelineValue: 0, // Calculated in useDeals
      closedWonValue: 0, // Calculated in useDeals
      closedLostValue: 0, // Calculated in useDeals
      conversionRate: customers.length > 0 
        ? Math.round((activeCustomers / customers.length) * 100) 
        : 0,
      upcomingFollowUps: 0, // Calculated in useInteractions
    };
  }, [customers]);

  return {
    customers,
    isLoaded,
    stats,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    getCustomersByStatus,
    getCustomersByTag,
    searchCustomers,
  };
}
