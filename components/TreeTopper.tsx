
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { StarShape } from './StarGeometry';

export const TreeTopper: React.FC = () => {
  const starRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (starRef.current) {
      starRef.current.rotation.y = time * 0.8;
      starRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }
    if (glowRef.current) {
        glowRef.current.intensity = 20 + Math.sin(time * 4) * 8;
    }
  });

  return (
    <group position={[0, 7.5, 0]}>
      <Float speed={3} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={starRef} rotation={[0, 0, 0]}>
          <StarShape />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={4} 
            metalness={1} 
            roughness={0} 
          />
        </mesh>
        
        <pointLight 
            ref={glowRef}
            intensity={30} 
            distance={15} 
            color="#FFD700" 
        />
        
        {/* Swirling Sparkles */}
        <Sparkles 
            count={100} 
            scale={4} 
            size={4} 
            speed={0.8} 
            color="#FFD700" 
            opacity={0.8}
        />
      </Float>
    </group>
  );
};
