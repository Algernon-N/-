
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SNOW_COUNT = 250;

export const Snow: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObj = new THREE.Object3D();

  // Define a 5-pointed star shape for the "star-shaped pine needles"
  const starShape = useMemo(() => {
    const s = new THREE.Shape();
    const points = 5;
    const outerRadius = 1;
    const innerRadius = 0.3;
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  // Settings to extrude the star shape into a thin 3D object
  const extrudeSettings = {
    steps: 1,
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3
  };

  const snowData = useMemo(() => {
    const particles = [];
    for (let i = 0; i < SNOW_COUNT; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 60,
          Math.random() * 40 - 10,
          (Math.random() - 0.5) * 60
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        speed: 0.04 + Math.random() * 0.08,
        swing: Math.random() * 0.03,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        offset: Math.random() * Math.PI * 2,
        scale: 0.04 + Math.random() * 0.08
      });
    }
    return particles;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    snowData.forEach((p, i) => {
      // Gentle downward motion
      p.position.y -= p.speed;
      // Slight swaying motion
      p.position.x += Math.sin(time + p.offset) * p.swing;
      
      // Update rotation for a fluttering effect
      p.rotation.x += p.rotSpeed;
      p.rotation.y += p.rotSpeed * 1.5;
      p.rotation.z += p.rotSpeed * 0.5;

      // Wrap around when reaching the bottom
      if (p.position.y < -15) {
        p.position.y = 25;
      }

      tempObj.position.copy(p.position);
      tempObj.rotation.copy(p.rotation);
      tempObj.scale.setScalar(p.scale);
      tempObj.updateMatrix();
      meshRef.current?.setMatrixAt(i, tempObj.matrix);
    });
    if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, SNOW_COUNT]}>
      <extrudeGeometry args={[starShape, extrudeSettings]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#ffffff"
        emissiveIntensity={0.4}
        transparent 
        opacity={0.7} 
        roughness={0}
        metalness={0.5}
      />
    </instancedMesh>
  );
};
