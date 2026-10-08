import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import katex from 'katex';
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

export const EditorPane = forwardRef<EditorPaneRef, EditorPaneProps>(
  ({ content, onChange, diagnostics, onLineClick, activeLine }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [inlineMath, setInlineMath] = useState<string | null>('\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}');

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
          selection: { anchor: selection.from + prefix.length, head: selection.from + prefix.length + (selectedText.length || 4) },
        });
      },
      insertSnippet: (snippet: string) => {
        if (!viewRef.current) return;
        const { state } = viewRef.current;
        const selection = state.selection.main;
        viewRef.current.dispatch({
          changes: { from: selection.from, to: selection.to, insert: snippet },
          selection: { anchor: selection.from + snippet.length },
        });
      },
      jumpToLine: (line: number) => {
        if (!viewRef.current || line <= 0) return;
        try {
          const docLine = viewRef.current.state.doc.line(Math.min(line, viewRef.current.state.doc.lines));
          viewRef.current.dispatch({
            selection: { anchor: docLine.from },
            scrollIntoView: true,
          });
        } catch (e) {
          // ignore
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
          { label: '\\begin{equation}', type: 'snippet', apply: '\\begin{equation}\n  ${}\n\\end{equation}' },
          { label: '\\begin{figure}', type: 'snippet', apply: '\\begin{figure}[htbp]\n  \\centering\n  \\includegraphics[width=0.8\\linewidth]{${}}\n  \\caption{${}}\n  \\label{fig:${}}\n\\end{figure}' },
          { label: '\\begin{table}', type: 'snippet', apply: '\\begin{table}[htbp]\n  \\centering\n  \\begin{tabular}{|c|c|}\n    \\hline\n    A & B \\\\\n    \\hline\n  \\end{tabular}\n  \\caption{${}}\n\\end{table}' },
          { label: '\\cite', type: 'function', info: 'BibTeX Citation' },
          { label: '\\ref', type: 'function', info: 'Cross reference' },
          { label: '\\textbf', type: 'function', info: 'Bold text' },
          { label: '\\textit', type: 'function', info: 'Italic text' },
          { label: '\\underline', type: 'function', info: 'Underline text' },
          { label: '\\texttt', type: 'function', info: 'Monospace text' },
          { label: '\\usepackage', type: 'keyword', info: 'Import LaTeX package' },
        ],
      };
    };

    useEffect(() => {
      if (!editorRef.current) return;

      const darkTheme = EditorView.theme({
        '&': {
          color: 'var(--text-primary)',
          backgroundColor: 'var(--bg-primary)',
          fontSize: '13px',
          fontFamily: "'Geist Mono', 'Fira Code', monospace",
          height: '100%',
        },
        '.cm-content': {
          caretColor: 'var(--accent-primary)',
          padding: '16px 0',
        },
        '.cm-cursor': {
          borderLeftColor: 'var(--accent-primary)',
        },
        '.cm-gutters': {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          borderRight: '1px solid var(--border-color-subtle)',
          paddingRight: '8px',
        },
        '.cm-activeLine': {
          backgroundColor: 'var(--bg-surface)',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'var(--bg-surface-hover)',
          color: 'var(--accent-primary)',
        },
      });

      const startState = EditorState.create({
        doc: content,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          autocompletion({ override: [latexCompletions] }),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          darkTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newDoc = update.state.doc.toString();
              onChange(newDoc);

              // Extract main equation for inline math preview card
              const match = newDoc.match(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/);
              if (match && match[1]) {
                setInlineMath(match[1].replace(/\\label\{[^}]*\}/g, '').trim());
              }
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

    // Sync content when changed externally
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
          const line = viewRef.current.state.doc.line(Math.min(activeLine, viewRef.current.state.doc.lines));
          viewRef.current.dispatch({
            selection: { anchor: line.from },
            scrollIntoView: true,
          });
        } catch (e) {
          // ignore
        }
      }
    }, [activeLine]);

    const renderMathHtml = (tex: string) => {
      try {
        return katex.renderToString(tex, { displayMode: true, throwOnError: false });
      } catch (e) {
        return tex;
      }
    };

    return (
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] border-r border-[var(--border-color-subtle)] relative overflow-hidden">
        <div className="flex-1 overflow-auto" ref={editorRef} />

        {/* Inline Math Equation Preview Card */}
        {inlineMath && (
          <div className="m-4 p-4 rounded-xl bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-2xl transition-all">
            <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] mb-2 flex items-center justify-between">
              <span>Inline Math Preview</span>
              <span className="text-[var(--accent-primary)] font-semibold">LaTeX (KaTeX)</span>
            </div>
            <div
              className="text-center py-2 text-[var(--text-primary)] overflow-x-auto text-base select-none"
              dangerouslySetInnerHTML={{ __html: renderMathHtml(inlineMath) }}
            />
          </div>
        )}
      </div>
    );
  }
);
