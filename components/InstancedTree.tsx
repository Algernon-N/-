
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LEAF_COUNT = 5500;
const DECO_COUNT = 800;
const RIBBON_COUNT = 2000;
const BASE_GIFT_COUNT = 45;
const TREE_SNOW_COUNT = 66; // Reduced to 1/6 of 400
const TREE_GIFT_COUNT = 300; // Gift box ornaments on tree

interface InstancedTreeProps {
  isSpread: boolean;
  handRotationY: number;
}

export const InstancedTree: React.FC<InstancedTreeProps> = ({ isSpread, handRotationY }) => {
  const leafMeshRef = useRef<THREE.InstancedMesh>(null);
  const decoCubeMeshRef = useRef<THREE.InstancedMesh>(null);
  const decoIcoMeshRef = useRef<THREE.InstancedMesh>(null);
  const ribbonMeshRef = useRef<THREE.InstancedMesh>(null);
  const baseGiftMeshRef = useRef<THREE.InstancedMesh>(null);
  const treeSnowMeshRef = useRef<THREE.InstancedMesh>(null);
  const treeGiftMeshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const tempObj = new THREE.Object3D();

  // Define the Star-shaped Pine Needle geometry for tree decorations
  const pineStarGeometry = useMemo(() => {
    const s = new THREE.Shape();
    const points = 6; // 6-pointed star for a more "snowflake/needle" look
    const outerRadius = 1;
    const innerRadius = 0.25; // Very sharp inner radius for needle effect
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3
    };
    return new THREE.ExtrudeGeometry(s, extrudeSettings);
  }, []);
  
  const data = useMemo(() => {
    const treePositions: THREE.Vector3[] = [];
    const starPositions: THREE.Vector3[] = [];
    const ribbonPositions: THREE.Vector3[] = [];
    const ribbonRotations: THREE.Euler[] = [];
    const baseGiftPositions: THREE.Vector3[] = [];
    const treeSnowPositions: THREE.Vector3[] = [];
    const treeGiftPositions: THREE.Vector3[] = [];
    
    const height = 14;
    const baseRadius = 5.5;

    const getPointInTree = () => {
        const y = Math.pow(Math.random(), 1.2) * height;
        const radiusAtY = baseRadius * (1 - y / height);
        const radius = radiusAtY + (Math.random() - 0.5) * 1.0;
        const angle = Math.random() * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * radius, y - 6, Math.sin(angle) * radius);
    };

    for (let i = 0; i < LEAF_COUNT; i++) {
      treePositions.push(getPointInTree());
      const phi = Math.acos(-1 + (2 * i) / LEAF_COUNT);
      const theta = Math.sqrt(LEAF_COUNT * Math.PI) * phi;
      const sr = 15 + Math.random() * 10;
      starPositions.push(new THREE.Vector3(
        sr * Math.cos(theta) * Math.sin(phi),
        sr * Math.sin(theta) * Math.sin(phi),
        sr * Math.cos(phi)
      ));
    }

    for (let i = 0; i < RIBBON_COUNT; i++) {
      const t = i / RIBBON_COUNT;
      const angle = t * Math.PI * 2 * 5.0;
      const y = t * height * 0.98;
      const radius = (baseRadius * (1 - t)) + 0.35;
      const pos = new THREE.Vector3(Math.cos(angle) * radius, y - 6, Math.sin(angle) * radius);
      ribbonPositions.push(pos);
      const nextAngle = ((i+1) / RIBBON_COUNT) * Math.PI * 2 * 5.0;
      const nextY = ((i+1) / RIBBON_COUNT) * height * 0.98;
      const nextRadius = (baseRadius * (1 - (i+1) / RIBBON_COUNT)) + 0.35;
      const nextPos = new THREE.Vector3(Math.cos(nextAngle) * nextRadius, nextY - 6, Math.sin(nextAngle) * nextRadius);
      const lookAtMat = new THREE.Matrix4().lookAt(pos, nextPos, new THREE.Vector3(0, 1, 0));
      ribbonRotations.push(new THREE.Euler().setFromRotationMatrix(lookAtMat));
    }

    for (let i = 0; i < BASE_GIFT_COUNT; i++) {
      const angle = (i / BASE_GIFT_COUNT) * Math.PI * 2 + (Math.random() * 0.5);
      const dist = 3.2 + Math.random() * 3.8;
      baseGiftPositions.push(new THREE.Vector3(Math.cos(angle) * dist, -6.5, Math.sin(angle) * dist));
    }

    for (let i = 0; i < TREE_SNOW_COUNT; i++) treeSnowPositions.push(getPointInTree());
    for (let i = 0; i < TREE_GIFT_COUNT; i++) treeGiftPositions.push(getPointInTree());

    return { 
        treePositions, starPositions, ribbonPositions, 
        ribbonRotations, baseGiftPositions, 
        treeSnowPositions, treeGiftPositions 
    };
  }, []);

  useEffect(() => {
    const leafColors = ['#0B3D0B', '#1B5E20', '#2E7D32', '#004D40'];
    const rubyColors = ['#B71C1C', '#D32F2F', '#8E0000'];
    const brightGiftColors = ['#FF0055', '#00FFCC', '#FFCC00', '#CC00FF', '#FFFFFF', '#0099FF'];
    const treeGiftColors = ['#D32F2F', '#FFD700']; // Red and Yellow for tree ornaments
    const crystalWhite = '#FFFFFF';
    
    const color = new THREE.Color();

    for (let i = 0; i < LEAF_COUNT; i++) {
      color.set(leafColors[Math.floor(Math.random() * leafColors.length)]);
      leafMeshRef.current?.setColorAt(i, color);
    }
    
    for (let i = 0; i < DECO_COUNT / 2; i++) {
      color.set(Math.random() > 0.4 ? rubyColors[0] : '#FFD700');
      decoCubeMeshRef.current?.setColorAt(i, color);
      color.set(Math.random() > 0.6 ? rubyColors[1] : '#FBC02D');
      decoIcoMeshRef.current?.setColorAt(i, color);
    }

    for (let i = 0; i < BASE_GIFT_COUNT; i++) {
        color.set(brightGiftColors[Math.floor(Math.random() * brightGiftColors.length)]);
        baseGiftMeshRef.current?.setColorAt(i, color);
    }

    for (let i = 0; i < TREE_SNOW_COUNT; i++) {
        color.set(crystalWhite);
        treeSnowMeshRef.current?.setColorAt(i, color);
    }

    for (let i = 0; i < TREE_GIFT_COUNT; i++) {
        color.set(treeGiftColors[Math.floor(Math.random() * treeGiftColors.length)]);
        treeGiftMeshRef.current?.setColorAt(i, color);
    }

    [leafMeshRef, decoCubeMeshRef, decoIcoMeshRef, baseGiftMeshRef, treeSnowMeshRef, treeGiftMeshRef].forEach(ref => {
        if (ref.current) {
            ref.current.instanceColor!.needsUpdate = true;
        }
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const lerpFactor = 0.08;

    if (groupRef.current) {
      const targetRotationY = isSpread ? handRotationY : groupRef.current.rotation.y;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
    }

    for (let i = 0; i < LEAF_COUNT; i++) {
      leafMeshRef.current?.getMatrixAt(i, tempObj.matrix);
      tempObj.matrix.decompose(tempObj.position, tempObj.quaternion, tempObj.scale);
      const targetPos = isSpread ? data.starPositions[i] : data.treePositions[i];
      const targetScale = isSpread ? 0.04 : (0.12 + Math.random() * 0.05);
      tempObj.position.lerp(targetPos, lerpFactor);
      tempObj.scale.setScalar(THREE.MathUtils.lerp(tempObj.scale.x, targetScale, lerpFactor));
      tempObj.updateMatrix();
      leafMeshRef.current?.setMatrixAt(i, tempObj.matrix);
    }

    for (let i = 0; i < TREE_SNOW_COUNT; i++) {
        treeSnowMeshRef.current?.getMatrixAt(i, tempObj.matrix);
        tempObj.matrix.decompose(tempObj.position, tempObj.quaternion, tempObj.scale);
        const targetPos = isSpread ? data.starPositions[i % 500] : data.treeSnowPositions[i];
        const targetScale = isSpread ? 0 : 0.4 + Math.sin(time + i) * 0.1;
        tempObj.position.lerp(targetPos, lerpFactor);
        tempObj.scale.setScalar(THREE.MathUtils.lerp(tempObj.scale.x, targetScale, lerpFactor));
        // Rotating the star pine needles
        tempObj.rotation.set(time * 0.5, time * 0.8 + i, i);
        tempObj.updateMatrix();
        treeSnowMeshRef.current?.setMatrixAt(i, tempObj.matrix);
    }

    for (let i = 0; i < TREE_GIFT_COUNT; i++) {
        treeGiftMeshRef.current?.getMatrixAt(i, tempObj.matrix);
        tempObj.matrix.decompose(tempObj.position, tempObj.quaternion, tempObj.scale);
        const targetPos = isSpread ? data.starPositions[(i+200) % 500] : data.treeGiftPositions[i];
        const targetScale = isSpread ? 0 : 0.22;
        tempObj.position.lerp(targetPos, lerpFactor);
        tempObj.scale.setScalar(THREE.MathUtils.lerp(tempObj.scale.x, targetScale, lerpFactor));
        if (!isSpread) tempObj.rotation.set(0, Math.sin(time + i), 0);
        tempObj.updateMatrix();
        treeGiftMeshRef.current?.setMatrixAt(i, tempObj.matrix);
    }

    for (let i = 0; i < RIBBON_COUNT; i++) {
        ribbonMeshRef.current?.getMatrixAt(i, tempObj.matrix);
        tempObj.matrix.decompose(tempObj.position, tempObj.quaternion, tempObj.scale);
        const targetPos = isSpread ? data.starPositions[i % 500] : data.ribbonPositions[i];
        tempObj.position.lerp(targetPos, lerpFactor);
        if (!isSpread) {
            tempObj.rotation.copy(data.ribbonRotations[i]);
            tempObj.rotation.x += Math.sin(time + i * 0.1) * 0.1;
            tempObj.scale.set(0.6, 0.08, 0.02);
        } else {
            tempObj.scale.setScalar(THREE.MathUtils.lerp(tempObj.scale.x, 0, lerpFactor));
        }
        tempObj.updateMatrix();
        ribbonMeshRef.current?.setMatrixAt(i, tempObj.matrix);
    }

    for (let i = 0; i < BASE_GIFT_COUNT; i++) {
      baseGiftMeshRef.current?.getMatrixAt(i, tempObj.matrix);
      tempObj.matrix.decompose(tempObj.position, tempObj.quaternion, tempObj.scale);
      const targetPos = isSpread ? data.starPositions[i % 50] : data.baseGiftPositions[i];
      const targetScale = isSpread ? 0 : (0.55 + Math.random() * 0.4);
      tempObj.position.lerp(targetPos, lerpFactor);
      tempObj.scale.setScalar(THREE.MathUtils.lerp(tempObj.scale.x, targetScale, lerpFactor));
      if (!isSpread) tempObj.rotation.set(0, Math.sin(time * 0.3 + i), 0);
      tempObj.updateMatrix();
      baseGiftMeshRef.current?.setMatrixAt(i, tempObj.matrix);
    }

    const decoAlpha = isSpread ? 0 : 1;
    [decoCubeMeshRef, decoIcoMeshRef].forEach((ref) => {
      if (ref.current) {
        for (let i = 0; i < ref.current.count; i++) {
            ref.current.getMatrixAt(i, tempObj.matrix);
            tempObj.matrix.decompose(tempObj.position, tempObj.quaternion, tempObj.scale);
            tempObj.scale.setScalar(THREE.MathUtils.lerp(tempObj.scale.x, decoAlpha * 0.18, lerpFactor));
            tempObj.updateMatrix();
            ref.current.setMatrixAt(i, tempObj.matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
      }
    });

    [leafMeshRef, baseGiftMeshRef, ribbonMeshRef, treeSnowMeshRef, treeGiftMeshRef].forEach(ref => {
        if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={leafMeshRef} args={[null as any, null as any, LEAF_COUNT]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial metalness={0.7} roughness={0.4} />
      </instancedMesh>
      
      {/* Decorative White Snowflakes on tree - Now Star-shaped Pine Needles */}
      <instancedMesh ref={treeSnowMeshRef} args={[pineStarGeometry, null as any, TREE_SNOW_COUNT]}>
        <meshPhysicalMaterial 
          color="#FFFFFF" 
          metalness={0.9} 
          roughness={0.05} 
          emissive="#FFFFFF" 
          emissiveIntensity={1.2} 
          clearcoat={1} 
        />
      </instancedMesh>

      <instancedMesh ref={treeGiftMeshRef} args={[null as any, null as any, TREE_GIFT_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.5} roughness={0.2} />
      </instancedMesh>
      <instancedMesh ref={decoCubeMeshRef} args={[null as any, null as any, DECO_COUNT / 2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial metalness={1} roughness={0.05} clearcoat={1} />
      </instancedMesh>
      <instancedMesh ref={decoIcoMeshRef} args={[null as any, null as any, DECO_COUNT / 2]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial metalness={1} roughness={0.05} clearcoat={1} />
      </instancedMesh>
      <instancedMesh ref={ribbonMeshRef} args={[null as any, null as any, RIBBON_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#D32F2F" metalness={0.6} roughness={0.3} emissive="#800000" emissiveIntensity={0.5} />
      </instancedMesh>
      <instancedMesh ref={baseGiftMeshRef} args={[null as any, null as any, BASE_GIFT_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.8} roughness={0.1} />
      </instancedMesh>
      {!isSpread && (
        <mesh position={[0, -6.6, 0]}>
          <cylinderGeometry args={[0.3, 0.5, 1.2, 12]} />
          <meshStandardMaterial color="#1a120a" metalness={0.9} roughness={0.1} />
        </mesh>
      )}
    </group>
  );
};
