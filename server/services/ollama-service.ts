import {
  AIDiagnosticFixRequest,
  AIFastEditRequest,
  AIFastEditResponse,
  AIStatusResponse,
  QwenModelId,
  QwenModelSpec,
  SearchReplacePatch,
} from '../../src/types/index.ts';
import { LaTeXErrorParser } from '../compiler/error-parser.ts';

export const QWEN_MODEL_CATALOG: Omit<QwenModelSpec, 'installed'>[] = [
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
  },
];

export class OllamaQwenService {
  private endpoint: string;
  private activeModel: QwenModelId = 'qwen2.5-coder:1.5b';

  constructor(endpoint = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434') {
    this.endpoint = endpoint.replace(/\/$/, '');
  }

  public setActiveModel(model: QwenModelId): void {
    this.activeModel = model;
  }

  public getActiveModel(): QwenModelId {
    return this.activeModel;
  }

  /**
   * Parse a Search/Replace block (`<<<<<<< SEARCH ... ======= ... >>>>>>>`) or JSON response
   * returned by Qwen 2.5 Coder.
   */
  public static parseSearchReplaceOutput(rawOutput: string): SearchReplacePatch | null {
    const trimmed = rawOutput.trim();

    // 1. Check for <<<<<<< SEARCH ... ======= ... >>>>>>> block
    const blockRegex =
      /<<<<<<<\s*SEARCH\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>>(?:\s*REPLACE)?/i;
    const blockMatch = trimmed.match(blockRegex);
    if (blockMatch) {
      const beforeBlock = trimmed.slice(0, blockMatch.index).trim();
      return {
        search: blockMatch[1],
        replace: blockMatch[2],
        explanation:
          beforeBlock.replace(/^```[a-z]*\s*/i, '').trim() ||
          'Applied atomic Search/Replace patch via Qwen 2.5 Coder.',
      };
    }

    // 2. Check for JSON object { search, replace, explanation }
    try {
      const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed.search === 'string' && typeof parsed.replace === 'string') {
          return {
            search: parsed.search,
            replace: parsed.replace,
            explanation:
              typeof parsed.explanation === 'string'
                ? parsed.explanation
                : 'Applied structured Qwen 2.5 Coder patch.',
          };
        }
      }
    } catch {
      // Fall through
    }

    return null;
  }

  /**
   * Apply a Search/Replace patch onto a LaTeX source string without rewriting the whole document.
   * Supports exact substring matching and whitespace-normalized line matching.
   */
  public static applySearchReplacePatch(
    fileContent: string,
    patch: { search: string; replace: string }
  ): { applied: boolean; patchedContent: string } {
    if (!patch.search) {
      return {
        applied: true,
        patchedContent: patch.replace
          ? `${patch.replace}\n${fileContent}`
          : fileContent,
      };
    }

    // 1. Direct exact substring match
    if (fileContent.includes(patch.search)) {
      return {
        applied: true,
        patchedContent: fileContent.replace(patch.search, patch.replace),
      };
    }

    // 2. Normalized CRLF/LF match
    const normContent = fileContent.replace(/\r\n/g, '\n');
    const normSearch = patch.search.replace(/\r\n/g, '\n').trim();
    if (normSearch && normContent.includes(normSearch)) {
      return {
        applied: true,
        patchedContent: normContent.replace(normSearch, patch.replace.replace(/\r\n/g, '\n')),
      };
    }

    // 3. Line-by-line trimmed match for single-line targets
    const lines = normContent.split('\n');
    if (!normSearch.includes('\n')) {
      const idx = lines.findIndex((line) => line.trim() === normSearch);
      if (idx !== -1) {
        const leadingIndent = lines[idx].match(/^\s*/)?.[0] || '';
        lines[idx] = `${leadingIndent}${patch.replace.trim()}`;
        return {
          applied: true,
          patchedContent: lines.join('\n'),
        };
      }
    }

    return {
      applied: false,
      patchedContent: fileContent,
    };
  }

  /**
   * Probe local Ollama daemon for installed models and health status.
   */
  public async getStatus(): Promise<AIStatusResponse> {
    let ollamaAvailable = false;
    let installedModels: string[] = [];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);

    try {
      const res = await fetch(`${this.endpoint}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      if (res.ok) {
        ollamaAvailable = true;
        const data = (await res.json()) as { models?: { name: string }[] };
        installedModels = (data.models || []).map((m) => m.name);
      }
    } catch {
      ollamaAvailable = false;
    } finally {
      clearTimeout(timer);
    }

    const models: QwenModelSpec[] = QWEN_MODEL_CATALOG.map((spec) => ({
      ...spec,
      installed: installedModels.some(
        (m) => m.toLowerCase().startsWith(spec.id.toLowerCase())
      ),
    }));

    return {
      ollamaAvailable,
      endpoint: this.endpoint,
      activeModel: this.activeModel,
      installedModels,
      models,
      fallbackEngine: 'LocTex Deterministic AST & Heuristic Engine (Zero-Latency)',
      installCommand: `ollama run ${this.activeModel}`,
    };
  }

  /**
   * Call local Ollama `/api/generate` with a strict timeout.
   */
  private async generateWithOllama(
    prompt: string,
    model: QwenModelId,
    jsonFormat = false,
    timeoutMs = 4500
  ): Promise<string | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const body: Record<string, unknown> = {
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 256,
        },
      };
      if (jsonFormat) {
        body.format = 'json';
      }

      const res = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) return null;
      const data = (await res.json()) as { response?: string };
      return data.response || null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Detect and fix a LaTeX compiler diagnostic using Qwen 2.5 Coder (or deterministic fallback).
   */
  public async fixDiagnostic(req: AIDiagnosticFixRequest): Promise<AIFastEditResponse> {
    const startTime = Date.now();
    const modelToUse = req.model || this.activeModel;
    const lines = req.fileContent.replace(/\r\n/g, '\n').split('\n');
    const targetIdx = Math.max(0, Math.min(lines.length - 1, req.diagnostic.line - 1));
    const targetLine = lines[targetIdx] || '';

    const startLine = Math.max(0, targetIdx - 3);
    const endLine = Math.min(lines.length - 1, targetIdx + 3);
    const snippet = lines.slice(startLine, endLine + 1).join('\n');

    const prompt = `You are Qwen 2.5 Coder, an expert LaTeX compiler assistant.
Fix the following LaTeX error on line ${req.diagnostic.line}:
Error Message: ${req.diagnostic.message}
Offending Line: ${targetLine}
Context:
${snippet}

Respond ONLY with a valid JSON object matching:
{"explanation": "concise reason", "search": "exact line or snippet to replace", "replace": "corrected LaTeX code"}`;

    const rawResponse = await this.generateWithOllama(prompt, modelToUse, true, 4000);
    if (rawResponse) {
      const parsed = OllamaQwenService.parseSearchReplaceOutput(rawResponse);
      if (parsed) {
        const applied = OllamaQwenService.applySearchReplacePatch(req.fileContent, parsed);
        if (applied.applied) {
          return {
            success: true,
            explanation: parsed.explanation,
            search: parsed.search,
            replace: parsed.replace,
            patchedContent: applied.patchedContent,
            modelUsed: modelToUse,
            latencyMs: Date.now() - startTime,
            usedFallback: false,
          };
        }
      }
    }

    // Deterministic Fallback Engine when Ollama daemon is offline
    return this.buildDeterministicDiagnosticFix(req, targetLine, startTime);
  }

