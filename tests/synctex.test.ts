import { describe, it, expect } from 'vitest';
import { SyncTeXParser } from '../server/services/synctex-parser.ts';
import fs from 'fs';
import path from 'path';

describe('SyncTeXParser Tests', () => {
  const testSyncFile = path.resolve(process.cwd(), 'loctex_data', 'test.synctex');

  it('should parse raw synctex content into normalized bounding boxes', () => {
    const rawContent = `SyncTeX Version:1
Input:1:./main.tex
Input:2:./chapter1.tex
{1
x1,10,1:6553600,13107200:13107200,655360:0
k1,12,1:6553600,19660800:19660800,655360:0
}1
`;

    if (!fs.existsSync(path.dirname(testSyncFile))) {
      fs.mkdirSync(path.dirname(testSyncFile), { recursive: true });
    }
    fs.writeFileSync(testSyncFile, rawContent, 'utf-8');

    const boxes = SyncTeXParser.parse(testSyncFile);
    expect(boxes.length).toBe(2);
    expect(boxes[0].page).toBe(1);
    expect(boxes[0].line).toBe(10);
    expect(boxes[0].x).toBe(100); // 6553600 * 1/65536 = 100 pt
    expect(boxes[0].y).toBe(200); // 13107200 * 1/65536 = 200 pt
    expect(boxes[0].file).toBe('./main.tex');

    // Cleanup
    fs.unlinkSync(testSyncFile);
  });
});
