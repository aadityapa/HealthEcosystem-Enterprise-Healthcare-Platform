'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { dmsApi } from '@/lib/api/dms';
import type { DmsSearchResult } from '@/types';

const columns: ColumnDef<DmsSearchResult>[] = [
  { accessorKey: 'query', header: 'Query' },
  { accessorKey: 'resultCount', header: 'Results' },
  { accessorKey: 'searchedBy', header: 'Searched By' },
  { accessorKey: 'topMatch', header: 'Top Match' },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['dms-search'],
    queryFn: () => dmsApi.listSearchResults(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Document Search" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="query" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
