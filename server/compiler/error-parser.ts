import { DiagnosticError, DiagnosticQuickFix } from '../../src/types/index.ts';

interface SuggestionResult {
  suggestion?: string;
  quickFix?: DiagnosticQuickFix;
}

export class LaTeXErrorParser {
  public static resolveSuggestion(
    message: string,
    excerpt = '',
    _file = 'main.tex'
  ): SuggestionResult {
    const normMsg = message.toLowerCase();
    const trimmedExcerpt = excerpt.trim();

    // 1. Undefined control sequence
    if (normMsg.includes('undefined control sequence')) {
      const typoMap: Record<string, string> = {
        '\\sectioin': '\\section',
        '\\subsectioin': '\\subsection',
        '\\textbold': '\\textbf',
        '\\bold': '\\textbf',
        '\\it': '\\textit',
        '\\cenetr': '\\centering',
        '\\centerline': '\\centering',
        '\\includegraphic': '\\includegraphics',
        '\\eq': '\\begin{equation}',
        '\\citeation': '\\cite',
        '\\refe': '\\ref',
      };

      const escapeRegex = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

      // Match exact macro command boundary so \eq doesn't falsely match \eqref
      for (const [typo, fix] of Object.entries(typoMap)) {
        const regex = new RegExp(escapeRegex(typo) + '(?![a-zA-Z])');
        if (regex.test(trimmedExcerpt)) {
          return {
            suggestion: `Typo detected in command '${typo}'. Did you mean '${fix}'?`,
            quickFix: {
              label: `Replace with ${fix}`,
              action: 'replace',
              target: typo,
              payload: fix,
            },
          };
        }
      }

      // Check package-specific commands
      const pkgMap: Record<string, { pkg: string; desc: string }> = {
        '\\eqref': { pkg: 'amsmath', desc: 'Mathematical equation references' },
        '\\align': { pkg: 'amsmath', desc: 'Aligned multi-line equations' },
        '\\bmatrix': { pkg: 'amsmath', desc: 'Bracketed matrix environments' },
        '\\pmatrix': { pkg: 'amsmath', desc: 'Parenthesized matrix environments' },
        '\\text': { pkg: 'amsmath', desc: 'Text inside math expressions' },
        '\\mathbb': { pkg: 'amssymb', desc: 'Blackboard bold mathematical fonts (R, N, Z)' },
        '\\mathfrak': { pkg: 'amssymb', desc: 'Fraktur mathematical fonts' },
        '\\includegraphics': { pkg: 'graphicx', desc: 'Figures, diagrams, and external images' },
        '\\url': { pkg: 'hyperref', desc: 'Clickable hyperlinks and URLs' },
        '\\href': { pkg: 'hyperref', desc: 'Clickable hyperlinks with custom anchor text' },
        '\\toprule': { pkg: 'booktabs', desc: 'Publication-quality scientific tables' },
        '\\midrule': { pkg: 'booktabs', desc: 'Publication-quality scientific tables' },
        '\\bottomrule': { pkg: 'booktabs', desc: 'Publication-quality scientific tables' },
        '\\lstinline': { pkg: 'listings', desc: 'Source code syntax highlighting' },
        '\\lstlisting': { pkg: 'listings', desc: 'Source code blocks' },
        '\\tikz': { pkg: 'tikz', desc: 'Vector diagram rendering' },
        '\\algorithm': { pkg: 'algorithm2e', desc: 'Algorithm pseudocode typesetting' },
        '\\si': { pkg: 'siunitx', desc: 'Scientific SI units typesetting' },
        '\\colortbl': { pkg: 'colortbl', desc: 'Colored table rows and cells' },
      };

      for (const [cmd, info] of Object.entries(pkgMap)) {
        const regex = new RegExp(escapeRegex(cmd) + '(?![a-zA-Z])');
        if (regex.test(trimmedExcerpt)) {
          return {
            suggestion: `Command '${cmd}' requires the '${info.pkg}' package for ${info.desc}.`,
            quickFix: {
              label: `Add \\usepackage{${info.pkg}}`,
              action: 'insert_package',
              payload: `\\usepackage{${info.pkg}}`,
            },
          };
        }
      }

      return {
        suggestion: `Command not defined in current scope. Check for typos or verify that the required \\usepackage{...} is loaded in your preamble.`,
      };
    }

    // 2. Missing $ inserted
    if (normMsg.includes('missing $ inserted') || normMsg.includes('extra }, or forgotten $')) {
      return {
        suggestion: `Mathematical syntax or reserved characters (_, ^, &, %) found outside math mode. Wrap expression in $ ... $ or escape character with \\.`,
        quickFix: {
          label: 'Wrap in $...$',
          action: 'wrap_math',
          payload: '$...$',
        },
      };
    }

    // Font expansion / microtype scalable font requirement
    if (normMsg.includes('auto expansion is only possible with scalable fonts') || normMsg.includes('font expansion')) {
      return {
        suggestion: `pdfTeX microtype font expansion requires scalable vector fonts with T1 fontenc. Add \\usepackage{lmodern} right after \\usepackage[T1]{fontenc}.`,
        quickFix: {
          label: 'Add \\usepackage{lmodern}',
          action: 'insert_package',
          payload: '\\usepackage{lmodern}',
        },
      };
    }

    // 3. File not found
    if (normMsg.includes('file') && normMsg.includes('not found')) {
      const fileMatch = message.match(/['`"]([^'`"]+)['`"]/);
      const missingName = fileMatch ? fileMatch[1] : 'requested file';
      return {
        suggestion: `Target file '${missingName}' could not be located in workspace. Verify filename, directory path, or ensure package is installed.`,
      };
    }

    // 4. Environment mismatch
    if (
      normMsg.includes('ended by') ||
      (normMsg.includes('environment') && normMsg.includes('undefined'))
    ) {
      return {
        suggestion: `LaTeX environment mismatch or unclosed \\begin{...}. Verify that every \\begin{env} has a matching \\end{env}.`,
      };
    }

    // 5. Spurious line break
    if (normMsg.includes("there's no line here to end")) {
      return {
        suggestion: `Spurious '\\\\' line break. Do not use '\\\\' at the beginning of a section/paragraph or immediately following another line break.`,
        quickFix: {
          label: 'Remove spurious \\\\',
          action: 'replace',
          target: '\\\\',
          payload: '',
        },
      };
    }

    // 6. Citations & References
    if (normMsg.includes('citation') && normMsg.includes('undefined')) {
      return {
        suggestion: `Citation key undefined in bibliography. Check your .bib entries or re-run compiler passes to resolve cross-references.`,
      };
    }

    if (normMsg.includes('reference') && normMsg.includes('undefined')) {
      return {
        suggestion: `Cross-reference label undefined. Check \\label{...} key spelling and recompile to resolve cross-references.`,
      };
    }

    return {};
  }

  public static parse(logContent: string, defaultFile = 'main.tex'): DiagnosticError[] {
    const diagnostics: DiagnosticError[] = [];
    const lines = logContent.split('\n');

    let currentFile = defaultFile;
    let i = 0;

    // Regex patterns
    const fileEnterRegex = /\(([^()]+(?:\.tex|\.sty|\.cls|\.bib))/;
    const errorLineRegex = /^! (.+)$/;
    const lineNumRegex = /^l\.(\d+)(.*)$/;
    const warningRegex = /^LaTeX Warning: (.+) on input line (\d+)\.$/;

    while (i < lines.length) {
      const line = lines[i].trim();

      // Check for file context change
      const fileMatch = line.match(fileEnterRegex);
      if (fileMatch && fileMatch[1]) {
        currentFile = fileMatch[1].trim();
      }

      // 1. Check for standard LaTeX Error (starts with '!')
      const errorMatch = line.match(errorLineRegex);
      if (errorMatch) {
        const message = errorMatch[1].trim();
        let lineNum = 1;
        let excerpt = '';

        // Look ahead for "l.<number> <code excerpt>"
        let j = i + 1;
        while (j < Math.min(i + 8, lines.length)) {
          const ahead = lines[j].trim();
          const lMatch = ahead.match(lineNumRegex);
          if (lMatch) {
            lineNum = parseInt(lMatch[1], 10);
            excerpt = lMatch[2].trim();
            break;
          }
          j++;
        }

        const { suggestion, quickFix } = this.resolveSuggestion(message, excerpt, currentFile);

        diagnostics.push({
          id: `err-${diagnostics.length + 1}`,
          file: currentFile,
          line: lineNum,
          message,
          severity: 'error',
          excerpt: excerpt || undefined,
          suggestion,
          quickFix,
        });

        i = j;
        continue;
      }

      // 2. Check for LaTeX Warning with line number
      const warnMatch = line.match(warningRegex);
      if (warnMatch) {
        const warnMessage = warnMatch[1].trim();
        const lineNum = parseInt(warnMatch[2], 10);
        const { suggestion, quickFix } = this.resolveSuggestion(warnMessage, '', currentFile);

        diagnostics.push({
          id: `warn-${diagnostics.length + 1}`,
          file: currentFile,
          line: lineNum,
          message: warnMessage,
          severity: 'warning',
          suggestion,
          quickFix,
        });
      }

      i++;
    }

    return diagnostics;
  }
}
