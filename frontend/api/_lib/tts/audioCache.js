// ========================================================
// VECTRA // SHA-256 AUDIO CACHE — Vercel /tmp compatible
// ========================================================
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// On Vercel, /tmp is the only writable directory (512MB, ephemeral per function invocation)
// On local, use the standard backend/cache/audio path
const isVercel = process.env.VERCEL === '1';
const cacheDir = isVercel
  ? '/tmp/vectra_audio_cache'
  : path.resolve(process.cwd(), 'backend/cache/audio');

try {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
} catch {}

export class AudioCache {
  getHash(text) {
    const normalized = (text || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
    return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24);
  }

  has(text) {
    try {
      const hash = this.getHash(text);
      const filePath = path.join(cacheDir, `${hash}.mp3`);
      return fs.existsSync(filePath);
    } catch { return false; }
  }

  getPath(text) {
    const hash = this.getHash(text);
    return path.join(cacheDir, `${hash}.mp3`);
  }

  getUrl(text) {
    const hash = this.getHash(text);
    // Vercel: return as base64 data URI to avoid file serving issues
    if (isVercel) {
      return `/_audio_/${hash}.mp3`;
    }
    return `/cache/audio/${hash}.mp3`;
  }

  save(text, buffer) {
    try {
      const filePath = this.getPath(text);
      fs.writeFileSync(filePath, buffer);
    } catch {}
    return this.getUrl(text);
  }

  getBuffer(hash) {
    try {
      const filePath = path.join(cacheDir, `${hash}.mp3`);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
      }
    } catch {}
    return null;
  }
}

export const audioCache = new AudioCache();
