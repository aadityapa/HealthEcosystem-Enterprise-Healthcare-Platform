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
import { Bot, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { agentsApi } from '@/lib/api/agents';
import type { AiAgentRecord } from '@/types';

const columns: ColumnDef<AiAgentRecord>[] = [
  { accessorKey: 'agentCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.agentCode ?? '—'}</span> },
  { accessorKey: 'name', header: 'Agent' },
  { accessorKey: 'type', header: 'Type', cell: ({ row }) => <GenericStatusBadge value={String(row.original.type)} /> },
  { accessorKey: 'sessionsToday', header: 'Sessions' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function DashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['agents-stats'], queryFn: () => agentsApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['agents-all'], queryFn: () => agentsApi.listAgents() });

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
        <PageHeader title="AI Agents Dashboard" description="Patient, doctor, lab, and management AI agents" />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Agents" value={stats.activeAgents.toLocaleString()} icon={Bot} trend={{ value: stats.agentsTrend, label: 'vs last month' }} />
            <StatCard title="Sessions Today" value={stats.sessionsToday.toLocaleString()} icon={MessageSquare} trend={{ value: stats.sessionsTrend, label: 'vs yesterday' }} />
            <StatCard title="Avg Resolution (sec)" value={stats.avgResolutionTime.toLocaleString()} icon={Clock} trend={{ value: stats.resolutionTrend, label: 'improvement' }} />
            <StatCard title="Satisfaction Score" value={stats.satisfactionScore} icon={Sparkles} trend={{ value: stats.satisfactionTrend, label: 'vs last week' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" />Active Agents</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/agents/patient')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No records found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
