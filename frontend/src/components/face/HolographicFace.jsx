import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * VECTRA // ULTRA-FUTURISTIC SCI-FI FACE (SOLO OJOS Y BOCA REACTIVA)
 * 
 * - Sin malla de cabeza ni esferas wireframe
 * - Ojos holográficos de alta definición con parpadeo suave y seguimiento de mirada
 * - Cejas expresivas reactivas a las emociones
 * - Boca holográfica ondulatoria con visemas y reactividad de audio en tiempo real
 * - Fondo sci-fi cinemático: estrellas cuánticas flotantes, rejilla en perspectiva y anillos giroscópicos
 */
export default function HolographicFace({
  state = 'reposo',
  emotion = 'neutral',
  viseme = 'closed',
  theme = 'cyan',
  audioLevel = 0
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  // Paleta de colores Three.js por tema
  const themeColors = {
    cyan: { primary: 0x00f0ff, secondary: 0x0077ff, glow: 0x88ffff, pupil: 0x00f0ff, mouth: 0x00f0ff },
    blue: { primary: 0x2d82ff, secondary: 0x00e1ff, glow: 0x8ab9ff, pupil: 0x2d82ff, mouth: 0x00e1ff },
    green: { primary: 0x00ff88, secondary: 0x00c853, glow: 0xaaffc0, pupil: 0x00ff88, mouth: 0x00ff88 },
    amber: { primary: 0xffaa00, secondary: 0xff5500, glow: 0xffdd88, pupil: 0xffaa00, mouth: 0xffaa00 }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Escena, Cámara y Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02050b, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const currentColors = themeColors[theme] || themeColors.cyan;

    // 2. FONDO BACANO SCI-FI // ESTRELLAS Y PARTÍCULAS CUÁNTICAS
    const particleCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(particleCount * 3);
    const starSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 26;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      starSpeeds[i] = 0.15 + Math.random() * 0.35;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

    const starMat = new THREE.PointsMaterial({
      color: currentColors.glow,
      size: 0.048,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Nebulosa de puntos de colores — segundas partículas más brillantes y escasas
    const nebulaCount = 120;
    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaPos = new Float32Array(nebulaCount * 3);
    for (let i = 0; i < nebulaCount; i++) {
      nebulaPos[i * 3] = (Math.random() - 0.5) * 20;
      nebulaPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      nebulaPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4;
    }
    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
    const nebulaMat = new THREE.PointsMaterial({
      color: currentColors.secondary,
      size: 0.1,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    const nebulaField = new THREE.Points(nebulaGeo, nebulaMat);
    scene.add(nebulaField);

    // 3. FONDO BACANO SCI-FI // ANILLOS HOLOGRÁFICOS GIROSCÓPICOS PROFUNDOS (DISTANTES)
    const bgRingGroup = new THREE.Group();
    bgRingGroup.position.set(0, 0, -8);
    scene.add(bgRingGroup);

    const ring1Geo = new THREE.RingGeometry(5.5, 5.55, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: currentColors.secondary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    bgRingGroup.add(ring1);

    const ring2Geo = new THREE.RingGeometry(7.8, 7.83, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: currentColors.primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    bgRingGroup.add(ring2);

    // Anillo medio adicional para más profundidad
    const ring3Geo = new THREE.RingGeometry(9.5, 9.52, 80);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: currentColors.glow,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    bgRingGroup.add(ring3);

    // 4. FONDO BACANO SCI-FI // REJILLA DE PERSPECTIVA INFERIOR
    const gridHelper = new THREE.GridHelper(30, 30, currentColors.primary, 0x061220);
    gridHelper.position.set(0, -4.5, -2);
    gridHelper.rotation.x = 0.18; // Ligera inclinación en perspectiva
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.14;
    scene.add(gridHelper);

    // 5. GRUPO DEL ROSTRO (SOLO OJOS Y BOCA)
    const faceGroup = new THREE.Group();
    scene.add(faceGroup);

    // ========================================================
    // OJOS HOLOGRÁFICOS CYBERNETIC DE ALTA FIDELIDAD
    // ========================================================
    const eyeSpacing = 1.35; // Distancia entre ojos
    const eyeY = 0.55;

    // A) OJO IZQUIERDO
    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-eyeSpacing, eyeY, 0);
    faceGroup.add(leftEyeGroup);

    // B) OJO DERECHO
    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(eyeSpacing, eyeY, 0);
    faceGroup.add(rightEyeGroup);

    // Halo exterior glow difuso (más grande, muy transparente)
    const eyeHaloGeo = new THREE.RingGeometry(0.50, 0.62, 48);
    const eyeHaloMat = new THREE.MeshBasicMaterial({
      color: currentColors.primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    const leftEyeHalo = new THREE.Mesh(eyeHaloGeo, eyeHaloMat);
    leftEyeGroup.add(leftEyeHalo);
    const rightEyeHalo = new THREE.Mesh(eyeHaloGeo, eyeHaloMat.clone());
    rightEyeGroup.add(rightEyeHalo);

    // Anillo exterior brillante del iris (geometría de anillo fino de alta calidad)
    const outerIrisGeo = new THREE.RingGeometry(0.38, 0.44, 48);
    const outerIrisMat = new THREE.MeshBasicMaterial({
      color: currentColors.primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    const leftOuterIris = new THREE.Mesh(outerIrisGeo, outerIrisMat);
    leftEyeGroup.add(leftOuterIris);
    const rightOuterIris = new THREE.Mesh(outerIrisGeo, outerIrisMat.clone());
    rightEyeGroup.add(rightOuterIris);

    // Anillo medio concéntrico
    const midIrisGeo = new THREE.RingGeometry(0.29, 0.33, 40);
    const midIrisMat = new THREE.MeshBasicMaterial({
      color: currentColors.secondary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    const leftMidIris = new THREE.Mesh(midIrisGeo, midIrisMat);
    leftEyeGroup.add(leftMidIris);
    const rightMidIris = new THREE.Mesh(midIrisGeo, midIrisMat.clone());
    rightEyeGroup.add(rightMidIris);

    // Anillo interior concéntrico
    const innerIrisGeo = new THREE.RingGeometry(0.18, 0.22, 36);
    const innerIrisMat = new THREE.MeshBasicMaterial({
      color: currentColors.glow,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const leftInnerIris = new THREE.Mesh(innerIrisGeo, innerIrisMat);
    leftEyeGroup.add(leftInnerIris);
    const rightInnerIris = new THREE.Mesh(innerIrisGeo, innerIrisMat.clone());
    rightEyeGroup.add(rightInnerIris);

    // Pupila central luminosa (esfera brillante)
    const pupilGeo = new THREE.SphereGeometry(0.1, 24, 24);
    const pupilMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.98
    });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.05);
    leftEyeGroup.add(leftPupil);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat.clone());
    rightPupil.position.set(0, 0, 0.05);
    rightEyeGroup.add(rightPupil);

    // Destello de energía en el núcleo de la pupila
    const coreGlowGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const coreGlowMat = new THREE.MeshBasicMaterial({
      color: currentColors.primary
    });
    const leftCore = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    leftCore.position.set(0, 0, 0.09);
    leftEyeGroup.add(leftCore);
    const rightCore = new THREE.Mesh(coreGlowGeo, coreGlowMat.clone());
    rightCore.position.set(0, 0, 0.09);
    rightEyeGroup.add(rightCore);

    // ========================================================
    // CEJAS EXPRESIVAS HOLOGRÁFICAS
    // ========================================================
    const browGeo = new THREE.BoxGeometry(0.75, 0.07, 0.08);
    const browMat = new THREE.MeshBasicMaterial({
      color: currentColors.primary,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-eyeSpacing, eyeY + 0.75, 0);
    faceGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat.clone());
    rightBrow.position.set(eyeSpacing, eyeY + 0.75, 0);
    faceGroup.add(rightBrow);

    // ========================================================
    // BOCA ONDULATORIA HOLOGRÁFICA (ONDAS REACTIVAS DE VOZ)
    // ========================================================
    const mouthSegmentCount = 48;
    const mouthWidth = 1.6;
    const mouthPoints = [];
    for (let i = 0; i <= mouthSegmentCount; i++) {
      const u = (i / mouthSegmentCount) * 2 - 1; // -1 a 1
      mouthPoints.push(new THREE.Vector3(u * (mouthWidth / 2), 0, 0));
    }

    const mouthGeo = new THREE.BufferGeometry().setFromPoints(mouthPoints);
    const mouthMat = new THREE.LineBasicMaterial({
      color: currentColors.glow,
      linewidth: 3,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const mouthLine = new THREE.Line(mouthGeo, mouthMat);
    mouthLine.position.set(0, -0.95, 0);
    faceGroup.add(mouthLine);

    // Resplandor inferior de la boca
    const mouthGlowCurve = new THREE.EllipseCurve(0, 0, 0.8, 0.08, 0, Math.PI * 2, false, 0);
    const mouthGlowGeo = new THREE.BufferGeometry().setFromPoints(mouthGlowCurve.getPoints(32));
    const mouthGlowMat = new THREE.LineBasicMaterial({
      color: currentColors.primary,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const mouthGlow = new THREE.Line(mouthGlowGeo, mouthGlowMat);
    mouthGlow.position.set(0, -0.95, -0.05);
    faceGroup.add(mouthGlow);

    // ========================================================
    // SEGUIMIENTO DE MIRADA CON EL MOUSE
    // ========================================================
    const targetLook = { x: 0, y: 0 };
    const currentLook = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetLook.x = Math.max(-1, Math.min(1, normX));
      targetLook.y = Math.max(-1, Math.min(1, normY));
    };

    window.addEventListener('mousemove', handleMouseMove);

    // ========================================================
    // VARIABLES DE ANIMACIÓN Y PARPADEO REALISTA
    // ========================================================
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkProgress = 0;
    let isDoubleBlink = false;
    let doubleBlinkDone = false;
    const clock = new THREE.Clock();

    sceneRef.current = {
      scene,
      camera,
      renderer,
      starField,
      nebulaField,
      starPos,
      starSpeeds,
      bgRingGroup,
      ring1,
      ring2,
      ring3,
      gridHelper,
      faceGroup,
      leftEyeGroup,
      rightEyeGroup,
      leftEyeHalo,
      rightEyeHalo,
      leftOuterIris,
      rightOuterIris,
      leftInnerIris,
      rightInnerIris,
      leftPupil,
      rightPupil,
      leftCore,
      rightCore,
      leftBrow,
      rightBrow,
      mouthLine,
      mouthGlow,
      mouthPoints,
      clock
    };

    // ========================================================
    // LOOP DE ANIMACIÓN 60 FPS
    // ========================================================
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // 1. Suavizado de seguimiento de mirada (damping elástico)
      currentLook.x += (targetLook.x - currentLook.x) * 0.06;
      currentLook.y += (targetLook.y - currentLook.y) * 0.06;

      // Desplazamiento de pupilas en función de la mirada
      const pupilShiftX = currentLook.x * 0.16;
      const pupilShiftY = currentLook.y * 0.14;
      leftPupil.position.x = pupilShiftX;
      leftPupil.position.y = pupilShiftY;
      rightPupil.position.x = pupilShiftX;
      rightPupil.position.y = pupilShiftY;
      leftCore.position.x = pupilShiftX;
      leftCore.position.y = pupilShiftY;
      rightCore.position.x = pupilShiftX;
      rightCore.position.y = pupilShiftY;

      // 2. Parpadeo suave y natural (con opción de doble parpadeo)
      blinkTimer += delta;
      // Varía el intervalo de parpadeo de forma aleatoria (entre 2.5 y 5 segundos)
      if (blinkTimer > 2.5 + Math.sin(time * 0.3) * 1.2 && !isBlinking) {
        if (Math.random() < 0.15) {
          isBlinking = true;
          blinkProgress = 0;
          isDoubleBlink = Math.random() < 0.25; // 25% de probabilidad de doble pestañeo
          doubleBlinkDone = false;
        }
      }

      // Pulso de halos de ojo
      const haloPulse = 0.12 + Math.sin(time * 2.2) * 0.06;
      leftEyeHalo.material.opacity = haloPulse;
      rightEyeHalo.material.opacity = haloPulse;
      // Rotación sutil del anillo interno
      leftInnerIris.rotation.z = time * 0.8;
      rightInnerIris.rotation.z = -time * 0.8;

      if (isBlinking) {
        blinkProgress += delta * 9.5; // Velocidad de parpadeo realista
        // Curva de parpadeo suave con seno
        const rawScaleY = 1 - Math.sin(Math.min(Math.PI, blinkProgress * Math.PI));
        const eyeScaleY = Math.max(0.04, rawScaleY);

        leftEyeGroup.scale.y = eyeScaleY;
        rightEyeGroup.scale.y = eyeScaleY;

        if (blinkProgress >= 1) {
          if (isDoubleBlink && !doubleBlinkDone) {
            // Iniciar segundo parpadeo rápido
            blinkProgress = 0;
            doubleBlinkDone = true;
          } else {
            isBlinking = false;
            blinkTimer = 0;
            leftEyeGroup.scale.y = 1;
            rightEyeGroup.scale.y = 1;
          }
        }
      }

      // 3. Rotación de anillos sci-fi de fondo
      ring1.rotation.z = time * 0.09;
      ring1.rotation.x = Math.sin(time * 0.06) * 0.3;
      ring2.rotation.z = -time * 0.06;
      ring2.rotation.x = Math.cos(time * 0.05) * 0.25;
      ring3.rotation.z = time * 0.04;
      ring3.rotation.y = Math.sin(time * 0.04) * 0.2;

      // 3b. Nebulosa rotando suavemente
      nebulaField.rotation.y = time * 0.018;

      // 4. Ondulación de estrellas y partículas flotantes
      const sPos = starField.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        let y = sPos.getY(i) + starSpeeds[i] * delta * 0.4;
        if (y > 8) y = -8;
        sPos.setY(i, y);
      }
      sPos.needsUpdate = true;

      // 5. Animación reactiva de la boca (ondas de audio)
      const mouthPosAttr = mouthLine.geometry.attributes.position;
      const isSpeaking = state === 'hablando' || (audioLevel || 0) > 0.08;
      const waveFreq = isSpeaking ? 16 : 4;
      const waveAmp = isSpeaking ? (0.12 + (audioLevel || 0.2) * 0.35) : 0.025;

      for (let i = 0; i <= mouthSegmentCount; i++) {
        const u = (i / mouthSegmentCount) * 2 - 1; // -1 a 1
        const envelope = 1 - u * u; // Suavizar hacia los extremos

        let yOffset = 0;
        if (isSpeaking) {
          // Onda senoidal dinámica con armónicos
          yOffset = (
            Math.sin(time * waveFreq + u * 6) * 0.6 +
            Math.sin(time * (waveFreq * 1.5) - u * 8) * 0.4
          ) * waveAmp * envelope;
        } else {
          // Respiración suave
          yOffset = Math.sin(time * 2.5 + u * 2) * waveAmp * envelope;
        }

        mouthPosAttr.setY(i, yOffset);
      }
      mouthPosAttr.needsUpdate = true;

      // 6. Respiración y balanceo general de la cara
      faceGroup.position.y = Math.sin(time * 1.8) * 0.05;
      faceGroup.rotation.y = currentLook.x * 0.15;
      faceGroup.rotation.x = -currentLook.y * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Redimensionado responsivo
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Efecto para cambiar colores del tema en tiempo real
  useEffect(() => {
    if (!sceneRef.current) return;
    const { leftOuterIris, rightOuterIris, leftInnerIris, rightInnerIris, leftBrow, rightBrow, mouthLine, mouthGlow, starField, nebulaField, ring1, ring2, ring3, gridHelper } = sceneRef.current;
    const colors = themeColors[theme] || themeColors.cyan;

    leftOuterIris.material.color.setHex(colors.primary);
    rightOuterIris.material.color.setHex(colors.primary);
    leftInnerIris.material.color.setHex(colors.glow);
    rightInnerIris.material.color.setHex(colors.glow);
    leftBrow.material.color.setHex(colors.primary);
    rightBrow.material.color.setHex(colors.primary);
    mouthLine.material.color.setHex(colors.glow);
    mouthGlow.material.color.setHex(colors.primary);
    starField.material.color.setHex(colors.glow);
    if (nebulaField) nebulaField.material.color.setHex(colors.secondary);
    ring1.material.color.setHex(colors.secondary);
    ring2.material.color.setHex(colors.primary);
    if (ring3) ring3.material.color.setHex(colors.glow);
    gridHelper.material.color.setHex(colors.primary);
  }, [theme]);

  // Efecto para animar cejas según la emoción
  useEffect(() => {
    if (!sceneRef.current) return;
    const { leftBrow, rightBrow } = sceneRef.current;

    if (emotion === 'feliz') {
      leftBrow.rotation.z = -0.18;
      rightBrow.rotation.z = 0.18;
      leftBrow.position.y = 1.35;
      rightBrow.position.y = 1.35;
    } else if (emotion === 'pensando') {
      leftBrow.rotation.z = 0.22;
      rightBrow.rotation.z = -0.22;
      leftBrow.position.y = 1.38;
      rightBrow.position.y = 1.38;
    } else if (emotion === 'duda') {
      leftBrow.rotation.z = -0.32; // Ceja izquierda levantada
      rightBrow.rotation.z = -0.08;
      leftBrow.position.y = 1.45;
      rightBrow.position.y = 1.25;
    } else if (emotion === 'enfasis') {
      leftBrow.rotation.z = 0.25;
      rightBrow.rotation.z = -0.25;
      leftBrow.position.y = 1.22;
      rightBrow.position.y = 1.22;
    } else {
      // Neutral
      leftBrow.rotation.z = 0;
      rightBrow.rotation.z = 0;
      leftBrow.position.y = 1.3;
      rightBrow.position.y = 1.3;
    }
  }, [emotion]);

  // Efecto para abrir/cerrar boca según visema
  useEffect(() => {
    if (!sceneRef.current) return;
    const { mouthLine, mouthGlow } = sceneRef.current;

    const visemeScales = {
      closed: [0.75, 0.1],
      A: [1.1, 1.3],
      E: [1.25, 0.7],
      I: [1.15, 0.4],
      O: [0.7, 1.2],
      U: [0.55, 0.8]
    };

    const targetScale = visemeScales[viseme] || visemeScales.closed;
    mouthLine.scale.x = targetScale[0];
    mouthLine.scale.y = targetScale[1];
    mouthGlow.scale.x = targetScale[0];
    mouthGlow.scale.y = targetScale[1];
  }, [viseme]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ background: 'radial-gradient(ellipse at center, #061224 0%, #020712 55%, #010408 100%)' }}>
      {/* Canvas Three.js a pantalla completa */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Indicador de Estado — solo estado, sin debug de visema/emoción */}
      <div className="absolute bottom-4 left-6 flex items-center gap-2 pointer-events-none px-4 py-1.5 bg-black/50 backdrop-blur-md border border-[var(--primary)]/30 rounded-full text-xs font-mono">
        <span className={`w-2 h-2 rounded-full ${
          state === 'hablando'   ? 'bg-green-400 animate-ping' :
          state === 'pensando'   ? 'bg-yellow-400 animate-pulse' :
          state === 'escuchando' ? 'bg-[var(--primary)] animate-pulse' :
          state === 'error'      ? 'bg-red-500' : 'bg-[var(--primary)]/60'
        }`} />
        <span className="uppercase tracking-widest font-semibold text-[var(--primary)]/80">
          VECTRA // {state}
        </span>
      </div>
    </div>
  );
}
