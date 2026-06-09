'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Label,
  StatusBadge,
} from '@health/design-system';
import { Loader2, Pencil, Settings2, X } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { devicesApi } from '@/lib/api/devices';
import { formatDateTime } from '@/lib/mock-data';
import type { DeviceAdapter } from '@/types';

function AdapterEditModal({
  adapter,
  onClose,
}: {
  adapter: DeviceAdapter;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [jsonText, setJsonText] = useState(
    JSON.stringify(adapter.fieldMapping, null, 2),
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (fieldMapping: Record<string, string>) =>
      devicesApi.updateAdapter(adapter.id, fieldMapping),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-adapters'] });
      onClose();
    },
  });

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText) as Record<string, string>;
      setParseError(null);
      mutation.mutate(parsed);
    } catch {
      setParseError('Invalid JSON. Please check the field mapping syntax.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-lg shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Field Mapping — {adapter.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {adapter.vendor} · {adapter.protocol} protocol
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fieldMapping">Field Mapping JSON</Label>
            <textarea
              id="fieldMapping"
              rows={12}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setParseError(null);
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-input"
            />
            {parseError && <p className="text-xs text-destructive">{parseError}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Mapping'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdapterConfigPage() {
  const [editingAdapter, setEditingAdapter] = useState<DeviceAdapter | null>(null);

  const { data: adapters = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['device-adapters'],
    queryFn: devicesApi.listAdapters,
  });

  const columns: ColumnDef<DeviceAdapter>[] = [
    {
      accessorKey: 'name',
      header: 'Adapter',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.vendor}</p>
        </div>
      ),
    },
    {
      accessorKey: 'protocol',
      header: 'Protocol',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.protocol}</span>
      ),
    },
    {
      accessorKey: 'deviceCount',
      header: 'Devices',
    },
    {
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.enabled ? 'active' : 'inactive'}
          label={row.original.enabled ? 'Enabled' : 'Disabled'}
        />
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => formatDateTime(row.original.updatedAt),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setEditingAdapter(row.original);
          }}
        >
          <Pencil className="h-3 w-3" />
          Edit Mapping
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Adapter Configuration"
          description={`${adapters.length} protocol adapters configured for field mapping`}
        />

        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <Settings2 className="mx-auto mb-2 h-8 w-8 text-destructive" />
            <p className="text-destructive">Failed to load adapter configurations.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={adapters}
            searchKey="name"
            searchPlaceholder="Search adapters..."
            isLoading={isLoading}
            emptyMessage="No adapters configured. Adapters are created when devices are registered."
          />
        )}

        {editingAdapter && (
          <AdapterEditModal
            adapter={editingAdapter}
            onClose={() => setEditingAdapter(null)}
          />
        )}
      </div>
    </PageTransition>
  );
}
