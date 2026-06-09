import * as React from 'react';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card, CardContent } from './card';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, description, trend, icon: Icon, className }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <Card variant="stat" className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1.5 text-sm">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className={cn('font-medium', isPositive ? 'text-success' : 'text-destructive')}>
              {isPositive ? '+' : ''}
              {trend.value}%
            </span>
            {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
