'use client';

import { useState, useMemo } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot,
} from '@hello-pangea/dnd';
import { Deal, DealStage, PIPELINE_COLUMNS, DEAL_STAGE_COLORS } from '@/types/crm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { 
  DollarSign, 
  Calendar, 
  MoreHorizontal, 
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User
} from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';

interface DealPipelineProps {
  deals: Deal[];
  customersMap: Map<string, { name: string; company: string }>;
  onMoveDeal: (dealId: string, newStage: DealStage) => void;
  onEditDeal: (deal: Deal) => void;
  onAddDeal?: (stage: DealStage) => void;
  readOnly?: boolean;
  filterCustomerId?: string;
}

interface DealCardProps {
  deal: Deal;
  customerName: string;
  customerCompany: string;
  index: number;
  onEdit: (deal: Deal) => void;
}

function DealCard({ deal, customerName, customerCompany, index, onEdit }: DealCardProps) {
  const isOverdue = deal.expectedClose && isPast(parseISO(deal.expectedClose)) && 
    !['closed-won', 'closed-lost'].includes(deal.stage);
  
  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(deal)}
          className={cn(
            'bg-white dark:bg-slate-800 p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing transition-all',
            snapshot.isDragging
              ? 'shadow-xl ring-2 ring-indigo-500/20 border-indigo-500 rotate-2'
              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:scale-[1.02]'
          )}
          style={provided.draggableProps.style}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 flex-1 line-clamp-2">
              {deal.title}
            </h4>
            {deal.stage === 'closed-won' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
            {deal.stage === 'closed-lost' && (
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
          </div>

          {/* Customer */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {customerName}
              {customerCompany && ` • ${customerCompany}`}
            </span>
          </div>

          {/* Value & Date */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <DollarSign className="w-3.5 h-3.5" />
              {deal.value.toLocaleString()}
            </span>
            
            {deal.expectedClose && (
              <span className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue && 'text-red-500 font-medium',
                !isOverdue && 'text-slate-500 dark:text-slate-400'
              )}>
                <Calendar className="w-3 h-3" />
                {isOverdue ? 'Overdue' : format(parseISO(deal.expectedClose), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

interface PipelineColumnProps {
  column: typeof PIPELINE_COLUMNS[0];
  deals: Deal[];
  customersMap: Map<string, { name: string; company: string }>;
  onEditDeal: (deal: Deal) => void;
  onAddDeal?: (stage: DealStage) => void;
  readOnly?: boolean;
}

function PipelineColumn({ 
  column, 
  deals, 
  customersMap, 
  onEditDeal, 
  onAddDeal,
  readOnly 
}: PipelineColumnProps) {
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  
  return (
    <div className="flex flex-col h-full min-w-[280px] w-[280px]">
      <CardHeader className="pb-3 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', column.color)} />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              {column.title}
            </h3>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
              {deals.length}
            </span>
          </div>
          {!readOnly && onAddDeal && (
            <button
              onClick={() => onAddDeal(column.id)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          ${totalValue.toLocaleString()} total
        </p>
      </CardHeader>

      <Droppable droppableId={column.id} isDropDisabled={readOnly}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-2 space-y-2 min-h-[200px] rounded-lg transition-colors',
              snapshot.isDraggingOver
                ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-300 dark:border-indigo-700'
                : 'bg-slate-50/50 dark:bg-slate-900/30'
            )}
          >
            {deals.map((deal, index) => {
              const customer = customersMap.get(deal.customerId) || { name: 'Unknown', company: '' };
              return (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  customerName={customer.name}
                  customerCompany={customer.company}
                  index={index}
                  onEdit={onEditDeal}
                />
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export function DealPipeline({
  deals,
  customersMap,
  onMoveDeal,
  onEditDeal,
  onAddDeal,
  readOnly = false,
  filterCustomerId,
}: DealPipelineProps) {
  const filteredDeals = useMemo(() => {
    if (!filterCustomerId) return deals;
    return deals.filter(d => d.customerId === filterCustomerId);
  }, [deals, filterCustomerId]);

  const dealsByStage = useMemo(() => ({
    lead: filteredDeals.filter((d) => d.stage === 'lead'),
    contacted: filteredDeals.filter((d) => d.stage === 'contacted'),
    proposal: filteredDeals.filter((d) => d.stage === 'proposal'),
    negotiation: filteredDeals.filter((d) => d.stage === 'negotiation'),
    'closed-won': filteredDeals.filter((d) => d.stage === 'closed-won'),
    'closed-lost': filteredDeals.filter((d) => d.stage === 'closed-lost'),
  }), [filteredDeals]);

  const onDragEnd = (result: DropResult) => {
    if (readOnly) return;
    
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId as DealStage;
    onMoveDeal(draggableId, newStage);
  };

  return (
    <div className="w-full overflow-x-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 min-w-max pb-4">
          {PIPELINE_COLUMNS.map((column) => (
            <Card key={column.id} className="flex flex-col h-full">
              <PipelineColumn
                column={column}
                deals={dealsByStage[column.id]}
                customersMap={customersMap}
                onEditDeal={onEditDeal}
                onAddDeal={onAddDeal}
                readOnly={readOnly}
              />
            </Card>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

// Compact deal list for customer detail view
interface DealListProps {
  deals: Deal[];
  customersMap: Map<string, { name: string; company: string }>;
  onEditDeal: (deal: Deal) => void;
  onAddDeal?: () => void;
}

export function DealList({ deals, customersMap, onEditDeal, onAddDeal }: DealListProps) {
  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      // Sort by stage (open first), then by expected close date
      const aClosed = ['closed-won', 'closed-lost'].includes(a.stage);
      const bClosed = ['closed-won', 'closed-lost'].includes(b.stage);
      if (aClosed !== bClosed) return aClosed ? 1 : -1;
      
      if (!a.expectedClose || !b.expectedClose) return 0;
      return new Date(a.expectedClose).getTime() - new Date(b.expectedClose).getTime();
    });
  }, [deals]);

  if (deals.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No deals yet</p>
        {onAddDeal && (
          <Button variant="ghost" onClick={onAddDeal} className="mt-2">
            Add a deal
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedDeals.map((deal) => {
        const customer = customersMap.get(deal.customerId) || { name: 'Unknown', company: '' };
        const stageColors = DEAL_STAGE_COLORS[deal.stage];
        const isOverdue = deal.expectedClose && isPast(parseISO(deal.expectedClose)) && 
          !['closed-won', 'closed-lost'].includes(deal.stage);

        return (
          <button
            key={deal.id}
            onClick={() => onEditDeal(deal)}
            className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                  {deal.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                    stageColors.bg,
                    stageColors.text
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', stageColors.dot)} />
                    {stageColors.text.replace('text-', '').replace('-700', '').replace('-300', '').replace(' dark:', ' ').split(' ')[0]}
                  </span>
                  {isOverdue && (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Overdue
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  ${deal.value.toLocaleString()}
                </p>
                {deal.expectedClose && (
                  <p className={cn(
                    'text-xs',
                    isOverdue ? 'text-red-500' : 'text-slate-500'
                  )}>
                    {format(parseISO(deal.expectedClose), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
