'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Clock, Loader2, LogIn, LogOut, MapPin, ShieldCheck } from 'lucide-react';
import { Badge, Button, Card, CardContent } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { fieldApi } from '@/lib/api/field';
import { formatDateTime } from '@/lib/mock-data';

export default function AttendancePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => fieldApi.getAttendance(),
  });

  const checkInMutation = useMutation({
    mutationFn: () => fieldApi.checkIn(19.076, 72.8777),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const checkOutMutation = useMutation({
    mutationFn: () => fieldApi.checkOut(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const activeSession = data?.items.find((a) => !a.checkOutAt);
  const isPending = checkInMutation.isPending || checkOutMutation.isPending;

  return (
    <div>
      <MobileHeader title="Attendance" subtitle="Check-in with geofence" />

      <div className="space-y-4 px-4 py-4">
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground">
              Check in when you arrive at the branch. Your location is validated against the
              configured geofence.
            </p>

            {!activeSession ? (
              <Button
                className="w-full"
                onClick={() => checkInMutation.mutate()}
                disabled={isPending}
              >
                {checkInMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                Check In
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => checkOutMutation.mutate()}
                disabled={isPending}
              >
                {checkOutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Check Out
              </Button>
            )}
          </CardContent>
        </Card>

        {activeSession && (
          <Card className="border-emerald-200 dark:border-emerald-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Active Session</p>
                <Badge variant={activeSession.withinGeofence ? 'default' : 'destructive'}>
                  {activeSession.withinGeofence ? (
                    <>
                      <ShieldCheck className="mr-1 h-3 w-3" />
                      In Geofence
                    </>
                  ) : (
                    'Outside Geofence'
                  )}
                </Badge>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Since {formatDateTime(activeSession.checkInAt)}
              </p>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="mb-3 font-display text-sm font-semibold">Recent Records</h2>
          {isLoading ? (
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
          ) : (
            <div className="space-y-2">
              {data?.items.map((record) => (
                <Card key={record.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm">{formatDateTime(record.checkInAt)}</p>
                      {record.checkOutAt && (
                        <p className="text-xs text-muted-foreground">
                          Out: {formatDateTime(record.checkOutAt)}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {record.withinGeofence ? 'Valid' : 'Invalid'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Link href="/tracking">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 p-4">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">GPS Tracking</p>
                <p className="text-xs text-muted-foreground">View location history</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
