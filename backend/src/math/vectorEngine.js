// ========================================================
// VECTRA // DETERMINISTIC VECTOR & ANALYTIC GEOMETRY ENGINE
// ========================================================
import * as math from 'mathjs';

export class VectorEngine {
  // 1. Suma de vectores
  add(v1, v2) {
    const dim = Math.max(v1.length, v2.length, 3);
    const a = this.pad3D(v1);
    const b = this.pad3D(v2);
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  // 2. Resta de vectores
  subtract(v1, v2) {
    const a = this.pad3D(v1);
    const b = this.pad3D(v2);
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  // 3. Multiplicación por escalar
  multiplyScalar(v, k) {
    return v.map((comp) => comp * k);
  }

  // 4. Magnitud o norma euclidiana
  magnitude(v) {
    const sumSquares = v.reduce((sum, val) => sum + val * val, 0);
    return Math.sqrt(sumSquares);
  }

  // 5. Vector unitario (normalización)
  unitVector(v) {
    const mag = this.magnitude(v);
    if (mag === 0) return [0, 0, 0];
    return v.map((comp) => comp / mag);
  }

  // 6. Producto punto (escalar)
  dotProduct(v1, v2) {
    const a = this.pad3D(v1);
    const b = this.pad3D(v2);
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  // 7. Ángulo entre vectores (en grados y radianes)
  angleBetween(v1, v2) {
    const mag1 = this.magnitude(v1);
    const mag2 = this.magnitude(v2);
    if (mag1 === 0 || mag2 === 0) return { degrees: 0, radians: 0, cosTheta: 1 };

    const dot = this.dotProduct(v1, v2);
    let cosTheta = dot / (mag1 * mag2);
    // Control de imprecisiones numéricas en límites [-1, 1]
    cosTheta = Math.max(-1, Math.min(1, cosTheta));
    const radians = Math.acos(cosTheta);
    const degrees = (radians * 180) / Math.PI;

    return {
      radians,
      degrees: Math.round(degrees * 100) / 100,
      cosTheta: Math.round(cosTheta * 1000) / 1000
    };
  }

  // 8. Producto cruz (vectorial) en R³
  crossProduct(v1, v2) {
    const a = this.pad3D(v1);
    const b = this.pad3D(v2);
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  // 9. Proyección escalar y vectorial de v1 sobre v2
  projection(v1, v2) {
    const bMag = this.magnitude(v2);
    if (bMag === 0) return { scalarProj: 0, vectorProj: [0, 0, 0] };

    const dot = this.dotProduct(v1, v2);
    const scalarProj = dot / bMag;
    const factor = dot / (bMag * bMag);
    const vectorProj = this.pad3D(v2).map((comp) => comp * factor);

    return {
      scalarProj: Math.round(scalarProj * 1000) / 1000,
      vectorProj: vectorProj.map((c) => Math.round(c * 1000) / 1000)
    };
  }

  // 10. Verificación de ortogonalidad y paralelismo
  isOrthogonal(v1, v2) {
    return Math.abs(this.dotProduct(v1, v2)) < 1e-6;
  }

  isParallel(v1, v2) {
    const cross = this.crossProduct(v1, v2);
    return this.magnitude(cross) < 1e-6;
  }

  // 11. Área del paralelogramo y del triángulo
  areaParallelogram(v1, v2) {
    const cross = this.crossProduct(v1, v2);
    return this.magnitude(cross);
  }

  areaTriangle(v1, v2) {
    return this.areaParallelogram(v1, v2) / 2;
  }

  // 12. Volumen del paralelepípedo (Producto Triple Escalar)
  tripleScalarProduct(v1, v2, v3) {
    const cross23 = this.crossProduct(v2, v3);
    const triple = this.dotProduct(v1, cross23);
    return {
      raw: triple,
      volume: Math.abs(triple)
    };
  }

  // 13. Ecuaciones de la recta en R³ (Punto P0 y Vector Director v)
  lineEquations(point, direction) {
    const p = this.pad3D(point);
    const v = this.pad3D(direction);

    return {
      point: p,
      direction: v,
      vectorial: `\\vec{r}(t) = \\langle ${p[0]}, ${p[1]}, ${p[2]} \\rangle + t \\langle ${v[0]}, ${v[1]}, ${v[2]} \\rangle`,
      parametric: [
        `x = ${p[0]} + ${v[0]}t`,
        `y = ${p[1]} + ${v[1]}t`,
        `z = ${p[2]} + ${v[2]}t`
      ],
      symmetric: `\\frac{x - ${p[0]}}{${v[0]}} = \\frac{y - ${p[1]}}{${v[1]}} = \\frac{z - ${p[2]}}{${v[2]}}`
    };
  }

  // 14. Ecuación del plano en R³ (Punto P0 y Vector Normal n)
  planeEquation(point, normal) {
    const p = this.pad3D(point);
    const n = this.pad3D(normal);
    // A(x - x0) + B(y - y0) + C(z - z0) = 0 => Ax + By + Cz + D = 0
    const D = -(n[0] * p[0] + n[1] * p[1] + n[2] * p[2]);

    const signB = n[1] >= 0 ? `+ ${n[1]}` : `- ${Math.abs(n[1])}`;
    const signC = n[2] >= 0 ? `+ ${n[2]}` : `- ${Math.abs(n[2])}`;
    const signD = D >= 0 ? `+ ${D}` : `- ${Math.abs(D)}`;

    return {
      coefficients: { A: n[0], B: n[1], C: n[2], D },
      equationLatex: `${n[0]}x ${signB}y ${signC}z ${signD} = 0`,
      normal: n,
      point: p
    };
  }

  // 15. Distancia de punto a plano: |Ax0 + By0 + Cz0 + D| / sqrt(A^2 + B^2 + C^2)
  distancePointToPlane(point, planeCoeffs) {
    const p = this.pad3D(point);
    const { A, B, C, D } = planeCoeffs;
    const numerator = Math.abs(A * p[0] + B * p[1] + C * p[2] + D);
    const denominator = Math.sqrt(A * A + B * B + C * C);
    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  // 16. Dependencia / Independencia Lineal (Determinante 2x2 o 3x3)
  linearIndependence2D(v1, v2) {
    const det = v1[0] * v2[1] - v1[1] * v2[0];
    return {
      isIndependent: Math.abs(det) > 1e-6,
      determinant: det
    };
  }

  linearIndependence3D(v1, v2, v3) {
    const tsp = this.tripleScalarProduct(v1, v2, v3);
    return {
      isIndependent: Math.abs(tsp.raw) > 1e-6,
      determinant: tsp.raw
    };
  }

  // 17. Distancia euclidiana entre dos puntos/vectores
  distance(v1, v2) {
    const a = this.pad3D(v1);
    const b = this.pad3D(v2);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // 18. Punto medio entre dos vectores/puntos
  midpoint(v1, v2) {
    const a = this.pad3D(v1);
    const b = this.pad3D(v2);
    return [
      Math.round(((a[0] + b[0]) / 2) * 1000) / 1000,
      Math.round(((a[1] + b[1]) / 2) * 1000) / 1000,
      Math.round(((a[2] + b[2]) / 2) * 1000) / 1000
    ];
  }

  // 19. Cosenos y ángulos directores (α, β, γ respecto a ejes X, Y, Z)
  directionCosines(v) {
    const mag = this.magnitude(v);
    if (mag === 0) return { cosAlpha: 0, cosBeta: 0, cosGamma: 0, alphaDeg: 0, betaDeg: 0, gammaDeg: 0 };
    const p = this.pad3D(v);
    const cosA = p[0] / mag;
    const cosB = p[1] / mag;
    const cosG = p[2] / mag;
    return {
      cosAlpha: Math.round(cosA * 1000) / 1000,
      cosBeta: Math.round(cosB * 1000) / 1000,
      cosGamma: Math.round(cosG * 1000) / 1000,
      alphaDeg: Math.round((Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / Math.PI) * 10) / 10,
      betaDeg: Math.round((Math.acos(Math.max(-1, Math.min(1, cosB))) * 180 / Math.PI) * 10) / 10,
      gammaDeg: Math.round((Math.acos(Math.max(-1, Math.min(1, cosG))) * 180 / Math.PI) * 10) / 10
    };
  }

  // 20. Producto Triple Vectorial: A x (B x C) = (A·C)B - (A·B)C (Identidad BAC-CAB)
  tripleVectorProduct(v1, v2, v3) {
    const bCrossC = this.crossProduct(v2, v3);
    const result = this.crossProduct(v1, bCrossC);
    const dotAC = this.dotProduct(v1, v3);
    const dotAB = this.dotProduct(v1, v2);
    return {
      result,
      dotAC,
      dotAB,
      formulaText: `(\\vec{A} \\cdot \\vec{C})\\vec{B} - (\\vec{A} \\cdot \\vec{B})\\vec{C}`
    };
  }

  // 21. Coordenadas esféricas y cilíndricas a partir de cartesianas (x, y, z)
  spherical(v) {
    const p = this.pad3D(v);
    const rho = this.magnitude(p);
    const thetaRad = Math.atan2(p[1], p[0]); // Ángulo azimutal
    const phiRad = rho === 0 ? 0 : Math.acos(Math.max(-1, Math.min(1, p[2] / rho))); // Ángulo polar
    return {
      rho: Math.round(rho * 1000) / 1000,
      thetaDeg: Math.round(((thetaRad * 180 / Math.PI + 360) % 360) * 100) / 100,
      phiDeg: Math.round((phiRad * 180 / Math.PI) * 100) / 100
    };
  }

  cylindrical(v) {
    const p = this.pad3D(v);
    const r = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
    const thetaRad = Math.atan2(p[1], p[0]);
    return {
      r: Math.round(r * 1000) / 1000,
      thetaDeg: Math.round(((thetaRad * 180 / Math.PI + 360) % 360) * 100) / 100,
      z: p[2]
    };
  }

  // Helper para garantizar 3 coordenadas [x, y, z]
  pad3D(v) {
    if (!Array.isArray(v)) return [0, 0, 0];
    return [v[0] || 0, v[1] || 0, v[2] || 0];
  }
}

export const vectorEngine = new VectorEngine();
