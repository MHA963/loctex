import { describe, it, expect } from 'vitest';
import { OllamaQwenService, QWEN_MODEL_CATALOG } from '../server/services/ollama-service.ts';
import { DiagnosticError } from '../src/types/index.ts';

describe('OllamaQwenService & Qwen 2.5 Coder Engine Tests', () => {
  it('should expose complete Qwen 2.5 Coder model specifications (1.5b, 3b, 7b)', () => {
    expect(QWEN_MODEL_CATALOG.length).toBe(3);
    const modelIds = QWEN_MODEL_CATALOG.map((m) => m.id);
    expect(modelIds).toEqual([
      'qwen2.5-coder:1.5b',
      'qwen2.5-coder:3b',
      'qwen2.5-coder:7b',
    ]);
    expect(QWEN_MODEL_CATALOG[0].vramGb).toBe('1.1 GB');
    expect(QWEN_MODEL_CATALOG[0].quantization).toContain('Q4_K_M');
  });

  it('should parse <<<<<<< SEARCH ... ======= ... >>>>>>> diff blocks', () => {
    const rawLlmOutput = `Fixed the typo in the section command:
<<<<<<< SEARCH
\\sectioin{Introduction}
=======
\\section{Introduction}
>>>>>>>`;

    const parsed = OllamaQwenService.parseSearchReplaceOutput(rawLlmOutput);
    expect(parsed).not.toBeNull();
    expect(parsed?.search).toBe('\\sectioin{Introduction}');
    expect(parsed?.replace).toBe('\\section{Introduction}');
    expect(parsed?.explanation).toContain('Fixed the typo');
  });

  it('should parse structured JSON Search/Replace responses from Qwen 2.5 Coder', () => {
    const jsonOutput = JSON.stringify({
      explanation: 'Added amsmath package for eqref',
      search: '\\documentclass{article}',
      replace: '\\documentclass{article}\n\\usepackage{amsmath}',
    });

    const parsed = OllamaQwenService.parseSearchReplaceOutput(jsonOutput);
    expect(parsed).not.toBeNull();
    expect(parsed?.search).toBe('\\documentclass{article}');
    expect(parsed?.replace).toContain('\\usepackage{amsmath}');
  });

  it('should apply Search/Replace patch cleanly while preserving indentation', () => {
    const doc = `\\documentclass{article}
\\begin{document}
  \\sectioin{Experimental Setup}
  Some body text here.
\\end{document}`;

    const res = OllamaQwenService.applySearchReplacePatch(doc, {
      search: '\\sectioin{Experimental Setup}',
      replace: '\\section{Experimental Setup}',
    });

    expect(res.applied).toBe(true);
    expect(res.patchedContent).toContain('  \\section{Experimental Setup}');
    expect(res.patchedContent).toContain('Some body text here.');
  });

  it('should repair LaTeX errors via fixDiagnostic even when Ollama daemon is unreachable', async () => {
    // Point to an unused port so it immediately triggers the deterministic fallback
    const service = new OllamaQwenService('http://127.0.0.1:59999');

    const doc = `\\documentclass{article}
\\begin{document}
See Equation \\eqref{eq:1}.
\\end{document}`;

    const diagnostic: DiagnosticError = {
      id: 'err-1',
      file: 'main.tex',
      line: 3,
      message: 'Undefined control sequence.',
      severity: 'error',
      excerpt: '\\eqref{eq:1}',
    };

    const fixResult = await service.fixDiagnostic({
      diagnostic,
      fileContent: doc,
    });

    expect(fixResult.success).toBe(true);
    expect(fixResult.patchedContent).toContain('\\usepackage{amsmath}');
    expect(fixResult.explanation).toContain('amsmath');
  });

  it('should perform fast-edit table generation via fastEdit', async () => {
    const service = new OllamaQwenService('http://127.0.0.1:59999');

    const doc = `\\documentclass{article}
\\begin{document}
Results Placeholder
\\end{document}`;

    const editResult = await service.fastEdit({
      instruction: 'Convert target into a 3-column booktabs table',
      selectedText: 'Results Placeholder',
      fileContent: doc,
      model: 'qwen2.5-coder:3b',
    });

    expect(editResult.success).toBe(true);
    expect(editResult.patchedContent).toContain('\\begin{table}');
    expect(editResult.patchedContent).toContain('\\toprule');
    expect(editResult.patchedContent).toContain('\\caption{Results Placeholder}');
  });
});
