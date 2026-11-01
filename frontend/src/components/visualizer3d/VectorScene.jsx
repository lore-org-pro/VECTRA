import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RotateCcw, Box, Play, Pause, Layers, Info, Compass, Sparkles, Eye, Shield, GraduationCap, Volume2, ArrowLeft } from 'lucide-react';
import { soundFX } from '../../utils/audioFX';

// ══════════════════════════════════════════════
// Paleta de Colores y Resolución Universal
// ══════════════════════════════════════════════
const COLOR_NAMES_MAP = {
  rojo: '#ef4444',
  red: '#ef4444',
  azul: '#3b82f6',
  blue: '#3b82f6',
  verde: '#10b981',
  green: '#10b981',
  amarillo: '#facc15',
  yellow: '#facc15',
  morado: '#a855f7',
  purple: '#a855f7',
  naranja: '#f97316',
  orange: '#f97316',
  cian: '#00f5ff',
  cyan: '#00f5ff',
  magenta: '#ec4899',
  rosa: '#f43f5e',
  blanco: '#ffffff',
  white: '#ffffff'
};

const DEFAULT_PALETTE = ['#00f5ff', '#ff6b35', '#10b981', '#f43f5e', '#a855f7', '#ffd700'];

function resolveHexColor(rawColor, fallbackHex = '#00f5ff') {
  if (!rawColor) return fallbackHex;
  const str = String(rawColor).toLowerCase().trim();
  if (COLOR_NAMES_MAP[str]) return COLOR_NAMES_MAP[str];
  if (str.startsWith('#')) {
    // Validar longitud
    if (str.length === 4 || str.length === 7) return str;
  }
  return fallbackHex;
}

function hexToNumber(hexStr) {
  try {
    return parseInt(hexStr.replace('#', '0x'), 16);
  } catch {
    return 0x00f5ff;
  }
}

function parseCoordinates(vec) {
  const raw = vec?.componentes || vec?.coordenadas || vec?.coords || vec?.vector || vec?.valores;
  if (Array.isArray(raw)) {
    return [
      Number(raw[0]) || 0,
      Number(raw[1]) || 0,
      Number(raw[2]) || 0
    ];
  }
  if (raw && typeof raw === 'object') {
    return [
      Number(raw.x) || 0,
      Number(raw.y) || 0,
      Number(raw.z) || 0
    ];
  }
  return [0, 0, 0];
}

// ══════════════════════════════════════════════
// Sprites de Alta Fidelidad Holográfica Ultra-Nítidos (Hi-DPI)
// ══════════════════════════════════════════════

// 1. Badge Holográfico Elegante para Vectores (Nombre + Coordenadas + Magnitud)
// DPI 2x: canvas reducido a 560×90 lógicos para badges más compactos y claros
function createVectorBadgeSprite({ name, coords, mag, colorHex = '#00f5ff', isResult = false }) {
  const DPI = 2;
  const W = 560, H = 90;
  const canvas = document.createElement('canvas');
  canvas.width = W * DPI;
  canvas.height = H * DPI;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPI, DPI);

  // Fondo semi-transparente más limpio
  ctx.shadowColor = colorHex;
  ctx.shadowBlur = isResult ? 18 : 10;
  ctx.fillStyle = isResult ? 'rgba(6, 28, 20, 0.88)' : 'rgba(4, 12, 30, 0.85)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(4, 4, W - 8, H - 8, 16);
  else ctx.rect(4, 4, W - 8, H - 8);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Borde neón — más delgado y limpio
  ctx.strokeStyle = colorHex + '44';
  ctx.lineWidth = 5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(4, 4, W - 8, H - 8, 16);
  ctx.stroke();
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = isResult ? 2.5 : 1.8;
  ctx.stroke();

  // Franja lateral de color
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, colorHex + 'bb');
  grad.addColorStop(1, colorHex + '22');
  ctx.fillStyle = grad;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(4, 4, 8, H - 8, [16, 0, 0, 16]);
  ctx.fill();

  // Punto indicador de color
  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 10;
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.arc(30, H / 2, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Nombre del vector
  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 8;
  ctx.font = 'bold 34px "JetBrains Mono", monospace, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colorHex;
  ctx.fillText(`→${name}`, 50, H / 2);
  ctx.shadowBlur = 0;

  // Separador vertical
  ctx.strokeStyle = 'rgba(148,163,184,0.25)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(115, 14); ctx.lineTo(115, H - 14);
  ctx.stroke();

  // Coordenadas
  const coordText = `(${coords.map(c => Number.isInteger(c) ? c : c.toFixed(2)).join(', ')})`;
  ctx.font = '600 28px "JetBrains Mono", monospace, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(coordText, 126, H / 2);

  // Pill de magnitud a la derecha
  const magText = `‖v‖ ${mag}`;
  ctx.font = 'bold 22px "JetBrains Mono", monospace, sans-serif';
  const magW = ctx.measureText(magText).width + 18;
  const magX = W - magW - 8;
  const magY = H / 2;

  ctx.fillStyle = isResult ? 'rgba(16,185,129,0.25)' : 'rgba(0,245,255,0.14)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(magX, magY - 16, magW, 32, 9);
  ctx.fill();
  ctx.strokeStyle = isResult ? '#10b981' : colorHex;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = isResult ? '#6ee7b7' : '#bae6fd';
  ctx.textAlign = 'center';
  ctx.fillText(magText, magX + magW / 2, magY);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  return sprite;
}

