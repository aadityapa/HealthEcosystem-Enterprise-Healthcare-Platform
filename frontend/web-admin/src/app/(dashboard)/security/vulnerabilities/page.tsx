'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { securityApi } from '@/lib/api/security';

import type { SecurityVulnerability } from '@/types';

const columns: ColumnDef<SecurityVulnerability>[] = [
  { accessorKey: 'cveId', header: 'CVE ID', cell: ({ row }) => <span className="font-mono text-sm">{row.original.cveId ?? '—'}</span> },
  { accessorKey: 'component', header: 'Component' },
  { accessorKey: 'severity', header: 'Severity', cell: ({ row }) => <GenericStatusBadge value={String(row.original.severity)} /> },
  { accessorKey: 'patchAvailable', header: 'Patch', cell: ({ row }) => (row.original.patchAvailable ? 'Yes' : 'No') },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['security-vulnerabilities'],
    queryFn: () => securityApi.listVulnerabilities(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Vulnerabilities" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="cveId" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
