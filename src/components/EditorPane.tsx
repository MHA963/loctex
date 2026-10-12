import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { StreamLanguage, syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { stex } from '@codemirror/legacy-modes/mode/stex';
import { tags as t } from '@lezer/highlight';
import { DiagnosticError } from '../types/index.ts';

export interface EditorPaneRef {
  wrapSelection: (prefix: string, suffix: string) => void;
  insertSnippet: (snippet: string) => void;
  jumpToLine: (line: number) => void;
}

interface EditorPaneProps {
  content: string;
  onChange: (value: string) => void;
  diagnostics: DiagnosticError[];
  onLineClick?: (line: number) => void;
  activeLine?: number | null;
}

// Custom Vibrant LaTeX Highlight Style
const latexHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#38bdf8', fontWeight: 'bold' }, // \documentclass, \section, \begin
  { tag: t.atom, color: '#d4af37' }, // LaTeX macros & commands
  { tag: t.bracket, color: '#fbbf24' }, // { } and [ ]
  { tag: t.string, color: '#a7f3d0' }, // Strings & text arguments
  { tag: t.comment, color: '#64748b', fontStyle: 'italic' }, // % Comments
  { tag: t.number, color: '#f472b6' }, // Numbers & dimensions (11pt)
  { tag: t.variableName, color: '#e2e8f0' }, // Identifiers
  { tag: t.propertyName, color: '#fb923c' }, // Options & tags
  { tag: t.operator, color: '#38bdf8' }, // Math operators
  { tag: t.heading, color: '#38bdf8', fontWeight: 'bold' },
]);

export const EditorPane = forwardRef<EditorPaneRef, EditorPaneProps>(
  ({ content, onChange, diagnostics, onLineClick, activeLine }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    // Expose imperative methods for topbar formatting
    useImperativeHandle(ref, () => ({
      wrapSelection: (prefix: string, suffix: string) => {
        if (!viewRef.current) return;
        const { state } = viewRef.current;
        const selection = state.selection.main;
        const selectedText = state.sliceDoc(selection.from, selection.to);
        const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

        viewRef.current.dispatch({
          changes: { from: selection.from, to: selection.to, insert: replacement },
          selection: {
            anchor: selection.from + prefix.length,
            head: selection.from + prefix.length + (selectedText.length || 4),
          },
        });
        viewRef.current.focus();
      },
      insertSnippet: (snippet: string) => {
        if (!viewRef.current) return;
        const { state } = viewRef.current;
        const selection = state.selection.main;
        viewRef.current.dispatch({
          changes: { from: selection.from, to: selection.to, insert: snippet },
          selection: { anchor: selection.from + snippet.length },
        });
        viewRef.current.focus();
      },
      jumpToLine: (line: number) => {
        if (!viewRef.current || line <= 0) return;
        try {
          const docLine = viewRef.current.state.doc.line(Math.min(line, viewRef.current.state.doc.lines));
          viewRef.current.dispatch({
            selection: { anchor: docLine.from },
            scrollIntoView: true,
          });
          viewRef.current.focus();
        } catch (e) {
          // ignore out of bounds
        }
      },
    }));

    // Autocomplete for standard LaTeX commands and citations
    const latexCompletions = (context: CompletionContext) => {
      const word = context.matchBefore(/\\[a-zA-Z]*/);
      if (!word) return null;
      if (word.from === word.to && !context.explicit) return null;

      return {
        from: word.from,
        options: [
          { label: '\\section', type: 'keyword', info: 'Section heading' },
          { label: '\\subsection', type: 'keyword', info: 'Subsection heading' },
          { label: '\\subsubsection', type: 'keyword', info: 'Subsubsection heading' },
          { label: '\\begin{equation}', type: 'snippet', apply: '\\begin{equation}\n  ${}\n\\end{equation}' },
          { label: '\\begin{figure}', type: 'snippet', apply: '\\begin{figure}[htbp]\n  \\centering\n  \\includegraphics[width=0.8\\linewidth]{${}}\n  \\caption{${}}\n  \\label{fig:${}}\n\\end{figure}' },
          { label: '\\begin{table}', type: 'snippet', apply: '\\begin{table}[htbp]\n  \\centering\n  \\begin{tabular}{|c|c|}\n    \\hline\n    A & B \\\\\n    \\hline\n  \\end{tabular}\n  \\caption{${}}\n\\end{table}' },
          { label: '\\cite', type: 'function', info: 'BibTeX Citation' },
          { label: '\\ref', type: 'function', info: 'Cross reference' },
          { label: '\\eqref', type: 'function', info: 'Equation reference' },
          { label: '\\textbf', type: 'function', info: 'Bold text' },
          { label: '\\textit', type: 'function', info: 'Italic text' },
          { label: '\\underline', type: 'function', info: 'Underline text' },
          { label: '\\texttt', type: 'function', info: 'Monospace code text' },
          { label: '\\usepackage', type: 'keyword', info: 'Import LaTeX package' },
          { label: '\\item', type: 'keyword', info: 'List item' },
        ],
      };
    };

    useEffect(() => {
      if (!editorRef.current) return;

      const editorTheme = EditorView.theme({
        '&': {
          color: '#f4f2ec',
          backgroundColor: 'var(--bg-primary, #0e0d0b)',
          fontSize: '13.5px',
          fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', monospace",
          height: '100%',
          lineHeight: '1.6',
        },
        '.cm-content': {
          caretColor: '#d4af37',
          padding: '16px 0',
        },
        '.cm-cursor': {
          borderLeftColor: '#d4af37',
          borderLeftWidth: '2px',
        },
        '.cm-gutters': {
          backgroundColor: 'var(--bg-primary, #0e0d0b)',
          color: '#525048',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          paddingRight: '10px',
          paddingLeft: '4px',
        },
        '.cm-activeLine': {
          backgroundColor: 'rgba(212, 175, 55, 0.07)',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'rgba(212, 175, 55, 0.15)',
          color: '#d4af37',
          fontWeight: 'bold',
        },
        '.cm-selectionBackground, ::selection': {
          backgroundColor: 'rgba(212, 175, 55, 0.25) !important',
        },
      });

      const startState = EditorState.create({
        doc: content,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          StreamLanguage.define(stex),
          syntaxHighlighting(latexHighlightStyle),
          autocompletion({ override: [latexCompletions] }),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          editorTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newDoc = update.state.doc.toString();
              onChange(newDoc);
            }
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
      };
    }, []);

    // Sync content when changed externally (e.g. from file switch or PDF direct edit)
    useEffect(() => {
      if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: content },
        });
      }
    }, [content]);

    // Jump to line if activeLine provided
    useEffect(() => {
      if (viewRef.current && activeLine && activeLine > 0) {
        try {
          const docLine = viewRef.current.state.doc.line(Math.min(activeLine, viewRef.current.state.doc.lines));
          viewRef.current.dispatch({
            selection: { anchor: docLine.from, head: docLine.to },
            scrollIntoView: true,
          });
          viewRef.current.focus();
        } catch (e) {
          // ignore
        }
      }
    }, [activeLine]);

    return (
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] border-r border-[#24221e] relative overflow-hidden">
        {/* Full Height CodeMirror LaTeX Editor with Syntax Colors */}
        <div className="flex-1 h-full overflow-auto" ref={editorRef} />
      </div>
    );
  }
);
