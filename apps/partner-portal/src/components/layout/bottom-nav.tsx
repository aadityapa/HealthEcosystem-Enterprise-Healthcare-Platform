'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CreditCard,
  FileSignature,
  FileText,
  Headphones,
  Home,
  IndianRupee,
} from 'lucide-react';
import { cn } from '@health/design-system';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/subscriptions', label: 'Subs', icon: CreditCard },
  { href: '/quotations', label: 'Quotes', icon: FileText },
  { href: '/contracts', label: 'Contracts', icon: FileSignature },
  { href: '/revenue', label: 'Revenue', icon: IndianRupee },
  { href: '/support', label: 'Support', icon: Headphones },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('h-4 w-4', isActive && 'stroke-[2.5]')} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
