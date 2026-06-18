'use client';

import Link from 'next/link';
import { ChevronRight, LogOut, MapPin, User } from 'lucide-react';
import { Button, Card, CardContent } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { useAuth } from '@/hooks/use-auth';

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <MobileHeader title="Profile" />

      <div className="space-y-4 px-4 py-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.employeeCode}</p>
              <p className="text-xs text-muted-foreground">{user?.phone}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {[
            { href: '/tracking', label: 'GPS Tracking', icon: MapPin },
            { href: '/attendance', label: 'Attendance', icon: User },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Button variant="outline" className="w-full text-destructive" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
