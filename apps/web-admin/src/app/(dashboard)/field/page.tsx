'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  ErrorState,
  SkeletonStatCards,
  StatCard,
  StatusBadge,
} from '@health/design-system';
import { Clock, MapPin, Truck, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { fieldApi } from '@/lib/api/field';
import type { CollectionRoute } from '@/types';

const statusMap: Record<CollectionRoute['status'], 'pending' | 'processing' | 'approved' | 'inactive'> = {
  planned: 'pending',
  'in-progress': 'processing',
  completed: 'approved',
  cancelled: 'inactive',
};

const columns: ColumnDef<CollectionRoute>[] = [
  { accessorKey: 'routeCode', header: 'Route', cell: ({ row }) => <span className="font-mono text-sm">{row.original.routeCode}</span> },
  { accessorKey: 'phlebotomistName', header: 'Phlebotomist' },
  { accessorKey: 'zone', header: 'Zone' },
  { accessorKey: 'stops', header: 'Stops', cell: ({ row }) => `${row.original.completedStops}/${row.original.stops}` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />,
  },
];

export default function FieldDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['field-stats'], queryFn: () => fieldApi.getDashboardStats() });
  const routesQuery = useQuery({ queryKey: ['field-routes'], queryFn: () => fieldApi.listRoutes() });

  if (statsQuery.isError || routesQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load field ops dashboard" message="Could not fetch field data." onRetry={() => { statsQuery.refetch(); routesQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const activeRoutes = (routesQuery.data ?? []).filter((r) => r.status === 'in-progress' || r.status === 'planned').slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Field Operations" description="Home collection, phlebotomists, and route management" actions={<Button onClick={() => router.push('/field/tracking')}><MapPin className="h-4 w-4" />Live Tracking</Button>} />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Phlebotomists" value={stats.activePhlebotomists} icon={Users} trend={{ value: stats.phlebotomistsTrend, label: 'vs last week' }} />
            <StatCard title="Routes Today" value={stats.routesToday} icon={Truck} trend={{ value: stats.routesTrend, label: 'vs yesterday' }} />
            <StatCard title="Collections Completed" value={stats.collectionsCompleted} icon={MapPin} trend={{ value: stats.collectionsTrend, label: 'vs yesterday' }} />
            <StatCard title="On-Time Rate" value={`${stats.onTimeRate}%`} icon={Clock} trend={{ value: stats.onTimeTrend, label: 'vs last week' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" />Active Routes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/field/routes')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={activeRoutes} isLoading={routesQuery.isLoading} emptyMessage="No active routes." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
