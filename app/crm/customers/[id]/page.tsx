'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  DollarSign,
  Tag,
  FileText,
  History,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Select } from '@/components/ui/input';
import { DealList } from '@/components/DealPipeline';
import { InteractionTimeline, QuickInteractionButtons } from '@/components/InteractionTimeline';
import { useCustomers } from '@/hooks/use-customers';
import { useDeals } from '@/hooks/use-deals';
import { useInteractions } from '@/hooks/use-interactions';
import { Customer, CustomerStatus, Deal, DealStage, Interaction, InteractionType, COMMON_CUSTOMER_TAGS, CUSTOMER_STATUS_COLORS } from '@/types/crm';
import { cn, formatDate } from '@/lib/utils';

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

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const { customers, updateCustomer, deleteCustomer, getCustomerById, isLoaded: customersLoaded } = useCustomers();
  const { deals, createDeal, updateDeal, deleteDeal, getDealsByCustomer } = useDeals();
  const { interactions, createInteraction, updateInteraction, deleteInteraction, getInteractionsByCustomer } = useInteractions();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [interactionType, setInteractionType] = useState<InteractionType>('note');

  const customer = useMemo(() => getCustomerById(customerId), [customerId, getCustomerById, customers]);
  const customerDeals = useMemo(() => getDealsByCustomer(customerId), [customerId, getDealsByCustomer, deals]);
  const customerInteractions = useMemo(() => getInteractionsByCustomer(customerId), [customerId, getInteractionsByCustomer, interactions]);

  // Create customers map for DealList
  const customersMap = useMemo(() => {
    const map = new Map();
    customers.forEach(c => {
      map.set(c.id, { name: c.name, company: c.company });
    });
    return map;
  }, [customers]);

  const handleUpdateCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateCustomer(customerId, {
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      status: formData.get('status') as CustomerStatus,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      address: formData.get('address') as string,
      notes: formData.get('notes') as string,
    });
    
    setIsEditModalOpen(false);
  };

  const handleDeleteCustomer = () => {
    deleteCustomer(customerId);
    // Also delete related deals and interactions
    customerDeals.forEach(d => deleteDeal(d.id));
    customerInteractions.forEach(i => deleteInteraction(i.id));
    router.push('/crm');
  };

  const handleCreateDeal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingDeal) {
      updateDeal(editingDeal.id, {
        title: formData.get('title') as string,
        value: Number(formData.get('value')),
        stage: formData.get('stage') as DealStage,
        expectedClose: formData.get('expectedClose') as string || null,
        notes: formData.get('notes') as string,
      });
    } else {
      createDeal({
        customerId,
        title: formData.get('title') as string,
        value: Number(formData.get('value')),
        stage: formData.get('stage') as DealStage,
        expectedClose: formData.get('expectedClose') as string || null,
        notes: formData.get('notes') as string,
      });
    }
    
    setIsDealModalOpen(false);
    setEditingDeal(null);
  };

  const handleCreateInteraction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingInteraction) {
      updateInteraction(editingInteraction.id, {
        type: formData.get('type') as InteractionType,
        date: new Date(formData.get('date') as string).toISOString(),
        notes: formData.get('notes') as string,
        followUpDate: formData.get('followUpDate') as string || null,
      });
    } else {
      createInteraction({
        customerId,
        type: formData.get('type') as InteractionType,
        date: new Date(formData.get('date') as string).toISOString(),
        notes: formData.get('notes') as string,
        followUpDate: formData.get('followUpDate') as string || null,
      });
    }
    
    setIsInteractionModalOpen(false);
    setEditingInteraction(null);
  };

  const openAddDeal = () => {
    setEditingDeal(null);
    setIsDealModalOpen(true);
  };

  const openEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setIsDealModalOpen(true);
  };

  const openAddInteraction = (type: InteractionType = 'note') => {
    setInteractionType(type);
    setEditingInteraction(null);
    setIsInteractionModalOpen(true);
  };

  const openEditInteraction = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setInteractionType(interaction.type);
    setIsInteractionModalOpen(true);
  };

  if (!customersLoaded) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Customer Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">The customer you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/crm')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to CRM
        </Button>
      </div>
    );
  }

  const statusColors = CUSTOMER_STATUS_COLORS[customer.status];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants}>
            <Button variant="ghost" onClick={() => router.push('/crm')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to CRM
            </Button>
          </motion.div>

          {/* Customer Header */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold',
                      statusColors.bg,
                      statusColors.text
                    )}>
                      {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {customer.name}
                      </h1>
                      {customer.company && (
                        <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {customer.company}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
                          statusColors.bg,
                          statusColors.text,
                          statusColors.border
                        )}>
                          {customer.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          Customer since {formatDate(customer.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </a>
                  )}
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </a>
                  )}
                  {customer.address && (
                    <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      {customer.address}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {customer.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {customer.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {customer.notes && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{customer.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Deals & Interactions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deals Section */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      Deals
                      <span className="text-sm font-normal text-slate-500">({customerDeals.length})</span>
                    </CardTitle>
                    <Button size="sm" onClick={openAddDeal}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Deal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DealList
                    deals={customerDeals}
                    customersMap={customersMap}
                    onEditDeal={openEditDeal}
                    onAddDeal={openAddDeal}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Interactions Section */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-500" />
                      Interactions
                      <span className="text-sm font-normal text-slate-500">({customerInteractions.length})</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <QuickInteractionButtons onLogInteraction={openAddInteraction} />
                  </div>
                  <InteractionTimeline
                    interactions={customerInteractions}
                    onEditInteraction={openEditInteraction}
                    compact
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Customer"
        size="lg"
      >
        <form onSubmit={handleUpdateCustomer} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="name"
              label="Name *"
              defaultValue={customer.name}
              required
            />
            <Input
              name="company"
              label="Company"
              defaultValue={customer.company}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="email"
              label="Email"
              type="email"
              defaultValue={customer.email}
            />
            <Input
              name="phone"
              label="Phone"
              defaultValue={customer.phone}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              name="status"
              label="Status"
              defaultValue={customer.status}
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
              defaultValue={customer.tags.join(', ')}
              placeholder="comma separated"
            />
          </div>

          <Input
            name="address"
            label="Address"
            defaultValue={customer.address}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={customer.notes}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Customer</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Customer"
        size="sm"
      >
        <div className="p-6">
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Are you sure you want to delete <strong>{customer.name}</strong>? 
            This will also delete all associated deals and interactions. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteCustomer}>
              Delete Customer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deal Modal */}
      <Modal
        isOpen={isDealModalOpen}
        onClose={() => {
          setIsDealModalOpen(false);
          setEditingDeal(null);
        }}
        title={editingDeal ? 'Edit Deal' : 'Add Deal'}
        size="md"
      >
        <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
          <Input
            name="title"
            label="Deal Title *"
            defaultValue={editingDeal?.title}
            placeholder="e.g., Garage Door Installation"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="value"
              label="Value ($) *"
              type="number"
              defaultValue={editingDeal?.value}
              placeholder="3500"
              required
            />
            <Select
              name="stage"
              label="Stage *"
              defaultValue={editingDeal?.stage || 'lead'}
              options={[
                { value: 'lead', label: 'Lead' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'proposal', label: 'Proposal' },
                { value: 'negotiation', label: 'Negotiation' },
                { value: 'closed-won', label: 'Closed (Won)' },
                { value: 'closed-lost', label: 'Closed (Lost)' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Expected Close Date
            </label>
            <input
              type="date"
              name="expectedClose"
              defaultValue={editingDeal?.expectedClose?.split('T')[0]}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={editingDeal?.notes}
              placeholder="Additional details about this deal..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-between pt-4">
            {editingDeal && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  deleteDeal(editingDeal.id);
                  setIsDealModalOpen(false);
                  setEditingDeal(null);
                }}
              >
                Delete Deal
              </Button>
            )}
            <div className="flex gap-3 ml-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsDealModalOpen(false);
                  setEditingDeal(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingDeal ? 'Update Deal' : 'Create Deal'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Interaction Modal */}
      <Modal
        isOpen={isInteractionModalOpen}
        onClose={() => {
          setIsInteractionModalOpen(false);
          setEditingInteraction(null);
        }}
        title={editingInteraction ? 'Edit Interaction' : 'Log Interaction'}
        size="md"
      >
        <form onSubmit={handleCreateInteraction} className="p-6 space-y-4">
          <Select
            name="type"
            label="Interaction Type *"
            defaultValue={editingInteraction?.type || interactionType}
            options={[
              { value: 'call', label: 'Phone Call' },
              { value: 'email', label: 'Email' },
              { value: 'meeting', label: 'Meeting' },
              { value: 'visit', label: 'Site Visit' },
              { value: 'note', label: 'Note' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="datetime-local"
              name="date"
              defaultValue={editingInteraction 
                ? new Date(editingInteraction.date).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16)
              }
              required
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes *
            </label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={editingInteraction?.notes}
              placeholder="What was discussed? Any action items?"
              required
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Follow-up Date (optional)
            </label>
            <input
              type="date"
              name="followUpDate"
              defaultValue={editingInteraction?.followUpDate?.split('T')[0]}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-between pt-4">
            {editingInteraction && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  deleteInteraction(editingInteraction.id);
                  setIsInteractionModalOpen(false);
                  setEditingInteraction(null);
                }}
              >
                Delete
              </Button>
            )}
            
            <div className="flex gap-3 ml-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsInteractionModalOpen(false);
                  setEditingInteraction(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingInteraction ? 'Update' : 'Log Interaction'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
