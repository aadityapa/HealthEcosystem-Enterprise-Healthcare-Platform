'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  SkeletonStatCards,
  StatCard,
} from '@health/design-system';
import { Download, IndianRupee } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { billingApi } from '@/lib/api/billing';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { GstReportEntry } from '@/types';

const PERIODS = ['May 2026', 'April 2026', 'March 2026', 'February 2026'];

const selectClass =
  'flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const columns: ColumnDef<GstReportEntry>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice #',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.invoiceNumber}</span>
    ),
  },
  {
    accessorKey: 'invoiceDate',
    header: 'Date',
    cell: ({ row }) => formatDate(row.original.invoiceDate),
  },
  { accessorKey: 'customerName', header: 'Customer' },
  {
    accessorKey: 'gstin',
    header: 'GSTIN',
    cell: ({ row }) => row.original.gstin ?? '—',
  },
  {
    accessorKey: 'hsnSac',
    header: 'HSN/SAC',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.hsnSac}</span>,
  },
  {
    accessorKey: 'taxableValue',
    header: 'Taxable',
    cell: ({ row }) => formatCurrency(row.original.taxableValue),
  },
  {
    accessorKey: 'cgst',
    header: 'CGST',
    cell: ({ row }) => formatCurrency(row.original.cgst),
  },
  {
    accessorKey: 'sgst',
    header: 'SGST',
    cell: ({ row }) => formatCurrency(row.original.sgst),
  },
  {
    accessorKey: 'igst',
    header: 'IGST',
    cell: ({ row }) => formatCurrency(row.original.igst),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.original.total),
  },
];

export default function GstReportPage() {
  const [period, setPeriod] = useState(PERIODS[0]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-gst', period],
    queryFn: () => billingApi.getGstReport(period),
  });

  const summary = data?.summary;
  const entries = data?.entries ?? [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="GST Reports"
          description="GSTR-1 outward supply summary and export"
          actions={
            <div className="flex items-center gap-2">
              <select
                className={selectClass}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export GSTR-1
              </Button>
            </div>
          }
        />

        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load GST report.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <SkeletonStatCards count={4} />
        ) : summary ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Taxable Value"
              value={formatCurrency(summary.totalTaxable)}
              icon={IndianRupee}
              description={`${summary.invoiceCount} invoices`}
            />
            <StatCard
              title="CGST"
              value={formatCurrency(summary.totalCgst)}
              icon={IndianRupee}
            />
            <StatCard
              title="SGST"
              value={formatCurrency(summary.totalSgst)}
              icon={IndianRupee}
            />
            <StatCard
              title="IGST"
              value={formatCurrency(summary.totalIgst)}
              icon={IndianRupee}
              description={`Total tax: ${formatCurrency(summary.totalTax)}`}
            />
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>GSTR-1 — Outward Supplies ({period})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={entries}
              searchKey="invoiceNumber"
              searchPlaceholder="Search invoices..."
              isLoading={isLoading}
              emptyMessage="No GST entries for this period."
            />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
