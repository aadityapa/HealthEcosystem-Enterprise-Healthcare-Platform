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
import { ArrowRightLeft, GraduationCap, MessageSquare, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { customerSuccessApi } from '@/lib/api/customer-success';
import type { OnboardingRecord } from '@/types';

const columns: ColumnDef<OnboardingRecord>[] = [
  { accessorKey: 'tenantName', header: 'Tenant' },
  { accessorKey: 'plan', header: 'Plan' },
  { accessorKey: 'progress', header: 'Progress', cell: ({ row }) => `${row.original.progress}%` },
  { accessorKey: 'csm', header: 'CSM' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={row.original.status} /> },
];

export default function CustomerSuccessDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['cs-stats'], queryFn: () => customerSuccessApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['cs-onboarding'], queryFn: () => customerSuccessApi.listOnboarding() });

  if (statsQuery.isError || listQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load customer success dashboard" message="Could not fetch customer success data." onRetry={() => { statsQuery.refetch(); listQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const preview = (listQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Customer Success Dashboard" description="Onboarding, migrations, training, and support operations" actions={<Button variant="outline" onClick={() => router.push('/customer-success/onboarding')}>View Onboarding</Button>} />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Onboardings" value={stats.activeOnboardings} icon={UserPlus} trend={{ value: stats.onboardingsTrend, label: 'pipeline growth' }} />
            <StatCard title="Migrations In Progress" value={stats.migrationsInProgress} icon={ArrowRightLeft} trend={{ value: stats.migrationsTrend, label: 'data transfers' }} />
            <StatCard title="Training Sessions" value={stats.trainingSessions} icon={GraduationCap} trend={{ value: stats.trainingTrend, label: 'this month' }} />
            <StatCard title="Open Tickets" value={stats.openTickets} icon={MessageSquare} trend={{ value: stats.ticketsTrend, label: 'support queue' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Active Onboardings</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/customer-success/onboarding')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No onboarding records found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
