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
import { Clock, FileText, Scan, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { radiologyApi } from '@/lib/api/radiology';
import type { RadiologyWorklistItem } from '@/types';

const priorityMap: Record<RadiologyWorklistItem['priority'], 'pending' | 'processing' | 'critical'> = {
  routine: 'pending',
  urgent: 'processing',
  stat: 'critical',
};

const columns: ColumnDef<RadiologyWorklistItem>[] = [
  { accessorKey: 'accessionNumber', header: 'Accession #', cell: ({ row }) => <span className="font-mono text-sm">{row.original.accessionNumber}</span> },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'modality', header: 'Modality' },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => <StatusBadge status={priorityMap[row.original.priority]} label={row.original.priority} />,
  },
  { accessorKey: 'assignedTo', header: 'Radiologist', cell: ({ row }) => row.original.assignedTo ?? '—' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status === 'finalized' ? 'approved' : 'pending'} label={row.original.status} /> },
];

export default function RadiologyDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['radiology-stats'], queryFn: () => radiologyApi.getDashboardStats() });
  const worklistQuery = useQuery({ queryKey: ['radiology-worklist'], queryFn: () => radiologyApi.listWorklist() });

  if (statsQuery.isError || worklistQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load radiology dashboard" message="Could not fetch radiology data." onRetry={() => { statsQuery.refetch(); worklistQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const pendingItems = (worklistQuery.data ?? []).filter((w) => w.status !== 'finalized').slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Radiology Dashboard" description="Imaging studies, worklist, and PACS integration" actions={<Button onClick={() => router.push('/radiology/worklist')}><Scan className="h-4 w-4" />Worklist</Button>} />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Studies Today" value={stats.studiesToday} icon={Scan} trend={{ value: stats.studiesTrend, label: 'vs yesterday' }} />
            <StatCard title="Pending Reports" value={stats.pendingReports} icon={FileText} trend={{ value: stats.pendingTrend, label: 'vs yesterday' }} />
            <StatCard title="Avg Report TAT (hrs)" value={stats.avgReportTat.toFixed(1)} icon={Clock} trend={{ value: stats.tatTrend, label: 'improvement' }} />
            <StatCard title="PACS Status" value={stats.pacsOnline ? 'Online' : 'Offline'} icon={Server} trend={{ value: 0, label: stats.pacsOnline ? 'all nodes healthy' : 'check nodes' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Pending Worklist</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/radiology/worklist')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={pendingItems} isLoading={worklistQuery.isLoading} emptyMessage="Worklist is clear." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
