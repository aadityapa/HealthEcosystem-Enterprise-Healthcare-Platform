'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  ErrorState,
  SkeletonStatCards,
  StatCard,
  StatusBadge,
} from '@health/design-system';
import { AlertTriangle, Cpu, MessageSquare, Plus, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { devicesApi } from '@/lib/api/devices';
import { deviceStatusMap } from '@/lib/devices/status-maps';
import { formatDateTime } from '@/lib/mock-data';
import type { Device, DeviceError } from '@/types';
import { Button } from '@health/design-system';

const errorColumns: ColumnDef<DeviceError>[] = [
  {
    accessorKey: 'occurredAt',
    header: 'Time',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(row.original.occurredAt)}
      </span>
    ),
  },
  {
    accessorKey: 'deviceCode',
    header: 'Device',
    cell: ({ row }) => (
      <div>
        <p className="font-mono text-sm font-medium">{row.original.deviceCode}</p>
        <p className="text-xs text-muted-foreground">{row.original.deviceName}</p>
      </div>
    ),
  },
  {
    accessorKey: 'errorType',
    header: 'Type',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.errorType}</span>
    ),
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => (
      <span className="max-w-md truncate text-sm">{row.original.message}</span>
    ),
  },
  {
    accessorKey: 'severity',
    header: 'Severity',
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.severity === 'critical' ? 'critical' : 'pending'}
        label={row.original.severity}
      />
    ),
  },
];

function DeviceGridCard({ device }: { device: Device }) {
  const status = deviceStatusMap[device.status];
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium leading-tight">{device.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{device.deviceCode}</p>
            </div>
          </div>
          <StatusBadge status={status.status} label={status.label} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Vendor</p>
            <p className="font-medium">{device.vendor}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Protocol</p>
            <p className="font-medium">{device.protocol}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Last seen</p>
            <p className="font-medium">{formatDateTime(device.lastSeen)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DeviceDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['device-stats'],
    queryFn: devicesApi.getDashboardStats,
  });

  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: devicesApi.listDevices,
  });

  const errorsQuery = useQuery({
    queryKey: ['device-errors'],
    queryFn: devicesApi.listErrors,
  });

  const isLoading = statsQuery.isLoading || devicesQuery.isLoading;
  const isError = statsQuery.isError || devicesQuery.isError;
  const stats = statsQuery.data;
  const devices = devicesQuery.data ?? [];
  const errors = errorsQuery.data ?? [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Device Dashboard"
          description="Overview of connected laboratory instruments and message flow"
          actions={
            <Link href="/devices/register">
              <Button>
                <Plus className="h-4 w-4" />
                Register Device
              </Button>
            </Link>
          }
        />

        {isLoading ? (
          <SkeletonStatCards count={5} />
        ) : isError ? (
          <ErrorState
            title="Failed to load device dashboard"
            onRetry={() => {
              statsQuery.refetch();
              devicesQuery.refetch();
            }}
          />
        ) : stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard title="Total Devices" value={stats.totalDevices} icon={Cpu} />
              <StatCard
                title="Online"
                value={stats.online}
                icon={Wifi}
                trend={{ value: stats.onlineTrend, label: 'vs yesterday' }}
              />
              <StatCard title="Offline" value={stats.offline} icon={WifiOff} />
              <StatCard title="Errors" value={stats.errors} icon={AlertTriangle} />
              <StatCard
                title="Msgs / Min"
                value={stats.messagesPerMin}
                icon={MessageSquare}
                trend={{ value: stats.messagesTrend, label: 'vs last hour' }}
              />
            </div>

            {devices.length === 0 ? (
              <EmptyState
                title="No devices registered"
                description="Register your first laboratory instrument to start receiving results."
                icon={Cpu}
                action={{
                  label: 'Register Device',
                  onClick: () => window.location.assign('/devices/register'),
                }}
              />
            ) : (
              <div>
                <h2 className="mb-4 text-lg font-semibold">Connected Devices</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {devices.map((device) => (
                    <DeviceGridCard key={device.id} device={device} />
                  ))}
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Recent Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {errorsQuery.isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 animate-pulse rounded bg-muted" />
                    ))}
                  </div>
                ) : errorsQuery.isError ? (
                  <ErrorState onRetry={() => errorsQuery.refetch()} />
                ) : errors.length === 0 ? (
                  <EmptyState
                    title="No recent errors"
                    description="All devices are operating normally."
                    icon={AlertTriangle}
                  />
                ) : (
                  <DataTable
                    columns={errorColumns}
                    data={errors}
                    searchKey="deviceCode"
                    searchPlaceholder="Search by device code..."
                    emptyMessage="No errors recorded."
                  />
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </PageTransition>
  );
}
