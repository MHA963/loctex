import React, { type ReactNode, type HTMLAttributes } from 'react';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  headerSlot,
  footerSlot,
  children,
  className = '',
  ...props
}: AppShellProps) {
  return (
    <div
      className={`min-h-screen flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-[family-name:var(--font-sans)] antialiased ${className}`}
      {...props}
    >
      {headerSlot && (
        <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] backdrop-blur-[var(--backdrop-blur)]">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {headerSlot}
          </div>
        </header>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>

      {footerSlot && (
        <footer className="w-full border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            {footerSlot}
          </div>
        </footer>
      )}
    </div>
  );
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  title: string;
  subtitle?: string;
  badgeSlot?: ReactNode;
  actionSlot?: ReactNode;
  children?: ReactNode;
  interactive?: boolean;
}

export function Card({
  title,
  subtitle,
  badgeSlot,
  actionSlot,
  children,
  interactive = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <section
      role={interactive ? 'button' : 'region'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={title}
      className={`relative rounded-[var(--radius-xl)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-[var(--backdrop-blur)] transition-all duration-200 ${
        interactive
          ? 'cursor-pointer hover:border-[var(--color-border-accent)] hover:bg-[var(--color-bg-surface-raised)] hover:shadow-[var(--shadow-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] active:scale-[0.99]'
          : ''
      } ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] truncate">
              {title}
            </h2>
            {badgeSlot}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {actionSlot && <div className="shrink-0">{actionSlot}</div>}
      </div>

      {children && (
        <div className="text-sm leading-relaxed text-[var(--color-text-subtle)]">
          {children}
        </div>
      )}
    </section>
  );
}
