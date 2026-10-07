import React, { type ReactNode } from 'react';

export interface PageShellProps {
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  children: ReactNode;
}

export function PageShell({ headerSlot, footerSlot, children }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] font-[family-name:var(--font-sans)]">
      {headerSlot && (
        <header className="sticky top-0 z-30 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
          <div className="mx-auto w-full max-w-7xl px-6 py-4 flex items-center justify-between">
            {headerSlot}
          </div>
        </header>
      )}

      <main className="flex-1 w-full mx-auto max-w-7xl px-6 py-12 md:py-16">
        {children}
      </main>

      {footerSlot && (
        <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="mx-auto w-full max-w-7xl px-6 py-8 text-sm text-[var(--text-muted)]">
            {footerSlot}
          </div>
        </footer>
      )}
    </div>
  );
}

export interface ContentCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionSlot?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

export function ContentCard({
  eyebrow,
  title,
  description,
  actionSlot,
  children,
  onClick,
  ariaLabel,
}: ContentCardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <article
      role={isInteractive ? 'button' : 'article'}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel ?? title}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`group relative flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 md:p-8 transition-all duration-300 ${
        isInteractive
          ? 'cursor-pointer hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]'
          : ''
      }`}
    >
      <header className="mb-4 flex flex-col gap-2">
        {eyebrow && (
          <span className="text-[length:var(--font-size-xs)] uppercase tracking-[var(--letter-spacing-widest)] text-[var(--text-accent)] font-medium">
            {eyebrow}
          </span>
        )}
        <h3 className="font-[family-name:var(--font-serif)] text-[length:var(--font-size-2xl)] font-normal tracking-tight text-[var(--text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="text-[length:var(--font-size-base)] text-[var(--text-muted)] leading-relaxed">
            {description}
          </p>
        )}
      </header>

      {children && <div className="flex-1 my-4">{children}</div>}

      {actionSlot && (
        <footer className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border-subtle)]">
          {actionSlot}
        </footer>
      )}
    </article>
  );
}
