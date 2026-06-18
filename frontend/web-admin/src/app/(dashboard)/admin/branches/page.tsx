'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Building2, MapPin, Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { fetchWithDelay, mockBranches } from '@/lib/mock-data';
import type { Branch } from '@/types';

const columns: ColumnDef<Branch>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Branch Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {row.original.city}
      </div>
    ),
  },
  {
    accessorKey: 'manager',
    header: 'Branch Manager',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'patientCount',
    header: 'Patients',
    cell: ({ row }) => row.original.patientCount.toLocaleString('en-IN'),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function BranchesPage() {
  const { data: branches = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['branches'],
    queryFn: () => fetchWithDelay(mockBranches),
  });

  const activeCount = branches.filter((b) => b.status === 'active').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Branch Management"
          description={`${activeCount} active branches of ${branches.length} total`}
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add Branch
            </Button>
          }
        />

        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load branches.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={branches}
            searchKey="name"
            searchPlaceholder="Search branches..."
            isLoading={isLoading}
            emptyMessage="No branches configured. Add your first branch to get started."
          />
        )}
      </div>
    </PageTransition>
  );
}
