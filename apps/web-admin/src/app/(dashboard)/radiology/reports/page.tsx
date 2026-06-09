'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { radiologyApi } from '@/lib/api/radiology';

import type { RadiologyReport } from '@/types';

const columns: ColumnDef<RadiologyReport>[] = [
  { accessorKey: 'accessionNumber', header: 'Accession #', cell: ({ row }) => <span className="font-mono text-sm">{row.original.accessionNumber ?? '—'}</span> },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'modality', header: 'Modality' },
  { accessorKey: 'studyDescription', header: 'Study' },
  { accessorKey: 'radiologist', header: 'Radiologist' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['radiology-reports'],
    queryFn: () => radiologyApi.listReports(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Radiology Reports" description={`Finalized and preliminary reports ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="patientName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
