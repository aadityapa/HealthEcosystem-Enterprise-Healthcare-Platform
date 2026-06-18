'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  Input,
  Label,
} from '@health/design-system';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { devicesApi } from '@/lib/api/devices';
import {
  CONNECTION_TYPES,
  DEVICE_BRANCHES,
  DEVICE_PROTOCOLS,
  DEVICE_VENDORS,
} from '@/lib/mock-data/devices';
import type { DeviceConnectionType, DeviceProtocol, DeviceRegisterPayload, DeviceVendor } from '@/types';

const initialForm: DeviceRegisterPayload = {
  name: '',
  deviceCode: '',
  vendor: 'Roche',
  model: '',
  protocol: 'ASTM',
  connectionType: 'tcp',
  host: '',
  port: 5000,
  branch: DEVICE_BRANCHES[0].name,
};

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-input dark:bg-background';

export default function RegisterDevicePage() {
  const router = useRouter();
  const [form, setForm] = useState<DeviceRegisterPayload>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof DeviceRegisterPayload, string>>>({});

  const mutation = useMutation({
    mutationFn: devicesApi.registerDevice,
    onSuccess: () => router.push('/devices'),
  });

  const updateField = <K extends keyof DeviceRegisterPayload>(
    field: K,
    value: DeviceRegisterPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DeviceRegisterPayload, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Device name is required';
    if (!form.deviceCode.trim()) newErrors.deviceCode = 'Device code is required';
    if (!form.model.trim()) newErrors.model = 'Model is required';
    if (!form.host.trim()) newErrors.host = 'Host / port is required';
    if (!form.port || form.port < 1) newErrors.port = 'Valid port is required';
    if (!form.branch) newErrors.branch = 'Branch is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(form);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="Register Device"
          description="Configure a new laboratory instrument for result integration"
          actions={
            <Link href="/devices">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          }
        />

        {mutation.isError ? (
          <ErrorState
            title="Registration failed"
            message="Could not register the device. Please check your connection and try again."
            onRetry={() => mutation.reset()}
          />
        ) : null}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Device Identity</CardTitle>
              <CardDescription>Basic identification and vendor information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="col-span-full space-y-2">
                <Label htmlFor="name" required>
                  Device Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Cobas 6000 - Chemistry"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  error={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceCode" required>
                  Device Code
                </Label>
                <Input
                  id="deviceCode"
                  placeholder="ROC-CHEM-01"
                  value={form.deviceCode}
                  onChange={(e) => updateField('deviceCode', e.target.value.toUpperCase())}
                  error={!!errors.deviceCode}
                />
                {errors.deviceCode && (
                  <p className="text-xs text-destructive">{errors.deviceCode}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor" required>
                  Vendor
                </Label>
                <select
                  id="vendor"
                  value={form.vendor}
                  onChange={(e) => updateField('vendor', e.target.value as DeviceVendor)}
                  className={selectClassName}
                >
                  {DEVICE_VENDORS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" required>
                  Model
                </Label>
                <Input
                  id="model"
                  placeholder="e.g. Cobas 6000 c501"
                  value={form.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  error={!!errors.model}
                />
                {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch" required>
                  Branch
                </Label>
                <select
                  id="branch"
                  value={form.branch}
                  onChange={(e) => updateField('branch', e.target.value)}
                  className={selectClassName}
                >
                  {DEVICE_BRANCHES.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Connection Settings</CardTitle>
              <CardDescription>Protocol and network configuration for the instrument</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="protocol" required>
                  Protocol
                </Label>
                <select
                  id="protocol"
                  value={form.protocol}
                  onChange={(e) => updateField('protocol', e.target.value as DeviceProtocol)}
                  className={selectClassName}
                >
                  {DEVICE_PROTOCOLS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="connectionType" required>
                  Connection Type
                </Label>
                <select
                  id="connectionType"
                  value={form.connectionType}
                  onChange={(e) =>
                    updateField('connectionType', e.target.value as DeviceConnectionType)
                  }
                  className={selectClassName}
                >
                  {CONNECTION_TYPES.map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="host" required>
                  Host
                </Label>
                <Input
                  id="host"
                  placeholder="192.168.10.41 or COM3"
                  value={form.host}
                  onChange={(e) => updateField('host', e.target.value)}
                  error={!!errors.host}
                />
                {errors.host && <p className="text-xs text-destructive">{errors.host}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="port" required>
                  Port
                </Label>
                <Input
                  id="port"
                  type="number"
                  min={1}
                  max={65535}
                  value={form.port}
                  onChange={(e) => updateField('port', parseInt(e.target.value, 10) || 0)}
                  error={!!errors.port}
                />
                {errors.port && <p className="text-xs text-destructive">{errors.port}</p>}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-3">
            <Link href="/devices">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Register Device
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
