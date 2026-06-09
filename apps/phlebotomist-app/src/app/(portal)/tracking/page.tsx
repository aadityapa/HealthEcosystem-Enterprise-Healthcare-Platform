'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { Button, Card, CardContent } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { fieldApi } from '@/lib/api/field';
import { formatDateTime } from '@/lib/mock-data';

export default function TrackingPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tracking-history'],
    queryFn: () => fieldApi.getTrackingHistory(),
  });

  const pingMutation = useMutation({
    mutationFn: () => {
      const lat = 19.076 + (Math.random() - 0.5) * 0.01;
      const lng = 72.8777 + (Math.random() - 0.5) * 0.01;
      return fieldApi.recordPing(lat, lng);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracking-history'] }),
  });

  return (
    <div>
      <MobileHeader title="GPS Tracking" subtitle="Live location pings" />

      <div className="space-y-4 px-4 py-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm text-muted-foreground">
              Record your current GPS position. Pings are sent to the field service for route
              monitoring.
            </p>
            <Button
              className="w-full"
              onClick={() => pingMutation.mutate()}
              disabled={pingMutation.isPending}
            >
              {pingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Send GPS Ping
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 font-display text-sm font-semibold">Ping History</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data?.items.map((ping) => (
                <Card key={ping.id}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs">
                        {ping.lat.toFixed(4)}, {ping.lng.toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(ping.recordedAt)}
                        {ping.accuracy != null && ` · ±${ping.accuracy}m`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
