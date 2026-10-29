import { defineConfig } from 'vitest/config';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Isolate test database and file operations to temp directory so tests NEVER pollute user's loctex_data
const TEST_DATA_DIR = path.resolve(os.tmpdir(), 'loctex_test_suite_data');
if (!fs.existsSync(TEST_DATA_DIR)) {
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
}
process.env.LOCTEX_DATA_DIR = TEST_DATA_DIR;

export default defineConfig({
  test: {
    environment: 'node',
  },
});
