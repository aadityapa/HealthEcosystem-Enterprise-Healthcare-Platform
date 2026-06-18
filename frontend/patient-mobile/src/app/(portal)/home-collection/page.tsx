'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle2, Home, Loader2, MapPin } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { patientPortalApi } from '@/lib/api/patient-portal';
import { formatCurrency } from '@/lib/mock-data';

export default function HomeCollectionPage() {
  const queryClient = useQueryClient();
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['test-catalog'],
    queryFn: () => patientPortalApi.getTestCatalog(),
  });

  const { data: timeSlots } = useQuery({
    queryKey: ['time-slots', preferredDate],
    queryFn: () => patientPortalApi.getTimeSlots(preferredDate),
    enabled: !!preferredDate,
  });

  const collectionMutation = useMutation({
    mutationFn: () =>
      patientPortalApi.scheduleHomeCollection({
        testIds: selectedTests,
        preferredDate,
        preferredTimeSlot: timeSlot,
        address,
        pincode,
        landmark: landmark || undefined,
        notes: notes || undefined,
      }),
    onSuccess: (data) => {
      setSuccess(data.message);
      setSelectedTests([]);
      setPreferredDate('');
      setTimeSlot('');
      setAddress('');
      setPincode('');
      setLandmark('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const toggleTest = (id: string) => {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
    setSuccess(null);
  };

  const totalAmount =
    tests
      ?.filter((t) => selectedTests.includes(t.id))
      .reduce((sum, t) => sum + t.price, 0) ?? 0;

  return (
    <div>
      <MobileHeader title="Home Collection" subtitle="Sample pickup at your doorstep" />

      <div className="space-y-6 px-4 py-4">
        {success && (
          <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-800 dark:text-emerald-200">{success}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Home className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              A certified phlebotomist will visit your home to collect samples. Free collection for orders above ₹999.
            </p>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 font-display text-sm font-semibold">Select Tests</h2>
          {testsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {tests?.map((test) => {
                const selected = selectedTests.includes(test.id);
                return (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() => toggleTest(test.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{test.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {test.sampleType} · TAT {test.tat}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(test.price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedTests.length > 0 && (
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground">
                {selectedTests.length} test{selectedTests.length > 1 ? 's' : ''}
              </span>
              <span className="font-display text-lg font-bold">{formatCurrency(totalAmount)}</span>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="font-display text-sm font-semibold">Pickup Address</h2>

          <div className="space-y-2">
            <Label htmlFor="address" required>
              Full address
            </Label>
            <Input
              id="address"
              placeholder="Flat/House no., Building, Street"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pincode" required>
                Pincode
              </Label>
              <Input
                id="pincode"
                placeholder="400050"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                placeholder="Near..."
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-sm font-semibold">Preferred Slot</h2>

          <div className="space-y-2">
            <Label htmlFor="hc-date" required>
              Date
            </Label>
            <Input
              id="hc-date"
              type="date"
              value={preferredDate}
              onChange={(e) => {
                setPreferredDate(e.target.value);
                setTimeSlot('');
              }}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {preferredDate && (
            <div className="space-y-2">
              <Label required>Time slot</Label>
              <div className="grid grid-cols-1 gap-2">
                {timeSlots?.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setTimeSlot(slot.label)}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      timeSlot === slot.label
                        ? 'border-primary bg-primary/5'
                        : slot.available
                          ? 'border-border hover:bg-muted/50'
                          : 'cursor-not-allowed border-border/50 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{slot.label}</span>
                      {!slot.available && (
                        <Badge variant="outline" className="text-[10px]">
                          Full
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="hc-notes">Notes (optional)</Label>
            <Input
              id="hc-notes"
              placeholder="Gate code, floor, fasting status..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <Button
          className="w-full"
          disabled={
            selectedTests.length === 0 ||
            !preferredDate ||
            !timeSlot ||
            !address ||
            pincode.length < 6 ||
            collectionMutation.isPending
          }
          onClick={() => collectionMutation.mutate()}
        >
          {collectionMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              Schedule Collection
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
