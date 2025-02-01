import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

const EnchantedForest = (props) =>{
  const { nodes, materials } = useGLTF('/free_-_skybox_enchanted_forest.glb')
  return (
    <group {...props} dispose={null}>
      <group scale={0.01}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere_Material_0.geometry}
          material={materials.Material}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={5500000}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/free_-_skybox_enchanted_forest.glb')

export default EnchantedForest;