import { DiagnosticError } from '../../src/types/index.ts';

export class LaTeXErrorParser {
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
    const genericWarningRegex = /^(.+ Warning: .+)$/;

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

        diagnostics.push({
          id: `err-${diagnostics.length + 1}`,
          file: currentFile,
          line: lineNum,
          message,
          severity: 'error',
          excerpt: excerpt || undefined,
        });

        i = j;
        continue;
      }

      // 2. Check for LaTeX Warning with line number
      const warnMatch = line.match(warningRegex);
      if (warnMatch) {
        diagnostics.push({
          id: `warn-${diagnostics.length + 1}`,
          file: currentFile,
          line: parseInt(warnMatch[2], 10),
          message: warnMatch[1].trim(),
          severity: 'warning',
        });
      }

      i++;
    }

    return diagnostics;
  }
}
