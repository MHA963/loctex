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
      <div className="w-full max-w-3xl bg-[#141311] border border-[#33302a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#100f0d] border-b border-[#262420] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#f4f2ec]">
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
              <p className="text-[11px] text-[#8c887e]">
                Atomic Search/Replace diff engine for sub-second LaTeX edits without full-file rewrites.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              className="p-1.5 rounded-lg bg-[#1e1d1a] hover:bg-[#2a2824] text-[#a8a49c] hover:text-[#f4f2ec] border border-[#33302a] transition-colors"
              title="Refresh Ollama connection"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#262420] text-[#8c887e] hover:text-[#f4f2ec]"
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
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a8a49c]">
                Select Qwen 2.5 Coder Model Tier
              </span>
              <div className="flex items-center gap-2 bg-[#1a1916] px-2.5 py-1 rounded-lg border border-[#2e2c26] font-mono text-[10px]">
                <Terminal className="w-3 h-3 text-[#d4af37]" />
                <span className="text-[#dedbd2]">ollama run {selectedModel}</span>
                <button
                  onClick={handleCopyInstallCmd}
                  className="text-[#8c887e] hover:text-[#d4af37] ml-1"
                  title="Copy Ollama command"
                >
                  {copiedCmd ? (
                    <Check className="w-3 h-3 text-emerald-400" />
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
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#1f1d18] border-[#d4af37] shadow-lg'
                        : 'bg-[#181714] border-[#262420] hover:border-[#3d3a33]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#f4f2ec] text-xs">{m.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />}
                      </div>
                      <p className="text-[10px] text-[#8c887e] leading-relaxed">{m.description}</p>
                    </div>

                    <div className="pt-2 border-t border-[#262420] grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                      <div className="flex items-center gap-1 text-[#c7c3b8]">
                        <Cpu className="w-3 h-3 text-[#d4af37]" />
                        <span>{m.parameters}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#c7c3b8]">
                        <HardDrive className="w-3 h-3 text-sky-400" />
                        <span>{m.vramGb}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 col-span-2">
                        <Zap className="w-3 h-3" />
                        <span>{m.speedTokSec} • {m.quantization}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Model Detailed Spec Strip */}
            <div className="bg-[#181714] border border-[#262420] rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-2 text-[#dedbd2]">
                <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Active Tag:</span>
                <strong className="text-[#d4af37]">{currentSpec.id}</strong>
              </div>
              <div className="flex items-center gap-4 text-[#8c887e]">
                <span>Context: {currentSpec.contextWindow}</span>
                <span>Protocol: Search/Replace Diff</span>
              </div>
            </div>
          </div>

          {/* 2. Fast-Edit Instruction Input */}
          <div className="space-y-2.5 pt-2 border-t border-[#24221e]">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#a8a49c]">
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
                  className="px-2.5 py-1 rounded-lg bg-[#1c1b18] hover:bg-[#282621] text-[#c7c3b8] hover:text-[#d4af37] border border-[#2e2c26] text-[10px] transition-colors"
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
                className="flex-1 bg-[#0e0d0b] border border-[#33302a] focus:border-[#d4af37] rounded-xl px-3.5 py-2 text-xs text-[#f4f2ec] focus:outline-none"
              />
              <button
                onClick={() => handleRunFastEdit()}
                disabled={isGenerating || !instruction.trim()}
                className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e5c158] disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
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
                className="w-full bg-[#100f0d] border border-[#262420] rounded-lg px-3 py-1.5 text-[11px] font-mono text-[#a8a49c] focus:outline-none focus:border-[#3d3a33]"
              />
            </div>
          </div>

          {/* 3. Search / Replace Diff Preview */}
          {patchResult && (
            <div className="space-y-2.5 bg-[#100f0d] border border-[#33302a] rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#f4f2ec]">
                    {patchResult.explanation}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  {patchResult.modelUsed} • {patchResult.latencyMs}ms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-[11px]">
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-2.5 overflow-x-auto">
                  <div className="text-[9px] uppercase text-rose-400 font-bold mb-1">
                    - SEARCH (Original)
                  </div>
                  <pre className="text-rose-200 whitespace-pre-wrap">
                    {patchResult.search || '(Top of file)'}
                  </pre>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-2.5 overflow-x-auto">
                  <div className="text-[9px] uppercase text-emerald-400 font-bold mb-1">
                    + REPLACE (Patched)
                  </div>
                  <pre className="text-emerald-200 whitespace-pre-wrap">{patchResult.replace}</pre>
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
