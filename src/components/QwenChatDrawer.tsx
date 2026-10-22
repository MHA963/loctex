import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Copy,
  Check,
  Code2,
  Bug,
  PenTool,
  HelpCircle,
  CornerDownLeft,
  Bot,
  User,
  Loader2,
} from 'lucide-react';
import {
  AIChatIntent,
  ChatMessage,
  QwenModelId,
} from '../types/index.ts';

export interface QwenChatDrawerProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string, intent: AIChatIntent, model: QwenModelId) => Promise<void>;
  onClearHistory: () => Promise<void>;
  onInsertCodeSnippet?: (snippet: string) => void;
  onReplaceSelection?: (snippet: string) => void;
  activeModel: QwenModelId;
  onSelectModel: (model: QwenModelId) => void;
  availableModels?: QwenModelId[];
  selectedText?: string;
  hasSelection?: boolean;
  isGenerating?: boolean;
}

export const QwenChatDrawer: React.FC<QwenChatDrawerProps> = ({
  isOpen,
  onToggleOpen,
  messages,
  onSendMessage,
  onClearHistory,
  onInsertCodeSnippet,
  onReplaceSelection,
  activeModel,
  onSelectModel,
  availableModels = ['qwen2.5-coder:1.5b', 'qwen2.5-coder:3b', 'qwen2.5-coder:7b'],
  selectedText = '',
  hasSelection = false,
  isGenerating = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<AIChatIntent>('ask');
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages thread when new messages arrive
  useEffect(() => {
    if (isOpen && scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages, isOpen, isGenerating]);

  // Adjust placeholder text based on intent and active selection
  const getPlaceholderText = () => {
    switch (selectedIntent) {
      case 'rewrite':
        return hasSelection
          ? 'Ask Qwen to rewrite the highlighted selection...'
          : 'Highlight text in editor or type request to rewrite section...';
      case 'format':
        return 'Ask Qwen to format LaTeX equations, tables, or environments...';
      case 'debug':
        return 'Ask Qwen to inspect LaTeX errors, unbalanced braces, or missing packages...';
      case 'ask':
      default:
        return 'Ask Qwen questions about LaTeX, formulas, structure, or citations... (Enter to send)';
    }
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed && !hasSelection) return;

    const messageToSend = trimmed || (selectedIntent === 'rewrite' ? 'Please rewrite and improve this text.' : 'Please inspect and format this LaTeX snippet.');
    setInputText('');
    await onSendMessage(messageToSend, selectedIntent, activeModel);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetIdx(id);
    setTimeout(() => setCopiedSnippetIdx(null), 2000);
  };

  // Helper to extract and render markdown / LaTeX code blocks inside responses
  const renderMessageContent = (content: string, msgId: string) => {
    const codeBlockRegex = /```(?:latex|tex)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockCount = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        code: match[1].trim(),
        blockId: `${msgId}-${blockCount++}`,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return (
      <div className="space-y-2 text-xs leading-relaxed text-[var(--text-primary)]">
        {parts.map((p, i) => {
          if (p.type === 'text') {
            return (
              <p key={i} className="whitespace-pre-wrap select-text font-sans">
                {p.content}
              </p>
            );
          }
          const isCopied = copiedSnippetIdx === p.blockId;
          return (
            <div
              key={i}
              className="my-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden font-mono text-[11px]"
            >
              <div className="flex items-center justify-between px-2.5 py-1 bg-[var(--bg-secondary)] border-b border-[var(--border-color-subtle)] text-[10px] text-[var(--text-muted)]">
                <span>LaTeX Code Block</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopySnippet(p.code!, p.blockId!)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    title="Copy snippet"
                  >
                    {isCopied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                  {onInsertCodeSnippet && (
                    <button
                      onClick={() => onInsertCodeSnippet(p.code!)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] transition-colors cursor-pointer font-sans"
                      title="Insert code into editor at cursor"
                    >
                      <span>Insert</span>
                    </button>
                  )}
                  {onReplaceSelection && hasSelection && (
                    <button
                      onClick={() => onReplaceSelection(p.code!)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer font-sans"
                      title="Replace current selection with this snippet"
                    >
                      <span>Replace</span>
                    </button>
                  )}
                </div>
              </div>
              <pre className="p-2.5 overflow-x-auto text-[var(--syntax-keyword, #38bdf8)] select-text">
                <code>{p.code}</code>
              </pre>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col transition-all duration-200 z-20 ${
        isOpen ? 'h-[30%] min-h-[190px] shadow-lg' : 'h-10'
      }`}
    >
      {/* Drawer Header & Quick Action Bar */}
      <div className="h-10 px-3 bg-[var(--bg-secondary)] flex items-center justify-between border-b border-[var(--border-color-subtle)] select-none">
        {/* Left: Brand badge & Model selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleOpen}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:opacity-90 transition-opacity cursor-pointer"
            title={isOpen ? 'Collapse Conversation Drawer' : 'Expand Conversation Drawer (30% space)'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-mono">Qwen Assistant</span>
            {isOpen ? <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" /> : <ChevronUp className="w-3 h-3 text-[var(--text-muted)]" />}
          </button>

          <span className="text-[var(--border-color-subtle)]">|</span>

          {/* Model Selector Dropdown */}
          <select
            value={activeModel}
            onChange={(e) => onSelectModel(e.target.value as QwenModelId)}
            className="bg-[var(--bg-surface)] text-[var(--text-primary)] rounded px-2 py-0.5 text-[10px] font-mono border border-[var(--border-color-subtle)] focus:outline-none cursor-pointer"
            title="Chosen local Qwen model"
          >
            {availableModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Intent Preset Pills */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-0.5 rounded-full border border-[var(--border-color-subtle)] text-[10px]">
          <button
            onClick={() => setSelectedIntent('ask')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              selectedIntent === 'ask'
                ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="General Ask (no effect on code)"
          >
            <HelpCircle className="w-2.5 h-2.5" />
            <span>Ask</span>
          </button>

          <button
            onClick={() => setSelectedIntent('rewrite')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              selectedIntent === 'rewrite'
                ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Request Academic Rewrite of text"
          >
            <PenTool className="w-2.5 h-2.5" />
            <span>Rewrite</span>
          </button>

          <button
            onClick={() => setSelectedIntent('format')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              selectedIntent === 'format'
                ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Request LaTeX formatting and alignment"
          >
            <Code2 className="w-2.5 h-2.5" />
            <span>Format</span>
          </button>

          <button
            onClick={() => setSelectedIntent('debug')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              selectedIntent === 'debug'
                ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Debug LaTeX syntax and compiler errors"
          >
            <Bug className="w-2.5 h-2.5" />
            <span>Debug</span>
          </button>
        </div>

        {/* Right: Message Counter & Actions */}
        <div className="flex items-center gap-2">
          {hasSelection && (
            <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[9px] font-mono">
              Selected: {selectedText.slice(0, 24)}...
            </span>
          )}

          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1 text-[var(--text-muted)] hover:text-rose-400 rounded transition-colors cursor-pointer"
              title="Clear Project Conversation History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onToggleOpen}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition-colors cursor-pointer"
            title={isOpen ? 'Minimize Drawer' : 'Open Drawer'}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Conversation View (~30% height of code editor) */}
      {isOpen && (
        <div
          ref={scrollViewportRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[var(--bg-surface)] select-text"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-6 text-[var(--text-muted)]">
              <Bot className="w-8 h-8 stroke-1 text-[var(--accent-primary)]/60 mb-2" />
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                Project Conversation Cached
              </p>
              <p className="text-[11px] max-w-sm mt-1">
                Ask questions, request rewrites, format equations, or debug compiler errors without mutating your code directly.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      isUser
                        ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] font-medium text-xs'
                        : 'bg-[var(--bg-secondary)] border border-[var(--border-color-subtle)] text-[var(--text-primary)]'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-[var(--border-color-subtle)] text-[10px] text-[var(--text-muted)]">
                        <span className="font-mono text-[9px] uppercase tracking-wide">
                          {m.model || activeModel} • {m.intent || 'ask'}
                        </span>
                        <span className="font-mono text-[9px]">
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    )}

                    {isUser ? (
                      <p className="whitespace-pre-wrap text-xs select-text">{m.content}</p>
                    ) : (
                      renderMessageContent(m.content, m.id)
                    )}
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isGenerating && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-muted)] flex items-center gap-2">
                <span>Qwen is processing your request...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Text Box & Prompt Bar (Always accessible at bottom of code editor) */}
      <div className="p-2 bg-[var(--bg-surface)] border-t border-[var(--border-color-subtle)] flex items-center gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (!isOpen) onToggleOpen();
            }}
            placeholder={getPlaceholderText()}
            className="w-full resize-none rounded-lg bg-[var(--bg-secondary)] px-3 py-1.5 pr-8 text-xs font-sans text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-color-subtle)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors leading-relaxed"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={isGenerating || (!inputText.trim() && !hasSelection)}
          className={`flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            inputText.trim() || hasSelection
              ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:opacity-90 shadow-sm'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
          }`}
          title="Send to Qwen (Enter)"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <div className="flex items-center gap-1">
              <span>Send</span>
              <CornerDownLeft className="w-3 h-3" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
