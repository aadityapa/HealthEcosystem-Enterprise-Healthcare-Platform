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
  Input,
  Label,
} from '@health/design-system';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { api } from '@/lib/api/client';

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}

const initialForm: PatientFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  bloodGroup: '',
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
};

export default function RegisterPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState<PatientFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({});

  const mutation = useMutation({
    mutationFn: (data: PatientFormData) => api.post('/api/v1/patients', data),
    onSuccess: () => router.push('/patients'),
    onError: () => {
      router.push('/patients');
    },
  });

  const updateField = (field: keyof PatientFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PatientFormData, string>> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
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
          title="Register Patient"
          description="Create a new patient record with demographic and contact information"
          actions={
            <Link href="/patients">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          }
        />

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic demographic details for the patient record</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" required>
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  error={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" required>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  error={!!errors.lastName}
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" required>
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  error={!!errors.dateOfBirth}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" required>
                  Gender
                </Label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <select
                  id="bloodGroup"
                  value={form.bloodGroup}
                  onChange={(e) => updateField('bloodGroup', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select blood group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" required>
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  error={!!errors.phone}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={form.emergencyContact}
                  onChange={(e) => updateField('emergencyContact', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={form.emergencyPhone}
                  onChange={(e) => updateField('emergencyPhone', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-3">
            <Link href="/patients">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Register Patient
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
