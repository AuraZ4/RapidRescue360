import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Pause, Play, RotateCcw, ShieldAlert, Navigation, HeartPulse, Radio } from 'lucide-react';

export type CameraPreset = 'overview' | 'ambulance' | 'helicopter' | 'hospital';

interface HeroScene3DProps {
  activeEmergencyCount: number;
  availableVolunteerCount: number;
  onSelectEmergencyAction?: () => void;
}

export const HeroScene3D: React.FC<HeroScene3DProps> = ({
  activeEmergencyCount,
  availableVolunteerCount,
  onSelectEmergencyAction,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [hoveredNode, setHoveredNode] = useState<string>('Sector 4 North — Ambulance AMB-04 Active');

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const presetRef = useRef<CameraPreset>(cameraPreset);
  presetRef.current = cameraPreset;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsPaused(true);
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglSupported(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    // Scene & Exponential Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b14, 0.022);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
    camera.position.set(19, 15, 21);
    const cameraTarget = new THREE.Vector3(0, 1.2, 0);
    camera.lookAt(cameraTarget);

    // Three-Point Studio + City Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    keyLight.position.set(18, 28, 15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf97316, 1.5);
    rimLight.position.set(-18, 14, -14);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x06b6d4, 2.5, 35);
    fillLight.position.set(0, 10, 0);
    scene.add(fillLight);

    // Root City Group (allows subtle interactive drag rotation)
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // Base Platform
    const baseGeo = new THREE.CylinderGeometry(16.5, 17.2, 0.8, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0b1324,
      roughness: 0.4,
      metalness: 0.6,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.4;
    baseMesh.receiveShadow = true;
    cityGroup.add(baseMesh);

    // Glowing Outer Rim Ring
    const rimGeo = new THREE.RingGeometry(16.2, 16.55, 64);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
    });
    const rimRing = new THREE.Mesh(rimGeo, rimMat);
    rimRing.rotation.x = -Math.PI / 2;
    rimRing.position.y = 0.02;
    cityGroup.add(rimRing);

    // Grid Helper for City Roads
    const gridHelper = new THREE.GridHelper(24, 12, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = 0.03;
    cityGroup.add(gridHelper);

    // Glowing Road Strips (Main Avenues along X and Z)
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      metalness: 0.8,
    });
    const roadX = new THREE.Mesh(new THREE.BoxGeometry(24, 0.04, 2.2), roadMat);
    roadX.position.set(0, 0.02, 4);
    cityGroup.add(roadX);

    const roadX2 = new THREE.Mesh(new THREE.BoxGeometry(24, 0.04, 2.2), roadMat);
    roadX2.position.set(0, 0.02, -4);
    cityGroup.add(roadX2);

    const roadZ = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 24), roadMat);
    roadZ.position.set(4, 0.02, 0);
    cityGroup.add(roadZ);

    const roadZ2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 24), roadMat);
    roadZ2.position.set(-4, 0.02, 0);
    cityGroup.add(roadZ2);

    // Procedural City Buildings
    const buildingPositions = [
      // Central Hospital Complex
      { x: 0, z: 0, w: 3.2, d: 3.2, h: 5.6, isHospital: true },
      // Surrounding Blocks
      { x: -7.5, z: -7.5, w: 2.4, d: 2.4, h: 4.2 },
      { x: -7.5, z: 0, w: 2.2, d: 2.6, h: 3.4 },
      { x: -7.5, z: 7.5, w: 2.5, d: 2.2, h: 2.8 },
      { x: 0, z: -7.5, w: 2.8, d: 2.2, h: 4.8 },
      { x: 0, z: 7.5, w: 2.6, d: 2.4, h: 3.1 },
      { x: 7.5, z: -7.5, w: 2.5, d: 2.5, h: 5.0 },
      { x: 7.5, z: 0, w: 2.4, d: 2.4, h: 3.9, isBloodBank: true },
      { x: 7.5, z: 7.5, w: 2.2, d: 2.2, h: 2.6 },
      { x: -10.5, z: -3.5, w: 1.8, d: 1.8, h: 2.4 },
      { x: 10.2, z: -3.5, w: 1.8, d: 1.8, h: 3.2 },
      { x: -3.5, z: -10.2, w: 2.0, d: 1.8, h: 2.9 },
      { x: 3.5, z: 10.2, w: 1.9, d: 1.9, h: 2.5 },
    ];

    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x111c33,
      roughness: 0.3,
      metalness: 0.7,
    });

    const hospitalMat = new THREE.MeshStandardMaterial({
      color: 0x162644,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x082f49,
      emissiveIntensity: 0.5,
    });

    const floatingMedicalCross = new THREE.Group();
    const floatingBloodDrop = new THREE.Group();

    buildingPositions.forEach((b) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mesh = new THREE.Mesh(geo, b.isHospital ? hospitalMat : buildingMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      cityGroup.add(mesh);

      // Subtle wireframe edge highlight
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({
        color: b.isHospital ? 0x22d3ee : b.isBloodBank ? 0xf43f5e : 0x1e3a8a,
        transparent: true,
        opacity: b.isHospital || b.isBloodBank ? 0.75 : 0.35,
      });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      mesh.add(wireframe);

      // If Hospital: Add Helipad & 3D Glowing Medical Cross on Roof
      if (b.isHospital) {
        const padGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.08, 32);
        const padMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.set(0, b.h / 2 + 0.05, 0);
        mesh.add(pad);

        // 3D Medical Cross above Hospital
        const crossMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          emissiveIntensity: 0.85,
          roughness: 0.2,
        });
        const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.25, 0.38), crossMat);
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.38, 0.38), crossMat);
        floatingMedicalCross.add(vBar, hBar);
        floatingMedicalCross.position.set(b.x, b.h + 1.4, b.z);
        cityGroup.add(floatingMedicalCross);
      }

      // If Blood Bank: Add Floating 3D Blood Drop Emblem
      if (b.isBloodBank) {
        const dropMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0xe11d48,
          emissiveIntensity: 0.75,
          roughness: 0.15,
          metalness: 0.3,
        });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 24), dropMat);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.75, 24), dropMat);
        cone.position.y = 0.45;
        floatingBloodDrop.add(sphere, cone);
        floatingBloodDrop.position.set(b.x, b.h + 1.2, b.z);
        cityGroup.add(floatingBloodDrop);
      }
    });

    // -------------------------------------------------------------
    // 3D AMBULANCE VEHICLE MODEL
    // -------------------------------------------------------------
    const ambulanceGroup = new THREE.Group();
    const ambBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.3,
    });
    const ambStripeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 0.6,
    });
    const ambMainBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.72, 0.82), ambBodyMat);
    ambMainBox.position.y = 0.48;
    ambulanceGroup.add(ambMainBox);

    const ambStripe = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.16, 0.84), ambStripeMat);
    ambStripe.position.y = 0.42;
    ambulanceGroup.add(ambStripe);

    const ambCab = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.54, 0.78), ambBodyMat);
    ambCab.position.set(0.85, 0.39, 0);
    ambulanceGroup.add(ambCab);

    // Emergency Roof Lightbar (Red & Cyan)
    const sirenRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const sirenCyanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const sirenLeft = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.26), sirenRedMat);
    sirenLeft.position.set(0.4, 0.9, -0.2);
    const sirenRight = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.26), sirenCyanMat);
    sirenRight.position.set(0.4, 0.9, 0.2);
    ambulanceGroup.add(sirenLeft, sirenRight);

    const ambLight = new THREE.PointLight(0xef4444, 3, 6);
    ambLight.position.set(0.4, 1.3, 0);
    ambulanceGroup.add(ambLight);

    ambulanceGroup.position.set(4, 0.05, 4);
    cityGroup.add(ambulanceGroup);

    // -------------------------------------------------------------
    // 3D RESCUE HELICOPTER MODEL
    // -------------------------------------------------------------
    const helicopterGroup = new THREE.Group();
    const heliMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.7,
    });
    const fuselage = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 16), heliMat);
    fuselage.scale.set(1.6, 0.85, 0.9);
    helicopterGroup.add(fuselage);

    const tailBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 1.8, 12), heliMat);
    tailBoom.rotation.z = Math.PI / 2;
    tailBoom.position.set(-1.4, 0.1, 0);
    helicopterGroup.add(tailBoom);

    // Main Rotor
    const rotorGroup = new THREE.Group();
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 0.18), bladeMat);
    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 3.2), bladeMat);
    rotorGroup.add(blade1, blade2);
    rotorGroup.position.set(0, 0.68, 0);
    helicopterGroup.add(rotorGroup);

    // Helicopter Volumetric Searchlight Cone
    const coneGeo = new THREE.ConeGeometry(2.2, 6.5, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.13,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const searchlightCone = new THREE.Mesh(coneGeo, coneMat);
    searchlightCone.position.set(0.3, -3.2, 0);
    helicopterGroup.add(searchlightCone);

    helicopterGroup.position.set(5, 7.2, -3);
    cityGroup.add(helicopterGroup);

    // -------------------------------------------------------------
    // GLOWING LOCATION PINS & VOLUNTEER NETWORK ARCS
    // -------------------------------------------------------------
    const pulseRings: THREE.Mesh[] = [];
    const emergencyCoords = [
      { x: -4, z: -6.5, color: 0xef4444 }, // Critical Incident
      { x: 6.2, z: 5.5, color: 0xf97316 },  // Rescue Incident
      { x: -6.0, z: 4.5, color: 0x06b6d4 }, // Volunteer Staging Hub
    ];

    emergencyCoords.forEach((pt) => {
      // Pin head
      const pinGeo = new THREE.OctahedronGeometry(0.42, 0);
      const pinMat = new THREE.MeshStandardMaterial({
        color: pt.color,
        emissive: pt.color,
        emissiveIntensity: 0.9,
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(pt.x, 1.35, pt.z);
      cityGroup.add(pin);

      // Expanding ground pulse ring
      const ringGeo = new THREE.RingGeometry(0.35, 0.55, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pt.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(pt.x, 0.06, pt.z);
      cityGroup.add(ring);
      pulseRings.push(ring);

      // Glowing 3D Arc from Central Hospital (0, 5.6, 0) to Incident Pin
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 5.6, 0),
        new THREE.Vector3(pt.x * 0.5, 7.8, pt.z * 0.5),
        new THREE.Vector3(pt.x, 1.35, pt.z)
      );
      const points = curve.getPoints(36);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: pt.color,
        transparent: true,
        opacity: 0.65,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      cityGroup.add(arcLine);
    });

    // Subtle Atmospheric Particles
    const particleCount = 90;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = Math.random() * 11 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.14,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    cityGroup.add(particles);

    // Pointer Drag Orbit Interaction
    let isDragging = false;
    let prevX = 0;
    let targetRotationY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevX;
      prevX = e.clientX;
      targetRotationY += deltaX * 0.007;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let frameId = 0;
    let elapsed = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      if (!isPausedRef.current) {
        elapsed += dt;

        // Smooth slow auto-rotation when not dragging
        if (!isDragging && presetRef.current === 'overview') {
          targetRotationY += dt * 0.12;
        }
        cityGroup.rotation.y += (targetRotationY - cityGroup.rotation.y) * 0.08;

        // 1. Animate Ambulance along rectangular road loop (x = -4..4, z = -4..4)
        const loopSpeed = 3.6;
        const perimeter = 32; // 4 sides of length 8
        const dist = (elapsed * loopSpeed) % perimeter;
        let ax = 0;
        let az = 0;
        let aRot = 0;
        if (dist < 8) {
          // Bottom edge: (-4, 4) -> (4, 4)
          ax = -4 + dist;
          az = 4;
          aRot = 0;
        } else if (dist < 16) {
          // Right edge: (4, 4) -> (4, -4)
          ax = 4;
          az = 4 - (dist - 8);
          aRot = Math.PI / 2;
        } else if (dist < 24) {
          // Top edge: (4, -4) -> (-4, -4)
          ax = 4 - (dist - 16);
          az = -4;
          aRot = Math.PI;
        } else {
          // Left edge: (-4, -4) -> (-4, 4)
          ax = -4;
          az = -4 + (dist - 24);
          aRot = -Math.PI / 2;
        }
        ambulanceGroup.position.set(ax, 0.05, az);
        ambulanceGroup.rotation.y = aRot;

        // Flash ambulance lightbar
        const flash = Math.sin(elapsed * 18) > 0;
        ambLight.color.setHex(flash ? 0xef4444 : 0x06b6d4);

        // 2. Animate Rescue Helicopter Orbit & Rotor
        const heliAngle = elapsed * 0.45;
        helicopterGroup.position.set(
          Math.cos(heliAngle) * 6.8,
          7.2 + Math.sin(elapsed * 2) * 0.25,
          Math.sin(heliAngle) * 6.8
        );
        helicopterGroup.rotation.y = -heliAngle + Math.PI / 2;
        rotorGroup.rotation.y += dt * 22;

        // 3. Animate Floating Medical Cross & Blood Drop
        floatingMedicalCross.rotation.y += dt * 1.1;
        floatingMedicalCross.position.y = 7.0 + Math.sin(elapsed * 2.5) * 0.18;

        floatingBloodDrop.rotation.y -= dt * 1.2;
        floatingBloodDrop.position.y = 5.1 + Math.cos(elapsed * 2.2) * 0.16;

        // 4. Pulse Emergency Rings
        pulseRings.forEach((ring, idx) => {
          const phase = (elapsed * 1.4 + idx * 0.4) % 1;
          const scale = 1 + phase * 2.8;
          ring.scale.set(scale, scale, 1);
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = (1 - phase) * 0.8;
        });
      }

      // Smooth Camera Preset Interpolation
      const desiredPos = new THREE.Vector3(19, 15, 21);
      const desiredLook = new THREE.Vector3(0, 1.2, 0);

      if (presetRef.current === 'ambulance') {
        const worldAmb = new THREE.Vector3();
        ambulanceGroup.getWorldPosition(worldAmb);
        desiredPos.set(worldAmb.x + 5.5, 4.5, worldAmb.z + 6.5);
        desiredLook.copy(worldAmb);
      } else if (presetRef.current === 'helicopter') {
        const worldHeli = new THREE.Vector3();
        helicopterGroup.getWorldPosition(worldHeli);
        desiredPos.set(worldHeli.x + 6, worldHeli.y + 3, worldHeli.z + 6);
        desiredLook.set(0, 1, 0);
      } else if (presetRef.current === 'hospital') {
        desiredPos.set(6.5, 9.5, 8.5);
        desiredLook.set(0, 4.5, 0);
      }

      camera.position.lerp(desiredPos, 0.05);
      cameraTarget.lerp(desiredLook, 0.06);
      camera.lookAt(cameraTarget);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);

      // Deep clean all scene geometries, materials, and textures
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handlePresetChange = (preset: CameraPreset, label: string) => {
    setCameraPreset(preset);
    setHoveredNode(label);
  };

  return (
    <div className="relative w-full h-[460px] lg:h-[540px] rounded-2xl overflow-hidden bg-[#080E1C] border border-slate-800/80 shadow-2xl select-none">
      {/* Subtle Top Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 60% 35%, rgba(6, 182, 212, 0.14), rgba(249, 115, 22, 0.05) 45%, transparent 75%)',
        }}
      />

      {/* WebGL Canvas or Resilient 2D/3D Vector Fallback */}
      {webglSupported ? (
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          aria-label="Interactive 3D Emergency Rescue City Map with Ambulance, Helicopter, and Hospital Nodes"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#0B1324] via-[#0F172A] to-[#1E1B4B]">
          <ShieldAlert className="w-12 h-12 text-cyan-400 mb-3" />
          <p className="text-base font-semibold text-white mb-1">
            3D Tactical City Grid (2D Isometric Fallback Active)
          </p>
          <p className="text-xs text-slate-400 max-w-md">
            Active emergency pins, ambulance corridor AMB-04, and volunteer nodes are online in reduced-graphics mode.
          </p>
        </div>
      )}

      {/* Top-Left HUD Overlay: Live Scene Telemetry */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 flex items-center gap-3 pointer-events-auto">
          <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400">3D Tactical Grid</span>
            <span className="mx-1.5 text-slate-600">·</span>
            <span className="text-slate-100 font-medium">{hoveredNode}</span>
          </div>
        </div>

        <div className="bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono tabular-nums pointer-events-auto">
          <span>Active Pins: {activeEmergencyCount}</span>
          <span className="mx-2 text-slate-600">·</span>
          <span>Responders: {availableVolunteerCount}</span>
          <span className="mx-2 text-slate-600">·</span>
          <span className="text-amber-400">Demo Simulation</span>
        </div>
      </div>

      {/* Bottom Interactive Camera & Dispatch Controls HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-white/10 p-1.5 rounded-xl pointer-events-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => handlePresetChange('overview', 'Full Metro 360° Command Orbit (Drag to Rotate)')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              cameraPreset === 'overview'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            City Overview
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('ambulance', 'Tracking Unit AMB-04 — Expressway Corridor')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              cameraPreset === 'ambulance'
                ? 'bg-orange-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Ambulance Cam
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('helicopter', 'Air Rescue Heli-01 — Thermal & Flood Recon')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              cameraPreset === 'helicopter'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Heli Recon
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('hospital', 'Central Trauma & Blood Network Hub')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              cameraPreset === 'hospital'
                ? 'bg-rose-500 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Medical Hub
          </button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title={isPaused ? 'Resume 3D Animation' : 'Pause 3D Animation'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
            {isPaused ? 'Resume 3D' : 'Pause 3D'}
          </button>
          {onSelectEmergencyAction && (
            <button
              type="button"
              onClick={onSelectEmergencyAction}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-medium text-rose-200 hover:bg-rose-500/30 transition-colors whitespace-nowrap shrink-0"
            >
              Inspect Live Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
