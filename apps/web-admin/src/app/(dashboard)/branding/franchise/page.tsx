'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { brandingApi } from '@/lib/api/branding';
import type { FranchiseBranding } from '@/types';

const columns: ColumnDef<FranchiseBranding>[] = [
  { accessorKey: 'franchiseCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.franchiseCode ?? '—'}</span> },
  { accessorKey: 'franchiseName', header: 'Franchise' },
  { accessorKey: 'theme', header: 'Theme' },
  { accessorKey: 'customDomain', header: 'Domain' },
  { accessorKey: 'branches', header: 'Branches' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['branding-franchise'],
    queryFn: () => brandingApi.listFranchiseBranding(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Franchise Branding" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="franchiseName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
