/**
 * CRM Types for Red Clay Garage Services
 * Customer Relationship Management type definitions
 */

// Customer Status
export type CustomerStatus = 'active' | 'inactive' | 'prospect' | 'former';

// Deal Stage in pipeline
export type DealStage = 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

// Interaction types
export type InteractionType = 'call' | 'email' | 'meeting' | 'visit' | 'note';

// Customer interface
export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  tags: string[];
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Deal interface
export interface Deal {
  id: string;
  customerId: string;
  title: string;
  value: number;
  stage: DealStage;
  expectedClose: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Interaction interface
export interface Interaction {
  id: string;
  customerId: string;
  type: InteractionType;
  date: string;
  notes: string;
  followUpDate?: string | null;
  createdAt: string;
}

// Pipeline column for Kanban view
export interface PipelineColumn {
  id: DealStage;
  title: string;
  color: string;
}

// Customer with related data
export interface CustomerWithDetails extends Customer {
  deals: Deal[];
  interactions: Interaction[];
  totalValue: number;
  lastContact: string | null;
}

// Dashboard stats
export interface CRMStats {
  totalCustomers: number;
  activeCustomers: number;
  prospects: number;
  pipelineValue: number;
  closedWonValue: number;
  closedLostValue: number;
  conversionRate: number;
  upcomingFollowUps: number;
}

// Color mappings
export const CUSTOMER_STATUS_COLORS: Record<CustomerStatus, { bg: string; text: string; border: string }> = {
  active: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  inactive: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' },
  prospect: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  former: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
};

export const DEAL_STAGE_COLORS: Record<DealStage, { bg: string; text: string; border: string; dot: string }> = {
  lead: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', dot: 'bg-slate-500' },
  contacted: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  proposal: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-500' },
  negotiation: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  'closed-won': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  'closed-lost': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
};

export const INTERACTION_TYPE_COLORS: Record<InteractionType, { bg: string; text: string; icon: string }> = {
  call: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: 'Phone' },
  email: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: 'Mail' },
  meeting: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: 'Users' },
  visit: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: 'MapPin' },
  note: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', icon: 'FileText' },
};

// Pipeline columns configuration
export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: 'lead', title: 'Lead', color: 'bg-slate-500' },
  { id: 'contacted', title: 'Contacted', color: 'bg-blue-500' },
  { id: 'proposal', title: 'Proposal', color: 'bg-indigo-500' },
  { id: 'negotiation', title: 'Negotiation', color: 'bg-amber-500' },
  { id: 'closed-won', title: 'Closed (Won)', color: 'bg-emerald-500' },
  { id: 'closed-lost', title: 'Closed (Lost)', color: 'bg-red-500' },
];

// Common tags for garage door business
export const COMMON_CUSTOMER_TAGS = [
  'Homeowner',
  'Commercial',
  'Annual Maintenance',
  'Repair',
  'New Install',
  'Emergency',
  'Referral',
  'Builder',
  'Property Manager',
  'HOA',
];

// Auburn, AL area neighborhoods/areas
export const AUBURN_AREAS = [
  'Downtown Auburn',
  'North Auburn',
  'South Auburn',
  'Moores Mill',
  'Cary Woods',
  'Grove Hill',
  'Pepperell',
  'Opelika',
  'Smiths Station',
  'Beauregard',
  'Other',
];
