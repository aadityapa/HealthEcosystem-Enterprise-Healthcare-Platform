'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { devicesApi } from '@/lib/api/devices';
import { messageStatusMap } from '@/lib/devices/status-maps';
import { formatDateTime } from '@/lib/mock-data';
import type { DeviceMessage } from '@/types';

export default function MessageQueuePage() {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['device-messages'],
    queryFn: devicesApi.listMessages,
    refetchInterval: 15000,
  });

  const retryMutation = useMutation({
    mutationFn: devicesApi.retryMessage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['device-messages'] }),
  });

  const columns: ColumnDef<DeviceMessage>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Time',
      cell: ({ row }) => formatDateTime(row.original.timestamp),
    },
    {
      accessorKey: 'deviceName',
      header: 'Device',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.deviceName}</p>
          <p className="text-xs capitalize text-muted-foreground">{row.original.direction}</p>
        </div>
      ),
    },
    {
      accessorKey: 'protocol',
      header: 'Protocol',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.protocol}</span>
      ),
    },
    {
      accessorKey: 'barcode',
      header: 'Barcode',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-primary">{row.original.barcode}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const mapped = messageStatusMap[row.original.status];
        return <StatusBadge status={mapped.status} label={mapped.label} />;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const canRetry = row.original.status === 'failed' || row.original.status === 'queued';
        const isRetrying =
          retryMutation.isPending && retryMutation.variables === row.original.id;
        return canRetry ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isRetrying}
            onClick={(e) => {
              e.stopPropagation();
              retryMutation.mutate(row.original.id);
            }}
          >
            {isRetrying ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Retry
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
  ];

  const failedCount = messages.filter((m) => m.status === 'failed').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Message Queue"
          description={`${messages.length} messages in queue${failedCount ? ` · ${failedCount} failed` : ''}`}
          actions={
            failedCount > 0 ? (
              <Link href="/devices/messages/failed">
                <Button variant="outline">View Failed ({failedCount})</Button>
              </Link>
            ) : undefined
          }
        />

        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load message queue.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={messages}
            searchKey="barcode"
            searchPlaceholder="Search by barcode..."
            isLoading={isLoading}
            emptyMessage="Message queue is empty. Incoming device messages will appear here."
          />
        )}
      </div>
    </PageTransition>
  );
}