// 2. Badge Compacto de Ángulo entre Vectores
function createAngleBadgeSprite(angleDeg) {
  const DPI = 2;
  const W = 360, H = 110;
  const canvas = document.createElement('canvas');
  canvas.width = W * DPI;
  canvas.height = H * DPI;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPI, DPI);

  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 20;
  ctx.fillStyle = 'rgba(24, 18, 4, 0.97)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(5, 5, W - 10, H - 10, 20);
  else ctx.rect(5, 5, W - 10, H - 10);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#facc1566';
  ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3; ctx.stroke();

  ctx.font = 'bold 48px "JetBrains Mono", monospace, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#fde68a';
  ctx.fillText(`θ = ${angleDeg}°`, W / 2, H / 2);
  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  return sprite;
}

// 3. Badge Compacto para Ejes Cartesianos (+X, +Y, +Z)
function createAxisBadgeSprite(axisName, colorHex) {
  const DPI = 2;
  const W = 220, H = 100;
  const canvas = document.createElement('canvas');
  canvas.width = W * DPI;
  canvas.height = H * DPI;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPI, DPI);

  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 16;
  ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(5, 5, W - 10, H - 10, 18);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = colorHex + '55';
  ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 2.5; ctx.stroke();

  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 10;
  ctx.font = 'bold 50px "JetBrains Mono", monospace, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(axisName, W / 2, H / 2);
  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  return sprite;
}


// ══════════════════════════════════════════════
// Vector 3D de Alta Fidelidad Holográfica y Elegante
// ══════════════════════════════════════════════
function createVector3DMesh(start, end, hexColor, radius = 0.14, headRadius = 0.36, headHeight = 0.75, isResult = false) {
  const group = new THREE.Group();
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  if (length < 0.001) return group;

  const actualRadius = isResult ? radius * 1.15 : radius;
  const actualHeadR = isResult ? headRadius * 1.15 : headRadius;
  const actualHeadH = isResult ? headHeight * 1.1 : headHeight;
  const shaftLength = Math.max(0.02, length - actualHeadH);

  // Material metálico-emisivo estilizado, limpio sin saturación quemada
  const mat = new THREE.MeshStandardMaterial({
    color: hexColor,
    roughness: 0.2,
    metalness: 0.6,
    emissive: hexColor,
    emissiveIntensity: isResult ? 0.75 : 0.5
  });

  // 1. Tubo liso y elegante del vector (sin anillos tipo oruga)
  const shaftGeo = new THREE.CylinderGeometry(actualRadius, actualRadius, shaftLength, 32);
  shaftGeo.translate(0, shaftLength / 2, 0);
  const shaftMesh = new THREE.Mesh(shaftGeo, mat);
  group.add(shaftMesh);

  // 2. Cono aerodinámico y afilado en la punta
  const headGeo = new THREE.ConeGeometry(actualHeadR, actualHeadH, 32);
  headGeo.translate(0, actualHeadH / 2, 0);
  const headMesh = new THREE.Mesh(headGeo, mat);
  headMesh.position.y = shaftLength;
  group.add(headMesh);

  // 3. Puntero sutil en la cúspide (delicado y nítido)
  const tipGeo = new THREE.SphereGeometry(actualRadius * 0.75, 16, 16);
  const tipMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 });
  const tipMesh = new THREE.Mesh(tipGeo, tipMat);
  tipMesh.position.y = length;
  group.add(tipMesh);

  // Orientar hacia la dirección del vector
  group.position.copy(start);
  const up = new THREE.Vector3(0, 1, 0);
  const normDir = dir.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normDir);
  group.setRotationFromQuaternion(quaternion);

  return group;
}

