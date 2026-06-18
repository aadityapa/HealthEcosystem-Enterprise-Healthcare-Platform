'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard, Loader2, Receipt } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  EmptyState,
  StatCard,
} from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { patientPortalApi } from '@/lib/api/patient-portal';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { PatientInvoice } from '@/types';

function invoiceStatusVariant(status: PatientInvoice['status']) {
  switch (status) {
    case 'paid':
      return 'secondary' as const;
    case 'partial':
      return 'default' as const;
    case 'pending':
      return 'outline' as const;
    case 'overdue':
      return 'destructive' as const;
  }
}

export default function PaymentsPage() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => patientPortalApi.getInvoices(),
  });

  const totalOutstanding =
    invoices?.reduce((sum, inv) => sum + (inv.amount - inv.paid), 0) ?? 0;
  const paidCount = invoices?.filter((inv) => inv.status === 'paid').length ?? 0;

  return (
    <div>
      <MobileHeader title="Payments" subtitle="Track invoices and payment status" />

      <div className="space-y-6 px-4 py-4">
        {!isLoading && invoices && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Outstanding"
              value={formatCurrency(totalOutstanding)}
              icon={CreditCard}
            />
            <StatCard
              title="Paid Invoices"
              value={paidCount}
              icon={Receipt}
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !invoices?.length ? (
          <EmptyState
            icon={Receipt}
            title="No invoices"
            description="Your payment history will appear here"
          />
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => {
              const outstanding = invoice.amount - invoice.paid;
              return (
                <Card key={invoice.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 shrink-0 text-primary" />
                          <p className="truncate text-sm font-medium">{invoice.description}</p>
                        </div>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {invoice.invoiceNumber}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                          <span>Issued: {formatDate(invoice.createdAt)}</span>
                          <span>Due: {formatDate(invoice.dueDate)}</span>
                        </div>
                      </div>
                      <Badge variant={invoiceStatusVariant(invoice.status)} className="capitalize shrink-0">
                        {invoice.status}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-display text-lg font-bold">
                          {formatCurrency(invoice.amount)}
                        </p>
                      </div>
                      {outstanding > 0 ? (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Due</p>
                          <p className="text-sm font-semibold text-destructive">
                            {formatCurrency(outstanding)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-emerald-600">Fully paid</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
