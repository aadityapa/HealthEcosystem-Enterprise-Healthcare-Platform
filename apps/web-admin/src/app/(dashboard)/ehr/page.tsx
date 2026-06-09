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
import { Calendar, ClipboardList, FileText, Plus, Stethoscope, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { ehrApi } from '@/lib/api/ehr';
import { formatDateTime } from '@/lib/mock-data';
import type { Appointment } from '@/types';

const statusMap: Record<Appointment['status'], 'pending' | 'processing' | 'approved' | 'inactive' | 'critical'> = {
  scheduled: 'pending',
  'checked-in': 'processing',
  'in-progress': 'processing',
  completed: 'approved',
  cancelled: 'inactive',
  'no-show': 'critical',
};

const columns: ColumnDef<Appointment>[] = [
  { accessorKey: 'appointmentNumber', header: 'Appt #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.appointmentNumber}</span> },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'doctorName', header: 'Doctor' },
  { accessorKey: 'specialty', header: 'Specialty' },
  { accessorKey: 'scheduledAt', header: 'Scheduled', cell: ({ row }) => formatDateTime(row.original.scheduledAt) },
  { accessorKey: 'type', header: 'Type', cell: ({ row }) => row.original.type.replace('-', ' ') },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status.replace('-', ' ')} />
    ),
  },
];

export default function EhrDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['ehr-stats'], queryFn: () => ehrApi.getDashboardStats() });
  const appointmentsQuery = useQuery({ queryKey: ['ehr-appointments'], queryFn: () => ehrApi.listAppointments() });

  if (statsQuery.isError || appointmentsQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load EHR dashboard" message="Could not fetch EHR data." onRetry={() => { statsQuery.refetch(); appointmentsQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const todayAppointments = (appointmentsQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="EHR Dashboard"
          description="Appointments, consultations, and clinical records"
          actions={<Button onClick={() => router.push('/ehr/appointments')}><Plus className="h-4 w-4" />Book Appointment</Button>}
        />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Appointments Today" value={stats.appointmentsToday} icon={Calendar} trend={{ value: stats.appointmentsTrend, label: 'vs yesterday' }} />
            <StatCard title="Pending Consultations" value={stats.consultationsPending} icon={Stethoscope} trend={{ value: stats.consultationsTrend, label: 'in queue' }} />
            <StatCard title="Prescriptions Issued" value={stats.prescriptionsIssued} icon={FileText} trend={{ value: stats.prescriptionsTrend, label: 'today' }} />
            <StatCard title="Telemedicine Sessions" value={stats.telemedicineSessions} icon={Video} trend={{ value: stats.telemedicineTrend, label: 'today' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" />Today&apos;s Appointments</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/ehr/appointments')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={todayAppointments} isLoading={appointmentsQuery.isLoading} emptyMessage="No appointments today." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
