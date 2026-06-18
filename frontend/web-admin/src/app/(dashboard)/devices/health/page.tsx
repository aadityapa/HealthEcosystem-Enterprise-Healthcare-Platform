'use client';

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
import { Activity, HeartPulse } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { devicesApi } from '@/lib/api/devices';
import { deviceStatusMap } from '@/lib/devices/status-maps';
import { formatDateTime } from '@/lib/mock-data';
import type { DeviceHealthMetrics } from '@/types';

function HealthCard({ metrics }: { metrics: DeviceHealthMetrics }) {
  const status = deviceStatusMap[metrics.status];
  const maxQueue = 50;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{metrics.deviceName}</CardTitle>
            <p className="font-mono text-xs text-muted-foreground">{metrics.deviceCode}</p>
          </div>
          <StatusBadge status={status.status} label={status.label} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Messages / min</p>
            <p className="text-lg font-semibold">{metrics.messagesPerMin}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Error rate</p>
            <p
              className={`text-lg font-semibold ${metrics.errorRate > 5 ? 'text-destructive' : ''}`}
            >
              {metrics.errorRate}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Queue depth</p>
            <p className="text-lg font-semibold">{metrics.queueDepth}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Latency</p>
            <p className="text-lg font-semibold">{metrics.latencyMs}ms</p>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Queue utilization</span>
            <span>{metrics.queueDepth}/{maxQueue}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                metrics.queueDepth > 30
                  ? 'bg-destructive'
                  : metrics.queueDepth > 10
                    ? 'bg-amber-500'
                    : 'bg-primary'
              }`}
              style={{ width: `${Math.min((metrics.queueDepth / maxQueue) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Status Timeline</p>
          <div className="space-y-2">
            {metrics.timeline.map((event) => {
              const eventStatus = deviceStatusMap[event.status];
              return (
                <div key={event.id} className="flex items-center gap-2 text-xs">
                  <span className="w-28 shrink-0 text-muted-foreground">
                    {formatDateTime(event.timestamp)}
                  </span>
                  <StatusBadge
                    status={eventStatus.status}
                    label={eventStatus.label}
                    showDot={false}
                  />
                  {event.note && (
                    <span className="truncate text-muted-foreground">{event.note}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DeviceHealthPage() {
  const { data: metrics = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['device-health'],
    queryFn: devicesApi.getHealthMetrics,
    refetchInterval: 30000,
  });

  const unhealthyCount = metrics.filter(
    (m) => m.status === 'error' || m.status === 'offline' || m.errorRate > 5,
  ).length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Device Health"
          description={
            metrics.length
              ? `${metrics.length} devices monitored · ${unhealthyCount} need attention`
              : 'Health metrics per connected instrument'
          }
        />

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Health metrics unavailable"
            onRetry={() => refetch()}
          />
        ) : metrics.length === 0 ? (
          <EmptyState
            title="No health data"
            description="Device health metrics will appear once instruments are connected."
            icon={HeartPulse}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((m) => (
              <HealthCard key={m.deviceId} metrics={m} />
            ))}
          </div>
        )}

        {!isLoading && !isError && metrics.length > 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
              <Activity className="h-4 w-4 shrink-0" />
              Metrics refresh every 30 seconds. Uptime calculated over rolling 24-hour window.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </PageTransition>
  );
}
