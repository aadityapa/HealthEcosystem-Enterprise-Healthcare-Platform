'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Building2, Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { masterDataApi } from '@/lib/api/master-data';
import type { Department } from '@/types';

const columns: ColumnDef<Department>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Department',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  { accessorKey: 'head', header: 'Department Head' },
  { accessorKey: 'testCount', header: 'Tests' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function DepartmentsPage() {
  const { data: departments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['master-departments'],
    queryFn: () => masterDataApi.listDepartments(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Departments"
          description="Laboratory department structure"
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load departments.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={departments}
            searchKey="name"
            searchPlaceholder="Search departments..."
            isLoading={isLoading}
            emptyMessage="No departments configured."
          />
        )}
      </div>
    </PageTransition>
  );
}
