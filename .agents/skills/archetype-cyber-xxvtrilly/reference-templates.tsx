import React, { ReactNode } from 'react';

export interface AppShellProps {
  sidebarSlot?: ReactNode;
  headerSlot?: ReactNode;
  children: ReactNode;
}

export function AppShell({ sidebarSlot, headerSlot, children }: AppShellProps) {
  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans antialiased">
      {sidebarSlot && (
        <aside
          aria-label="Navigation Rail"
          className="fixed left-0 top-0 z-40 hidden h-full w-16 flex-col items-center border-r border-[var(--border-danger)] bg-[var(--bg-surface)] py-8 md:flex"
        >
          {sidebarSlot}
        </aside>
      )}

      <div className="flex min-h-screen flex-col pl-0 md:pl-16">
        {headerSlot && (
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 px-6 backdrop-blur-md">
            {headerSlot}
          </header>
        )}

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8 md:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}

export interface CardProps {
  title: string;
  category?: string;
  metadata?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  actionSlot?: ReactNode;
  mediaSlot?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
}

export function InteractiveCard({
  title,
  category,
  metadata,
  isActive = false,
  isDisabled = false,
  actionSlot,
  mediaSlot,
  children,
  onClick,
}: CardProps) {
  return (
    <article
      role="article"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
      aria-selected={isActive}
      onClick={isDisabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative overflow-hidden rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--bg-surface-glass)] p-6 backdrop-blur-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-neon)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] ${
        isActive
          ? 'border-l-4 border-l-[var(--accent-neon)] bg-[var(--bg-surface-active)] shadow-[var(--shadow-neon-sm)]'
          : 'border-l-4 border-l-transparent hover:border-[var(--border-accent)] hover:bg-[var(--bg-surface-hover)]'
      } ${isDisabled ? 'pointer-events-none opacity-40' : 'cursor-pointer'}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {mediaSlot && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-[var(--bg-surface)] text-[var(--accent-neon)]">
              {mediaSlot}
            </div>
          )}

          <div className="flex flex-col">
            {(category || metadata) && (
              <div className="flex items-center gap-2 font-mono text-[var(--text-xs)] uppercase tracking-[var(--tracking-widest)] text-[var(--text-muted)]">
                {category && <span>{category}</span>}
                {category && metadata && <span>/</span>}
                {metadata && <span>{metadata}</span>}
              </div>
            )}
            <h3 className="text-[var(--text-lg)] font-bold tracking-[var(--tracking-tight)] text-[var(--text-primary)] group-hover:text-[var(--accent-neon)] transition-colors">
              {title}
            </h3>
          </div>
        </div>

        {children && <div className="text-[var(--text-base)] text-[var(--text-secondary)]">{children}</div>}

        {actionSlot && <div className="shrink-0">{actionSlot}</div>}
      </div>
    </article>
  );
}
