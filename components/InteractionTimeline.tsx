'use client';

import { Interaction, InteractionType, INTERACTION_TYPE_COLORS } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { 
  Phone, 
  Mail, 
  Users, 
  MapPin, 
  FileText, 
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

const iconMap = {
  Phone: Phone,
  Mail: Mail,
  Users: Users,
  MapPin: MapPin,
  FileText: FileText,
};

interface InteractionTimelineProps {
  interactions: Interaction[];
  showCustomer?: boolean;
  customersMap?: Map<string, string>; // id -> name
  onAddInteraction?: () => void;
  onEditInteraction?: (interaction: Interaction) => void;
  compact?: boolean;
}

interface InteractionItemProps {
  interaction: Interaction;
  showCustomer?: boolean;
  customerName?: string;
  isLast?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

function InteractionItem({ 
  interaction, 
  showCustomer, 
  customerName,
  isLast,
  compact,
  onClick 
}: InteractionItemProps) {
  const typeColors = INTERACTION_TYPE_COLORS[interaction.type];
  const Icon = iconMap[typeColors.icon as keyof typeof iconMap] || FileText;
  
  const hasFollowUp = interaction.followUpDate;
  const followUpDate = hasFollowUp ? parseISO(interaction.followUpDate!) : null;
  const isFollowUpToday = followUpDate && isToday(followUpDate);
  const isFollowUpOverdue = followUpDate && isPast(followUpDate) && !isToday(followUpDate);
  
  return (
    <div className={cn('flex gap-4', compact && 'gap-3')}">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
      )}
      
      {/* Icon */}
      <div className={cn(
        'relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
        typeColors.bg,
        compact && 'w-8 h-8'
      )}>
        <Icon className={cn(
          'w-5 h-5',
          typeColors.text,
          compact && 'w-4 h-4'
        )} />
      </div>

      {/* Content */}
      <button
        onClick={onClick}
        className={cn(
          'flex-1 text-left pb-6',
          compact && 'pb-4'
        )}
      >
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
          <CardContent className={cn('p-4', compact && 'p-3')}">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
                  typeColors.bg,
                  typeColors.text
                )}>
                  {interaction.type}
                </span>
                {showCustomer && customerName && (
                  <span className="text-xs text-slate-500">
                    with {customerName}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {formatDate(interaction.date)}
              </span>
            </div>

            {/* Notes */}
            {interaction.notes && (
              <p className={cn(
                'text-slate-700 dark:text-slate-300',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {interaction.notes}
              </p>
            )}

            {/* Follow-up */}
            {hasFollowUp && (
              <div className={cn(
                'mt-3 flex items-center gap-2 p-2 rounded-lg',
                isFollowUpToday && 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
                isFollowUpOverdue && 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
                !isFollowUpToday && !isFollowUpOverdue && 'bg-slate-50 dark:bg-slate-800/50'
              )}>
                {isFollowUpToday ? (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                ) : isFollowUpOverdue ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Calendar className="w-4 h-4 text-slate-400" />
                )}
                <span className={cn(
                  'text-xs',
                  isFollowUpToday && 'text-amber-700 dark:text-amber-300 font-medium',
                  isFollowUpOverdue && 'text-red-700 dark:text-red-300 font-medium',
                  !isFollowUpToday && !isFollowUpOverdue && 'text-slate-500'
                )}>
                  Follow-up: {isFollowUpToday && 'Today'}
                  {isFollowUpOverdue && `Overdue (${format(followUpDate!, 'MMM d')})`}
                  {!isFollowUpToday && !isFollowUpOverdue && format(followUpDate!, 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </button>
    </div>
  );
}

export function InteractionTimeline({
  interactions,
  showCustomer = false,
  customersMap,
  onAddInteraction,
  onEditInteraction,
  compact = false,
}: InteractionTimelineProps) {
  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No interactions yet</p>
        {onAddInteraction && (
          <Button variant="ghost" onClick={onAddInteraction} className="mt-2">
            Log an interaction
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {interactions.map((interaction, index) => (
        <InteractionItem
          key={interaction.id}
          interaction={interaction}
          showCustomer={showCustomer}
          customerName={customersMap?.get(interaction.customerId)}
          isLast={index === interactions.length - 1}
          compact={compact}
          onClick={() => onEditInteraction?.(interaction)}
        />
      ))}
    </div>
  );
}

// Quick interaction buttons for customer detail
interface QuickInteractionButtonsProps {
  onLogInteraction: (type: InteractionType) => void;
}

export function QuickInteractionButtons({ onLogInteraction }: QuickInteractionButtonsProps) {
  const buttons: { type: InteractionType; label: string; icon: React.ReactNode }[] = [
    { type: 'call', label: 'Call', icon: <Phone className="w-4 h-4" /> },
    { type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { type: 'meeting', label: 'Meeting', icon: <Users className="w-4 h-4" /> },
    { type: 'visit', label: 'Visit', icon: <MapPin className="w-4 h-4" /> },
    { type: 'note', label: 'Note', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map(({ type, label, icon }) => (
        <Button
          key={type}
          variant="secondary"
          size="sm"
          onClick={() => onLogInteraction(type)}
          className="gap-1.5"
        >
          {icon}
          {label}
        </Button>
      ))}
    </div>
  );
}

// Follow-up list for dashboard
interface FollowUpListProps {
  interactions: Interaction[];
  customersMap: Map<string, string>;
  onComplete?: (interactionId: string) => void;
}

export function FollowUpList({ interactions, customersMap, onComplete }: FollowUpListProps) {
  const sortedFollowUps = interactions
    .filter(i => i.followUpDate)
    .sort((a, b) => {
      if (!a.followUpDate || !b.followUpDate) return 0;
      return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime();
    });

  if (sortedFollowUps.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
        <p className="text-sm">No upcoming follow-ups</p>
        <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedFollowUps.slice(0, 5).map((interaction) => {
        const followUpDate = parseISO(interaction.followUpDate!);
        const isDueToday = isToday(followUpDate);
        const isOverdue = isPast(followUpDate) && !isToday(followUpDate);
        const customerName = customersMap.get(interaction.customerId) || 'Unknown';
        const typeColors = INTERACTION_TYPE_COLORS[interaction.type];

        return (
          <div
            key={interaction.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              isDueToday && 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
              isOverdue && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
              !isDueToday && !isOverdue && 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              typeColors.bg
            )}>
              <span className={typeColors.text}>
                {typeColors.icon === 'Phone' && <Phone className="w-3.5 h-3.5" />}
                {typeColors.icon === 'Mail' && <Mail className="w-3.5 h-3.5" />}
                {typeColors.icon === 'Users' && <Users className="w-3.5 h-3.5" />}
                {typeColors.icon === 'MapPin' && <MapPin className="w-3.5 h-3.5" />}
                {typeColors.icon === 'FileText' && <FileText className="w-3.5 h-3.5" />}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {customerName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {interaction.notes?.slice(0, 50)}
                {interaction.notes && interaction.notes.length > 50 && '...'}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className={cn(
                'text-xs font-medium',
                isDueToday && 'text-amber-600 dark:text-amber-400',
                isOverdue && 'text-red-600 dark:text-red-400',
                !isDueToday && !isOverdue && 'text-slate-500'
              )}>
                {isDueToday && 'Today'}
                {isOverdue && `${Math.abs(Math.floor((new Date().getTime() - followUpDate.getTime()) / 86400000))}d overdue`}
                {!isDueToday && !isOverdue && format(followUpDate, 'MMM d')}
              </p>
              {onComplete && (
                <button
                  onClick={() => onComplete(interaction.id)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
