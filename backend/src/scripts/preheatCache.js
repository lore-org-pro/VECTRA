// ========================================================
// VECTRA // PRE-HEAT AUDIO CACHE SCRIPT
// ========================================================
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { ttsService } from '../tts/ttsService.js';
import { audioCache } from '../tts/audioCache.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const responsesPath = path.resolve(__dirname, '../../../demo-data/demoResponses.json');

console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '        PRECALENTAMIENTO DE CACHÉ DE AUDIO VECTRA             ');
console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════════════════');

const ESSENTIAL_PHRASES = [
  '¡Hola! Soy VECTRA, tu asistente holográfico de álgebra vectorial y geometría analítica. Estoy listo para ayudarte con operaciones en dos y tres dimensiones. ¿Qué ejercicio deseas realizar?',
  'Soy VECTRA, un asistente inteligente especializado en cálculo vectorial. Puedo resolver sumas, restas, productos punto y cruz, planos, rectas tridimensionales y proyectar sus procedimientos paso a paso junto a modelos en tres dimensiones.',
  'Te escucho con total claridad. Todos los sistemas de reconocimiento de voz y cálculo vectorial están activos y calibrados al cien por ciento.',
  'Es un placer colaborar con la comunidad académica. La matemática vectorial es el lenguaje fundamental que describe la estructura geométrica de nuestro universo.',
  'Entendido. Regresando al modo de espera.',
  'VECTRA en línea. Haz una pregunta en voz alta.',
  'Comprendo tu pregunta. Como asistente especializado en álgebra vectorial, puedo calcular sumas, productos escalares y vectoriales, ángulos, planos y rectas en el espacio. Indícame los vectores a procesar.'
];

async function preheat() {
  console.log(`1. Precalentando ${ESSENTIAL_PHRASES.length} frases conversacionales esenciales...`);
  for (const phrase of ESSENTIAL_PHRASES) {
    if (audioCache.has(phrase)) {
      console.log(` \x1b[32m✓\x1b[0m Ya en caché: "${phrase.slice(0, 45)}..."`);
    } else {
      process.stdout.write(` ⏳ Sintetizando: "${phrase.slice(0, 45)}..." `);
      try {
        const res = await ttsService.synthesize(phrase);
        if (res.audioUrl) {
          console.log(`\x1b[32m✓ [${res.provider || 'tts'}]\x1b[0m`);
        } else {
          console.log(`\x1b[33m⚠ [sin url]\x1b[0m`);
        }
      } catch (err) {
        console.log(`\x1b[31m✗ Error: ${err.message}\x1b[0m`);
      }
    }
  }

  if (fs.existsSync(responsesPath)) {
    const responses = JSON.parse(fs.readFileSync(responsesPath, 'utf-8'));
    const entries = Object.entries(responses);
    console.log(`\n2. Precalentando audio para ${entries.length} preguntas de demostración...`);

    for (const [id, data] of entries) {
      const text = data.habla;
      if (audioCache.has(text)) {
        console.log(` \x1b[32m✓\x1b[0m [${id}] En caché: "${text.slice(0, 45)}..."`);
      } else {
        process.stdout.write(` ⏳ [${id}] Sintetizando: "${text.slice(0, 45)}..." `);
        try {
          const res = await ttsService.synthesize(text);
          if (res.audioUrl) {
            console.log(`\x1b[32m✓ [${res.provider || 'tts'}]\x1b[0m`);
          } else {
            console.log(`\x1b[33m⚠ [sin url]\x1b[0m`);
          }
        } catch (err) {
          console.log(`\x1b[31m✗ Error: ${err.message}\x1b[0m`);
        }
      }
    }
  }

  console.log('\x1b[36m%s\x1b[0m', '\n──────────────────────────────────────────────────────────────');
  console.log(' Proceso finalizado. Todo el audio pregrabado está en caché local.');
}

preheat();
