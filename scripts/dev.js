import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Detección automática de la IP de red local activa
function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Priorizar IPv4 no internas
      if (iface.family === 'IPv4' && !iface.internal) {
        // Ignorar rangos APIPA de autoconfiguración (169.254.x.x)
        if (!iface.address.startsWith('169.254.')) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalNetworkIP();

console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '      💠 INICIALIZANDO SISTEMA HOLOGRÁFICO VECTRA 💠         ');
console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════════════════');
console.log('\x1b[32m%s\x1b[0m', `  ➜ Local:              https://localhost:5173/`);
console.log('\x1b[32m%s\x1b[0m', `  ➜ Red (Otra PC/Móvil): https://${localIP}:5173/`);
console.log('\x1b[33m%s\x1b[0m', `  🔒 Nota: En la otra PC usa HTTPS para que el navegador`);
console.log('\x1b[33m%s\x1b[0m', `     permita el micrófono automáticamente (acepta el aviso`);
console.log('\x1b[33m%s\x1b[0m', `     de certificado local una sola vez).`);
console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════════════════\n');

// Start backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  shell: true,
  stdio: 'inherit'
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  shell: true,
  stdio: 'inherit'
});

process.on('SIGINT', () => {
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 Deteniendo servicios VECTRA...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});
