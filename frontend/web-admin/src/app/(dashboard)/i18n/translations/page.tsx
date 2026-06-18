'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { i18nApi } from '@/lib/api/i18n';
import type { TranslationEntry } from '@/types';

const columns: ColumnDef<TranslationEntry>[] = [
  { accessorKey: 'key', header: 'Key', cell: ({ row }) => <span className="font-mono text-sm">{row.original.key ?? '—'}</span> },
  { accessorKey: 'namespace', header: 'Namespace' },
  { accessorKey: 'locale', header: 'Locale' },
  { accessorKey: 'value', header: 'Value' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['i18n-translations'],
    queryFn: () => i18nApi.listTranslations(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Translations" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="key" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
