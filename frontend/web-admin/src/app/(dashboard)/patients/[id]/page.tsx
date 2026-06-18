'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  FileText,
  Mail,
  Phone,
  TestTube2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusBadge,
} from '@health/design-system';
import { PageTransition } from '@/components/motion/page-transition';
import { fetchWithDelay, formatDate, getPatientById } from '@/lib/mock-data';
import { useState } from 'react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'orders', label: 'Lab Orders', icon: ClipboardList },
  { id: 'results', label: 'Results', icon: TestTube2 },
  { id: 'billing', label: 'Billing', icon: FileText },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: patient, isLoading, isError, refetch } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchWithDelay(getPatientById(id)),
  });

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageTransition>
    );
  }

  if (isError || !patient) {
    return (
      <PageTransition>
        <ErrorState
          title="Patient not found"
          message="The patient record you're looking for doesn't exist or has been removed."
          onRetry={() => refetch()}
        />
        <div className="mt-4">
          <Link href="/patients">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to patients
            </Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  const age = Math.floor(
    (Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/patients">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold">
                  {patient.firstName} {patient.lastName}
                </h1>
                <StatusBadge status={patient.status} />
              </div>
              <p className="font-mono text-sm text-primary">{patient.uhid}</p>
            </div>
          </div>
          <Link href={`/lims/orders/new?patientId=${patient.id}`}>
            <Button>New Lab Order</Button>
          </Link>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                    <dd className="mt-1 flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(patient.dateOfBirth)} ({age} yrs)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Gender</dt>
                    <dd className="mt-1 font-medium capitalize">{patient.gender}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Blood Group</dt>
                    <dd className="mt-1">
                      {patient.bloodGroup ? (
                        <Badge variant="outline">{patient.bloodGroup}</Badge>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Registered</dt>
                    <dd className="mt-1 font-medium">{formatDate(patient.registeredAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd className="mt-1 flex items-center gap-2 font-medium">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {patient.phone}
                    </dd>
                  </div>
                  {patient.email && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Email</dt>
                      <dd className="mt-1 flex items-center gap-2 font-medium">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {patient.email}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: '2026-06-05', event: 'CBC ordered', status: 'reported' as const },
                    { date: '2026-05-20', event: 'Lipid Profile', status: 'approved' as const },
                    { date: '2026-04-12', event: 'Thyroid Panel', status: 'approved' as const },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.event}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                      </div>
                      <StatusBadge status={item.status} showDot={false} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'orders' && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {[
                  { id: 'ORD-001', tests: 'Complete Blood Count', date: '2026-06-05', status: 'reported' as const },
                  { id: 'ORD-002', tests: 'Lipid Profile', date: '2026-05-20', status: 'approved' as const },
                ].map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-mono text-sm text-primary">{order.id}</p>
                      <p className="font-medium">{order.tests}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.date)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'results' && (
          <Card>
            <CardContent className="pt-6">
              <Link href="/lims/results/res1">
                <div className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div>
                    <p className="font-medium">Complete Blood Count</p>
                    <p className="text-sm text-muted-foreground">2026-06-05 · 6 parameters</p>
                  </div>
                  <StatusBadge status="processing" label="Pending Review" />
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {activeTab === 'billing' && (
          <EmptyState
            title="No billing records"
            description="Invoices and payment history for this patient will appear here."
          />
        )}
      </div>
    </PageTransition>
  );
}
