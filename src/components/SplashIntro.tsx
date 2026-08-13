import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Brand color palette
    const colors = [
      new THREE.Color('#C9762F'), // Amber
      new THREE.Color('#2D5A27'), // Deep Emerald
      new THREE.Color('#A64B2A'), // Terracotta
      new THREE.Color('#FAF7F2'), // Warm light
      new THREE.Color('#E6D3C1')  // Muted Clay
    ];

    const particleCount = 1200;
    const positions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Start positions: drifting from wide radius
      const theta = Math.random() * Math.PI * 2;
      const radius = 60 + Math.random() * 40;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      // Target positions: Converging to form GATHERUM wordmark silhouette area
      targetPositions[i * 3] = (Math.random() - 0.5) * 48;
      targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;

      const color = colors[Math.floor(Math.random() * colors.length)];
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;

      sizes[i] = 0.6 + Math.random() * 1.8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let animationFrameId: number;
    const startTime = Date.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const positionsAttr = geometry.attributes.position;

      if (elapsed < 2.2) {
        // Convergence phase
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          positionsAttr.array[ix] += (targetPositions[ix] - positionsAttr.array[ix]) * 0.05;
          positionsAttr.array[iy] += (targetPositions[iy] - positionsAttr.array[iy]) * 0.05;
          positionsAttr.array[iz] += (targetPositions[iz] - positionsAttr.array[iz]) * 0.05;
        }
      } else if (elapsed < 3.5) {
        // Pulse & Tilt Phase
        const t = elapsed - 2.2;
        const pulse = 1.0 + Math.sin(t * Math.PI) * 0.06;
        particles.scale.set(pulse, pulse, pulse);
        particles.rotation.y = Math.sin(t * 2) * 0.12;
        particles.rotation.x = Math.cos(t * 2) * 0.06;
      } else if (elapsed < 4.5) {
        // Dissolve phase
        const t = (elapsed - 3.5);
        material.opacity = Math.max(0, 0.85 * (1 - t));
        particles.scale.addScalar(0.015);
        
        if (t > 0.95) {
          onComplete();
          return;
        }
      }

      positionsAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#181615] text-[#FAF7F2] overflow-hidden">
      {/* 3D Canvas Background */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Foreground Typography */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.8 }}
        className="relative z-10 text-center px-6 max-w-2xl pointer-events-none"
      >
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#C9762F] text-xs font-semibold tracking-widest uppercase mb-4 backdrop-blur-md border border-white/10">
          <Sparkles className="w-3.5 h-3.5" /> Presenting
        </span>
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-[#FAF7F2] drop-shadow-2xl mb-3">
          GATHERUM
        </h1>
        <p className="text-stone-300 text-sm md:text-base font-light tracking-wide max-w-md mx-auto">
          The art of elevated hosting. Curated salons, intimate suppers & architectural gatherings.
        </p>
      </motion.div>

      {/* Skip / Enter Action */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        onClick={onComplete}
        className="absolute bottom-10 z-20 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C9762F] hover:bg-[#b06424] text-white text-xs font-medium uppercase tracking-widest transition-all shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
      >
        Enter Platform <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};
