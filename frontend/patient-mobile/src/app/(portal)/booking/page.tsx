'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Calendar, CheckCircle2, Loader2, MapPin } from 'lucide-react';
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

export default function BookingPage() {
  const queryClient = useQueryClient();
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [branchId, setBranchId] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['test-catalog'],
    queryFn: () => patientPortalApi.getTestCatalog(),
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => patientPortalApi.getBranches(),
  });

  const bookingMutation = useMutation({
    mutationFn: () =>
      patientPortalApi.createBooking({
        testIds: selectedTests,
        preferredDate,
        preferredTime,
        branchId,
        notes: notes || undefined,
      }),
    onSuccess: (data) => {
      setSuccess(data.message);
      setSelectedTests([]);
      setPreferredDate('');
      setPreferredTime('');
      setBranchId('');
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
      <MobileHeader title="Book a Test" subtitle="Schedule lab tests online" />

      <div className="space-y-6 px-4 py-4">
        {success && (
          <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-800 dark:text-emerald-200">{success}</p>
            </CardContent>
          </Card>
        )}

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
                          {test.category} · {test.sampleType} · TAT {test.tat}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(test.price)}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {test.code}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedTests.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedTests.length} test{selectedTests.length > 1 ? 's' : ''} selected
                </span>
                <span className="font-display text-lg font-bold">{formatCurrency(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="font-display text-sm font-semibold">Schedule</h2>

          <div className="space-y-2">
            <Label htmlFor="branch" required>
              Branch
            </Label>
            <select
              id="branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">Select branch</option>
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.city}
                </option>
              ))}
            </select>
            {branchId && (
              <p className="flex items-start gap-1 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                {branches?.find((b) => b.id === branchId)?.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" required>
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" required>
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Fasting required, special instructions..."
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
            !preferredTime ||
            !branchId ||
            bookingMutation.isPending
          }
          onClick={() => bookingMutation.mutate()}
        >
          {bookingMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              Confirm Booking
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
