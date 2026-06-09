'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  ShieldCheck,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  Input,
  Skeleton,
  StatusBadge,
} from '@health/design-system';
import { PageTransition } from '@/components/motion/page-transition';
import { api } from '@/lib/api/client';
import { fetchWithDelay, mockLabResult } from '@/lib/mock-data';

export default function ResultEntryPage() {
  const params = useParams();
  const id = params.id as string;
  const [values, setValues] = useState<Record<string, string>>({});
  const [verified, setVerified] = useState(false);

  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ['lab-result', id],
    queryFn: () => fetchWithDelay({ ...mockLabResult, id }),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: unknown) => api.put(`/api/v1/lims/results/${id}`, payload),
  });

  const verifyMutation = useMutation({
    mutationFn: () => api.post(`/api/v1/lims/results/${id}/verify`),
    onSuccess: () => setVerified(true),
  });

  if (isLoading) {
    return (
      <PageTransition>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-96 w-full" />
      </PageTransition>
    );
  }

  if (isError || !result) {
    return (
      <PageTransition>
        <ErrorState title="Result not found" onRetry={() => refetch()} />
      </PageTransition>
    );
  }

  const getFlagColor = (flag?: string) => {
    switch (flag) {
      case 'high':
      case 'low':
        return 'warning';
      case 'critical':
        return 'destructive';
      default:
        return 'success';
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/lims/samples">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Result Entry</h1>
              <p className="text-sm text-muted-foreground">
                {result.patientName} · {result.testPanel}
              </p>
              <p className="font-mono text-xs text-primary">{result.orderId}</p>
            </div>
          </div>
          <StatusBadge
            status={verified ? 'approved' : result.status === 'critical' ? 'critical' : 'processing'}
            label={verified ? 'Verified' : 'Pending Verification'}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Parameter Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Parameter</th>
                    <th className="pb-3 pr-4 font-medium">Value</th>
                    <th className="pb-3 pr-4 font-medium">Unit</th>
                    <th className="pb-3 pr-4 font-medium">Reference</th>
                    <th className="pb-3 font-medium">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {result.parameters.map((param) => {
                    const currentValue = values[param.id] ?? param.value;
                    const isAbnormal = param.flag && param.flag !== 'normal';
                    return (
                      <tr key={param.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{param.name}</td>
                        <td className="py-3 pr-4">
                          <Input
                            value={currentValue}
                            onChange={(e) =>
                              setValues((prev) => ({ ...prev, [param.id]: e.target.value }))
                            }
                            className={`max-w-[120px] ${isAbnormal ? 'border-warning' : ''}`}
                            disabled={verified}
                          />
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{param.unit}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{param.referenceRange}</td>
                        <td className="py-3">
                          {param.flag && param.flag !== 'normal' ? (
                            <Badge variant={getFlagColor(param.flag) as 'warning' | 'destructive' | 'success'}>
                              {param.flag === 'critical' && (
                                <AlertTriangle className="mr-1 h-3 w-3" />
                              )}
                              {param.flag.toUpperCase()}
                            </Badge>
                          ) : (
                            <Badge variant="success">Normal</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {result.parameters.some((p) => p.flag === 'critical' || p.flag === 'high') && (
          <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <p>Abnormal values detected. Please review before verification.</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={saveMutation.isPending || verified}
            onClick={() => saveMutation.mutate({ parameters: values })}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button
            disabled={verifyMutation.isPending || verified}
            onClick={() => verifyMutation.mutate()}
          >
            {verified ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Verified
              </>
            ) : verifyMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Verify Results
              </>
            )}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
