'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: Omit<SidebarNavItem, 'children'>[];
}

export interface SidebarProps {
  items: SidebarNavItem[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  activeHref?: string;
  onNavigate?: (href: string) => void;
  className?: string;
}

export function Sidebar({
  items,
  logo,
  footer,
  collapsed = false,
  onCollapsedChange,
  activeHref = '',
  onNavigate,
  className,
}: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href: string) =>
    activeHref === href || (href !== '/' && activeHref.startsWith(href));

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-64',
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && logo}
        <Button
          variant="ghost"
          size="icon"
          className={cn('shrink-0', collapsed && 'mx-auto')}
          onClick={() => onCollapsedChange?.(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const active = isActive(item.href);
          const expanded = expandedGroups[item.title] ?? active;

          if (hasChildren) {
            return (
              <div key={item.title}>
                <button
                  type="button"
                  onClick={() => {
                    if (collapsed) onCollapsedChange?.(false);
                    else toggleGroup(item.title);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronRight
                        className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')}
                      />
                    </>
                  )}
                </button>
                {!collapsed && expanded && item.children && (
                  <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.href);
                      return (
                        <button
                          key={child.href}
                          type="button"
                          onClick={() => onNavigate?.(child.href)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            childActive
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}
                        >
                          <ChildIcon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left">{child.title}</span>
                          {child.badge !== undefined && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              {child.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => onNavigate?.(item.href)}
              title={collapsed ? item.title : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {footer && !collapsed && <div className="border-t p-4">{footer}</div>}
    </aside>
  );
}
