'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { brandingApi } from '@/lib/api/branding';
import type { BrandingTheme } from '@/types';

const columns: ColumnDef<BrandingTheme>[] = [
  { accessorKey: 'themeCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.themeCode ?? '—'}</span> },
  { accessorKey: 'name', header: 'Theme' },
  { accessorKey: 'primaryColor', header: 'Primary Color' },
  { accessorKey: 'appliedTo', header: 'Applied To' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['branding-themes'],
    queryFn: () => brandingApi.listThemes(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Branding Themes" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
