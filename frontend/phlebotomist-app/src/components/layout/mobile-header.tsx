'use client';

import { Moon, Sun, Syringe } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@health/design-system';
import { useAuthStore } from '@/stores/auth.store';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showGreeting?: boolean;
}

export function MobileHeader({ title, subtitle, showGreeting = false }: MobileHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Syringe className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            {showGreeting && user ? (
              <>
                <p className="text-xs text-muted-foreground">Good morning</p>
                <h1 className="font-display text-base font-semibold leading-tight">
                  {user.name.split(' ')[0]}
                </h1>
              </>
            ) : title ? (
              <>
                <h1 className="font-display text-base font-semibold leading-tight">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              </>
            ) : null}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}
