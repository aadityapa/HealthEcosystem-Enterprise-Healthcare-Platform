'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { aiApi } from '@/lib/api/ai';

import type { AiChatSession } from '@/types';

const columns: ColumnDef<AiChatSession>[] = [
  { accessorKey: 'sessionId', header: 'Session', cell: ({ row }) => <span className="font-mono text-sm">{row.original.sessionId ?? '—'}</span> },
  { accessorKey: 'userName', header: 'User' },
  { accessorKey: 'topic', header: 'Topic' },
  { accessorKey: 'messages', header: 'Messages' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
  { accessorKey: 'startedAt', header: 'Started', cell: ({ row }) => new Date(row.original.startedAt).toLocaleString() },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ai-chat'],
    queryFn: () => aiApi.listChatSessions(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="AI Chat" description={`Conversational AI sessions ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="userName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
