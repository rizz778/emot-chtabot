import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
import { useFrame } from '@react-three/fiber';

const Forest = (props) => {
  const { nodes, materials } = useGLTF('/free_-_skybox_fairy_forest_day.glb');
  const meshRef = useRef();

  // Add drag functionality
  const bind = useDrag(({ offset: [x, y] }) => {
    console.log('Drag offset:', x, y); // Debugging: Log the drag offset
    meshRef.current.position.x = x / 100; // Adjust sensitivity
    meshRef.current.position.y = -y / 100; // Adjust sensitivity
  });

  // Add rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1; // Adjust rotation speed
    }
  });

  return (
    <group ref={meshRef} {...props} dispose={null} {...bind()}>
      <group scale={[100, 100, 100]}> {/* Adjust scale as needed */}
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere__0.geometry}
          material={materials['Scene_-_Root']}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]} 
        />
      </group>
    </group>
  );
};

useGLTF.preload('/free_-_skybox_fairy_forest_day.glb');

export default Forest;