import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { DiagnosticError } from '../../src/types/index.ts';
import { LaTeXErrorParser } from './error-parser.ts';

export interface CompilationResponse {
  success: boolean;
  pdfPath?: string;
  synctexPath?: string;
  diagnostics: DiagnosticError[];
  stdout: string;
  durationMs: number;
}

export class TectonicRunner {
  private executablePath: string;

  constructor(executablePath = 'tectonic') {
    this.executablePath = executablePath;
  }

  public async compile(projectDir: string, mainTexFile = 'main.tex'): Promise<CompilationResponse> {
    const startTime = Date.now();
    const fullMainPath = path.resolve(projectDir, mainTexFile);

    if (!fs.existsSync(fullMainPath)) {
      return {
        success: false,
        diagnostics: [
          {
            id: 'err-missing-main',
            file: mainTexFile,
            line: 1,
            message: `Main TeX file '${mainTexFile}' not found in project directory.`,
            severity: 'error',
          },
        ],
        stdout: '',
        durationMs: Date.now() - startTime,
      };
    }

    return new Promise((resolve) => {
      const args = [
        '-X',
        'compile',
        mainTexFile,
        '--synctex',
        '--keep-logs',
        '--keep-intermediates',
        '--outdir',
        projectDir,
      ];

      let stdout = '';
      let stderr = '';

      let child;
      try {
        child = spawn(this.executablePath, args, { cwd: projectDir, shell: true });
      } catch (err: any) {
        return resolve({
          success: false,
          diagnostics: [
            {
              id: 'err-exec',
              file: mainTexFile,
              line: 1,
              message: `Failed to launch TeX engine: ${err.message}`,
              severity: 'error',
            },
          ],
          stdout: '',
          durationMs: Date.now() - startTime,
        });
      }

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (err) => {
        const diagnostics = LaTeXErrorParser.parse(stderr + '\n' + stdout, mainTexFile);
        if (diagnostics.length === 0) {
          diagnostics.push({
            id: 'err-spawn',
            file: mainTexFile,
            line: 1,
            message: err.message,
            severity: 'error',
          });
        }
        resolve({
          success: false,
          diagnostics,
          stdout: stdout + '\n' + stderr,
          durationMs: Date.now() - startTime,
        });
      });

      child.on('close', (code) => {
        const durationMs = Date.now() - startTime;
        const combinedLog = stdout + '\n' + stderr;
        const diagnostics = LaTeXErrorParser.parse(combinedLog, mainTexFile);

        const baseName = path.basename(mainTexFile, path.extname(mainTexFile));
        const pdfPath = path.resolve(projectDir, `${baseName}.pdf`);
        const synctexPath = path.resolve(projectDir, `${baseName}.synctex.gz`);

        const pdfExists = fs.existsSync(pdfPath);

        resolve({
          success: code === 0 && pdfExists,
          pdfPath: pdfExists ? pdfPath : undefined,
          synctexPath: fs.existsSync(synctexPath) ? synctexPath : undefined,
          diagnostics,
          stdout: combinedLog,
          durationMs,
        });
      });
    });
  }
}
