'use client';

import { Customer, CUSTOMER_STATUS_COLORS } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';
import { Mail, Phone, Building2, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

interface CustomerCardProps {
  customer: Customer;
  showTags?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CustomerCard({ 
  customer, 
  showTags = true, 
  compact = false,
  className,
  onClick 
}: CustomerCardProps) {
  const statusColors = CUSTOMER_STATUS_COLORS[customer.status];
  
  const CardWrapper = onClick ? 'button' : 'div';
  
  return (
    <CardWrapper
      onClick={onClick}
      className={cn(
        'w-full text-left',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow'
      )}
    >
      <Card className={cn(
        'overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-700',
        className
      )}>
        <CardContent className={cn(
          'p-4',
          compact && 'p-3'
        )}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0 flex-1">
              <h3 className={cn(
                'font-semibold text-slate-900 dark:text-slate-100 truncate',
                compact ? 'text-sm' : 'text-base'
              )}>
                {customer.name}
              </h3>
              {customer.company && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{customer.company}</span>
                </p>
              )}
            </div>
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize flex-shrink-0',
              statusColors.bg,
              statusColors.text,
              statusColors.border
            )}>
              {customer.status}
            </span>
          </div>

          {/* Contact Info */}
          <div className={cn(
            'space-y-1.5',
            compact && 'space-y-1'
          )}>
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{customer.email}</span>
              </a>
            )}
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{customer.phone}</span>
              </a>
            )}
            {customer.address && !compact && (
              <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{customer.address}</span>
              </p>
            )}
          </div>

          {/* Tags */}
          {showTags && customer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {customer.tags.slice(0, compact ? 2 : 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {customer.tags.length > (compact ? 2 : 4) && (
                <span className="text-xs text-slate-400">
                  +{customer.tags.length - (compact ? 2 : 4)}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          {!compact && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Added {formatDate(customer.createdAt)}
              </p>
              <Link
                href={`/crm/customers/${customer.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View Details →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}

// Compact list item version for sidebars
interface CustomerListItemProps {
  customer: Customer;
  onClick?: () => void;
  isActive?: boolean;
}

export function CustomerListItem({ customer, onClick, isActive }: CustomerListItemProps) {
  const statusColors = CUSTOMER_STATUS_COLORS[customer.status];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-colors border',
        isActive 
          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
          statusColors.bg,
          statusColors.text
        )}>
          {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
            {customer.name}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {customer.company || customer.email || customer.phone}
          </p>
        </div>
      </div>
    </button>
  );
}
