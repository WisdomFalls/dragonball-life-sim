// Asset admission gate for the pixel-art renderer. It is deliberately small
// and dependency-free so the game can preserve its single-file build path.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PNG_SIGNATURE = '89504e470d0a1a0a';

export function inspectPng(buffer, label = 'image') {
  if (!Buffer.isBuffer(buffer) || buffer.length < 33 || buffer.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) {
    throw new Error(`${label} is not a PNG`);
  }
  if (buffer.subarray(12, 16).toString('ascii') !== 'IHDR') throw new Error(`${label} has no IHDR header`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colourType = buffer[25];
  // PNG types 4 and 6 include alpha. Indexed colour can include a tRNS chunk.
  const hasAlpha = colourType === 4 || colourType === 6 || buffer.includes(Buffer.from('tRNS'));
  return { width, height, hasAlpha, colourType };
}

function pngFiles(dir) {
  if (!statSync(dir).isDirectory()) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return pngFiles(path);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.png') ? [path] : [];
  });
}

export function validateArtDirectory(dir) {
  const failures = [];
  const files = pngFiles(dir);
  for (const file of files) {
    const info = inspectPng(readFileSync(file), file);
    if (!info.hasAlpha) failures.push(`${file}: must have a transparent alpha channel`);
    if (info.width > 1024 || info.height > 1024) failures.push(`${file}: exceeds the 1024px source-art limit`);
  }
  return { files, failures };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const result = validateArtDirectory(fileURLToPath(new URL('../src/art', import.meta.url)));
  if (result.failures.length) {
    console.error(result.failures.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`art assets valid (${result.files.length} PNG files)`);
  }
}

