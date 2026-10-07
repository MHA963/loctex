import React, { ReactNode } from 'react';

export interface PageShellProps {
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  children: ReactNode;
}

/** Canonical Page Shell: responsive container max-widths, viewport structure, and slot composition */
export const PageShell: React.FC<PageShellProps> = ({ headerSlot, footerSlot, children }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-canvas)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-family-sans)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {headerSlot && (
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: 'var(--color-bg-glass)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {headerSlot}
          </div>
        </header>
      )}

      <main style={{ flex: 1, width: '100%', maxWidth: '80rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        {children}
      </main>

      {footerSlot && (
        <footer style={{ borderTop: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-surface)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
            {footerSlot}
          </div>
        </footer>
      )}
    </div>
  );
};

export interface CompositeCardProps {
  title: string;
  subtitle?: string;
  badgeSlot?: ReactNode;
  actionSlot?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

/** Reusable Composite Component: slot patterns, typography hierarchy, and accessibility */
export const CompositeCard: React.FC<CompositeCardProps> = ({
  title,
  subtitle,
  badgeSlot,
  actionSlot,
  children,
  onClick,
  ariaLabel,
}) => {
  const isInteractive = Boolean(onClick);

  return (
    <article
      role={isInteractive ? 'button' : 'region'}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel || title}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        cursor: isInteractive ? 'pointer' : 'default',
        outline: 'none',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {badgeSlot && <div>{badgeSlot}</div>}
          <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.25rem', fontWeight: 'var(--font-weight-bold)', letterSpacing: 'var(--letter-spacing-tight)', color: 'var(--color-text-primary)', margin: 0 }}>
            {title}
          </h3>
          {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>{subtitle}</p>}
        </div>
        {actionSlot && <div style={{ flexShrink: 0 }}>{actionSlot}</div>}
      </header>

      {children && (
        <div style={{ color: 'var(--color-text-primary)', fontSize: '1rem', lineHeight: 1.6 }}>
          {children}
        </div>
      )}
    </article>
  );
};
