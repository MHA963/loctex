import { describe, it, expect } from 'vitest';
import { LaTeXErrorParser } from '../server/compiler/error-parser.ts';

describe('LaTeXErrorParser Tests', () => {
  it('should parse syntax error with line number and excerpt', () => {
    const log = `
This is XeTeX, Version 3.141592653-2.6-0.999994 (TeX Live 2022) (preloaded format=xelatex)
(./main.tex
! Undefined control sequence.
l.24 \\sectioin
              {Methodology}
The control sequence at the end of the top line
of your error message was never \\def'ed.
)
    `;

    const errors = LaTeXErrorParser.parse(log, 'main.tex');
    expect(errors.length).toBe(1);
    expect(errors[0].severity).toBe('error');
    expect(errors[0].line).toBe(24);
    expect(errors[0].message).toContain('Undefined control sequence');
  });

  it('should parse LaTeX warnings with line numbers', () => {
    const log = `
(./introduction.tex
LaTeX Warning: Citation 'smith2024' on page 1 undefined on input line 42.
)
    `;

    const errors = LaTeXErrorParser.parse(log, 'main.tex');
    expect(errors.length).toBe(1);
    expect(errors[0].severity).toBe('warning');
    expect(errors[0].line).toBe(42);
    expect(errors[0].message).toContain("Citation 'smith2024'");
  });

  it('should parse math mode missing dollar error', () => {
    const log = `
(./main.tex
! Missing $ inserted.
<inserted text> 
                $
l.15 \\alpha
           + \\beta = 1
)
    `;
    const errors = LaTeXErrorParser.parse(log, 'main.tex');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].severity).toBe('error');
    expect(errors[0].line).toBe(15);
    expect(errors[0].message).toContain('Missing $ inserted');
  });

  it('should return empty array for clean compilation log', () => {
    const log = `
Output written on main.pdf (1 page, 114491 bytes).
SyncTeX written on main.synctex.gz.
Transcript written on main.log.
    `;
    const errors = LaTeXErrorParser.parse(log, 'main.tex');
    expect(errors.length).toBe(0);
  });
});
