'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, MapPin, Syringe, User } from 'lucide-react';
import { cn } from '@health/design-system';

const navItems = [
  { href: '/', label: 'Route', icon: MapPin },
  { href: '/collect', label: 'Collect', icon: Syringe },
  { href: '/attendance', label: 'Attendance', icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/' || pathname.startsWith('/route')
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
