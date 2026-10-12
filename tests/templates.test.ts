import { describe, it, expect } from 'vitest';
import { STARTER_TEMPLATES } from '../src/components/Modals.tsx';

describe('Starter Templates Specification Tests', () => {
  it('should define all 4 required academic templates with metadata', () => {
    const ids = STARTER_TEMPLATES.map((t) => t.id);
    expect(ids).toContain('ieeetran');
    expect(ids).toContain('article');
    expect(ids).toContain('beamer');
    expect(ids).toContain('cv');
    expect(STARTER_TEMPLATES.length).toBe(4);
  });

  it('should have non-empty titles, descriptions, and badges for each template', () => {
    for (const tmpl of STARTER_TEMPLATES) {
      expect(tmpl.name.length).toBeGreaterThan(0);
      expect(tmpl.description.length).toBeGreaterThan(10);
      expect(tmpl.badge.length).toBeGreaterThan(0);
      expect(tmpl.icon).toBeDefined();
    }
  });

  it('should assign IEEEtran as the default template option', () => {
    expect(STARTER_TEMPLATES[0].id).toBe('ieeetran');
    expect(STARTER_TEMPLATES[0].badge).toBe('IEEEtran');
  });
});
