'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  Skeleton,
  StatusBadge,
} from '@health/design-system';
import { LineChart } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { qcApi } from '@/lib/api/qc';
import type { QcChartPoint } from '@/types';

function LeveyJenningsChart({
  points,
  mean,
  sd,
  unit,
}: {
  points: QcChartPoint[];
  mean: number;
  sd: number;
  unit: string;
}) {
  const values = points.map((p) => p.value);
  const minVal = Math.min(...values, mean - 3 * sd) - sd;
  const maxVal = Math.max(...values, mean + 3 * sd) + sd;
  const range = maxVal - minVal || 1;

  const toY = (val: number) => 100 - ((val - minVal) / range) * 100;
  const chartHeight = 280;
  const chartWidth = 100;

  const controlLines = [
    { label: '+3SD', value: mean + 3 * sd, style: 'stroke-destructive' },
    { label: '+2SD', value: mean + 2 * sd, style: 'stroke-orange-500' },
    { label: '+1SD', value: mean + sd, style: 'stroke-muted-foreground' },
    { label: 'Mean', value: mean, style: 'stroke-primary' },
    { label: '-1SD', value: mean - sd, style: 'stroke-muted-foreground' },
    { label: '-2SD', value: mean - 2 * sd, style: 'stroke-orange-500' },
    { label: '-3SD', value: mean - 3 * sd, style: 'stroke-destructive' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {controlLines.map((line) => (
          <span key={line.label} className="flex items-center gap-1.5">
            <span className={`inline-block h-0.5 w-4 border-t-2 ${line.style.replace('stroke-', 'border-')}`} />
            {line.label}: {line.value.toFixed(1)} {unit}
          </span>
        ))}
      </div>
      <div className="relative overflow-x-auto rounded-lg border bg-muted/20 p-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ minWidth: '600px', height: `${chartHeight}px` }}
          preserveAspectRatio="none"
        >
          {controlLines.map((line) => (
            <line
              key={line.label}
              x1="0"
              y1={(toY(line.value) / 100) * chartHeight}
              x2={chartWidth}
              y2={(toY(line.value) / 100) * chartHeight}
              className={line.style}
              strokeWidth="0.3"
              strokeDasharray={line.label === 'Mean' ? undefined : '1,1'}
            />
          ))}
          <polyline
            fill="none"
            className="stroke-primary"
            strokeWidth="0.5"
            points={points
              .map((p, i) => {
                const x = (i / (points.length - 1)) * chartWidth;
                const y = (toY(p.value) / 100) * chartHeight;
                return `${x},${y}`;
              })
              .join(' ')}
          />
          {points.map((p, i) => {
            const x = (i / (points.length - 1)) * chartWidth;
            const y = (toY(p.value) / 100) * chartHeight;
            const color =
              p.status === 'reject'
                ? 'fill-destructive'
                : p.status === 'warning'
                  ? 'fill-orange-500'
                  : 'fill-primary';
            return <circle key={p.date} cx={x} cy={y} r="0.8" className={color} />;
          })}
        </svg>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          {points.map((p) => (
            <span key={p.date}>{p.date.slice(5)}</span>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((p) => (
          <div key={p.date} className="flex items-center justify-between rounded-lg border p-2 text-sm">
            <span className="text-muted-foreground">{p.date}</span>
            <span className="font-medium">{p.value} {unit}</span>
            <StatusBadge
              status={p.status === 'in-range' ? 'approved' : p.status === 'warning' ? 'pending' : 'critical'}
              label={p.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QcChartsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['qc-chart'],
    queryFn: () => qcApi.getChartData(),
  });

  if (isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load QC chart" message="Could not fetch chart data." onRetry={() => refetch()} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Levey-Jennings Charts"
          description="Westgard rule visualization for QC data"
          actions={
            <Button variant="outline">
              <LineChart className="h-4 w-4" />
              Select Material
            </Button>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              {isLoading ? 'Loading...' : `${data?.materialName} — ${data?.analyte}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : data ? (
              <LeveyJenningsChart
                points={data.points}
                mean={data.mean}
                sd={data.sd}
                unit={data.unit}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
