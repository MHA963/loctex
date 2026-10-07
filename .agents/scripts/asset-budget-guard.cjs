#!/usr/bin/env node
/**
 * AOS Automated Asset Performance & Web Vitals Guard (v1.2.0)
 * 
 * Machine-enforced quality gate preventing uncompressed media bloat,
 * scroll jank, and LCP/CLS regressions across all subagent tasks.
 * 
 * Rules Enforced:
 * 1. Max raster file size: 200 KB per image.
 * 2. Mandatory WebP/AVIF presence: Every JPG/PNG must have an accompanying .webp variant.
 * 3. Total image payload ceiling: 2.0 MB maximum per application.
 */

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const publicDir = path.join(cwd, 'public');
const srcAssetsDir = path.join(cwd, 'src', 'assets');

const MAX_INDIVIDUAL_ASSET_KB = 200;
const MAX_TOTAL_IMAGE_PAYLOAD_MB = 2.0;

function findImages(dir) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findImages(filePath));
    } else if (/\.(png|jpe?g|webp|avif|gif)$/i.test(file)) {
      results.push({
        path: filePath,
        relativePath: path.relative(cwd, filePath),
        sizeKB: stat.size / 1024,
        ext: path.extname(file).toLowerCase(),
        baseName: path.parse(file).name,
        dir: dir,
        name: file
      });
    }
  }
  return results;
}

const allImages = [...findImages(publicDir), ...findImages(srcAssetsDir)];

if (allImages.length === 0) {
  console.log('[AOS_ASSET_GUARD] No raster media found in public/ or src/assets/. Gate PASSED.');
  process.exit(0);
}

console.log(`[AOS_ASSET_GUARD] Auditing ${allImages.length} media assets against 60fps performance budgets...`);

let violations = [];
let totalPayloadKB = 0;

for (const img of allImages) {
  totalPayloadKB += img.sizeKB;

  // Rule 1: Individual size budget (unless it's an SVG/vector)
  if (img.sizeKB > MAX_INDIVIDUAL_ASSET_KB) {
    violations.push({
      file: img.relativePath,
      error: `File size (${img.sizeKB.toFixed(1)} KB) exceeds strict budget of ${MAX_INDIVIDUAL_ASSET_KB} KB. Run 'node optimize-images.cjs'.`
    });
  }

  // Rule 2: WebP variant check for JPG/PNG
  if (['.jpg', '.jpeg', '.png'].includes(img.ext)) {
    const expectedWebp = path.join(img.dir, `${img.baseName}.webp`);
    if (!fs.existsSync(expectedWebp)) {
      violations.push({
        file: img.relativePath,
        error: `Missing companion WebP format ('${img.baseName}.webp'). Modern dual-source <picture> delivery is required.`
      });
    }
  }
}

const totalMB = (totalPayloadKB / 1024).toFixed(2);
console.log(`[AOS_ASSET_GUARD] Total media weight: ${totalMB} MB (Ceiling: ${MAX_TOTAL_IMAGE_PAYLOAD_MB} MB)`);

if (totalPayloadKB / 1024 > MAX_TOTAL_IMAGE_PAYLOAD_MB) {
  violations.push({
    file: 'Total Workspace Media',
    error: `Total media payload (${totalMB} MB) exceeds maximum allowance of ${MAX_TOTAL_IMAGE_PAYLOAD_MB} MB.`
  });
}

if (violations.length > 0) {
  console.error(`\n❌ [AOS_ASSET_GUARD_FAILED] Asset performance gate failed with ${violations.length} violation(s):`);
  violations.forEach((v, idx) => {
    console.error(`  ${idx + 1}. [${v.file}]: ${v.error}`);
  });
  console.error('\nAction Required: Run asset optimizer and use <picture> tags with WebP before marking task DONE.\n');
  process.exit(1);
}

console.log(`✅ [AOS_ASSET_GUARD_PASSED] All ${allImages.length} assets pass strict Web Vitals & 60fps zero-jank performance budgets.`);
process.exit(0);
