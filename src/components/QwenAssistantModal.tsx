import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Zap,
  HardDrive,
  Check,
  Copy,
  X,
  ArrowRight,
  RefreshCw,
  Terminal,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import {
  AIFastEditResponse,
  AIStatusResponse,
  QwenModelId,
  QwenModelSpec,
} from '../types/index.ts';

interface QwenAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileContent: string;
  activeLine: number | null;
  onApplyPatchedContent: (patchedContent: string) => void;
}

const DEFAULT_MODELS: QwenModelSpec[] = [
  {
    id: 'qwen2.5-coder:1.5b',
    name: 'Qwen 2.5 Coder 1.5B (Ultra-Fast)',
    parameters: '1.54B',
    quantization: 'Q4_K_M (4-bit)',
    vramGb: '1.1 GB',
    speedTokSec: '85–130 tok/s',
    contextWindow: '32,768 tokens',
    description:
      'Sub-400ms LaTeX syntax repair, missing package auto-injection, and inline math delimiter fixing.',
    installed: false,
  },
  {
    id: 'qwen2.5-coder:3b',
    name: 'Qwen 2.5 Coder 3B (Balanced)',
    parameters: '3.09B',
    quantization: 'Q4_K_M (4-bit)',
    vramGb: '2.1 GB',
    speedTokSec: '45–75 tok/s',
    contextWindow: '32,768 tokens',
    description:
      'Publication-grade booktabs table generation, TikZ diagram scaffolding, and equation refactoring.',
    installed: false,
  },
  {
    id: 'qwen2.5-coder:7b',
    name: 'Qwen 2.5 Coder 7B (Deep Academic)',
    parameters: '7.61B',
    quantization: 'Q4_K_M (4-bit)',
    vramGb: '4.7 GB',
    speedTokSec: '25–45 tok/s',
    contextWindow: '128,000 tokens',
    description:
      'Complex multi-line proof restructuring, matrix transformations, and BibTeX citation synthesis.',
    installed: false,
  },
];

const QUICK_PROMPTS = [
  'Convert target into a 3-column booktabs table with caption',
  'Wrap expression in a numbered equation environment with label',
  'Format lines as a structured itemize bullet list',
  'Insert a centered figure environment with caption and label',
];

