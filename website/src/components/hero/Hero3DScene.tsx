"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Hero3DScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Check WebGL availability
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      setHasWebGL(false);
      return;
    }

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090a0c, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Master Artifact Group
    const masterGroup = new THREE.Group();
    // Offset slightly right on wide desktop to balance hero copy
    masterGroup.position.set(width > 1024 ? 1.8 : 0, 0, 0);
    scene.add(masterGroup);

    // ==========================================
    // 1. OUTER METALLIC GRAPHITE GIMBAL RING
    // ==========================================
    const outerRingGeo = new THREE.TorusGeometry(3.2, 0.09, 24, 120);
    const graphiteMetalMat = new THREE.MeshStandardMaterial({
      color: 0x22262d,
      roughness: 0.22,
      metalness: 0.95,
      envMapIntensity: 1.2,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, graphiteMetalMat);
    masterGroup.add(outerRing);

    // Vernier ticks along outer ring perimeter
    const tickGeo = new THREE.BoxGeometry(0.04, 0.2, 0.06);
    const tickMat = new THREE.MeshStandardMaterial({
      color: 0x8a909d,
      roughness: 0.3,
      metalness: 0.8,
    });
    const tickCount = 48;
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2;
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(
        Math.cos(angle) * 3.2,
        Math.sin(angle) * 3.2,
        0
      );
      tick.rotation.z = angle;
      outerRing.add(tick);
    }

    // ==========================================
    // 2. INTERMEDIATE GYROSCOPIC RING (STEEL-BLUE)
    // ==========================================
    const midRingGeo = new THREE.TorusGeometry(2.4, 0.07, 24, 100);
    const steelBlueMat = new THREE.MeshStandardMaterial({
      color: 0x3d4957,
      roughness: 0.28,
      metalness: 0.9,
    });
    const midRing = new THREE.Mesh(midRingGeo, steelBlueMat);
    midRing.rotation.x = Math.PI / 4;
    masterGroup.add(midRing);

    // ==========================================
    // 3. INNER PRECISION CAGE & DETERMINISTIC NUCLEUS
    // ==========================================
    const innerRingGeo = new THREE.TorusGeometry(1.6, 0.05, 20, 80);
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0x5a6372,
      roughness: 0.35,
      metalness: 0.85,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, silverMat);
    innerRing.rotation.y = Math.PI / 3;
    masterGroup.add(innerRing);

    // Central geometric crystalline test nucleus (Icosahedron)
    const nucleusGeo = new THREE.IcosahedronGeometry(0.9, 1);
    const nucleusMat = new THREE.MeshPhysicalMaterial({
      color: 0x6b8cae,
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.7,
      ior: 1.5,
      thickness: 1.2,
      transparent: true,
      opacity: 0.85,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    masterGroup.add(nucleus);

    // Nucleus wireframe overlay
    const wireframeGeo = new THREE.IcosahedronGeometry(0.92, 1);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xdde3ed,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireframe = new THREE.Mesh(wireframeGeo, wireframeMat);
    masterGroup.add(wireframe);

    // ==========================================
    // 4. ORTHOGONAL MEASUREMENT NEEDLES & PROBES
    // ==========================================
    const needleGeo = new THREE.CylinderGeometry(0.015, 0.015, 5.2, 12);
    const needleMat = new THREE.MeshStandardMaterial({
      color: 0xa4a9b5,
      roughness: 0.2,
      metalness: 0.95,
    });

    const needleX = new THREE.Mesh(needleGeo, needleMat);
    needleX.rotation.z = Math.PI / 2;
    masterGroup.add(needleX);

    const needleY = new THREE.Mesh(needleGeo, needleMat);
    masterGroup.add(needleY);

    const needleZ = new THREE.Mesh(needleGeo, needleMat);
    needleZ.rotation.x = Math.PI / 2;
    masterGroup.add(needleZ);

    // Sensor tip markers on needle ends
    const sensorGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const sensorMatIcy = new THREE.MeshBasicMaterial({ color: 0x8ab4f8 });
    const sensorMatBronze = new THREE.MeshBasicMaterial({ color: 0xe5a962 });

    const s1 = new THREE.Mesh(sensorGeo, sensorMatIcy);
    s1.position.set(2.6, 0, 0);
    masterGroup.add(s1);

    const s2 = new THREE.Mesh(sensorGeo, sensorMatBronze);
    s2.position.set(-2.6, 0, 0);
    masterGroup.add(s2);

    const s3 = new THREE.Mesh(sensorGeo, sensorMatIcy);
    s3.position.set(0, 2.6, 0);
    masterGroup.add(s3);

    const s4 = new THREE.Mesh(sensorGeo, sensorMatBronze);
    s4.position.set(0, -2.6, 0);
    masterGroup.add(s4);

    // ==========================================
    // 5. TEST PERTURBATION DUST / PARTICLES
    // ==========================================
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.7;

      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
      scales[i] = Math.random() * 0.8 + 0.2;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x9ca9bb,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particles);

    // ==========================================
    // 6. CINEMATIC DIRECTIONAL LIGHTING
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0x13151a, 2.0);
    scene.add(ambientLight);

    // Key Light (Cool pure white from top left)
    const keyLight = new THREE.DirectionalLight(0xf5f8fc, 3.2);
    keyLight.position.set(-6, 8, 8);
    scene.add(keyLight);

    // Rim Light (Warm champagne highlight from bottom rear)
    const rimLight = new THREE.DirectionalLight(0xe5d0b5, 2.5);
    rimLight.position.set(6, -6, -6);
    scene.add(rimLight);

    // Fill Light (Icy steel-blue from front right)
    const fillLight = new THREE.DirectionalLight(0x6b8cae, 2.0);
    fillLight.position.set(5, 4, 6);
    scene.add(fillLight);

    // ==========================================
    // 7. INTERACTIVE MOUSE PARALLAX
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // ==========================================
    // 8. GSAP SCROLLTRIGGER CHOREOGRAPHY
    // ==========================================
    const scrollObj = {
      scrollProgress: 0,
      opacity: 1,
    };

    const trigger = ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.2,
      onUpdate: (self) => {
        scrollObj.scrollProgress = self.progress;
        // Fade out progressively as scroll advances
        scrollObj.opacity = Math.max(1 - self.progress * 1.35, 0);
        if (renderer.domElement) {
          renderer.domElement.style.opacity = `${scrollObj.opacity}`;
        }
      },
    });

    // ==========================================
    // 9. ANIMATION LOOP
    // ==========================================
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Only render if visible
      if (scrollObj.opacity > 0.01) {
        if (!prefersReducedMotion) {
          // Smooth mouse damping
          targetX += (mouseX - targetX) * 0.05;
          targetY += (mouseY - targetY) * 0.05;

          // Intrinsic continuous rotations
          outerRing.rotation.z += delta * 0.12;
          midRing.rotation.y += delta * 0.18;
          innerRing.rotation.x -= delta * 0.15;
          nucleus.rotation.y += delta * 0.25;
          nucleus.rotation.x += delta * 0.15;
          wireframe.rotation.y += delta * 0.25;
          wireframe.rotation.x += delta * 0.15;
          particles.rotation.y += delta * 0.04;

          // Dynamic breathing oscillation
          const breathe = 1 + Math.sin(elapsed * 1.5) * 0.015;

          // Scroll-driven transformations
          const p = scrollObj.scrollProgress;
          masterGroup.position.z = -p * 10;
          masterGroup.position.y = -p * 2.2;
          masterGroup.scale.set(
            (1 - p * 0.45) * breathe,
            (1 - p * 0.45) * breathe,
            (1 - p * 0.45) * breathe
          );

          // Combined mouse sway + scroll rotation
          masterGroup.rotation.y = targetX * 1.5 + p * 1.8;
          masterGroup.rotation.x = -targetY * 1.5 + p * 1.2;
        }

        renderer.render(scene, camera);
      }
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      masterGroup.position.x = w > 1024 ? 1.8 : 0;
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      trigger.kill();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Geometries and Materials
      outerRingGeo.dispose();
      midRingGeo.dispose();
      innerRingGeo.dispose();
      nucleusGeo.dispose();
      wireframeGeo.dispose();
      needleGeo.dispose();
      sensorGeo.dispose();
      particleGeo.dispose();

      graphiteMetalMat.dispose();
      tickMat.dispose();
      steelBlueMat.dispose();
      silverMat.dispose();
      nucleusMat.dispose();
      wireframeMat.dispose();
      needleMat.dispose();
      sensorMatIcy.dispose();
      sensorMatBronze.dispose();
      particleMat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center transition-opacity duration-300"
      aria-hidden="true"
    >
      {!hasWebGL && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-white/10 flex items-center justify-center opacity-30">
          <div className="w-56 h-56 rounded-full border border-dashed border-[#6B8CAE] animate-spin" />
        </div>
      )}
    </div>
  );
}
