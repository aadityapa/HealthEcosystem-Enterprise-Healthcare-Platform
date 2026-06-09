'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusBadge,
} from '@health/design-system';
import { FileText, Network, Stethoscope } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { devicesApi } from '@/lib/api/devices';
import { formatDateTime } from '@/lib/mock-data';

export default function Hl7MonitorPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showOruOnly, setShowOruOnly] = useState(false);

  const connectionQuery = useQuery({
    queryKey: ['hl7-connection'],
    queryFn: devicesApi.getHl7Connection,
    refetchInterval: 5000,
  });

  const messagesQuery = useQuery({
    queryKey: ['hl7-messages'],
    queryFn: devicesApi.listHl7Messages,
    refetchInterval: 5000,
  });

  const connection = connectionQuery.data;
  const allMessages = messagesQuery.data ?? [];
  const messages = showOruOnly ? allMessages.filter((m) => m.isOru) : allMessages;
  const selected = messages.find((m) => m.id === selectedId) ?? messages[0] ?? null;
  const isLoading = connectionQuery.isLoading || messagesQuery.isLoading;
  const isError = connectionQuery.isError || messagesQuery.isError;
  const oruCount = allMessages.filter((m) => m.isOru).length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="HL7 Monitor"
          description={`MLLP message log · ${oruCount} ORU result messages`}
          actions={
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOruOnly}
                onChange={(e) => setShowOruOnly(e.target.checked)}
                className="rounded border-input"
              />
              ORU messages only
            </label>
          }
        />

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-24 lg:col-span-3" />
            <Skeleton className="h-96 lg:col-span-1" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        ) : isError ? (
          <ErrorState
            title="HL7 monitor unavailable"
            onRetry={() => {
              connectionQuery.refetch();
              messagesQuery.refetch();
            }}
          />
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  <span className="font-medium">MLLP Listener</span>
                </div>
                <StatusBadge
                  status={connection?.connected && connection.mllpBound ? 'active' : 'critical'}
                  label={connection?.connected ? 'Bound' : 'Not bound'}
                />
                <Badge variant="outline">
                  {connection?.host}:{connection?.port}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {connection?.messagesReceived.toLocaleString('en-IN')} messages received
                </span>
              </CardContent>
            </Card>

            {messages.length === 0 ? (
              <EmptyState
                title={showOruOnly ? 'No ORU messages' : 'No HL7 messages'}
                description="Incoming MLLP-wrapped HL7 messages will appear in the live log."
                icon={Stethoscope}
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-base">MLLP Message Log</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[480px] space-y-2 overflow-y-auto p-3">
                    {messages.map((msg) => (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => setSelectedId(msg.id)}
                        className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                          selected?.id === msg.id ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{msg.deviceName}</span>
                          {msg.isOru && (
                            <Badge className="text-[10px]">ORU</Badge>
                          )}
                        </div>
                        <p className="font-mono text-xs text-primary">{msg.messageType}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(msg.timestamp)}
                        </p>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4" />
                      Segment Viewer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selected ? (
                      <>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge variant="outline">Control ID: {selected.controlId}</Badge>
                          <Badge variant="outline">{selected.messageType}</Badge>
                          {selected.isOru && (
                            <StatusBadge status="approved" label="ORU Result" showDot={false} />
                          )}
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">Raw HL7</p>
                          <pre className="max-h-32 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs dark:bg-muted/50">
                            {selected.raw.replace(/\r/g, '\n')}
                          </pre>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Segments ({selected.segments.length})
                          </p>
                          <div className="space-y-2">
                            {selected.segments.map((segment, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border bg-card p-3 dark:border-border"
                              >
                                <Badge className="mb-2">{segment.type}</Badge>
                                <div className="grid gap-1 font-mono text-xs">
                                  {segment.fields.map((field, fi) => (
                                    <div key={fi} className="flex gap-2">
                                      <span className="w-8 shrink-0 text-muted-foreground">
                                        {segment.type}.{fi}
                                      </span>
                                      <span className="break-all">{field || '—'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <EmptyState
                        title="Select a message"
                        description="Choose an HL7 message from the log to view segments."
                        icon={FileText}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
