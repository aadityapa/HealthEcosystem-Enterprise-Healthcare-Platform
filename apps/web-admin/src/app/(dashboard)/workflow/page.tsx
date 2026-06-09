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
import { FileCode, Activity, ClipboardList, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { workflowApi } from '@/lib/api/workflow';
import type { WorkflowInstance } from '@/types';

const columns: ColumnDef<WorkflowInstance>[] = [
  { accessorKey: 'instanceCode', header: 'Instance', cell: ({ row }) => <span className="font-mono text-sm">{row.original.instanceCode ?? '—'}</span> },
  { accessorKey: 'definitionName', header: 'Workflow' },
  { accessorKey: 'currentStep', header: 'Current Step' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function DashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['workflow-stats'], queryFn: () => workflowApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['workflow-instances'], queryFn: () => workflowApi.listInstances() });

  if (statsQuery.isError || listQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load dashboard" message="Could not fetch data." onRetry={() => { statsQuery.refetch(); listQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const preview = (listQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Workflow Dashboard" description="Process definitions, instances, tasks, and automation" />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Definitions" value={stats.activeDefinitions.toLocaleString()} icon={FileCode} trend={{ value: stats.definitionsTrend, label: 'vs last month' }} />
            <StatCard title="Running Instances" value={stats.runningInstances.toLocaleString()} icon={Activity} trend={{ value: stats.instancesTrend, label: 'vs yesterday' }} />
            <StatCard title="Pending Tasks" value={stats.pendingTasks.toLocaleString()} icon={ClipboardList} trend={{ value: stats.tasksTrend, label: 'vs yesterday' }} />
            <StatCard title="Automation Rules" value={stats.automationRules.toLocaleString()} icon={Sparkles} trend={{ value: stats.automationTrend, label: 'vs last month' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Active Instances</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/workflow/instances')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No records found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
