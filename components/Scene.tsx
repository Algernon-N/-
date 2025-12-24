
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { InstancedTree } from './InstancedTree';
import { TreeTopper } from './TreeTopper';
import { Snow } from './Snow';

interface SceneProps {
  isSpread: boolean;
  handRotationY: number;
}

export const Scene: React.FC<SceneProps> = ({ isSpread, handRotationY }) => {
  return (
    <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={['#020a05']} />
      
      <PerspectiveCamera makeDefault position={[0, 5, 22]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={!isSpread}
        autoRotateSpeed={0.2}
        enableDamping
      />

      <ambientLight intensity={0.12} />
      <pointLight position={[5, 12, 5]} intensity={2.5} color="#FFD700" />
      <spotLight 
        position={[-15, 20, -10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={15} 
        color="#2E7D32"
      />
      
      <Suspense fallback={null}>
        <group position={[0, -1, 0]}>
            <InstancedTree isSpread={isSpread} handRotationY={handRotationY} />
            {!isSpread && <TreeTopper />}
            <Snow />
        </group>
        
        <Environment preset="night" />
        <Stars radius={120} depth={60} count={isSpread ? 12000 : 4000} factor={4} saturation={1} fade speed={0.4} />
        {!isSpread && (
            <ContactShadows 
                opacity={0.65} 
                scale={35} 
                blur={3.5} 
                far={10} 
                color="#001a05" 
                position={[0, -6.6, 0]}
            />
        )}
      </Suspense>

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.7} 
          mipmapBlur 
          intensity={isSpread ? 3.0 : 2.0} 
          radius={0.4} 
        />
        <Noise opacity={0.03} />
        <Vignette eskil={false} offset={0.1} darkness={1.3} />
        <ChromaticAberration offset={new THREE.Vector2(0.0006, 0.0006)} />
      </EffectComposer>
    </Canvas>
  );
};
