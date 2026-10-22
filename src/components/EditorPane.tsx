import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { StreamLanguage, syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { stex } from '@codemirror/legacy-modes/mode/stex';
import { tags as t } from '@lezer/highlight';
import {
  AIChatIntent,
  ChatMessage,
  DiagnosticError,
  QwenModelId,
} from '../types/index.ts';
import {
  FontFamilyCommand,
  FontSizeCommand,
  FormatEdit,
  InlineToggleKind,
  SelectionFormatState,
  applyFontFamily,
  applyFontSize,
  detectSelectionFormat,
  toggleInlineFormat,
} from '../utils/latex-format.ts';
import { QwenChatDrawer } from './QwenChatDrawer.tsx';

export interface PastedAssetPayload {
  fileName: string;
  base64Data?: string;
  svgContent?: string;
}

export function isRawSvgMarkup(text: string): boolean {
  const trimmed = (text || '').trim();
  if (trimmed.length < 20) return false;
  return /^(?:<\?xml[^>]*>\s*)?<svg[\s>][\s\S]*<\/svg>$/i.test(trimmed);
}

export function buildPastedImageLatexSnippet(assetPath: string): string {
  const normalizedPath = assetPath.replace(/\\/g, '/');
  const baseLabel = normalizedPath
    .split('/')
    .pop()
    ?.replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_') || 'image';

  return [
    '\\begin{figure}[htbp]',
    '  \\centering',
    `  \\includegraphics[width=0.8\\linewidth,keepaspectratio]{${normalizedPath}}`,
    '  \\caption{}',
    `  \\label{fig:${baseLabel}}`,
    '\\end{figure}',
  ].join('\n');
}

export interface EditorPaneRef {
  wrapSelection: (prefix: string, suffix: string) => void;
  toggleInlineFormat: (kind: InlineToggleKind) => void;
  applyFontFamily: (family: FontFamilyCommand) => void;
  applyFontSize: (size: FontSizeCommand) => void;
  insertSnippet: (snippet: string) => void;
  replaceSelection: (replacement: string) => void;
  jumpToLine: (line: number) => void;
}

interface EditorPaneProps {
  content: string;
  onChange: (value: string) => void;
  diagnostics: DiagnosticError[];
  onLineClick?: (line: number) => void;
  activeLine?: number | null;
  onCompile?: () => void;
  onPasteAsset?: (payload: PastedAssetPayload) => Promise<string | null>;
  onSelectionFormatChange?: (formatState: SelectionFormatState, selectedText: string) => void;
  chatDrawerOpen?: boolean;
  onToggleChatDrawer?: () => void;
  chatMessages?: ChatMessage[];
  onSendChatMessage?: (message: string, intent: AIChatIntent, model: QwenModelId) => Promise<void>;
  onClearChatHistory?: () => Promise<void>;
  activeAiModel?: QwenModelId;
  onSelectAiModel?: (model: QwenModelId) => void;
  isAiGenerating?: boolean;
}

// Custom Vibrant LaTeX Highlight Style supporting all dynamic themes
const latexHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--syntax-keyword, #38bdf8)', fontWeight: 'bold' }, // \documentclass, \section, \begin
  { tag: t.atom, color: 'var(--syntax-atom, #d4af37)' }, // LaTeX macros & commands
  { tag: t.bracket, color: 'var(--syntax-bracket, #fbbf24)' }, // { } and [ ]
  { tag: t.string, color: 'var(--syntax-string, #a7f3d0)' }, // Strings & text arguments
  { tag: t.comment, color: 'var(--syntax-comment, #64748b)', fontStyle: 'italic' }, // % Comments
  { tag: t.number, color: 'var(--syntax-number, #f472b6)' }, // Numbers & dimensions (11pt)
  { tag: t.variableName, color: 'var(--syntax-variable, #e2e8f0)' }, // Identifiers
  { tag: t.propertyName, color: 'var(--syntax-property, #fb923c)' }, // Options & tags
  { tag: t.operator, color: 'var(--syntax-keyword, #38bdf8)' }, // Math operators
  { tag: t.heading, color: 'var(--syntax-keyword, #38bdf8)', fontWeight: 'bold' },
]);

