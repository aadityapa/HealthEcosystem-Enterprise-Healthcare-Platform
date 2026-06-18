'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@health/design-system';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { formatCurrency, testCatalog } from '@/lib/mock-data';

interface LineItemDraft {
  id: string;
  testId: string;
  quantity: number;
}

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [patientName, setPatientName] = useState('');
  const [clientType, setClientType] = useState('retail');
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    { id: '1', testId: 't1', quantity: 1 },
  ]);

  const addLine = () => {
    setLineItems((prev) => [
      ...prev,
      { id: String(Date.now()), testId: 't1', quantity: 1 },
    ]);
  };

  const removeLine = (id: string) => {
    setLineItems((prev) => prev.filter((l) => l.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => {
    const test = testCatalog.find((t) => t.id === item.testId);
    return sum + (test?.price ?? 0) * item.quantity;
  }, 0);

  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Create Invoice"
          description="Generate a new billing invoice with GST"
          actions={
            <Button variant="outline" onClick={() => router.push('/billing/invoices')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient & Client Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient Name</Label>
                  <Input
                    id="patient"
                    placeholder="Enter patient name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-type">Client Type</Label>
                  <select
                    id="client-type"
                    className={selectClass}
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                  >
                    <option value="retail">Retail</option>
                    <option value="corporate">Corporate</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <select id="branch" className={selectClass} defaultValue="mumbai">
                    <option value="mumbai">Mumbai Central Lab</option>
                    <option value="delhi">Delhi NCR Diagnostic</option>
                    <option value="bangalore">Bangalore Health Hub</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supply-type">Supply Type</Label>
                  <select id="supply-type" className={selectClass} defaultValue="intra">
                    <option value="intra">Intra-state (CGST + SGST)</option>
                    <option value="inter">Inter-state (IGST)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <Label>Test / Service</Label>
                      <select
                        className={selectClass}
                        value={item.testId}
                        onChange={(e) =>
                          setLineItems((prev) =>
                            prev.map((l) => (l.id === item.id ? { ...l, testId: e.target.value } : l)),
                          )
                        }
                      >
                        {testCatalog.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} — {formatCurrency(t.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20 space-y-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          setLineItems((prev) =>
                            prev.map((l) =>
                              l.id === item.id ? { ...l, quantity: Number(e.target.value) } : l,
                            ),
                          )
                        }
                      />
                    </div>
                    {lineItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>{formatCurrency(gst)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Grand Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
              <Button className="w-full mt-4" disabled={!patientName}>
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
