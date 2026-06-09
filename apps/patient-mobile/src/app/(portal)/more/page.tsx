'use client';

import Link from 'next/link';
import {
  Activity,
  Calendar,
  ChevronRight,
  Clock,
  Home,
  LogOut,
  User,
} from 'lucide-react';
import { Card, CardContent } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';

const menuItems = [
  {
    href: '/home-collection',
    label: 'Home Collection',
    description: 'Schedule sample pickup at home',
    icon: Home,
  },
  {
    href: '/timeline',
    label: 'Health Timeline',
    description: 'View your complete health history',
    icon: Clock,
  },
  {
    href: '/booking',
    label: 'Book a Test',
    description: 'Schedule lab tests online',
    icon: Calendar,
  },
];

export default function MorePage() {
  const { signOut } = useAuth();
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <MobileHeader title="More" subtitle="Additional options" />

      <div className="space-y-6 px-4 py-4">
        {user && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.phone}</p>
                <p className="font-mono text-xs text-muted-foreground">{user.uhid}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {menuItems.map(({ href, label, description, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="border-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">HealthEcosystem Patient Portal</p>
              <p className="text-xs text-muted-foreground">Version 1.0.0 · Phase 9</p>
            </div>
          </CardContent>
        </Card>

        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