export const EditorPane = forwardRef<EditorPaneRef, EditorPaneProps>(
  (
    {
      content,
      onChange,
      diagnostics,
      onLineClick,
      activeLine,
      onCompile,
      onPasteAsset,
      onSelectionFormatChange,
      chatDrawerOpen,
      onToggleChatDrawer,
      chatMessages,
      onSendChatMessage,
      onClearChatHistory,
      activeAiModel,
      onSelectAiModel,
      isAiGenerating,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [currentSelectionText, setCurrentSelectionText] = useState('');
    const onCompileRef = useRef(onCompile);
    const onPasteAssetRef = useRef(onPasteAsset);
    const onSelectionFormatChangeRef = useRef(onSelectionFormatChange);

    useEffect(() => {
      onSelectionFormatChangeRef.current = onSelectionFormatChange;
    }, [onSelectionFormatChange]);

    useEffect(() => {
      onCompileRef.current = onCompile;
    }, [onCompile]);

    useEffect(() => {
      onPasteAssetRef.current = onPasteAsset;
    }, [onPasteAsset]);

    const dispatchFormatEdit = (edit: FormatEdit | null) => {
      if (!viewRef.current || !edit) return;
      viewRef.current.dispatch({
        changes: { from: edit.from, to: edit.to, insert: edit.insert },
        selection: { anchor: edit.selectionFrom, head: edit.selectionTo },
      });
      viewRef.current.focus();
    };

    // Expose imperative methods for topbar formatting
    useImperativeHandle(ref, () => ({
      toggleInlineFormat: (kind: InlineToggleKind) => {
        if (!viewRef.current) return;
        const { state } = viewRef.current;
        const { from, to } = state.selection.main;
        dispatchFormatEdit(toggleInlineFormat(state.doc.toString(), from, to, kind));
      },
      applyFontFamily: (family: FontFamilyCommand) => {
        if (!viewRef.current) return;
        const { state } = viewRef.current;
        const { from, to } = state.selection.main;
        dispatchFormatEdit(applyFontFamily(state.doc.toString(), from, to, family));
      },
      applyFontSize: (size: FontSizeCommand) => {
        if (!viewRef.current) return;
        const { state } = viewRef.current;
        const { from, to } = state.selection.main;
        dispatchFormatEdit(applyFontSize(state.doc.toString(), from, to, size));
      },
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
      replaceSelection: (replacement: string) => {
        if (!viewRef.current) return;
        const { state } = viewRef.current;
        const { from, to } = state.selection.main;
        viewRef.current.dispatch({
          changes: { from, to, insert: replacement },
          selection: { anchor: from + replacement.length },
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
          color: 'var(--text-primary, #f4f2ec)',
          backgroundColor: 'var(--bg-primary, #0e0d0b)',
          fontSize: '13.5px',
          fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', monospace",
          height: '100%',
          lineHeight: '1.6',
        },
        '.cm-content': {
          caretColor: 'var(--accent-primary, #d4af37)',
          padding: '16px 0',
        },
        '.cm-cursor': {
          borderLeftColor: 'var(--accent-primary, #d4af37)',
          borderLeftWidth: '2px',
        },
        '.cm-gutters': {
          backgroundColor: 'var(--syntax-gutter-bg, var(--bg-secondary, #141311))',
          color: 'var(--syntax-gutter-text, #525048)',
          borderRight: '1px solid var(--border-color-subtle, rgba(255, 255, 255, 0.08))',
          paddingRight: '10px',
          paddingLeft: '4px',
        },
        '.cm-activeLine': {
          backgroundColor: 'var(--accent-glow, rgba(212, 175, 55, 0.07))',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'var(--accent-glow, rgba(212, 175, 55, 0.15))',
          color: 'var(--accent-primary, #d4af37)',
          fontWeight: 'bold',
        },
        '.cm-selectionBackground, ::selection': {
          backgroundColor: 'var(--accent-glow, rgba(212, 175, 55, 0.25)) !important',
        },
      });

      const pasteExtension = EditorView.domEventHandlers({
        paste(event, view) {
          const clipboard = event.clipboardData;
          if (!clipboard || !onPasteAssetRef.current) return false;

          // Check for binary screenshot / image files in clipboard items
          const items = Array.from(clipboard.items || []);
          const imageItem = items.find((item) => item.kind === 'file' && item.type.startsWith('image/'));

          if (imageItem) {
            const file = imageItem.getAsFile();
            if (!file) return false;

            event.preventDefault();
            const mimeSubtype = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
            const ext = mimeSubtype.replace(/[^a-z0-9]/gi, '') || 'png';
            const fileName = `figures/pasted_${Date.now()}.${ext}`;

            const reader = new FileReader();
            reader.onload = async () => {
              const base64Data = typeof reader.result === 'string' ? reader.result : '';
              if (!base64Data || !onPasteAssetRef.current) return;
              const savedPath = await onPasteAssetRef.current({ fileName, base64Data });
              if (savedPath) {
                const snippet = buildPastedImageLatexSnippet(savedPath);
                const sel = view.state.selection.main;
                view.dispatch({
                  changes: { from: sel.from, to: sel.to, insert: snippet },
                  selection: { anchor: sel.from + snippet.length },
                });
              }
            };
            reader.readAsDataURL(file);
            return true;
          }

          // Check for raw <svg>...</svg> markup or image/svg+xml text payload pasted into the code editor
          const svgMimeText = clipboard.getData('image/svg+xml');
          const plainText = clipboard.getData('text/plain');
          const candidateSvg = isRawSvgMarkup(svgMimeText)
            ? svgMimeText.trim()
            : isRawSvgMarkup(plainText)
            ? plainText.trim()
            : null;

          if (candidateSvg) {
            event.preventDefault();
            const fileName = `figures/pasted_${Date.now()}.svg`;
            void (async () => {
              if (!onPasteAssetRef.current) return;
              const savedPath = await onPasteAssetRef.current({ fileName, svgContent: candidateSvg });
              if (savedPath) {
                const snippet = buildPastedImageLatexSnippet(savedPath);
                const sel = view.state.selection.main;
                view.dispatch({
                  changes: { from: sel.from, to: sel.to, insert: snippet },
                  selection: { anchor: sel.from + snippet.length },
                });
              }
            })();
            return true;
          }

          return false;
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
          pasteExtension,
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                onCompileRef.current?.();
                return true;
              },
            },
            {
              key: 'Mod-s',
              run: () => {
                onCompileRef.current?.();
                return true;
              },
            },
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          editorTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newDoc = update.state.doc.toString();
              onChange(newDoc);
            }
            if (update.docChanged || update.selectionSet) {
              const { from, to } = update.state.selection.main;
              const documentText = update.state.doc.toString();
              const selText = documentText.slice(from, to);
              setCurrentSelectionText(selText);
              if (onSelectionFormatChangeRef.current) {
                onSelectionFormatChangeRef.current(
                  detectSelectionFormat(documentText, from, to),
                  selText
                );
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

    const handleInsertCodeSnippet = (snippet: string) => {
      if (!viewRef.current) return;
      const { state } = viewRef.current;
      const selection = state.selection.main;
      viewRef.current.dispatch({
        changes: { from: selection.from, to: selection.to, insert: snippet },
        selection: { anchor: selection.from + snippet.length },
      });
      viewRef.current.focus();
    };

    const handleReplaceSelection = (snippet: string) => {
      if (!viewRef.current) return;
      const { state } = viewRef.current;
      const { from, to } = state.selection.main;
      viewRef.current.dispatch({
        changes: { from, to, insert: snippet },
        selection: { anchor: from + snippet.length },
      });
      viewRef.current.focus();
    };

    return (
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] border-r border-[#24221e] relative overflow-hidden">
        {/* Full Height CodeMirror LaTeX Editor with Syntax Colors */}
        <div className="flex-1 min-h-0 overflow-auto" ref={editorRef} />

        {/* Bottom 30% Qwen Conversation Drawer & Prompt Bar */}
        <QwenChatDrawer
          isOpen={chatDrawerOpen ?? false}
          onToggleOpen={onToggleChatDrawer ?? (() => {})}
          messages={chatMessages ?? []}
          onSendMessage={onSendChatMessage ?? (async () => {})}
          onClearHistory={onClearChatHistory ?? (async () => {})}
          onInsertCodeSnippet={handleInsertCodeSnippet}
          onReplaceSelection={handleReplaceSelection}
          activeModel={activeAiModel ?? 'qwen2.5-coder:1.5b'}
          onSelectModel={onSelectAiModel ?? (() => {})}
          selectedText={currentSelectionText}
          hasSelection={Boolean(currentSelectionText.trim())}
          isGenerating={isAiGenerating ?? false}
        />
      </div>
    );
  }
);
