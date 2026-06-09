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
import { Bot, Brain, MessageSquare, Phone, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { aiApi } from '@/lib/api/ai';
import type { ClinicalAiInsight } from '@/types';

const severityMap: Record<ClinicalAiInsight['severity'], 'pending' | 'processing' | 'approved' | 'critical'> = {
  low: 'pending',
  medium: 'processing',
  high: 'approved',
  critical: 'critical',
};

const columns: ColumnDef<ClinicalAiInsight>[] = [
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'testName', header: 'Test' },
  { accessorKey: 'insightType', header: 'Type' },
  {
    accessorKey: 'severity',
    header: 'Severity',
    cell: ({ row }) => <StatusBadge status={severityMap[row.original.severity]} label={row.original.severity} />,
  },
  { accessorKey: 'description', header: 'Insight', cell: ({ row }) => <span className="max-w-xs truncate block">{row.original.description}</span> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status === 'new' ? 'pending' : row.original.status === 'reviewed' ? 'approved' : 'inactive'} label={row.original.status} /> },
];

export default function AiDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['ai-stats'], queryFn: () => aiApi.getDashboardStats() });
  const insightsQuery = useQuery({ queryKey: ['ai-clinical'], queryFn: () => aiApi.listClinicalInsights() });

  if (statsQuery.isError || insightsQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load AI dashboard" message="Could not fetch AI data." onRetry={() => { statsQuery.refetch(); insightsQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const recentInsights = (insightsQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="AI Dashboard" description="Clinical insights, operational intelligence, and conversational AI" actions={<Button onClick={() => router.push('/ai/chat')}><MessageSquare className="h-4 w-4" />Open Chat</Button>} />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Insights" value={stats.activeInsights} icon={Sparkles} trend={{ value: stats.insightsTrend, label: 'vs last week' }} />
            <StatCard title="Anomalies Detected" value={stats.anomaliesDetected} icon={Brain} trend={{ value: stats.anomaliesTrend, label: 'vs yesterday' }} />
            <StatCard title="Chat Sessions Today" value={stats.chatSessionsToday} icon={Bot} trend={{ value: stats.chatTrend, label: 'vs yesterday' }} />
            <StatCard title="WhatsApp Messages" value={stats.whatsappMessages.toLocaleString()} icon={Phone} trend={{ value: stats.whatsappTrend, label: 'vs yesterday' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />Recent Clinical Insights</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/ai/clinical')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={recentInsights} isLoading={insightsQuery.isLoading} emptyMessage="No clinical insights yet." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
