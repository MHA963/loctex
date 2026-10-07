import fs from 'fs';
import zlib from 'zlib';
import { SyncTeXBox } from '../../src/types/index.ts';

export class SyncTeXParser {
  /**
   * Parses a .synctex or .synctex.gz file into structured bounding boxes.
   */
  public static parse(synctexFilePath: string): SyncTeXBox[] {
    if (!fs.existsSync(synctexFilePath)) {
      return [];
    }

    let content = '';
    if (synctexFilePath.endsWith('.gz')) {
      const buffer = fs.readFileSync(synctexFilePath);
      content = zlib.gunzipSync(buffer).toString('utf-8');
    } else {
      content = fs.readFileSync(synctexFilePath, 'utf-8');
    }

    const boxes: SyncTeXBox[] = [];
    const lines = content.split('\n');

    let currentPage = 1;
    const inputFiles: Record<string, string> = {};

    // Unit conversion: TeX scaled points (sp) to PostScript points (pt)
    // 1 pt = 65536 sp
    const SP_TO_PT = 1 / 65536;

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // File tags: Input:1:./main.tex
      if (line.startsWith('Input:')) {
        const parts = line.split(':');
        if (parts.length >= 3) {
          inputFiles[parts[1]] = parts.slice(2).join(':');
        }
        continue;
      }

      // Page marker: {1
      if (line.startsWith('{')) {
        const pageNum = parseInt(line.substring(1), 10);
        if (!isNaN(pageNum)) currentPage = pageNum;
        continue;
      }

      // Record lines:
      // x<tag>,<line>,<col>:<link_x>,<link_y>:<width>,<height>,<depth>
      // g<tag>,<line>,<col>:<link_x>,<link_y>
      // k<tag>,<line>,<col>:<link_x>,<link_y>:<width>,<height>,<depth>
      // h<tag>,<line>,<col>:<link_x>,<link_y>:<width>,<height>,<depth>
      // v<tag>,<line>,<col>:<link_x>,<link_y>:<width>,<height>,<depth>
      const typeChar = line[0];
      if (['x', 'k', 'h', 'v', 'g'].includes(typeChar)) {
        try {
          const rest = line.substring(1);
          const [tagLineCol, pos, dims] = rest.split(':');
          if (!tagLineCol || !pos) continue;

          const [tag, lineNum, colNum] = tagLineCol.split(',').map((v) => parseInt(v, 10));
          const [linkX, linkY] = pos.split(',').map((v) => parseInt(v, 10));

          let width = 100;
          let height = 14;
          if (dims) {
            const [w, h] = dims.split(',').map((v) => parseInt(v, 10));
            if (!isNaN(w) && w > 0) width = w * SP_TO_PT;
            if (!isNaN(h) && h > 0) height = h * SP_TO_PT;
          }

          const file = inputFiles[tag.toString()] || 'main.tex';

          boxes.push({
            page: currentPage,
            x: (linkX || 0) * SP_TO_PT,
            y: (linkY || 0) * SP_TO_PT,
            width: Math.max(width, 20),
            height: Math.max(height, 10),
            file,
            line: lineNum || 1,
            column: colNum || 1,
            tag: typeChar,
          });
        } catch (e) {
          // ignore malformed lines
        }
      }
    }

    return boxes;
  }
}
