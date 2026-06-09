'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, CheckCircle2, Loader2, MapPin, PenLine, ShieldCheck } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { fieldApi } from '@/lib/api/field';

interface StopPageProps {
  params: Promise<{ id: string }>;
}

export default function StopCollectPage({ params }: StopPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [otpVerified, setOtpVerified] = useState(false);
  const [barcode, setBarcode] = useState('');

  const { data: stopData, isLoading } = useQuery({
    queryKey: ['stop', id],
    queryFn: () => fieldApi.getStop(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => fieldApi.updateStopStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stop', id] }),
  });

  const proofMutation = useMutation({
    mutationFn: () =>
      fieldApi.submitProof(id, {
        photoUrl: 'mock://photo/sample-vial.jpg',
        signatureUrl: 'mock://signature/patient.png',
        otpVerified,
        barcodeScanned: barcode || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stop', id] });
      queryClient.invalidateQueries({ queryKey: ['today-route'] });
    },
  });

  const stop = stopData && 'patientName' in stopData ? stopData : null;
  const isCollected = stop?.status === 'COLLECTED';

  return (
    <div>
      <MobileHeader title="Collect Sample" subtitle={stop?.patientName} />

      <div className="space-y-4 px-4 py-4">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
        ) : stop ? (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{stop.patientName}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {stop.address.line1}
                    </p>
                  </div>
                  <Badge variant={isCollected ? 'default' : 'secondary'}>
                    {stop.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {!isCollected && (
              <div className="flex gap-2">
                {stop.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => statusMutation.mutate('EN_ROUTE')}
                    disabled={statusMutation.isPending}
                  >
                    En Route
                  </Button>
                )}
                {['PENDING', 'EN_ROUTE'].includes(stop.status) && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => statusMutation.mutate('ARRIVED')}
                    disabled={statusMutation.isPending}
                  >
                    Arrived
                  </Button>
                )}
              </div>
            )}

            <Card>
              <CardContent className="space-y-4 p-4">
                <h3 className="text-sm font-semibold">Collection Proof</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Photo captured</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4">
                    <PenLine className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Signature captured</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode / Sample ID</Label>
                  <Input
                    id="barcode"
                    placeholder="Scan or enter barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={isCollected}
                  />
                </div>

                <Button
                  variant={otpVerified ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setOtpVerified(true)}
                  disabled={isCollected || otpVerified}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {otpVerified ? 'OTP Verified' : 'Verify Patient OTP'}
                </Button>

                {!isCollected && (
                  <Button
                    className="w-full"
                    onClick={() => proofMutation.mutate()}
                    disabled={proofMutation.isPending || !otpVerified}
                  >
                    {proofMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Complete Collection
                      </>
                    )}
                  </Button>
                )}

                {isCollected && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    Sample collected successfully
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
