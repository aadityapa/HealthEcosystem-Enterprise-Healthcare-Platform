'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusBadge,
} from '@health/design-system';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { fetchWithDelay, formatDateTime, mockSamples } from '@/lib/mock-data';
import type { Sample } from '@/types';
import type { StatusVariant } from '@health/design-system';
import { TestTube2 } from 'lucide-react';

const columns: {
  id: Sample['status'];
  title: string;
  status: StatusVariant;
}[] = [
  { id: 'collected', title: 'Collected', status: 'collected' },
  { id: 'processing', title: 'Processing', status: 'processing' },
  { id: 'verified', title: 'Verified', status: 'verified' },
  { id: 'approved', title: 'Approved', status: 'approved' },
  { id: 'reported', title: 'Reported', status: 'reported' },
];

function SampleCard({ sample }: { sample: Sample }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-xs text-primary">{sample.barcode}</p>
        {sample.assignedTo && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {sample.assignedTo}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium">{sample.patientName}</p>
      <p className="text-xs text-muted-foreground">{sample.testName}</p>
      <p className="mt-2 text-[10px] text-muted-foreground">
        {formatDateTime(sample.collectedAt)}
      </p>
    </motion.div>
  );
}

export default function SamplesPage() {
  const { data: samples = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['samples'],
    queryFn: () => fetchWithDelay(mockSamples),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Sample Tracking"
          description="Kanban view of samples across the laboratory pipeline"
        />

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-5">
            {columns.map((col) => (
              <div key={col.id} className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : samples.length === 0 ? (
          <EmptyState
            title="No samples in pipeline"
            description="Samples will appear here once orders are collected."
            icon={TestTube2}
          />
        ) : (
          <div className="grid gap-4 overflow-x-auto lg:grid-cols-5">
            {columns.map((column) => {
              const columnSamples = samples.filter((s) => s.status === column.id);
              return (
                <div key={column.id} className="min-w-[220px]">
                  <Card className="h-full bg-muted/30">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={column.status} showDot={false} />
                        <span className="text-sm font-medium">{column.title}</span>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {columnSamples.length}
                      </span>
                    </div>
                    <CardContent className="space-y-2 p-3">
                      {columnSamples.length === 0 ? (
                        <p className="py-8 text-center text-xs text-muted-foreground">
                          No samples
                        </p>
                      ) : (
                        columnSamples.map((sample) => (
                          <Link
                            key={sample.id}
                            href={`/lims/results/${sample.id}`}
                          >
                            <SampleCard sample={sample} />
                          </Link>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
