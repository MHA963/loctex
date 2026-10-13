import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

export class ZipService {
  /**
   * Unpacks an Overleaf/Prism/standard LaTeX ZIP buffer into a target project directory.
   */
  public static async unpackZip(zipBuffer: Buffer, targetDir: string): Promise<{ mainFile: string; fileList: string[] }> {
    const zip = await JSZip.loadAsync(zipBuffer);
    const fileList: string[] = [];
    let detectedMainFile = 'main.tex';
    let foundMain = false;

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const entries = Object.keys(zip.files);

    for (const relativePath of entries) {
      const entry = zip.files[relativePath];
      const destPath = path.resolve(targetDir, relativePath);

      // Prevent directory traversal / Zip-Slip attacks
      const rel = path.relative(path.resolve(targetDir), destPath);
      if (rel.startsWith('..') || path.isAbsolute(rel) || rel === '') {
        continue;
      }

      if (entry.dir) {
        fs.mkdirSync(destPath, { recursive: true });
      } else {
        const parentDir = path.dirname(destPath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }

        const content = await entry.async('nodebuffer');
        fs.writeFileSync(destPath, content);
        fileList.push(relativePath);

        // Detect main file: looks for \begin{document} or main.tex / paper.tex
        if (!foundMain && relativePath.endsWith('.tex')) {
          if (relativePath.toLowerCase() === 'main.tex' || relativePath.toLowerCase() === 'paper.tex') {
            detectedMainFile = relativePath;
            foundMain = true;
          } else {
            const strContent = content.toString('utf-8');
            if (strContent.includes('\\begin{document}')) {
              detectedMainFile = relativePath;
              foundMain = true;
            }
          }
        }
      }
    }

    return { mainFile: detectedMainFile, fileList };
  }

  /**
   * Packages a project folder into a ZIP buffer for export.
   */
  public static async packProject(projectDir: string): Promise<Buffer> {
    const zip = new JSZip();

    const addFilesRecursively = (dir: string, baseDir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.resolve(dir, entry.name);
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

        // Skip temp/build artifacts
        if (
          entry.name === '.git' ||
          entry.name.endsWith('.synctex.gz') ||
          entry.name.endsWith('.aux') ||
          entry.name.endsWith('.fls') ||
          entry.name.endsWith('.fdb_latexmk')
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          addFilesRecursively(fullPath, baseDir);
        } else {
          const fileData = fs.readFileSync(fullPath);
          zip.file(relPath, fileData);
        }
      }
    };

    if (fs.existsSync(projectDir)) {
      addFilesRecursively(projectDir, projectDir);
    }

    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }
}
