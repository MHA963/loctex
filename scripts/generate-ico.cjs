const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create a minimal uncompressed/deflated RGBA PNG buffer
function createSolidPng(width, height, r, g, b, a) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createPngChunk('IHDR', ihdrData);

  // Raw image data with scanline filters (filter byte 0 = none per row)
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Gold gradient with dark border
      const isBorder = (x === 0 || y === 0 || x === width - 1 || y === height - 1);
      if (isBorder) {
        rawData[pxOffset] = 71;   // R
        rawData[pxOffset + 1] = 63; // G
        rawData[pxOffset + 2] = 39; // B
        rawData[pxOffset + 3] = 255;
      } else {
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = a;
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = createPngChunk('IDAT', idatData);
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createPngChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// Standard IEEE 802.3 CRC32
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      const bit = (byte ^ crc) & 1;
      crc >>>= 1;
      if (bit) crc ^= 0xEDB88320;
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

// Pack PNG images into a standard multi-resolution .ico file
function packIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  let offset = 6 + count * 16;

  for (const img of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry[0] = img.width >= 256 ? 0 : img.width;
    entry[1] = img.height >= 256 ? 0 : img.height;
    entry[2] = 0; // color palette count
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.data.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset

    dirEntries.push(entry);
    offset += img.data.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.data)]);
}

// Gold color RGB: 212, 175, 55
const png16 = { width: 16, height: 16, data: createSolidPng(16, 16, 212, 175, 55, 255) };
const png32 = { width: 32, height: 32, data: createSolidPng(32, 32, 212, 175, 55, 255) };
const png48 = { width: 48, height: 48, data: createSolidPng(48, 48, 212, 175, 55, 255) };

const icoBuffer = packIco([png16, png32, png48]);

fs.mkdirSync('public', { recursive: true });
fs.mkdirSync('resources', { recursive: true });
fs.writeFileSync('public/favicon.ico', icoBuffer);
fs.writeFileSync('resources/icon.ico', icoBuffer);
console.log('✅ Generated public/favicon.ico and resources/icon.ico successfully.');