// ══════════════════════════════════════════════
// Campo Estelar Cósmico (adaptativo a la escala de vectores)
// ══════════════════════════════════════════════
function createStarFieldPoints(count = 300, maxMag = 10) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  // Las estrellas siempre quedan más lejos que los vectores más grandes
  const innerR = Math.max(30, maxMag * 4.5);
  const spread = Math.max(60, maxMag * 6.0);

  for (let i = 0; i < count; i++) {
    const r = innerR + Math.random() * spread;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const tint = Math.random();
    if (tint > 0.6) {
      colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 1.0;
    } else if (tint > 0.3) {
      colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 1.0;
    } else {
      colors[i * 3] = 0.4; colors[i * 3 + 1] = 0.5; colors[i * 3 + 2] = 0.8;
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: Math.max(0.22, maxMag * 0.015),
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Points(geo, mat);
}

// ══════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════
export default function VectorScene({ 
  visualizationData = null, 
  theme = 'cyan',
  harvardLecture = '',
  onSpeakLecture = null,
  onGoBackToResult = null
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const targetCenterRef = useRef(new THREE.Vector3(0, 0.5, 0));
  const maxMagRef = useRef(10);

  const [autoRotate, setAutoRotate] = useState(true);
  const [showProjections, setShowProjections] = useState(true);
  const [showStatsCard, setShowStatsCard] = useState(true);
  const [cameraPreset, setCameraPreset] = useState('3d'); // '3d' | 'xy' | 'xz' | 'yz'

  const [vectorHUDInfo, setVectorHUDInfo] = useState({
    vectors: [],
    angleDeg: null,
    dotProduct: null,
    crossProduct: null
  });

  const autoRotateRef = useRef(true);
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);

  const showProjectionsRef = useRef(true);
  useEffect(() => {
    showProjectionsRef.current = showProjections;
    if (sceneRef.current?.projectionGroup) {
      sceneRef.current.projectionGroup.visible = showProjections;
    }
  }, [showProjections]);

  // ──────────────────────────────────────────────
  // 1. Inicialización de la Escena Three.js
  // ──────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    // Niebla lineal adaptativa: evita pantalla negra a cualquier distancia
    scene.fog = new THREE.Fog(0x020617, 30, 200);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // POST-PROCESADO CINEMATOGRÁFICO UNREAL ENGINE (Bloom Holográfico)
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.35,  // resplandor sutil y limpio (sin cegar ni quemar)
      0.25,  // radio de dispersión controlado
      0.82   // umbral para que solo los elementos luminosos brillen
    );
    composer.addPass(bloomPass);

    // Luces
    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.4);
    mainLight.position.set(12, 18, 14);
    scene.add(mainLight);

    const blueLight = new THREE.DirectionalLight(0x00f5ff, 0.7);
    blueLight.position.set(-10, -6, -8);
    scene.add(blueLight);

    // Fondo de estrellas (se reconstruye por visualizationData en el segundo useEffect)
    const starsGroup = new THREE.Group();
    starsGroup.name = 'starsGroup';
    const stars = createStarFieldPoints(300, 10);
    starsGroup.add(stars);
    scene.add(starsGroup);

    // Grupos dinámicos de rejilla y ejes para escalado inteligente
    const gridGroup = new THREE.Group();
    scene.add(gridGroup);

    const axesGroup = new THREE.Group();
    scene.add(axesGroup);

    // Esfera emisiva del Origen — pequeña y elegante
    const originGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const originMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00f5ff,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const originMesh = new THREE.Mesh(originGeo, originMat);
    scene.add(originMesh);

    const originLight = new THREE.PointLight(0x00f5ff, 1.2, 8);
    scene.add(originLight);

    // Grupo de vectores dinámicos
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);

    // Grupo de proyecciones y sombras al suelo
    const projectionGroup = new THREE.Group();
    scene.add(projectionGroup);

    // ── Control Orbital Esférico ──
    let isInteracting = false;
    let prevPointer = { x: 0, y: 0 };
    let spherical = { radius: 13.5, theta: Math.PI / 4, phi: Math.PI / 3 };

    const updateCamera = () => {
      const tgt = targetCenterRef.current || new THREE.Vector3(0, 0.5, 0);
      camera.position.x = tgt.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = tgt.y + spherical.radius * Math.cos(spherical.phi);
      camera.position.z = tgt.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(tgt);
    };
    updateCamera();

    // Eventos Mouse y Touch con límites dinámicos
    const onMouseDown = (e) => {
      isInteracting = true;
      prevPointer = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e) => {
      if (!isInteracting) return;
      spherical.theta -= (e.clientX - prevPointer.x) * 0.0075;
      spherical.phi = Math.max(0.04, Math.min(Math.PI - 0.04, spherical.phi - (e.clientY - prevPointer.y) * 0.0075));
      updateCamera();
      prevPointer = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isInteracting = false; };
    const onWheel = (e) => {
      const curMax = maxMagRef.current || 10;
      const minR = Math.max(2.0, curMax * 0.15);
      const maxR = Math.max(60, curMax * 5.0);
      const zoomStep = 0.009 * Math.max(1, curMax / 25);
      spherical.radius = Math.max(minR, Math.min(maxR, spherical.radius + e.deltaY * zoomStep));
      updateCamera();
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isInteracting = true;
        prevPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e) => {
      if (!isInteracting || e.touches.length !== 1) return;
      spherical.theta -= (e.touches[0].clientX - prevPointer.x) * 0.008;
      spherical.phi = Math.max(0.04, Math.min(Math.PI - 0.04, spherical.phi - (e.touches[0].clientY - prevPointer.y) * 0.008));
      updateCamera();
      prevPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => { isInteracting = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // ── Animación y Render ──
    let animId;
    const startTime = Date.now();
    let animProgress = 0;

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const elapsed = (Date.now() - startTime) / 1000;

      // Crecimiento fluido inicial
      if (animProgress < 1.0) {
        animProgress = Math.min(1.0, animProgress + 0.03);
        const ease = 1 - Math.pow(1 - animProgress, 3);
        dynamicGroup.scale.set(ease, ease, ease);
        projectionGroup.scale.set(ease, ease, ease);
      }

      // Auto-rotación
      if (autoRotateRef.current && !isInteracting) {
        spherical.theta += 0.004;
        updateCamera();
      }

      // Pulso sutil del origen
      const pulse = 1.0 + Math.sin(elapsed * 2.0) * 0.08;
      originMesh.scale.setScalar(pulse);
      originLight.intensity = 1.0 + Math.sin(elapsed * 2.5) * 0.3;

      starsGroup.rotation.y += 0.00015;
      gridGroup.rotation.y += 0.0005;
      composer.render();
    };
    renderLoop();

    sceneRef.current = {
      scene,
      camera,
      renderer,
      composer,
      dynamicGroup,
      projectionGroup,
      gridGroup,
      axesGroup,
      starsGroup,
      spherical,
      updateCamera,
      triggerGrow: () => {
        animProgress = 0;
        dynamicGroup.scale.set(0.001, 0.001, 0.001);
        projectionGroup.scale.set(0.001, 0.001, 0.001);
      }
    };

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          composer.setSize(w, h);
          bloomPass.resolution.set(w, h);
        }
      }
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  // ──────────────────────────────────────────────
  // 2. Construcción Reactiva de Vectores y Geometría
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene, camera, dynamicGroup, projectionGroup, gridGroup, axesGroup, starsGroup, spherical, updateCamera, triggerGrow } = sceneRef.current;

    // Limpiar grupos previos
    const cleanGroup = (grp) => {
      if (!grp) return;
      while (grp.children.length > 0) {
        const obj = grp.children[0];
        grp.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      }
    };
    cleanGroup(dynamicGroup);
    cleanGroup(projectionGroup);
    cleanGroup(gridGroup);
    cleanGroup(axesGroup);

    // Respaldo didáctico si no hay vectores válidos
    const defaultVectors = [
      { nombre: 'u', componentes: [2, 3, -1], color: '#00f5ff' },
      { nombre: 'v', componentes: [1, -4, 2], color: '#ff6b35' },
      { nombre: 'R', componentes: [3, -1, 1], color: '#10b981' }
    ];

    const inputVectors = Array.isArray(visualizationData?.vectores) && visualizationData.vectores.length > 0
      ? visualizationData.vectores
      : defaultVectors;

    const opType = visualizationData?.tipo || 'suma';

    let maxMag = 4;
    const pointsList = [];
    const infoList = [];

    // Primera pasada para calcular magnitud máxima y centro
    inputVectors.forEach((rawVec) => {
      const coords = parseCoordinates(rawVec);
      const tip = new THREE.Vector3(coords[0], coords[1], coords[2]);
      const mag = Math.round(tip.length() * 100) / 100;
      if (mag > maxMag) maxMag = mag;
    });

    maxMagRef.current = maxMag;

    // Reconstruir campo estelar adaptado a la escala actual
    if (starsGroup) {
      while (starsGroup.children.length > 0) {
        const s = starsGroup.children[0];
        starsGroup.remove(s);
        if (s.geometry) s.geometry.dispose();
        if (s.material) s.material.dispose();
      }
      starsGroup.add(createStarFieldPoints(320, maxMag));
    }

    // Proporciones holográficas dinámicas según la escala de los vectores
    const camDist = Math.max(12.0, maxMag * 2.3);
    const shaftR = Math.max(0.14, Math.min(0.65, maxMag * 0.02));
    const headR = shaftR * 2.5;
    const headH = Math.max(0.75, Math.min(3.0, maxMag * 0.065));
    const lightDist = Math.max(8.0, maxMag * 1.4);

    // Dimensiones compactas y ultra-nítidas para los badges
    const badgeW = Math.max(2.0, Math.min(3.4, maxMag * 0.14));
    const badgeH = badgeW * (90 / 560);

    inputVectors.forEach((rawVec, idx) => {
      const coords = parseCoordinates(rawVec);
      const [x, y, z] = coords;
      const tip = new THREE.Vector3(x, y, z);
      const mag = Math.round(tip.length() * 100) / 100;
      pointsList.push(tip);

      const isResult = (opType === 'suma' && idx === inputVectors.length - 1);
      const colorHex = resolveHexColor(rawVec.color, isResult ? '#10b981' : DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length]);
      const colorNum = hexToNumber(colorHex);

      const defaultName = opType === 'suma'
        ? (idx === inputVectors.length - 1 ? 'R' : (idx === 0 ? 'A' : 'B'))
        : (idx === 0 ? 'u' : (idx === 1 ? 'v' : `v_${idx + 1}`));

      const vecName = rawVec.nombre || rawVec.name || defaultName;

      infoList.push({
        nombre: vecName,
        componentes: [x, y, z],
        color: colorHex,
        magnitud: mag,
        isResult
      });

      // 1. Malla 3D del Vector con brillo y proporción limpia
      const mesh = createVector3DMesh(new THREE.Vector3(0, 0, 0), tip, colorNum, shaftR, headR, headH, isResult);
      dynamicGroup.add(mesh);

      // 2. Badge Holográfico con posicionamiento inteligente anti-colisión
      const badge = createVectorBadgeSprite({
        name: vecName,
        coords: [x, y, z],
        mag,
        colorHex,
        isResult
      });
      badge.scale.set(badgeW, badgeH, 1);

      // Posición: más allá de la punta, escalonada para que no colisione con el cono ni con otros badges
      const dirNorm = tip.length() > 0.001 ? tip.clone().normalize() : new THREE.Vector3(0, 1, 0);

      const perpOffset = new THREE.Vector3(
        Math.cos(idx * 2.4 + 0.8),
        0,
        Math.sin(idx * 2.4 + 0.8)
      ).multiplyScalar(badgeH * (0.8 + idx * 0.4));

      const primaryOffset = dirNorm.clone().multiplyScalar(headH * 1.5 + badgeH * 1.0);

      const elevSign = (idx % 2 === 0) ? 1 : -1;
      const elevOffset = new THREE.Vector3(0, elevSign * badgeH * 0.7 * (1 + idx * 0.25), 0);

      const badgePos = tip.clone().add(primaryOffset).add(perpOffset).add(elevOffset);
      badge.position.copy(badgePos);
      dynamicGroup.add(badge);

      // Línea líder sutil y nítida
      const leaderGeo = new THREE.BufferGeometry().setFromPoints([tip, badgePos]);
      const leaderMat = new THREE.LineDashedMaterial({
        color: colorNum,
        dashSize: Math.max(0.1, headH * 0.2),
        gapSize: Math.max(0.06, headH * 0.12),
        transparent: true,
        opacity: 0.35,
        linewidth: 1
      });
      const leaderLine = new THREE.Line(leaderGeo, leaderMat);
      leaderLine.computeLineDistances();
      dynamicGroup.add(leaderLine);

      // 3. Luz puntual suave en la punta
      const light = new THREE.PointLight(colorNum, isResult ? 1.4 : 0.8, lightDist * 0.8);
      light.position.set(x, y, z);
      dynamicGroup.add(light);

      // 4. Proyección Geométrica al Suelo: Retícula Sonar Discreta
      const floorPoint = new THREE.Vector3(x, 0, z);

      // Línea vertical discontinua de caída al plano XZ
      const dropDashMat = new THREE.LineDashedMaterial({
        color: colorNum,
        dashSize: Math.max(0.2, maxMag * 0.02),
        gapSize: Math.max(0.12, maxMag * 0.012),
        transparent: true,
        opacity: 0.4
      });
      const dropGeo = new THREE.BufferGeometry().setFromPoints([tip, floorPoint]);
      const dropLine = new THREE.Line(dropGeo, dropDashMat);
      dropLine.computeLineDistances();
      projectionGroup.add(dropLine);

      // Retícula circular en el suelo
      const sonarR = Math.max(0.3, shaftR * 2.0);
      const innerDiscGeo = new THREE.CircleGeometry(sonarR, 20);
      const innerDiscMat = new THREE.MeshBasicMaterial({ color: colorNum, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
      innerDisc.rotation.x = -Math.PI / 2;
      innerDisc.position.copy(floorPoint);
      innerDisc.position.y += 0.01;
      projectionGroup.add(innerDisc);
    });

    // ── Construcción Dinámica de Rejilla y Ejes Cartesianos ──
    const gridSize = Math.max(20, Math.ceil((maxMag * 2.6) / 10) * 10);
    const gridDivs = Math.max(20, Math.min(50, Math.round(gridSize / (maxMag > 30 ? 5 : 2))));
    const gridGround = new THREE.GridHelper(gridSize, gridDivs, 0x00bcd4, 0x071b2d);
    gridGroup.add(gridGround);

    const discR1 = Math.max(1.5, maxMag * 0.08);
    const discR2 = Math.max(8, maxMag * 0.65);
    const discGeo = new THREE.RingGeometry(discR1, discR2, 48);
    const discMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide, transparent: true, opacity: 0.02 });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    gridGroup.add(disc);

    // Ejes Cartesianos X, Y, Z Proporcionales
    const axisLen = Math.max(7.0, maxMag * 1.25);
    const axisShaftR = Math.max(0.04, Math.min(0.18, maxMag * 0.005));
    const axisHeadR = axisShaftR * 4;
    const axisHeadH = Math.max(0.4, Math.min(1.5, maxMag * 0.025));
    const axisBadgeW = Math.max(1.6, Math.min(2.8, maxMag * 0.1));
    const axisBadgeH = axisBadgeW * (100 / 220);

    // +X (Rojo)
    axesGroup.add(createVector3DMesh(new THREE.Vector3(0, 0, 0), new THREE.Vector3(axisLen, 0, 0), 0xef4444, axisShaftR, axisHeadR, axisHeadH));
    const labelX = createAxisBadgeSprite('+X', '#ef4444');
    labelX.scale.set(axisBadgeW, axisBadgeH, 1);
    labelX.position.set(axisLen + axisHeadH * 1.4, 0, 0);
    axesGroup.add(labelX);

    // -X (Rojo tenue)
    const negXGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-axisLen * 0.5, 0, 0)]);
    const negXLine = new THREE.Line(negXGeo, new THREE.LineDashedMaterial({ color: 0xef4444, dashSize: 0.3, gapSize: 0.2, transparent: true, opacity: 0.25 }));
    negXLine.computeLineDistances();
    axesGroup.add(negXLine);

    // +Y (Verde)
    axesGroup.add(createVector3DMesh(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, axisLen, 0), 0x10b981, axisShaftR, axisHeadR, axisHeadH));
    const labelY = createAxisBadgeSprite('+Y', '#10b981');
    labelY.scale.set(axisBadgeW, axisBadgeH, 1);
    labelY.position.set(0, axisLen + axisHeadH * 1.4, 0);
    axesGroup.add(labelY);

    // -Y (Verde tenue)
    const negYGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -axisLen * 0.5, 0)]);
    const negYLine = new THREE.Line(negYGeo, new THREE.LineDashedMaterial({ color: 0x10b981, dashSize: 0.3, gapSize: 0.2, transparent: true, opacity: 0.25 }));
    negYLine.computeLineDistances();
    axesGroup.add(negYLine);

    // +Z (Azul)
    axesGroup.add(createVector3DMesh(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, axisLen), 0x3b82f6, axisShaftR, axisHeadR, axisHeadH));
    const labelZ = createAxisBadgeSprite('+Z', '#3b82f6');
    labelZ.scale.set(axisBadgeW, axisBadgeH, 1);
    labelZ.position.set(0, 0, axisLen + axisHeadH * 1.4);
    axesGroup.add(labelZ);

    // -Z (Azul tenue)
    const negZGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -axisLen * 0.5)]);
    const negZLine = new THREE.Line(negZGeo, new THREE.LineDashedMaterial({ color: 0x3b82f6, dashSize: 0.3, gapSize: 0.2, transparent: true, opacity: 0.25 }));
    negZLine.computeLineDistances();
    axesGroup.add(negZLine);

    // ── Paralelogramo de Suma Vectorial Ilustrado (Limpio y Elegante) ──
    if ((opType === 'suma' || opType === 'ninguna') && pointsList.length >= 2) {
      const vA = pointsList[0];
      const vB = pointsList[1];
      const vSum = pointsList[2] || new THREE.Vector3().addVectors(vA, vB);

      // Línea proyectada de A hacia R (representando B desplazado)
      const dashBMat = new THREE.LineDashedMaterial({
        color: 0xffaa00,
        dashSize: Math.max(0.3, maxMag * 0.03),
        gapSize: Math.max(0.15, maxMag * 0.015),
        transparent: true,
        opacity: 0.85
      });
      const lineB = new THREE.Line(new THREE.BufferGeometry().setFromPoints([vA, vSum]), dashBMat);
      lineB.computeLineDistances();
      dynamicGroup.add(lineB);

      // Línea proyectada de B hacia R (representando A desplazado)
      const dashAMat = new THREE.LineDashedMaterial({
        color: 0x00f5ff,
        dashSize: Math.max(0.3, maxMag * 0.03),
        gapSize: Math.max(0.15, maxMag * 0.015),
        transparent: true,
        opacity: 0.85
      });
      const lineA = new THREE.Line(new THREE.BufferGeometry().setFromPoints([vB, vSum]), dashAMat);
      lineA.computeLineDistances();
      dynamicGroup.add(lineA);

      // Superficie translúcida del paralelogramo con brillo sutil
      const planeVerts = new Float32Array([
        0, 0, 0, vA.x, vA.y, vA.z, vSum.x, vSum.y, vSum.z,
        0, 0, 0, vSum.x, vSum.y, vSum.z, vB.x, vB.y, vB.z
      ]);
      const planeGeo = new THREE.BufferGeometry();
      planeGeo.setAttribute('position', new THREE.BufferAttribute(planeVerts, 3));
      planeGeo.computeVertexNormals();

      const planeMesh = new THREE.Mesh(
        planeGeo,
        new THREE.MeshBasicMaterial({
          color: 0x00f5ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.05
        })
      );
      dynamicGroup.add(planeMesh);
    }

    // ── Ángulo Interno Entre u y v: Arco 3D Limpio y Badge Centrado ──
    let angleDeg = null;
    let dotProd = null;
    let crossVec = null;

    if (pointsList.length >= 2) {
      const u = pointsList[0].clone();
      const v = pointsList[1].clone();
      const lenU = u.length();
      const lenV = v.length();

      if (lenU > 0.001 && lenV > 0.001) {
        dotProd = Math.round(u.dot(v) * 100) / 100;
        const cosTheta = Math.max(-1.0, Math.min(1.0, u.dot(v) / (lenU * lenV)));
        angleDeg = Math.round(THREE.MathUtils.radToDeg(Math.acos(cosTheta)) * 10) / 10;

        const cross = new THREE.Vector3().crossVectors(u, v);
        crossVec = [Math.round(cross.x), Math.round(cross.y), Math.round(cross.z)];

        // Radio proporcional del arco
        const arcRadius = Math.max(1.2, Math.min(2.5, Math.min(lenU, lenV) * 0.35));
        const arcPoints = [];
        const normU = u.clone().normalize();
        const normV = v.clone().normalize();
        // Solo renderizar arco 3D si el ángulo es visualmente discernible (evita artefactos colapsados en vectores casi paralelos)
        if (angleDeg >= 4.0 && angleDeg <= 176.0) {
          const steps = 30;
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const interp = new THREE.Vector3().lerpVectors(normU, normV, t).normalize().multiplyScalar(arcRadius);
            arcPoints.push(interp);
          }

          // 1. Sector translúcido dorado suave y discreto
          const fanVerts = [];
          for (let i = 0; i < arcPoints.length - 1; i++) {
            fanVerts.push(0, 0, 0);
            fanVerts.push(arcPoints[i].x, arcPoints[i].y, arcPoints[i].z);
            fanVerts.push(arcPoints[i + 1].x, arcPoints[i + 1].y, arcPoints[i + 1].z);
          }
          const fanGeo = new THREE.BufferGeometry();
          fanGeo.setAttribute('position', new THREE.Float32BufferAttribute(fanVerts, 3));
          fanGeo.computeVertexNormals();
          const fanMesh = new THREE.Mesh(
            fanGeo,
            new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.12 })
          );
          dynamicGroup.add(fanMesh);

          // 2. Curva dorada nítida y fina
          const arcCurve = new THREE.CatmullRomCurve3(arcPoints);
          const tubeGeo = new THREE.TubeGeometry(arcCurve, 28, Math.max(0.025, maxMag * 0.003), 10, false);
          const tubeMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0xfacc15,
            emissiveIntensity: 0.6,
            roughness: 0.3
          });
          dynamicGroup.add(new THREE.Mesh(tubeGeo, tubeMat));

          // 3. Badge Compacto del Ángulo θ
          const angleBadge = createAngleBadgeSprite(angleDeg);
          const angleBadgeW = Math.max(1.6, Math.min(2.6, maxMag * 0.12));
          angleBadge.scale.set(angleBadgeW, angleBadgeW * (110 / 360), 1);
          const midArc = new THREE.Vector3().lerpVectors(normU, normV, 0.5).normalize().multiplyScalar(arcRadius + angleBadgeW * 0.45);
          angleBadge.position.copy(midArc);
          dynamicGroup.add(angleBadge);
        }
      }
    }

    setVectorHUDInfo({
      vectors: infoList,
      angleDeg,
      dotProduct: dotProd,
      crossProduct: crossVec
    });

    // ── Auto-Framing y Ajuste Inteligente de Cámara y Niebla ──
    let minX = 0, maxX = 0, minY = 0, maxY = 0, minZ = 0, maxZ = 0;
    pointsList.forEach((pt) => {
      minX = Math.min(minX, pt.x); maxX = Math.max(maxX, pt.x);
      minY = Math.min(minY, pt.y); maxY = Math.max(maxY, pt.y);
      minZ = Math.min(minZ, pt.z); maxZ = Math.max(maxZ, pt.z);
    });

    // Centro del volumen vectorial ponderado hacia el origen para no perderlo de vista
    const centerTarget = new THREE.Vector3(
      (minX + maxX) * 0.3,
      (minY + maxY) * 0.3,
      (minZ + maxZ) * 0.3
    );
    targetCenterRef.current.copy(centerTarget);

    spherical.radius = camDist;

    // Niebla lineal: el volumen siempre tiene visibilidad perfecta (0% niebla), difuminando el fondo lejano
    if (scene.fog) {
      scene.fog.near = camDist * 1.8;
      scene.fog.far = camDist * 6.0;
    }

    // Plano de corte lejano de cámara
    camera.far = Math.max(500, maxMag * 25);
    camera.updateProjectionMatrix();

    updateCamera();
    if (triggerGrow) triggerGrow();
  }, [visualizationData]);

  // ──────────────────────────────────────────────
  // 3. Presets de Cámara y Controles
  // ──────────────────────────────────────────────
  const setCameraView = (preset) => {
    soundFX.playClick();
    setCameraPreset(preset);
    if (!sceneRef.current) return;

    if (preset === '3d') {
      sceneRef.current.spherical.theta = Math.PI / 4;
      sceneRef.current.spherical.phi = Math.PI / 3;
      setAutoRotate(true);
    } else if (preset === 'xy') {
      // Vista frontal (Plano XY)
      sceneRef.current.spherical.theta = 0;
      sceneRef.current.spherical.phi = Math.PI / 2;
      setAutoRotate(false);
    } else if (preset === 'xz') {
      // Vista superior / planta (Plano XZ)
      sceneRef.current.spherical.theta = 0;
      sceneRef.current.spherical.phi = 0.04;
      setAutoRotate(false);
    } else if (preset === 'yz') {
      // Vista lateral (Plano YZ)
      sceneRef.current.spherical.theta = Math.PI / 2;
      sceneRef.current.spherical.phi = Math.PI / 2;
      setAutoRotate(false);
    }
    sceneRef.current.updateCamera();
  };

  const handleReset = () => {
    soundFX.playClick();
    setCameraView('3d');
  };

  return (
    <div className="w-full h-full flex flex-col justify-between relative overflow-hidden select-none bg-[#020617] rounded-2xl border border-cyan-500/30 shadow-2xl">
      {/* ── TOPBAR CONTROLES HUD ── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 font-mono text-xs pointer-events-none gap-2 flex-wrap">
        {/* Título de estado y Navegación */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onGoBackToResult && (
            <button
              onClick={() => {
                soundFX.playClick();
                onGoBackToResult();
              }}
              className="px-3 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              title="Volver al Pizarrón de Resultado"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pizarrón</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/40 text-cyan-300 shadow-lg shrink-0">
            <Box className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="font-bold tracking-wider text-[11px]">
              ESPACIO 3D {cameraPreset.toUpperCase()}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>

          {onSpeakLecture && (
            <button
              onClick={() => {
                soundFX.playClick();
                onSpeakLecture();
              }}
              className="px-2.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow"
              title="Escuchar cátedra de Harvard mientras rotas los vectores en 3D"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Cátedra Harvard</span>
              <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
            </button>
          )}
        </div>

        {/* Botonera de Vistas y Herramientas */}
        <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-full border border-slate-700/60 pointer-events-auto shadow-lg shrink-0">
          {/* Presets de cámara */}
          {['3d', 'xy', 'xz', 'yz'].map((p) => (
            <button
              key={p}
              onClick={() => setCameraView(p)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                cameraPreset === p
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={`Ver plano ${p.toUpperCase()}`}
            >
              {p}
            </button>
          ))}

          <span className="w-[1px] h-3 bg-slate-700 mx-0.5" />

          {/* Toggle Sombras/Proyecciones */}
          <button
            onClick={() => {
              soundFX.playClick();
              setShowProjections((v) => !v);
            }}
            className={`p-1 rounded-full text-[10px] transition-all cursor-pointer ${
              showProjections ? 'text-cyan-300 bg-cyan-950/80' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Activar/Desactivar proyecciones y sombras al suelo"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Giro */}
          <button
            onClick={() => {
              soundFX.playClick();
              setAutoRotate((v) => !v);
            }}
            className={`p-1 rounded-full text-[10px] transition-all cursor-pointer ${
              autoRotate ? 'text-amber-300 bg-amber-950/80' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={autoRotate ? 'Pausar auto-giro' : 'Iniciar auto-giro'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Métricas */}
          <button
            onClick={() => {
              soundFX.playClick();
              setShowStatsCard((v) => !v);
            }}
            className={`p-1 rounded-full text-[10px] transition-all cursor-pointer ${
              showStatsCard ? 'text-emerald-300 bg-emerald-950/80' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Mostrar/Ocultar Telemetría"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Centrar vista"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── CANVAS THREE.JS ── */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* ── PANEL DE TELEMETRÍA LATERAL GLASSMORPHISM DE ALTA FIDELIDAD ── */}
      {showStatsCard && vectorHUDInfo.vectors.length > 0 && (
        <div className="absolute top-14 right-3 z-10 w-80 bg-slate-950/95 backdrop-blur-xl rounded-2xl border border-cyan-500/40 p-3.5 font-mono text-xs shadow-[0_0_30px_rgba(0,245,255,0.15)] pointer-events-auto">
          {/* Cabecera */}
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/25 mb-2.5">
            <span className="text-[11px] uppercase font-bold text-cyan-300 tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} /> TELEMETRÍA VECTORIAL
            </span>
            <span className="text-[9px] font-bold bg-cyan-950/90 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-700/60 shadow-sm">
              Base Canónica ℝ³
            </span>
          </div>

          {/* Lista de Vectores con desglose canónico */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {vectorHUDInfo.vectors.map((vec, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border transition-all ${
                  vec.isResult
                    ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: vec.color, boxShadow: `0 0 8px ${vec.color}` }}
                    />
                    <strong className="text-white text-[12px] tracking-wide">→{vec.nombre}</strong>
                    {vec.isResult && (
                      <span className="text-[8px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                        Resultante
                      </span>
                    )}
                  </div>
                  <span className="text-cyan-300 font-bold text-[11px] shrink-0 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/50">
                    ||v|| = {vec.magnitud}
                  </span>
                </div>

                {/* Desglose canónico î, ĵ, k̂ coloreado riguroso */}
                <div className="flex items-center gap-1.5 text-[10px] pl-5 text-slate-300 font-mono">
                  <span className="text-red-400 font-bold">{vec.componentes[0]}î</span>
                  <span className="text-slate-500">{vec.componentes[1] < 0 ? '-' : '+'}</span>
                  <span className="text-emerald-400 font-bold">{Math.abs(vec.componentes[1])}ĵ</span>
                  {vec.componentes[2] !== 0 && (
                    <>
                      <span className="text-slate-500">{vec.componentes[2] < 0 ? '-' : '+'}</span>
                      <span className="text-blue-400 font-bold">{Math.abs(vec.componentes[2])}k̂</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Métricas Angulares y Productos */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/90 space-y-1.5">
            {/* Ángulo θ */}
            {vectorHUDInfo.angleDeg !== null && (
              <div className="flex items-center justify-between text-[11px] bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-500/30">
                <span className="text-amber-300 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Ángulo (θ):
                </span>
                <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] shadow-sm">
                  {vectorHUDInfo.angleDeg}°
                </span>
              </div>
            )}

            {/* Producto Punto */}
            {vectorHUDInfo.dotProduct !== null && (
              <div className="flex items-center justify-between text-[11px] px-1 text-slate-300">
                <span className="text-slate-400">Producto Escalar (u · v):</span>
                <span className="text-emerald-400 font-bold font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  {vectorHUDInfo.dotProduct}
                </span>
              </div>
            )}

            {/* Producto Cruz */}
            {vectorHUDInfo.crossProduct && (
              <div className="flex items-center justify-between text-[10px] px-1 text-slate-300">
                <span className="text-slate-400">Vector Cruz (u × v):</span>
                <span className="text-purple-300 font-mono bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                  ({vectorHUDInfo.crossProduct.join(', ')})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER HUD: ORIENTACIÓN Y ATAJOS ── */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none font-mono text-[10px]">
        {/* Identificadores de Ejes */}
        <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 text-slate-200 pointer-events-auto shadow-md">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> +X
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> +Y
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> +Z
          </span>
        </div>

        {/* Guía de Interacción */}
        <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50 text-slate-400 hidden sm:block">
          Arrastra para orbitar · Rueda = Zoom · Presets 3D/XY/XZ/YZ arriba
        </div>
      </div>
    </div>
  );
}
