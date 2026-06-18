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
} from '@health/design-system';
import { BarChart3, Building2, Clock, IndianRupee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { analyticsApi } from '@/lib/api/analytics';
import { formatCurrency } from '@/lib/mock-data';
import type { BranchAnalyticsRow } from '@/types';

const columns: ColumnDef<BranchAnalyticsRow>[] = [
  { accessorKey: 'branchName', header: 'Branch' },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'orders', header: 'Orders', cell: ({ row }) => row.original.orders.toLocaleString() },
  { accessorKey: 'revenue', header: 'Revenue', cell: ({ row }) => formatCurrency(row.original.revenue) },
  { accessorKey: 'avgTat', header: 'Avg TAT (hrs)', cell: ({ row }) => row.original.avgTat.toFixed(1) },
  { accessorKey: 'growth', header: 'Growth', cell: ({ row }) => `${row.original.growth > 0 ? '+' : ''}${row.original.growth}%` },
];

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['analytics-stats'], queryFn: () => analyticsApi.getDashboardStats() });
  const branchesQuery = useQuery({ queryKey: ['analytics-branches'], queryFn: () => analyticsApi.listBranchAnalytics() });

  if (statsQuery.isError || branchesQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load analytics dashboard" message="Could not fetch analytics data." onRetry={() => { statsQuery.refetch(); branchesQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const topBranches = (branchesQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Analytics Dashboard" description="Business intelligence and operational metrics" actions={<Button variant="outline" onClick={() => router.push('/analytics/executive')}>Executive View</Button>} />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Revenue (MTD)" value={formatCurrency(stats.totalRevenue)} icon={IndianRupee} trend={{ value: stats.revenueTrend, label: 'vs last month' }} />
            <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()} icon={BarChart3} trend={{ value: stats.ordersTrend, label: 'vs last month' }} />
            <StatCard title="Avg TAT (hrs)" value={stats.avgTat.toFixed(1)} icon={Clock} trend={{ value: stats.tatTrend, label: 'improvement' }} />
            <StatCard title="Active Branches" value={stats.activeBranches} icon={Building2} trend={{ value: stats.branchesTrend, label: 'network growth' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Top Branches</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/analytics/branches')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={topBranches} isLoading={branchesQuery.isLoading} emptyMessage="No branch data available." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
