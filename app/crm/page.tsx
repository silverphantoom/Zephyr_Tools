'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Plus,
  Search,
  Filter,
  Building2,
  UserCircle,
  Tag,
  MoreHorizontal,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/input';
import { CustomerCard } from '@/components/CustomerCard';
import { DealPipeline } from '@/components/DealPipeline';
import { FollowUpList } from '@/components/InteractionTimeline';
import { useCustomers } from '@/hooks/use-customers';
import { useDeals } from '@/hooks/use-deals';
import { useInteractions } from '@/hooks/use-interactions';
import { Customer, CustomerStatus, COMMON_CUSTOMER_TAGS } from '@/types/crm';
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

type ViewType = 'dashboard' | 'customers' | 'pipeline';

export default function CRMPage() {
  const router = useRouter();
  const { customers, stats: customerStats, createCustomer, isLoaded: customersLoaded } = useCustomers();
  const { deals, stats: dealStats, moveDeal } = useDeals();
  const { upcomingFollowUps, todaysFollowUpsCount } = useInteractions();

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Create customers map for deal pipeline
  const customersMap = useMemo(() => {
    const map = new Map();
    customers.forEach(c => {
      map.set(c.id, { name: c.name, company: c.company });
    });
    return map;
  }, [customers]);

  const customersNameMap = useMemo(() => {
    const map = new Map();
    customers.forEach(c => map.set(c.id, c.name));
    return map;
  }, [customers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch = searchQuery === '' || 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchesTag = tagFilter === '' || customer.tags.includes(tagFilter);
      
      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [customers, searchQuery, statusFilter, tagFilter]);

  // Calculate combined stats
  const combinedStats = useMemo(() => ({
    totalCustomers: customerStats.totalCustomers,
    activeCustomers: customerStats.activeCustomers,
    prospects: customerStats.prospects,
    pipelineValue: dealStats.pipelineValue,
    closedWonValue: dealStats.closedWonValue,
    conversionRate: dealStats.conversionRate,
    todaysFollowUps: todaysFollowUpsCount,
  }), [customerStats, dealStats, todaysFollowUpsCount]);

  const handleAddCustomer = () => {
    setIsCustomerModalOpen(true);
  };

  const handleCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createCustomer({
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      status: formData.get('status') as CustomerStatus,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      address: formData.get('address') as string,
      notes: formData.get('notes') as string,
    });
    
    setIsCustomerModalOpen(false);
  };

  if (!customersLoaded) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">CRM</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage customers, deals, and interactions
              </p>
            </div>
            <Button onClick={handleAddCustomer} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Customer
            </Button>
          </motion.div>

          {/* View Tabs */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'pipeline', label: 'Pipeline', icon: DollarSign },
            ].map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id as ViewType)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    currentView === view.id
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {view.label}
                </button>
              );
            })}
          </motion.div>

          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Customers</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {combinedStats.totalCustomers}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {combinedStats.activeCustomers} active • {combinedStats.prospects} prospects
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pipeline Value</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                          ${combinedStats.pipelineValue.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {dealStats.openDeals} open deals
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Conversion Rate</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {combinedStats.conversionRate}%
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {dealStats.closedWon} won • {dealStats.closedLost} lost
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Today's Follow-ups</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {combinedStats.todaysFollowUps}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {upcomingFollowUps.length} total upcoming
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Customers */}
                <motion.div variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-indigo-500" />
                        Recent Customers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {customers.slice(0, 5).map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => router.push(`/crm/customers/${customer.id}`)}
                            className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                              {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{customer.name}</p>
                              <p className="text-sm text-slate-500 truncate">
                                {customer.company || customer.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Upcoming Follow-ups */}
                <motion.div variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-rose-500" />
                        Upcoming Follow-ups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FollowUpList 
                        interactions={upcomingFollowUps.slice(0, 5)} 
                        customersMap={customersNameMap}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </>
          )}

          {/* CUSTOMERS VIEW */}
          {currentView === 'customers' && (
            <>
              {/* Filters */}
              <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'all')}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'prospect', label: 'Prospect' },
                    { value: 'former', label: 'Former' },
                  ]}
                  className="w-40"
                />
                <Select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Tags' },
                    ...COMMON_CUSTOMER_TAGS.map(tag => ({ value: tag, label: tag })),
                  ]}
                  className="w-48"
                />
              </motion.div>

              {/* Customers Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                  <CustomerCard 
                    key={customer.id} 
                    customer={customer}
                    onClick={() => router.push(`/crm/customers/${customer.id}`)}
                  />
                ))}
              </motion.div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No customers found</p>
                  <Button variant="ghost" onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTagFilter('');
                  }} className="mt-2">
                    Clear filters
                  </Button>
                </div>
              )}
            </>
          )}

          {/* PIPELINE VIEW */}
          {currentView === 'pipeline' && (
            <motion.div variants={itemVariants}>
              <DealPipeline
                deals={deals}
                customersMap={customersMap}
                onMoveDeal={moveDeal}
                onEditDeal={(deal) => console.log('Edit deal:', deal)}
                onAddDeal={(stage) => console.log('Add deal to stage:', stage)}
              />
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Add New Customer"
        size="lg"
      >
        <form onSubmit={handleCustomerSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="name"
              label="Name *"
              placeholder="John Smith"
              required
            />
            <Input
              name="company"
              label="Company"
              placeholder="Company name (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
            />
            <Input
              name="phone"
              label="Phone"
              placeholder="(334) 555-0100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              name="status"
              label="Status"
              options={[
                { value: 'prospect', label: 'Prospect' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'former', label: 'Former' },
              ]}
            />
            <Input
              name="tags"
              label="Tags"
              placeholder="Homeowner, Annual Maintenance (comma separated)"
            />
          </div>

          <Input
            name="address"
            label="Address"
            placeholder="123 Lee Road, Auburn, AL"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              placeholder="Additional notes about this customer..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
