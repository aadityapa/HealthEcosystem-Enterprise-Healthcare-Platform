'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  StatusBadge,
} from '@health/design-system';
import { Building2, FileText, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { billingApi } from '@/lib/api/billing';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { CorporateClient } from '@/types';

const statusMap: Record<CorporateClient['status'], 'active' | 'critical' | 'inactive'> = {
  active: 'active',
  suspended: 'critical',
  expired: 'inactive',
};

function CreditLimitBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-warning' : 'bg-primary';
  return (
    <div className="w-32">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const columns: ColumnDef<CorporateClient>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Client',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  { accessorKey: 'contactPerson', header: 'Contact' },
  {
    accessorKey: 'creditLimit',
    header: 'Credit Limit',
    cell: ({ row }) => formatCurrency(row.original.creditLimit),
  },
  {
    accessorKey: 'outstanding',
    header: 'Outstanding',
    cell: ({ row }) => (
      <span className={row.original.outstanding > 0 ? 'text-destructive font-medium' : ''}>
        {formatCurrency(row.original.outstanding)}
      </span>
    ),
  },
  {
    id: 'creditUsage',
    header: 'Credit Usage',
    cell: ({ row }) => (
      <CreditLimitBar used={row.original.outstanding} limit={row.original.creditLimit} />
    ),
  },
  {
    accessorKey: 'discountPercent',
    header: 'Discount',
    cell: ({ row }) => `${row.original.discountPercent}%`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function CorporatePage() {
  const router = useRouter();
  const { data: clients = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-corporate'],
    queryFn: () => billingApi.listCorporateClients(),
  });

  const activeClients = clients.filter((c) => c.status === 'active');

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Corporate Clients"
          description={`${activeClients.length} active corporate contracts`}
          actions={
            <>
              <Button variant="outline" onClick={() => router.push('/billing/corporate/statements')}>
                <FileText className="h-4 w-4" />
                Statements
              </Button>
              <Button>
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </>
          }
        />

        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load corporate clients.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={clients}
              searchKey="name"
              searchPlaceholder="Search clients..."
              isLoading={isLoading}
              emptyMessage="No corporate clients configured."
            />

            {!isLoading && clients.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clients
                  .filter((c) => c.status === 'active')
                  .slice(0, 3)
                  .map((client) => (
                    <Card key={client.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{client.name}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono">{client.code}</p>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contract Period</span>
                          <span>
                            {formatDate(client.contractStart)} – {formatDate(client.contractEnd)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Terms</span>
                          <span>{client.paymentTerms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discount</span>
                          <span>{client.discountPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact</span>
                          <span>{client.contactPerson}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
