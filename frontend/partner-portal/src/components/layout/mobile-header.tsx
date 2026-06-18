'use client';

import { Handshake } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useAuthStore } from '@/stores/auth.store';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showGreeting?: boolean;
}

export function MobileHeader({ title, subtitle, showGreeting = false }: MobileHeaderProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Handshake className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            {showGreeting && user ? (
              <>
                <p className="text-xs text-muted-foreground">Partner Portal</p>
                <h1 className="font-display text-base font-semibold leading-tight">
                  {user.company}
                </h1>
              </>
            ) : title ? (
              <>
                <h1 className="font-display text-base font-semibold leading-tight">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </>
            ) : null}
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