export const QwenAssistantModal: React.FC<QwenAssistantModalProps> = ({
  isOpen,
  onClose,
  fileContent,
  activeLine,
  onApplyPatchedContent,
}) => {
  const [status, setStatus] = useState<AIStatusResponse | null>(null);
  const [selectedModel, setSelectedModel] = useState<QwenModelId>('qwen2.5-coder:1.5b');
  const [instruction, setInstruction] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [patchResult, setPatchResult] = useState<AIFastEditResponse | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = (await res.json()) as AIStatusResponse;
        setStatus(data);
        setSelectedModel(data.activeModel);
      }
    } catch {
      // Fallback defaults if server isn't reachable
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setPatchResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const models = status?.models || DEFAULT_MODELS;
  const currentSpec = models.find((m) => m.id === selectedModel) || models[0];

  const handleSelectModel = async (modelId: QwenModelId) => {
    setSelectedModel(modelId);
    try {
      const res = await fetch('/api/ai/model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId }),
      });
      if (res.ok) {
        const updated = (await res.json()) as AIStatusResponse;
        setStatus(updated);
      }
    } catch {
      // Ignore offline error
    }
  };

  const handleRunFastEdit = async (promptText = instruction) => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/fast-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: promptText,
          selectedText: selectedSnippet || undefined,
          fileContent,
          activeLine: activeLine || undefined,
          model: selectedModel,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as AIFastEditResponse;
        setPatchResult(data);
      }
    } catch (e) {
      console.error('Fast-edit request failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyInstallCmd = () => {
    const cmd = `ollama run ${selectedModel}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none font-sans">
      <div 
        className="w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border"
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderColor: 'var(--border-color)' 
        }}
      >
        {/* Modal Header */}
        <div 
          className="px-5 py-3.5 border-b flex items-center justify-between"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: 'var(--border-color)' 
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent-color) 15%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent-color) 40%, transparent)',
                color: 'var(--accent-color)',
              }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Qwen 2.5 Coder — Fast-Edit & LaTeX Repair Engine
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                    status?.ollamaAvailable
                      ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300'
                      : 'bg-amber-950/60 border-amber-700/50 text-amber-300'
                  }`}
                >
                  {status?.ollamaAvailable
                    ? 'Ollama Daemon Online (:11434)'
                    : 'Local Heuristic Fallback Ready'}
                </span>
              </div>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Atomic Search/Replace diff engine for sub-second LaTeX edits without full-file rewrites.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              className="p-1.5 rounded-lg border transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
              title="Refresh Ollama connection"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* 1. Model Selection & Hardware Specs Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Select Qwen 2.5 Coder Model Tier
              </span>
              <div 
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg border font-mono text-[10px]"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Terminal className="w-3 h-3" style={{ color: 'var(--accent-color)' }} />
                <span style={{ color: 'var(--text-primary)' }}>ollama run {selectedModel}</span>
                <button
                  onClick={handleCopyInstallCmd}
                  className="hover:opacity-80 ml-1"
                  style={{ color: 'var(--text-secondary)' }}
                  title="Copy Ollama command"
                >
                  {copiedCmd ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {models.map((m) => {
                const isSelected = m.id === selectedModel;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectModel(m.id)}
                    className="p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2"
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                      borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                      boxShadow: isSelected ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
                    }}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />}
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m.description}</p>
                    </div>

                    <div 
                      className="pt-2 border-t grid grid-cols-2 gap-1.5 font-mono text-[10px]"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        <Cpu className="w-3 h-3" style={{ color: 'var(--accent-color)' }} />
                        <span>{m.parameters}</span>
                      </div>
                      <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        <HardDrive className="w-3 h-3 text-sky-500" />
                        <span>{m.vramGb}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-500 col-span-2">
                        <Zap className="w-3 h-3" />
                        <span>{m.speedTokSec} • {m.quantization}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Model Detailed Spec Strip */}
            <div 
              className="border rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Layers className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                <span>Active Tag:</span>
                <strong style={{ color: 'var(--accent-color)' }}>{currentSpec.id}</strong>
              </div>
              <div className="flex items-center gap-4" style={{ color: 'var(--text-secondary)' }}>
                <span>Context: {currentSpec.contextWindow}</span>
                <span>Protocol: Search/Replace Diff</span>
              </div>
            </div>
          </div>

          {/* 2. Fast-Edit Instruction Input */}
          <div 
            className="space-y-2.5 pt-2 border-t"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <label className="block text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Fast-Edit Instruction (Ctrl+K)
            </label>

            {/* Preset Chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setInstruction(preset);
                    handleRunFastEdit(preset);
                  }}
                  className="px-2.5 py-1 rounded-lg border text-[10px] transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunFastEdit();
                }}
                placeholder="e.g., Convert this list into a 3-column booktabs table or wrap in align environment..."
                className="flex-1 rounded-xl px-3.5 py-2 text-xs focus:outline-none border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={() => handleRunFastEdit()}
                disabled={isGenerating || !instruction.trim()}
                className="px-4 py-2 rounded-xl disabled:opacity-50 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  color: '#000000',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Synthesizing...' : 'Generate Patch'}</span>
              </button>
            </div>

            {/* Optional Target Snippet Override */}
            <div>
              <input
                type="text"
                value={selectedSnippet}
                onChange={(e) => setSelectedSnippet(e.target.value)}
                placeholder="Optional: paste exact LaTeX line/snippet to target (leave blank to target active line)"
                className="w-full rounded-lg px-3 py-1.5 text-[11px] font-mono focus:outline-none border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              />
            </div>
          </div>

          {/* 3. Search / Replace Diff Preview */}
          {patchResult && (
            <div 
              className="space-y-2.5 border rounded-xl p-3.5"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {patchResult.explanation}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-800/40">
                  {patchResult.modelUsed} • {patchResult.latencyMs}ms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-[11px]">
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-2.5 overflow-x-auto">
                  <div className="text-[9px] uppercase text-rose-500 font-bold mb-1">
                    - SEARCH (Original)
                  </div>
                  <pre className="text-rose-600 dark:text-rose-200 whitespace-pre-wrap">
                    {patchResult.search || '(Top of file)'}
                  </pre>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-2.5 overflow-x-auto">
                  <div className="text-[9px] uppercase text-emerald-500 font-bold mb-1">
                    + REPLACE (Patched)
                  </div>
                  <pre className="text-emerald-700 dark:text-emerald-200 whitespace-pre-wrap">{patchResult.replace}</pre>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    onApplyPatchedContent(patchResult.patchedContent);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <span>Apply Patch & Compile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
