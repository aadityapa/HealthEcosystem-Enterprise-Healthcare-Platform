'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusBadge,
} from '@health/design-system';
import { Activity, Cpu, RefreshCw } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { devicesApi } from '@/lib/api/devices';
import { deviceStatusMap } from '@/lib/devices/status-maps';
import { formatDateTime } from '@/lib/mock-data';
import type { Device } from '@/types';

function DeviceStatusTile({ device }: { device: Device }) {
  const status = deviceStatusMap[device.status];
  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{device.name}</p>
        <StatusBadge status={status.status} label={status.label} showDot />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{device.messagesPerMin} msg/min</span>
        <span>{device.latencyMs}ms</span>
      </div>
    </div>
  );
}

function ThroughputChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-48 items-end gap-2 pt-4">
      {data.map((bucket) => (
        <div key={bucket.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-medium text-muted-foreground">{bucket.value}</span>
          <div
            className="w-full rounded-t bg-primary/80 transition-all duration-500 dark:bg-primary/60"
            style={{ height: `${(bucket.value / max) * 100}%`, minHeight: '4px' }}
          />
          <span className="text-[10px] text-muted-foreground">{bucket.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DeviceMonitoringPage() {
  const [secondsSinceRefresh, setSecondsSinceRefresh] = useState(0);

  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['device-monitoring'],
    queryFn: devicesApi.getMonitoringSnapshot,
    refetchInterval: 10000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSinceRefresh(Math.floor((Date.now() - dataUpdatedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  const devices = data?.devices ?? [];
  const throughput = data?.throughput ?? [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Real-time Monitoring"
          description="Live device status and message throughput across all branches"
          actions={
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? 'animate-spin text-primary' : ''}`}
              />
              <span>
                Auto-refresh {isFetching ? 'updating…' : `· ${secondsSinceRefresh}s ago`}
              </span>
            </div>
          }
        />

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-56 w-full" />
          </div>
        ) : isError ? (
          <ErrorState
            title="Monitoring unavailable"
            message="Could not fetch live device data."
            onRetry={() => refetch()}
          />
        ) : devices.length === 0 ? (
          <EmptyState
            title="No devices to monitor"
            description="Register devices to see real-time status here."
            icon={Cpu}
          />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Device Status Grid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {devices.map((device) => (
                    <DeviceStatusTile key={device.id} device={device} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Throughput</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Messages per minute · last refreshed{' '}
                  {data?.lastRefreshedAt ? formatDateTime(data.lastRefreshedAt) : '—'}
                </p>
              </CardHeader>
              <CardContent>
                {throughput.length === 0 ? (
                  <EmptyState
                    title="No throughput data"
                    description="Throughput metrics will appear once messages are flowing."
                    icon={Activity}
                  />
                ) : (
                  <ThroughputChart data={throughput} />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageTransition>
  );
}
