'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { AlertTriangle } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { inventoryApi } from '@/lib/api/inventory';
import { formatDate } from '@/lib/mock-data';
import type { ExpiryAlert } from '@/types';

const severityMap: Record<ExpiryAlert['severity'], 'pending' | 'critical'> = {
  warning: 'pending',
  critical: 'critical',
};

const columns: ColumnDef<ExpiryAlert>[] = [
  { accessorKey: 'itemCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.itemCode}</span> },
  { accessorKey: 'itemName', header: 'Item' },
  { accessorKey: 'itemType', header: 'Type', cell: ({ row }) => row.original.itemType.charAt(0).toUpperCase() + row.original.itemType.slice(1) },
  { accessorKey: 'lotNumber', header: 'Lot #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.lotNumber}</span> },
  { accessorKey: 'expiryDate', header: 'Expiry', cell: ({ row }) => formatDate(row.original.expiryDate) },
  {
    accessorKey: 'daysRemaining',
    header: 'Days Left',
    cell: ({ row }) => (
      <span className={row.original.daysRemaining < 0 ? 'font-medium text-destructive' : ''}>
        {row.original.daysRemaining < 0 ? `${Math.abs(row.original.daysRemaining)}d overdue` : `${row.original.daysRemaining}d`}
      </span>
    ),
  },
  { accessorKey: 'quantity', header: 'Qty' },
  {
    accessorKey: 'severity',
    header: 'Severity',
    cell: ({ row }) => (
      <StatusBadge status={severityMap[row.original.severity]} label={row.original.severity} />
    ),
  },
  { accessorKey: 'branch', header: 'Branch' },
];

export default function ExpiryPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory-expiry'],
    queryFn: () => inventoryApi.listExpiryAlerts(),
  });

  const critical = data.filter((a) => a.severity === 'critical').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Expiry Alerts"
          description={`${critical} critical alerts · ${data.length} total items`}
          actions={
            <Button variant="outline">
              <AlertTriangle className="h-4 w-4" />
              Export Report
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load expiry alerts.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="itemName" searchPlaceholder="Search items..." isLoading={isLoading} emptyMessage="No expiry alerts." />
        )}
      </div>
    </PageTransition>
  );
}
