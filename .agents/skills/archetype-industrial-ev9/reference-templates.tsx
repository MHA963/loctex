import React from 'react';

/**
 * PageShell - Canonical responsive layout wrapper with slot composition
 */
export interface PageShellProps {
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({
  headerSlot,
  footerSlot,
  children,
  className = '',
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-[family-name:var(--font-sans)] antialiased">
      {headerSlot && (
        <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 md:px-8 py-4 flex items-center justify-between">
            {headerSlot}
          </div>
        </header>
      )}

      <main className={`flex-1 w-full mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-20 ${className}`}>
        {children}
      </main>

      {footerSlot && (
        <footer className="w-full border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] py-8">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            {footerSlot}
          </div>
        </footer>
      )}
    </div>
  );
};

/**
 * ShowcaseCard - Reusable composite container with slot composition and accessibility
 */
export interface ShowcaseCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionSlot?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  isInteractive?: boolean;
}

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  eyebrow,
  title,
  description,
  actionSlot,
  children,
  className = '',
  isInteractive = false,
}) => {
  return (
    <article
      role={isInteractive ? 'button' : 'region'}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={title}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 md:p-8 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-interactive-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] ${
        isInteractive
          ? 'cursor-pointer hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-elevated)]'
          : ''
      } ${className}`}
    >
      <header className="flex flex-col gap-2">
        {eyebrow && (
          <span className="text-[var(--font-size-xs)] font-medium tracking-[var(--letter-spacing-wide)] text-[var(--color-accent-base)] uppercase">
            {eyebrow}
          </span>
        )}
        <h3 className="font-[family-name:var(--font-display)] text-[var(--font-size-xl)] md:text-[var(--font-size-2xl)] font-bold tracking-[var(--letter-spacing-tight)] text-[var(--color-text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-[var(--font-size-sm)] md:text-[var(--font-size-base)] leading-[var(--line-height-normal)] text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
      </header>

      {children && (
        <div className="my-6 w-full text-[var(--color-text-primary)]">
          {children}
        </div>
      )}

      {actionSlot && (
        <footer className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
          {actionSlot}
        </footer>
      )}
    </article>
  );
};
