// ========================================================
// VECTRA // AUTOMATED TESTS FOR VECTOR ENGINE
// ========================================================
import { vectorEngine } from '../math/vectorEngine.js';

console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '     PRUEBAS AUTOMATIZADAS DEL MOTOR MATEMÁTICO VECTRA        ');
console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════════════════');

let passed = 0;
let total = 0;

function assert(description, condition) {
  total++;
  if (condition) {
    passed++;
    console.log(` \x1b[32m✓\x1b[0m ${description}`);
  } else {
    console.error(` \x1b[31m✗\x1b[0m ${description}`);
  }
}

// 1. Suma
const sum = vectorEngine.add([2, 3, -1], [1, -4, 2]);
assert('Suma: (2,3,-1) + (1,-4,2) == (3,-1,1)', sum[0] === 3 && sum[1] === -1 && sum[2] === 1);

// 2. Resta
const sub = vectorEngine.subtract([4, 2, 1], [1, 5, -2]);
assert('Resta: (4,2,1) - (1,5,-2) == (3,-3,3)', sub[0] === 3 && sub[1] === -3 && sub[2] === 3);

// 3. Magnitud
const mag = vectorEngine.magnitude([3, -6, 2]);
assert('Magnitud: |(3,-6,2)| == 7', Math.abs(mag - 7) < 1e-6);

// 4. Vector Unitario
const unit = vectorEngine.unitVector([4, -3, 0]);
assert('Vector Unitario: u == (0.8, -0.6, 0)', Math.abs(unit[0] - 0.8) < 1e-6 && Math.abs(unit[1] - (-0.6)) < 1e-6);

// 5. Producto Punto y Ortogonalidad
const dot = vectorEngine.dotProduct([2, 3, -1], [-3, 2, 0]);
assert('Producto Punto: (2,3,-1) . (-3,2,0) == 0 (Ortogonales)', dot === 0 && vectorEngine.isOrthogonal([2, 3, -1], [-3, 2, 0]));

// 6. Ángulo entre vectores
const ang = vectorEngine.angleBetween([1, 1, 0], [0, 1, 1]);
assert('Ángulo: (1,1,0) y (0,1,1) == 60°', Math.abs(ang.degrees - 60) < 1e-2);

// 7. Producto Cruz
const cross = vectorEngine.crossProduct([1, 2, 3], [4, 5, 6]);
assert('Producto Cruz: (1,2,3) x (4,5,6) == (-3, 6, -3)', cross[0] === -3 && cross[1] === 6 && cross[2] === -3);

// 8. Área del Paralelogramo
const area = vectorEngine.areaParallelogram([3, 0, 2], [1, 4, 0]);
assert('Área Paralelogramo: √212 ≈ 14.56', Math.abs(area - Math.sqrt(212)) < 1e-4);

// 9. Volumen del Paralelepípedo (Producto Triple)
const vol = vectorEngine.tripleScalarProduct([1, 0, 2], [0, 2, 3], [3, 1, 0]);
assert('Volumen Paralelepípedo: |det| == 15', vol.volume === 15);

// 10. Ecuación del Plano
const plane = vectorEngine.planeEquation([2, -1, 4], [3, 2, -5]);
assert('Plano: 3x + 2y - 5z + 16 = 0', plane.coefficients.A === 3 && plane.coefficients.B === 2 && plane.coefficients.C === -5 && plane.coefficients.D === 16);

// 11. Distancia Punto a Plano
const dist = vectorEngine.distancePointToPlane([1, 2, 3], { A: 2, B: -1, C: 2, D: -5 });
assert('Distancia punto-plano: 1/3 ≈ 0.333', Math.abs(dist - 1 / 3) < 1e-4);

console.log('\x1b[36m%s\x1b[0m', '──────────────────────────────────────────────────────────────');
console.log(` Resultado: ${passed}/${total} pruebas superadas.`);
if (passed === total) {
  console.log('\x1b[32m%s\x1b[0m', ' 🌟 TODAS LAS OPERACIONES VECTORIALES SON 100% CORRECTAS.');
} else {
  process.exit(1);
}
