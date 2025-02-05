import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';

import DarkForestScene from '../assets/3d/forest_lighting_wip.glb';

const DarkForest = (props) => {
  const { nodes, materials } = useGLTF(DarkForestScene);
  const meshRef = useRef();

  // Add drag functionality

  // Add rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5; // Adjust rotation speed
    }
  });

  return (
    <group ref={meshRef} {...props} dispose={null} >
      <group scale= {0.019}>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Base_Mesh_Base_Material_0.geometry}
            material={materials.Base_Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Base_Mesh_Base_Material_0_1.geometry}
            material={materials.Base_Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Base_Mesh_Base_Material_0_2.geometry}
            material={materials.Base_Material}
          />
        </group>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.VFX_Mesh_VFX_Material_0.geometry}
          material={materials.VFX_Material}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
      </group>
    </group>
  );
};

export default DarkForest;