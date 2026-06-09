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
import { Cable, FileCode2, Radio } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { devicesApi } from '@/lib/api/devices';
import { formatDateTime } from '@/lib/mock-data';

export default function AstmMonitorPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const connectionQuery = useQuery({
    queryKey: ['astm-connection'],
    queryFn: devicesApi.getAstmConnection,
    refetchInterval: 5000,
  });

  const messagesQuery = useQuery({
    queryKey: ['astm-messages'],
    queryFn: devicesApi.listAstmMessages,
    refetchInterval: 5000,
  });

  const connection = connectionQuery.data;
  const messages = messagesQuery.data ?? [];
  const selected = messages.find((m) => m.id === selectedId) ?? messages[0] ?? null;
  const isLoading = connectionQuery.isLoading || messagesQuery.isLoading;
  const isError = connectionQuery.isError || messagesQuery.isError;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="ASTM Monitor"
          description="Live ASTM E1381/E1394 message log and frame parser"
        />

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-24 lg:col-span-3" />
            <Skeleton className="h-96 lg:col-span-1" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        ) : isError ? (
          <ErrorState
            title="ASTM monitor unavailable"
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
                  <Cable className="h-5 w-5 text-primary" />
                  <span className="font-medium">Connection</span>
                </div>
                <StatusBadge
                  status={connection?.connected ? 'active' : 'critical'}
                  label={connection?.connected ? 'Connected' : 'Disconnected'}
                />
                <Badge variant="outline">
                  {connection?.host}:{connection?.port}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {connection?.activeSessions} active sessions
                </span>
                <span className="text-sm text-muted-foreground">
                  Last handshake:{' '}
                  {connection?.lastHandshake ? formatDateTime(connection.lastHandshake) : '—'}
                </span>
              </CardContent>
            </Card>

            {messages.length === 0 ? (
              <EmptyState
                title="No ASTM messages"
                description="Incoming ASTM frames will appear in the live log."
                icon={Radio}
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-base">Live Message Log</CardTitle>
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
                          <Badge variant="outline" className="text-[10px]">
                            {msg.direction}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(msg.timestamp)}
                        </p>
                        {!msg.checksumValid && (
                          <StatusBadge status="critical" label="Checksum invalid" className="mt-1" />
                        )}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileCode2 className="h-4 w-4" />
                      Frame Parser Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selected ? (
                      <>
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">Raw Message</p>
                          <pre className="max-h-32 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs dark:bg-muted/50">
                            {selected.raw.replace(/\r/g, '\n')}
                          </pre>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Parsed Frames ({selected.frames.length})
                          </p>
                          <div className="space-y-2">
                            {selected.frames.map((frame, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border bg-card p-3 dark:border-border"
                              >
                                <div className="mb-1 flex items-center gap-2">
                                  <Badge>{frame.recordType}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Record type {frame.recordType}
                                  </span>
                                </div>
                                <div className="grid gap-1 font-mono text-xs">
                                  {frame.fields.map((field, fi) => (
                                    <div key={fi} className="flex gap-2">
                                      <span className="w-6 shrink-0 text-muted-foreground">
                                        [{fi}]
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
                        description="Choose a message from the log to preview parsed frames."
                        icon={FileCode2}
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
