// ========================================================
// VECTRA // PRE-FLIGHT PROVIDERS CHECK SCRIPT
// ========================================================
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { llmRouter } from '../router/llmRouter.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const providersPath = path.resolve(__dirname, '../../../providers.json');

console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '      VERIFICACIÓN PRE-VUELO DE PROVEEDORES VECTRA            ');
console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════════════════');

async function checkAll() {
  const raw = fs.readFileSync(providersPath, 'utf-8');
  const providers = JSON.parse(raw);

  const testMessage = 'Calcula la magnitud de (3, 4, 0).';

  for (const p of providers) {
    if (!p.active) {
      console.log(` ⚪ [${p.name}]: Desactivado en providers.json`);
      continue;
    }

    const startTime = Date.now();
    try {
      const res = await llmRouter.route(testMessage, [], p.id);
      const latency = Date.now() - startTime;
      const actualProvider = res._meta?.providerUsed;
      if (actualProvider === p.id) {
        console.log(` \x1b[32m✓\x1b[0m [${p.name}]: OPERATIVO (${latency}ms)`);
      } else {
        console.log(` \x1b[33m⚠\x1b[0m [${p.name}]: Sin clave configurada (Saltó a ${res._meta?.providerName})`);
      }
    } catch (err) {
      console.log(` \x1b[31m✗\x1b[0m [${p.name}]: ERROR (${err.message})`);
    }
  }

  console.log('\x1b[36m%s\x1b[0m', '──────────────────────────────────────────────────────────────');
  console.log(' Diagnóstico completado. El sistema cuenta con Modo Demo Offline como respaldo total.');
}

checkAll();
