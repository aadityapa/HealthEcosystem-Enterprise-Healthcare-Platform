'use client';

import { Bell, Search } from 'lucide-react';
import { Button, Input } from '@health/design-system';
import { ThemeToggle } from './theme-toggle';

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search patients, orders, samples..." className="pl-9 bg-muted/50" />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
