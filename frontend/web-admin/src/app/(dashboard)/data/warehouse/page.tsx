'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { dataPlatformApi } from '@/lib/api/data-platform';
import type { WarehouseTable } from '@/types';

const columns: ColumnDef<WarehouseTable>[] = [
  { accessorKey: 'tableName', header: 'Table' },
  { accessorKey: 'schema', header: 'Schema' },
  { accessorKey: 'rows', header: 'Rows' },
  { accessorKey: 'sizeGb', header: 'Size (GB)' },
  { accessorKey: 'refreshSchedule', header: 'Refresh' },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['data-warehouse'],
    queryFn: () => dataPlatformApi.listWarehouseTables(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Data Warehouse" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="tableName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
