import { spawn, spawnSync, execSync } from 'child_process';
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
  private engineType: 'tectonic' | 'pdflatex' | 'unknown' = 'unknown';

  constructor() {
    this.detectEngine();
  }

  private detectEngine(): 'tectonic' | 'pdflatex' | 'unknown' {
    try {
      execSync('tectonic --version', { stdio: 'ignore' });
      this.engineType = 'tectonic';
      return 'tectonic';
    } catch (_) {
      try {
        execSync('pdflatex --version', { stdio: 'ignore' });
        this.engineType = 'pdflatex';
        return 'pdflatex';
      } catch (__) {
        this.engineType = 'unknown';
        return 'unknown';
      }
    }
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

    if (this.engineType === 'unknown') {
      this.detectEngine();
    }

    const baseName = path.basename(mainTexFile, path.extname(mainTexFile));
    const pdfPath = path.resolve(projectDir, `${baseName}.pdf`);
    const synctexGz = path.resolve(projectDir, `${baseName}.synctex.gz`);
    const synctexPlain = path.resolve(projectDir, `${baseName}.synctex`);

    return new Promise((resolve) => {
      let command = 'tectonic';
      let args: string[] = [];

      if (this.engineType === 'tectonic') {
        command = 'tectonic';
        args = [
          '-X',
          'compile',
          mainTexFile,
          '--synctex',
          '--keep-logs',
          '--keep-intermediates',
          '--outdir',
          projectDir,
        ];
      } else {
        // Use pdflatex with non-blocking package installer
        command = 'pdflatex';
        args = [
          '-synctex=1',
          '-interaction=nonstopmode',
          '-enable-installer',
          mainTexFile,
        ];
      }

      let stdout = '';
      let stderr = '';

      let child;
      try {
        child = spawn(command, args, { cwd: projectDir, shell: false });
      } catch (err: any) {
        return resolve({
          success: false,
          diagnostics: [
            {
              id: 'err-exec',
              file: mainTexFile,
              line: 1,
              message: `Failed to launch TeX engine (${command}): ${err.message}`,
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

      child.on('close', async (code) => {
        let combinedLog = stdout + '\n' + stderr;

        const baseName = path.basename(mainTexFile, path.extname(mainTexFile));
        const auxFile = path.resolve(projectDir, `${baseName}.aux`);

        // Auto-heal: If pdfTeX fails due to scalable fonts requirement (T1 fontenc + microtype on MiKTeX), auto-inject lmodern
        if (!fs.existsSync(pdfPath) && combinedLog.includes('auto expansion is only possible with scalable fonts')) {
          try {
            const rawTex = fs.readFileSync(fullMainPath, 'utf-8');
            if (!rawTex.includes('{lmodern}')) {
              const healedTex = rawTex.replace(/(\\usepackage(?:\[[^\]]*\])?\{fontenc\})/, '$1\n\\usepackage{lmodern}');
              if (healedTex !== rawTex) {
                fs.writeFileSync(fullMainPath, healedTex, 'utf-8');
                const healResult = spawnSync(command, args, { cwd: projectDir, encoding: 'utf-8' });
                combinedLog = (healResult.stdout || '') + '\n' + (healResult.stderr || '');
              }
            }
          } catch (_) {}
        }

        // Run BibTeX and multi-pass for full citations if pdflatex was used
        if (this.engineType === 'pdflatex' && fs.existsSync(auxFile)) {
          try {
            spawnSync('bibtex', [baseName], { cwd: projectDir, stdio: 'ignore' });
            spawnSync('pdflatex', ['-synctex=1', '-interaction=nonstopmode', '-enable-installer', mainTexFile], { cwd: projectDir, stdio: 'ignore' });
          } catch (_) {}
        }

        const pdfExists = fs.existsSync(pdfPath);
        const synctexPath = fs.existsSync(synctexGz)
          ? synctexGz
          : fs.existsSync(synctexPlain)
          ? synctexPlain
          : undefined;

        let diagnostics = LaTeXErrorParser.parse(combinedLog, mainTexFile);
        if (pdfExists) {
          // If PDF was successfully created, filter out fatal abort warnings so UI stays green
          diagnostics = diagnostics.filter((d) => !d.message.includes('Fatal error') && !d.message.includes('no output PDF'));
        }

        resolve({
          success: pdfExists,
          pdfPath: pdfExists ? pdfPath : undefined,
          synctexPath,
          diagnostics,
          stdout: combinedLog,
          durationMs: Date.now() - startTime,
        });
      });
    });
  }
}
