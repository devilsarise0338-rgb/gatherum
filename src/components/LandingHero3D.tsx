import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from 'motion/react';

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const count = 3000;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 15;
      p[i * 3 + 1] = (Math.random() - 0.5) * 15;
      p[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return p;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.02;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    
    // Gentle mouse follow
    ref.current.rotation.x += (mouse.y * 0.2 - ref.current.rotation.x) * 0.05;
    ref.current.rotation.y += (mouse.x * 0.2 - ref.current.rotation.y) * 0.05;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#FF5A5F"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function FloatingShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += (mouse.y * 0.5 - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (mouse.x * 0.5 - meshRef.current.rotation.y) * 0.05;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 1]} />
        <meshStandardMaterial 
          color="#FF5A5F" 
          wireframe 
          transparent
          opacity={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function LandingHero3D() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 -z-10 opacity-60 dark:opacity-40">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ParticleField />
        <FloatingShape />
      </Canvas>
    </div>
  );
}
