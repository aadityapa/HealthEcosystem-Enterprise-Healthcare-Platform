'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { analyticsApi } from '@/lib/api/analytics';

import type { DeviceAnalyticsRow } from '@/types';

const columns: ColumnDef<DeviceAnalyticsRow>[] = [
  { accessorKey: 'deviceName', header: 'Device' },
  { accessorKey: 'branch', header: 'Branch' },
  { accessorKey: 'uptime', header: 'Uptime %', cell: ({ row }) => row.original.uptime.toFixed(1) },
  { accessorKey: 'messagesProcessed', header: 'Messages', cell: ({ row }) => row.original.messagesProcessed.toLocaleString() },
  { accessorKey: 'errorRate', header: 'Error Rate', cell: ({ row }) => row.original.errorRate.toFixed(1) },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-devices'],
    queryFn: () => analyticsApi.listDeviceAnalytics(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Device Analytics" description="Device uptime and throughput (${data.length} records)" actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="deviceName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
