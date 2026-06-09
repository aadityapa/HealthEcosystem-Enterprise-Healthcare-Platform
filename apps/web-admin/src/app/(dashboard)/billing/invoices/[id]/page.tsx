'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@health/design-system';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  ErrorState,
  Skeleton,
  StatusBadge,
} from '@health/design-system';
import { ArrowLeft, Ban, Receipt } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { billingApi } from '@/lib/api/billing';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/mock-data';
import type { InvoiceLineItem, PaymentRecord } from '@/types';

const lineColumns: ColumnDef<InvoiceLineItem>[] = [
  { accessorKey: 'description', header: 'Description' },
  {
    accessorKey: 'hsnSac',
    header: 'HSN/SAC',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.hsnSac}</span>,
  },
  { accessorKey: 'quantity', header: 'Qty' },
  {
    accessorKey: 'unitPrice',
    header: 'Unit Price',
    cell: ({ row }) => formatCurrency(row.original.unitPrice),
  },
  {
    accessorKey: 'discount',
    header: 'Discount',
    cell: ({ row }) => formatCurrency(row.original.discount),
  },
  {
    accessorKey: 'taxableAmount',
    header: 'Taxable',
    cell: ({ row }) => formatCurrency(row.original.taxableAmount),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.original.total),
  },
];

const paymentColumns: ColumnDef<PaymentRecord>[] = [
  {
    accessorKey: 'receivedAt',
    header: 'Date',
    cell: ({ row }) => formatDateTime(row.original.receivedAt),
  },
  {
    accessorKey: 'method',
    header: 'Method',
    cell: ({ row }) => row.original.method.toUpperCase(),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  { accessorKey: 'reference', header: 'Reference', cell: ({ row }) => row.original.reference ?? '—' },
  { accessorKey: 'receivedBy', header: 'Received By' },
];

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: invoice, isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-invoice', id],
    queryFn: () => billingApi.getInvoice(id),
  });

  const voidMutation = useMutation({
    mutationFn: () => billingApi.voidInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['billing-invoices'] });
    },
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

  if (isError || !invoice) {
    return (
      <PageTransition>
        <ErrorState
          title="Invoice not found"
          message="Could not load invoice details."
          onRetry={() => refetch()}
        />
      </PageTransition>
    );
  }

  const { gst } = invoice;
  const balance = invoice.amount - invoice.paid;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title={invoice.invoiceNumber}
          description={`${invoice.patientName}${invoice.patientUhid ? ` · ${invoice.patientUhid}` : ''}`}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/billing/invoices')}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              {invoice.status !== 'void' && invoice.status !== 'paid' && (
                <Button
                  variant="destructive"
                  onClick={() => voidMutation.mutate()}
                  disabled={voidMutation.isPending}
                >
                  <Ban className="h-4 w-4" />
                  {voidMutation.isPending ? 'Voiding...' : 'Void Invoice'}
                </Button>
              )}
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge
                status={invoice.status === 'paid' ? 'approved' : invoice.status === 'overdue' ? 'critical' : 'pending'}
                label={invoice.status}
                className="mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Grand Total</p>
              <p className="text-2xl font-bold">{formatCurrency(invoice.amount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(invoice.paid)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Balance Due</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(balance)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Line Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={lineColumns} data={invoice.lineItems} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {invoice.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payments recorded.</p>
                ) : (
                  <DataTable columns={paymentColumns} data={invoice.payments} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch</span>
                  <span>{invoice.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(invoice.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>{formatDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client Type</span>
                  <span className="capitalize">{invoice.clientType}</span>
                </div>
                {invoice.clientName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client</span>
                    <span>{invoice.clientName}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GST Breakdown</CardTitle>
                <p className="text-xs text-muted-foreground capitalize">
                  {gst.supplyType.replace('-', ' ')}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxable Amount</span>
                  <span>{formatCurrency(gst.taxableAmount)}</span>
                </div>
                {gst.supplyType === 'intra-state' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CGST</span>
                      <span>{formatCurrency(gst.cgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SGST</span>
                      <span>{formatCurrency(gst.sgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IGST</span>
                    <span>{formatCurrency(gst.igst)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Total Tax</span>
                  <span>{formatCurrency(gst.totalTax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-primary">
                  <span>Grand Total</span>
                  <span>{formatCurrency(gst.grandTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
