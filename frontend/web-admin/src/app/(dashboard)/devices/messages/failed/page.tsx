'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { devicesApi } from '@/lib/api/devices';
import { messageStatusMap } from '@/lib/devices/status-maps';
import { formatDateTime } from '@/lib/mock-data';
import type { FailedMessage } from '@/types';

const columns: ColumnDef<FailedMessage>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Time',
    cell: ({ row }) => formatDateTime(row.original.timestamp),
  },
  {
    accessorKey: 'deviceName',
    header: 'Device',
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
    accessorKey: 'errorCode',
    header: 'Error Code',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-destructive">{row.original.errorCode}</span>
    ),
  },
  {
    accessorKey: 'errorMessage',
    header: 'Error Details',
    cell: ({ row }) => (
      <span className="max-w-xs truncate text-sm" title={row.original.errorMessage}>
        {row.original.errorMessage}
      </span>
    ),
  },
  {
    accessorKey: 'retryCount',
    header: 'Retries',
    cell: ({ row }) => row.original.retryCount,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const mapped = messageStatusMap[row.original.status];
      return <StatusBadge status={mapped.status} label={mapped.label} />;
    },
  },
];

export default function FailedMessagesPage() {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['device-failed-messages'],
    queryFn: devicesApi.listFailedMessages,
  });

  const bulkRetryMutation = useMutation({
    mutationFn: devicesApi.bulkRetryFailed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['device-failed-messages'] }),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Failed Messages"
          description={`${messages.length} messages in dead-letter queue (DLQ)`}
          actions={
            <>
              <Link href="/devices/messages">
                <Button variant="outline">Back to Queue</Button>
              </Link>
              <Button
                disabled={messages.length === 0 || bulkRetryMutation.isPending}
                onClick={() => bulkRetryMutation.mutate()}
              >
                {bulkRetryMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Bulk Retry All
                  </>
                )}
              </Button>
            </>
          }
        />

        {bulkRetryMutation.isSuccess ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
            Successfully queued {bulkRetryMutation.data?.retried} messages for retry.
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-destructive" />
            <p className="text-destructive">Failed to load dead-letter queue.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={messages}
            searchKey="barcode"
            searchPlaceholder="Search failed messages..."
            isLoading={isLoading}
            emptyMessage="No failed messages. All device communications are processing successfully."
          />
        )}
      </div>
    </PageTransition>
  );
}
