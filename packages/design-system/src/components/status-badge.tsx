import { cn } from '../lib/utils';
import type { StatusVariant } from '../tokens/colors';

const statusConfig: Record<
  StatusVariant,
  { label: string; className: string; dotClassName: string }
> = {
  ordered: {
    label: 'Ordered',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dotClassName: 'bg-status-ordered',
  },
  collected: {
    label: 'Collected',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    dotClassName: 'bg-status-collected',
  },
  processing: {
    label: 'Processing',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    dotClassName: 'bg-status-processing',
  },
  verified: {
    label: 'Verified',
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    dotClassName: 'bg-status-verified',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    dotClassName: 'bg-status-approved',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    dotClassName: 'bg-status-rejected',
  },
  reported: {
    label: 'Reported',
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    dotClassName: 'bg-status-reported',
  },
  critical: {
    label: 'Critical',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    dotClassName: 'bg-status-critical',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    dotClassName: 'bg-warning',
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    dotClassName: 'bg-success',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    dotClassName: 'bg-slate-400',
  },
};

export interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, label, showDot = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClassName)} />}
      {label ?? config.label}
    </span>
  );
}

export { statusConfig };
