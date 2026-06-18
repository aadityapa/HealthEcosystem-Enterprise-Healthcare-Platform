'use client';

import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Loader2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
} from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { patientPortalApi } from '@/lib/api/patient-portal';
import { formatDate } from '@/lib/mock-data';
import type { LabReport } from '@/types';

function reportStatusVariant(status: LabReport['status']) {
  switch (status) {
    case 'ready':
      return 'default' as const;
    case 'delivered':
      return 'secondary' as const;
    case 'processing':
      return 'outline' as const;
  }
}

export default function ReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => patientPortalApi.getReports(),
  });

  return (
    <div>
      <MobileHeader title="Lab Reports" subtitle="Download your test results" />

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !reports?.length ? (
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description="Your lab reports will appear here once they are ready"
          />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <p className="truncate text-sm font-medium">{report.testName}</p>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {report.reportNumber}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>Ordered: {formatDate(report.orderDate)}</span>
                        {report.reportDate && (
                          <span>Ready: {formatDate(report.reportDate)}</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{report.branch}</p>
                    </div>
                    <Badge variant={reportStatusVariant(report.status)} className="capitalize shrink-0">
                      {report.status}
                    </Badge>
                  </div>

                  {report.status !== 'processing' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => {
                        // Mock download
                        alert(`Downloading ${report.reportNumber}...`);
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
