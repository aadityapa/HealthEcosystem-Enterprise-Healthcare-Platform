'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { HeartPulse, Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { masterDataApi } from '@/lib/api/master-data';
import type { Specialty } from '@/types';

const columns: ColumnDef<Specialty>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Specialty',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <HeartPulse className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  { accessorKey: 'departmentCount', header: 'Departments' },
  { accessorKey: 'testCount', header: 'Tests' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function SpecialtiesPage() {
  const { data: specialties = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['master-specialties'],
    queryFn: () => masterDataApi.listSpecialties(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Specialties"
          description="Clinical specialty classifications"
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add Specialty
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load specialties.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={specialties}
            searchKey="name"
            searchPlaceholder="Search specialties..."
            isLoading={isLoading}
            emptyMessage="No specialties configured."
          />
        )}
      </div>
    </PageTransition>
  );
}
