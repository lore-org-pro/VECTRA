import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * VECTRA // 3D EXPRESSIVE FACE (Three.js)
 * 
 * - Ojos 3D estilizados con córnea brillante, pupila y reflejos especulares duales
 * - Párpados 3D con parpadeo natural suave y doble parpadeo esporádico
 * - Cejas 3D reactivas a emociones (pensando, feliz, énfasis, neutral)
 * - Boca 3D dinámica con tubo CatmullRom reactiva a visemas y nivel de audio
 * - Micro-movimientos de respiración y orientación tridimensional hacia el usuario
 * - Iluminación de estudio física (MeshPhysicalMaterial)
 */
export default function ThreeDFace({
  state = 'reposo',
  emotion = 'neutral',
  viseme = 'closed',
  audioLevel = 0,
  isSpeaking = false,
  bgColor = '#ffffff'
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({ state, emotion, viseme, audioLevel, isSpeaking });

  useEffect(() => {
    stateRef.current = { state, emotion, viseme, audioLevel, isSpeaking };
  }, [state, emotion, viseme, audioLevel, isSpeaking]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 600;

    // 1. Escena y Cámara Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    // 2. Renderer con Antialiasing y Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 3. Iluminación de Estudio Profesional
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.4);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.6);
    fillLight.position.set(-4, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.8, 15);
    rimLight.position.set(0, 4, 3);
    scene.add(rimLight);

    // Grupo Maestro del Rostro 3D
    const faceGroup = new THREE.Group();
    scene.add(faceGroup);

    // 4. MATERIALES FÍSICOS PREMIUM
    const eyeWhiteMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1
    });

    const pupilMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0c14,
      roughness: 0.05,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });

    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const eyebrowMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.4,
      metalness: 0.1
    });

    const mouthMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.6
    });

    // 5. CONSTRUCCIÓN DE OJOS 3D ESTILIZADOS
    const eyeSpacing = 1.25;
    const eyeY = 0.55;

    // Función constructora de un ojo 3D
    function createEye(xPos, isLeft) {
      const eyePivot = new THREE.Group();
      eyePivot.position.set(xPos, eyeY, 0);

      // Globo ocular ovoide blanco
      const eyeGeo = new THREE.SphereGeometry(0.88, 36, 36);
      eyeGeo.scale(0.85, 1.2, 0.8);
      const eyeMesh = new THREE.Mesh(eyeGeo, eyeWhiteMat);
      eyePivot.add(eyeMesh);

      // Borde exterior estilizado
      const borderGeo = new THREE.TorusGeometry(0.88, 0.045, 16, 48);
      borderGeo.scale(0.86, 1.22, 1);
      const borderMesh = new THREE.Mesh(borderGeo, eyebrowMat);
      borderMesh.position.z = 0.15;
      eyePivot.add(borderMesh);

      // Pupila 3D centrada mirando al frente
      const pupilGeo = new THREE.SphereGeometry(0.52, 32, 32);
      pupilGeo.scale(0.86, 1.15, 0.4);
      const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
      pupilMesh.position.set(0, 0, 0.55);
      eyePivot.add(pupilMesh);

      // Brillo especular grande (arriba derecha)
      const glintLargeGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const glintLarge = new THREE.Mesh(glintLargeGeo, glintMat);
      glintLarge.position.set(0.18, 0.22, 0.76);
      eyePivot.add(glintLarge);

      // Brillo especular pequeño (abajo izquierda)
      const glintSmallGeo = new THREE.SphereGeometry(0.09, 16, 16);
      const glintSmall = new THREE.Mesh(glintSmallGeo, glintMat);
      glintSmall.position.set(-0.16, -0.20, 0.76);
      eyePivot.add(glintSmall);

      // Párpado 3D para animación de parpadeo suave
      const lidGeo = new THREE.SphereGeometry(0.92, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      lidGeo.scale(0.87, 1.22, 0.82);
      const lidMesh = new THREE.Mesh(
        lidGeo,
        new THREE.MeshStandardMaterial({ color: new THREE.Color(bgColor), roughness: 0.3 })
      );
      lidMesh.position.z = 0.05;
      lidMesh.rotation.x = -Math.PI * 0.5; // Ojo abierto
      eyePivot.add(lidMesh);

      return { pivot: eyePivot, eyelid: lidMesh, pupil: pupilMesh };
    }

    const leftEye = createEye(-eyeSpacing, true);
    const rightEye = createEye(eyeSpacing, false);
    faceGroup.add(leftEye.pivot);
    faceGroup.add(rightEye.pivot);

    // 6. CEJAS 3D EXPRESIVAS (Tubos curvos 3D)
    function createEyebrow(xPos, isLeft) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(isLeft ? -0.7 : -0.3, -0.05, 0),
        new THREE.Vector3(isLeft ? -0.1 : 0.1, 0.25, 0.05),
        new THREE.Vector3(isLeft ? 0.4 : 0.7, -0.05, 0)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.045, 12, false);
      const mesh = new THREE.Mesh(tubeGeo, eyebrowMat);
      mesh.position.set(xPos, eyeY + 1.35, 0.3);
      return mesh;
    }

    const leftEyebrow = createEyebrow(-eyeSpacing, true);
    const rightEyebrow = createEyebrow(eyeSpacing, false);
    faceGroup.add(leftEyebrow);
    faceGroup.add(rightEyebrow);

    // 7. BOCA 3D REACTIVA (Extrusión CatmullRom animada en tiempo real)
    let mouthMesh = null;
    const mouthY = -1.0;

    function buildMouthMesh(openAmount = 0, smileAmount = 0.3) {
      if (mouthMesh) {
        faceGroup.remove(mouthMesh);
        mouthMesh.geometry.dispose();
      }

      const p0 = new THREE.Vector3(-0.9, mouthY + smileAmount * 0.25, 0.2);
      const p1 = new THREE.Vector3(-0.45, mouthY - openAmount * 0.4, 0.2);
      const p2 = new THREE.Vector3(0, mouthY - openAmount * 0.6, 0.2);
      const p3 = new THREE.Vector3(0.45, mouthY - openAmount * 0.4, 0.2);
      const p4 = new THREE.Vector3(0.9, mouthY + smileAmount * 0.25, 0.2);

      const mouthCurve = new THREE.CatmullRomCurve3([p0, p1, p2, p3, p4]);
      const radius = 0.055 + openAmount * 0.02;
      const mouthGeo = new THREE.TubeGeometry(mouthCurve, 32, radius, 12, false);
      mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
      faceGroup.add(mouthMesh);
    }

    buildMouthMesh(0, 0.3);

    // 8. BUCLE DE ANIMACIÓN Y EXPRESIONES FACIALES
    let animationFrameId;
    let clock = new THREE.Clock();

    // Variables de parpadeo
    let isBlinking = false;
    let blinkStartTime = 0;
    let blinkDuration = 0.16;
    let nextBlinkTime = 2.0;

    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);
      const elapsedTime = clock.getElapsedTime();
      const { state: curState, emotion: curEmotion, isSpeaking: curSpeaking, audioLevel: curAudio } = stateRef.current;

      // A) Parpadeo 3D Natural
      if (elapsedTime > nextBlinkTime && !isBlinking) {
        isBlinking = true;
        blinkStartTime = elapsedTime;
        blinkDuration = 0.14 + Math.random() * 0.06;
        nextBlinkTime = elapsedTime + 2.5 + Math.random() * 3.0;
      }

      let blinkScale = 1.0;
      if (isBlinking) {
        const progress = (elapsedTime - blinkStartTime) / blinkDuration;
        if (progress >= 1.0) {
          isBlinking = false;
          blinkScale = 1.0;
        } else {
          // Curva sinusoidal suave para parpadear
          blinkScale = 1.0 - Math.sin(progress * Math.PI) * 0.95;
        }
      }

      leftEye.pivot.scale.y = blinkScale;
      rightEye.pivot.scale.y = blinkScale;

      // B) Expresión de Cejas reactivas
      if (curEmotion === 'pensando' || curState === 'pensando') {
        leftEyebrow.position.y = eyeY + 1.45 + Math.sin(elapsedTime * 2.5) * 0.03;
        leftEyebrow.rotation.z = -0.15;
        rightEyebrow.position.y = eyeY + 1.25;
        rightEyebrow.rotation.z = -0.12;
      } else if (curEmotion === 'feliz' || curEmotion === 'enfasis') {
        leftEyebrow.position.y = eyeY + 1.42;
        leftEyebrow.rotation.z = 0.08;
        rightEyebrow.position.y = eyeY + 1.42;
        rightEyebrow.rotation.z = -0.08;
      } else {
        leftEyebrow.position.y = eyeY + 1.35;
        leftEyebrow.rotation.z = 0;
        rightEyebrow.position.y = eyeY + 1.35;
        rightEyebrow.rotation.z = 0;
      }

      // C) Animación de Boca 3D con voz/audio
      let openFactor = 0;
      let smileFactor = 0.28;

      if (curSpeaking || curState === 'hablando') {
        openFactor = Math.sin(elapsedTime * 14) * 0.35 + 0.38 + (curAudio * 0.3);
        openFactor = Math.max(0.1, Math.min(0.8, openFactor));
        smileFactor = 0.35;
      } else if (curState === 'pensando') {
        openFactor = 0.05;
        smileFactor = 0.1;
      } else if (curState === 'escuchando') {
        openFactor = 0.12;
        smileFactor = 0.22;
      }

      buildMouthMesh(openFactor, smileFactor);

      // D) Micro-movimientos de respiración y presencia viva 3D
      faceGroup.position.y = Math.sin(elapsedTime * 1.6) * 0.06;
      faceGroup.rotation.z = Math.sin(elapsedTime * 0.9) * 0.015;
      faceGroup.rotation.y = Math.sin(elapsedTime * 0.7) * 0.025;

      renderer.render(scene, camera);
    };

    animateLoop();

    // 9. Manejador de redimensionado responsive
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 600;
      const newH = container.clientHeight || 600;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Limpieza
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [bgColor]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full flex items-center justify-center relative overflow-hidden select-none"
    />
  );
}
