'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@health/design-system';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { api } from '@/lib/api/client';
import { fetchWithDelay, getPatientById, mockPatients, testCatalog } from '@/lib/mock-data';

interface OrderLine {
  testId: string;
  testName: string;
  price: number;
}

export default function NewOrderPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId ?? '');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [referringDoctor, setReferringDoctor] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [testSearch, setTestSearch] = useState('');

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-for-order'],
    queryFn: () => fetchWithDelay(mockPatients, 300),
  });

  const selectedPatient = selectedPatientId
    ? getPatientById(selectedPatientId) ?? patients.find((p) => p.id === selectedPatientId)
    : undefined;

  const filteredPatients = patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.uhid.toLowerCase().includes(patientSearch.toLowerCase()),
  );

  const filteredTests = testCatalog.filter(
    (t) =>
      t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
      t.code.toLowerCase().includes(testSearch.toLowerCase()),
  );

  const totalAmount = orderLines.reduce((sum, line) => sum + line.price, 0);

  const mutation = useMutation({
    mutationFn: (payload: unknown) => api.post('/api/v1/lims/orders', payload),
    onSuccess: () => router.push('/lims/samples'),
    onError: () => router.push('/lims/samples'),
  });

  const addTest = (test: (typeof testCatalog)[0]) => {
    if (orderLines.some((l) => l.testId === test.id)) return;
    setOrderLines((prev) => [
      ...prev,
      { testId: test.id, testName: test.name, price: test.price },
    ]);
  };

  const removeTest = (testId: string) => {
    setOrderLines((prev) => prev.filter((l) => l.testId !== testId));
  };

  const handleSubmit = () => {
    if (!selectedPatientId || orderLines.length === 0) return;
    mutation.mutate({
      patientId: selectedPatientId,
      priority,
      referringDoctor,
      clinicalNotes,
      tests: orderLines,
      totalAmount,
    });
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          title="New Lab Order"
          description="Create a diagnostic order for a patient"
          actions={
            <Link href="/lims/samples">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Selection</CardTitle>
                <CardDescription>Search and select the patient for this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or UHID..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {selectedPatient ? (
                  <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div>
                      <p className="font-medium">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                      <p className="font-mono text-sm text-primary">{selectedPatient.uhid}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPatientId('')}>
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => setSelectedPatientId(patient.id)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{patient.uhid}</p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Selection</CardTitle>
                <CardDescription>Add tests from the catalog</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search tests by name or code..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  {filteredTests.map((test) => (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() => addTest(test)}
                      disabled={orderLines.some((l) => l.testId === test.id)}
                      className="flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                    >
                      <div>
                        <p className="text-sm font-medium">{test.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {test.code} · TAT {test.tat}
                        </p>
                      </div>
                      <span className="text-sm font-medium">₹{test.price}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as typeof priority)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Referring Doctor</Label>
                  <Input
                    id="doctor"
                    value={referringDoctor}
                    onChange={(e) => setReferringDoctor(e.target.value)}
                    placeholder="Dr. Name"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <Label htmlFor="notes">Clinical Notes</Label>
                  <textarea
                    id="notes"
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Clinical indication, fasting status, etc."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderLines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tests added yet</p>
                ) : (
                  <div className="space-y-2">
                    {orderLines.map((line) => (
                      <div key={line.testId} className="flex items-center justify-between text-sm">
                        <span className="flex-1 truncate">{line.testName}</span>
                        <span className="mx-2 font-medium">₹{line.price}</span>
                        <button
                          type="button"
                          onClick={() => removeTest(line.testId)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {priority !== 'routine' && (
                  <Badge variant={priority === 'stat' ? 'destructive' : 'warning'}>
                    {priority.toUpperCase()} priority
                  </Badge>
                )}
                <Button
                  className="w-full"
                  disabled={!selectedPatientId || orderLines.length === 0 || mutation.isPending}
                  onClick={handleSubmit}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Order'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
