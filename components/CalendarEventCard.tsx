'use client';

import { CalendarEvent } from '@/hooks/use-google-calendar';
import { format, isToday, isTomorrow } from 'date-fns';
import { Calendar, Clock, MapPin, ExternalLink, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CalendarEventCardProps {
  event: CalendarEvent;
  onCreateTask?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export function CalendarEventCard({ event, onCreateTask, compact = false }: CalendarEventCardProps) {
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getTimeLabel = (event: CalendarEvent) => {
    if (event.isAllDay) return 'All day';
    return format(event.startDate, 'h:mm a');
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
        <div className={cn(
          "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold flex-shrink-0",
          isToday(event.startDate) && "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
          isTomorrow(event.startDate) && "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
          !isToday(event.startDate) && !isTomorrow(event.startDate) && "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
        )}>
          <span>{format(event.startDate, 'MMM')}</span>
          <span className="text-lg">{format(event.startDate, 'd')}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{event.title}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeLabel(event)}
            </span>
            {event.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3" />
                {event.location}
              </span>
            )}
          </div>
        </div>

        {onCreateTask && (
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onCreateTask(event);
            }}
            title="Create task from event"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0",
          isToday(event.startDate) && "bg-indigo-100 dark:bg-indigo-900/30",
          isTomorrow(event.startDate) && "bg-amber-100 dark:bg-amber-900/30",
          !isToday(event.startDate) && !isTomorrow(event.startDate) && "bg-slate-100 dark:bg-slate-800"
        )}>
          <span className={cn(
            "text-xs font-medium",
            isToday(event.startDate) && "text-indigo-600 dark:text-indigo-400",
            isTomorrow(event.startDate) && "text-amber-600 dark:text-amber-400",
            !isToday(event.startDate) && !isTomorrow(event.startDate) && "text-slate-500 dark:text-slate-400"
          )}>
            {getDateLabel(event.startDate)}
          </span>
          <span className={cn(
            "text-xl font-bold",
            isToday(event.startDate) && "text-indigo-700 dark:text-indigo-300",
            isTomorrow(event.startDate) && "text-amber-700 dark:text-amber-300",
            !isToday(event.startDate) && !isTomorrow(event.startDate) && "text-slate-700 dark:text-slate-300"
          )}>
            {format(event.startDate, 'd')}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{event.title}</h4>
            
            {event.htmlLink && event.htmlLink !== '#' && (
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-indigo-500 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{event.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {getTimeLabel(event)}
            </span>
            
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </span>
            )}
            
            {event.isAllDay && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                All day
              </span>
            )}
          </div>

          {onCreateTask && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                onClick={() => onCreateTask(event)}
              >
                <Plus className="w-4 h-4" />
                Create Task from Event
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
