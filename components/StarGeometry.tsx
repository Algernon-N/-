
import React, { useMemo } from 'react';
import * as THREE from 'three';

export const StarShape = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.45;
    
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

  const extrudeSettings = {
    steps: 1,
    depth: 0.05, // Thin profile
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelOffset: 0,
    bevelSegments: 5
  };

  return <extrudeGeometry args={[shape, extrudeSettings]} />;
};
