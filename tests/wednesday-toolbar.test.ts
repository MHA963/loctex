import { describe, it, expect } from 'vitest';
import {
  applyFontFamily,
  applyFontSize,
  applyFormatEdit,
  detectSelectionFormat,
  toggleInlineFormat,
} from '../src/utils/latex-format.ts';

describe('Wednesday Toolbar Formatting: Reversible B / I / U & Font / Size Macros', () => {
  describe('Reversible Inline Formatting (Bold, Italic, Underline)', () => {
    it('wraps unformatted text in \\textbf on first click and unwarps on second click', () => {
      const doc = 'Introductory paragraph with key thesis statement.';
      const from = doc.indexOf('key thesis');
      const to = from + 'key thesis'.length;

      // 1st click: wrap
      const edit1 = toggleInlineFormat(doc, from, to, 'bold');
      const doc1 = applyFormatEdit(doc, edit1);
      expect(doc1).toBe('Introductory paragraph with \\textbf{key thesis} statement.');

      // 2nd click: selection inside or enclosing the \textbf macro
      const edit2 = toggleInlineFormat(doc1, edit1.selectionFrom, edit1.selectionTo, 'bold');
      const doc2 = applyFormatEdit(doc1, edit2);
      expect(doc2).toBe(doc); // cleanly unwrapped back to original!
    });

    it('unwraps \\textbf when selection exactly matches the entire macro', () => {
      const doc = 'Some \\textbf{emphasized text} here.';
      const from = doc.indexOf('\\textbf{emphasized text}');
      const to = from + '\\textbf{emphasized text}'.length;

      const edit = toggleInlineFormat(doc, from, to, 'bold');
      const result = applyFormatEdit(doc, edit);
      expect(result).toBe('Some emphasized text here.');
    });

    it('unwraps \\textit when cursor/selection is inside the macro content', () => {
      const doc = 'Check \\textit{experimental observations} now.';
      const from = doc.indexOf('observations');
      const to = from + 'observations'.length;

      const edit = toggleInlineFormat(doc, from, to, 'italic');
      const result = applyFormatEdit(doc, edit);
      expect(result).toBe('Check experimental observations now.');
    });

    it('unwraps \\underline without leaving dangling braces or corrupting adjacent text', () => {
      const doc = 'Alpha \\underline{beta gamma} delta';
      const from = doc.indexOf('beta');
      const to = doc.indexOf('gamma') + 'gamma'.length;

      const edit = toggleInlineFormat(doc, from, to, 'underline');
      const result = applyFormatEdit(doc, edit);
      expect(result).toBe('Alpha beta gamma delta');
    });

    it('inserts placeholder \\textbf{text} when selection is empty (collapsed cursor)', () => {
      const doc = 'Start here: ';
      const cursor = doc.length;

      const edit = toggleInlineFormat(doc, cursor, cursor, 'bold');
      const result = applyFormatEdit(doc, edit);
      expect(result).toBe('Start here: \\textbf{text}');
      expect(edit.selectionFrom).toBe('Start here: \\textbf{'.length);
      expect(edit.selectionTo).toBe('Start here: \\textbf{text'.length);
    });
  });

  describe('Font Family Macros (\\textrm, \\textsf, \\texttt)', () => {
    it('applies \\textsf to selected text', () => {
      const doc = 'Modern Sans Heading';
      const edit = applyFontFamily(doc, 0, doc.length, 'sf');
      expect(edit).not.toBeNull();
      const result = applyFormatEdit(doc, edit!);
      expect(result).toBe('\\textsf{Modern Sans Heading}');
    });

    it('replaces \\textsf with \\texttt cleanly without nesting macros', () => {
      const doc = 'Before \\textsf{important snippet} after';
      const from = doc.indexOf('important snippet');
      const to = from + 'important snippet'.length;

      // Select inner text and apply typewriter / monospace
      const edit = applyFontFamily(doc, from, to, 'tt');
      expect(edit).not.toBeNull();
      const result = applyFormatEdit(doc, edit!);
      expect(result).toBe('Before \\texttt{important snippet} after');
      expect(result).not.toContain('\\textsf');
    });

    it('removes font family wrapper when "default" is selected', () => {
      const doc = 'Value is \\texttt{CONST_MAX} in header';
      const from = doc.indexOf('CONST_MAX');
      const to = from + 'CONST_MAX'.length;

      const edit = applyFontFamily(doc, from, to, 'default');
      expect(edit).not.toBeNull();
      const result = applyFormatEdit(doc, edit!);
      expect(result).toBe('Value is CONST_MAX in header');
    });
  });

  describe('Font Size Declarations ({\\small ...}, {\\large ...})', () => {
    it('applies {\\small ...} to highlighted text', () => {
      const doc = 'Standard text footnote note at bottom.';
      const from = doc.indexOf('footnote note');
      const to = from + 'footnote note'.length;

      const edit = applyFontSize(doc, from, to, 'small');
      expect(edit).not.toBeNull();
      const result = applyFormatEdit(doc, edit!);
      expect(result).toBe('Standard text {\\small footnote note} at bottom.');
    });

    it('replaces existing font size declaration without nesting or leaving residual braces', () => {
      const doc = 'Title is {\\small preliminary header} today.';
      const from = doc.indexOf('preliminary');
      const to = from + 'preliminary header'.length;

      const edit = applyFontSize(doc, from, to, 'huge');
      expect(edit).not.toBeNull();
      const result = applyFormatEdit(doc, edit!);
      expect(result).toBe('Title is {\\huge preliminary header} today.');
      expect(result).not.toContain('\\small');
    });

    it('removes font size declaration when normalsize is applied', () => {
      const doc = 'Section {\\Large Big Title} body';
      const from = doc.indexOf('Big Title');
      const to = from + 'Big Title'.length;

      const edit = applyFontSize(doc, from, to, 'normalsize');
      expect(edit).not.toBeNull();
      const result = applyFormatEdit(doc, edit!);
      expect(result).toBe('Section Big Title body');
    });
  });

  describe('Live Selection Format Detection (detectSelectionFormat)', () => {
    it('detects nested bold and italic active states when cursor is inside both', () => {
      const doc = 'Mixed \\textbf{\\textit{nested formatted text}} content.';
      const cursor = doc.indexOf('nested');

      const format = detectSelectionFormat(doc, cursor, cursor + 6);
      expect(format.bold).toBe(true);
      expect(format.italic).toBe(true);
      expect(format.underline).toBe(false);
      expect(format.fontFamily).toBe('default');
      expect(format.fontSize).toBe('normalsize');
    });

    it('detects active font family and font size macros correctly', () => {
      const doc = 'Complex {\\small \\texttt{code snippet}} in doc.';
      const cursor = doc.indexOf('code');

      const format = detectSelectionFormat(doc, cursor, cursor + 4);
      expect(format.bold).toBe(false);
      expect(format.fontFamily).toBe('tt');
      expect(format.fontSize).toBe('small');
    });

    it('returns default format states on plain unformatted text', () => {
      const doc = 'Pure plain unadorned text without any macros.';
      const format = detectSelectionFormat(doc, 5, 15);
      expect(format).toEqual({
        bold: false,
        italic: false,
        underline: false,
        fontFamily: 'default',
        fontSize: 'normalsize',
      });
    });
  });
});