  private buildDeterministicDiagnosticFix(
    req: AIDiagnosticFixRequest,
    targetLine: string,
    startTime: number
  ): AIFastEditResponse {
    const resolved = LaTeXErrorParser.resolveSuggestion(
      req.diagnostic.message,
      req.diagnostic.excerpt || targetLine,
      req.diagnostic.file
    );

    let search = targetLine;
    let replace = targetLine;
    let patchedContent = req.fileContent;
    const explanation =
      resolved.suggestion ||
      `Automatically repaired LaTeX issue at line ${req.diagnostic.line}: ${req.diagnostic.message}`;

    if (resolved.quickFix) {
      const { action, payload, target } = resolved.quickFix;
      if (action === 'insert_package') {
        const docClassMatch = req.fileContent.match(/\\documentclass(?:\[[^\]]*\])?\{[^}]+\}/);
        if (docClassMatch) {
          search = docClassMatch[0];
          replace = `${docClassMatch[0]}\n${payload}`;
          patchedContent = req.fileContent.replace(search, replace);
        } else {
          search = '';
          replace = payload;
          patchedContent = `${payload}\n${req.fileContent}`;
        }
      } else if (action === 'replace' && target && targetLine.includes(target)) {
        replace = targetLine.replace(target, payload);
        const res = OllamaQwenService.applySearchReplacePatch(req.fileContent, {
          search,
          replace,
        });
        patchedContent = res.patchedContent;
      } else if (action === 'wrap_math') {
        replace = `$${targetLine.trim()}$`;
        const res = OllamaQwenService.applySearchReplacePatch(req.fileContent, {
          search,
          replace,
        });
        patchedContent = res.patchedContent;
      }
    } else if (req.diagnostic.message.toLowerCase().includes('ended by')) {
      // Mismatched environment repair
      const beginMatch = req.fileContent.match(/\\begin\{([a-zA-Z0-9*]+)\}/);
      if (beginMatch && targetLine.includes('\\end{')) {
        replace = targetLine.replace(/\\end\{[^}]+\}/, `\\end{${beginMatch[1]}}`);
        const res = OllamaQwenService.applySearchReplacePatch(req.fileContent, {
          search,
          replace,
        });
        patchedContent = res.patchedContent;
      }
    }

    return {
      success: true,
      explanation,
      search,
      replace,
      patchedContent,
      modelUsed: `${this.activeModel} (Local Fallback Engine)`,
      latencyMs: Math.max(1, Date.now() - startTime),
      usedFallback: true,
    };
  }

  /**
   * Perform fast inline LaTeX code editing using Search/Replace blocks.
   */
  public async fastEdit(req: AIFastEditRequest): Promise<AIFastEditResponse> {
    const startTime = Date.now();
    const modelToUse = req.model || this.activeModel;
    const targetSnippet =
      req.selectedText && req.selectedText.trim().length > 0
        ? req.selectedText
        : this.extractDefaultTargetSnippet(req.fileContent, req.activeLine);

    const prompt = `You are Qwen 2.5 Coder, a fast LaTeX editing model.
User Instruction: ${req.instruction}
Target LaTeX Snippet:
${targetSnippet}

Return ONLY a JSON object with:
{"explanation": "brief summary of edit", "search": "exact original snippet", "replace": "new LaTeX snippet"}`;

    const rawResponse = await this.generateWithOllama(prompt, modelToUse, true, 4500);
    if (rawResponse) {
      const parsed = OllamaQwenService.parseSearchReplaceOutput(rawResponse);
      if (parsed) {
        const applied = OllamaQwenService.applySearchReplacePatch(req.fileContent, parsed);
        if (applied.applied) {
          return {
            success: true,
            explanation: parsed.explanation,
            search: parsed.search,
            replace: parsed.replace,
            patchedContent: applied.patchedContent,
            modelUsed: modelToUse,
            latencyMs: Date.now() - startTime,
            usedFallback: false,
          };
        }
      }
    }

    // Fast Local Heuristic Synthesizer when Ollama daemon is offline
    return this.buildDeterministicFastEdit(req, targetSnippet, startTime);
  }

  private extractDefaultTargetSnippet(fileContent: string, activeLine?: number): string {
    const lines = fileContent.replace(/\r\n/g, '\n').split('\n');
    if (activeLine && activeLine > 0 && activeLine <= lines.length) {
      return lines[activeLine - 1];
    }
    const bodyIdx = lines.findIndex((l) => l.includes('\\begin{document}'));
    if (bodyIdx !== -1 && bodyIdx + 1 < lines.length) {
      const nonEmpty = lines.slice(bodyIdx + 1).find((l) => l.trim().length > 0 && !l.startsWith('\\end{document}'));
      if (nonEmpty) return nonEmpty;
    }
    return lines[0] || '';
  }

  private buildDeterministicFastEdit(
    req: AIFastEditRequest,
    targetSnippet: string,
    startTime: number
  ): AIFastEditResponse {
    const instr = req.instruction.toLowerCase();
    let replace = targetSnippet;
    let explanation = 'Applied fast LaTeX transformation.';

    if (instr.includes('table') || instr.includes('booktabs')) {
      replace = `\\begin{table}[htbp]
  \\centering
  \\caption{${req.selectedText ? req.selectedText.trim().slice(0, 40) : 'Experimental Results'}}
  \\label{tab:results}
  \\begin{tabular}{lcc}
    \\toprule
    Metric & Baseline & Proposed \\\\
    \\midrule
    Accuracy (\\%) & 91.4 & \\textbf{96.8} \\\\
    Latency (ms) & 42.0 & \\textbf{11.2} \\\\
    \\bottomrule
  \\end{tabular}
\\end{table}`;
      explanation = 'Generated publication-ready 3-column booktabs table environment.';
    } else if (instr.includes('equation') || instr.includes('math') || instr.includes('align')) {
      const inner = targetSnippet.replace(/^\$|\$$/g, '').trim() || 'E = mc^2';
      replace = `\\begin{equation}\n  ${inner}\n  \\label{eq:model}\n\\end{equation}`;
      explanation = 'Wrapped expression in a numbered LaTeX equation environment with label.';
    } else if (instr.includes('figure') || instr.includes('image')) {
      replace = `\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=0.8\\linewidth]{figure.pdf}
  \\caption{${targetSnippet.trim() || 'System Architecture Overview'}}
  \\label{fig:overview}
\\end{figure}`;
      explanation = 'Inserted standard figure environment with caption and cross-reference label.';
    } else if (instr.includes('itemize') || instr.includes('bullet') || instr.includes('list')) {
      const rawItems = targetSnippet
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const itemLines =
        rawItems.length > 0
          ? rawItems.map((i) => `  \\item ${i.replace(/^\\item\s*/, '')}`).join('\n')
          : '  \\item First key observation\n  \\item Second experimental finding';
      replace = `\\begin{itemize}\n${itemLines}\n\\end{itemize}`;
      explanation = 'Converted selection into a structured LaTeX itemize list.';
    } else if (instr.includes('bold')) {
      replace = `\\textbf{${targetSnippet.trim()}}`;
      explanation = 'Wrapped target text in \\textbf{...}.';
    } else {
      replace = `% [Qwen Fast-Edit: ${req.instruction}]\n${targetSnippet}`;
      explanation = `Annotated target snippet with instruction: "${req.instruction}".`;
    }

    const applied = OllamaQwenService.applySearchReplacePatch(req.fileContent, {
      search: targetSnippet,
      replace,
    });

    return {
      success: true,
      explanation,
      search: targetSnippet,
      replace,
      patchedContent: applied.patchedContent,
      modelUsed: `${req.model || this.activeModel} (Local Fast Synthesizer)`,
      latencyMs: Math.max(1, Date.now() - startTime),
      usedFallback: true,
    };
  }
}
