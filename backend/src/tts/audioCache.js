// ========================================================
// VECTRA // SHA-256 AUDIO DISK CACHE
// ========================================================
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheDir = path.resolve(__dirname, '../../cache/audio');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

export class AudioCache {
  getHash(text) {
    const normalized = (text || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
    return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24);
  }

  has(text) {
    const hash = this.getHash(text);
    const filePath = path.join(cacheDir, `${hash}.mp3`);
    return fs.existsSync(filePath);
  }

  getPath(text) {
    const hash = this.getHash(text);
    return path.join(cacheDir, `${hash}.mp3`);
  }

  getUrl(text) {
    const hash = this.getHash(text);
    return `/cache/audio/${hash}.mp3`;
  }

  save(text, buffer) {
    const filePath = this.getPath(text);
    fs.writeFileSync(filePath, buffer);
    return this.getUrl(text);
  }
}

export const audioCache = new AudioCache();
