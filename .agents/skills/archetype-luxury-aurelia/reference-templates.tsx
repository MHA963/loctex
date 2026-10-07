import React, { type ReactNode, type HTMLAttributes } from 'react';

export interface PageShellProps {
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface SectionCardProps extends HTMLAttributes<HTMLElement> {
  badge?: string;
  title: string;
  description?: string;
  actionSlot?: ReactNode;
  children?: ReactNode;
  isInteractive?: boolean;
}

export const PageShell: React.FC<PageShellProps> = ({
  headerSlot,
  footerSlot,
  children,
  className = '',
}) => {
  return (
    <div
      className={`min-h-screen flex flex-col ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {headerSlot && (
        <header
          role="banner"
          className="sticky top-0 z-50 w-full backdrop-blur-md"
          style={{
            backgroundColor: 'var(--color-bg-overlay)',
            borderBottom: '1px solid var(--color-border-dark)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {headerSlot}
          </div>
        </header>
      )}

      <main role="main" className="flex-1 w-full max-w-7xl mx-auto px-6 py-16">
        {children}
      </main>

      {footerSlot && (
        <footer
          role="contentinfo"
          className="w-full mt-auto"
          style={{
            backgroundColor: 'var(--color-bg-dark)',
            color: 'var(--color-text-inverse-muted)',
            borderTop: '1px solid var(--color-border-dark)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-12">{footerSlot}</div>
        </footer>
      )}
    </div>
  );
};

export const SectionCard: React.FC<SectionCardProps> = ({
  badge,
  title,
  description,
  actionSlot,
  children,
  isInteractive = false,
  className = '',
  ...rest
}) => {
  return (
    <article
      role={isInteractive ? 'button' : 'region'}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={title}
      className={`group relative overflow-hidden transition-all duration-300 outline-none focus-visible:ring-2 ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-xs)',
        padding: 'var(--spacing-8)',
        boxShadow: 'var(--shadow-subtle)',
      }}
      {...rest}
    >
      <header className="flex flex-col gap-2 mb-6">
        {badge && (
          <span
            className="text-xs uppercase tracking-[var(--tracking-widest)] font-semibold"
            style={{ color: 'var(--color-accent-bronze)' }}
          >
            {badge}
          </span>
        )}
        <h2
          className="text-3xl md:text-4xl font-normal leading-tight"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="text-sm md:text-base font-light leading-relaxed max-w-xl"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {description}
          </p>
        )}
      </header>

      {children && <div className="w-full mb-6">{children}</div>}

      {actionSlot && (
        <footer
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: 'var(--color-border-light)' }}
        >
          {actionSlot}
        </footer>
      )}
    </article>
  );
};
