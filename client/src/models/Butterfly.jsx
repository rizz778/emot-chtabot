import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

const Butterfly = (props) => {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF('/fantasy_butterfly_animation.glb');
  const { actions } = useAnimations(animations, group);

  // Debugging: Log nodes, materials, and animations
  useEffect(() => {
    console.log('Nodes:', nodes);
    console.log('Materials:', materials);
    console.log('Animations:', animations);
  }, [nodes, materials, animations]);

  // Play the animation
  useEffect(() => {
    if (actions && actions.Animation) {
      actions.Animation.play();
    }
  }, [actions]);

  return (
    <mesh>
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group
            name="a5a881a2de3b4f13be178d39cbe3ab46fbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}
          >
            <group name="Object_2">
              <group name="RootNode">
                <group name="Object_4">
                  <primitive object={nodes._rootJoint} />
                  <skinnedMesh
                    name="Object_7"
                    geometry={nodes.Object_7.geometry}
                    material={materials.butterflyMAT}
                    skeleton={nodes.Object_7.skeleton}
                  />
                  <group name="Object_6" />
                  <group name="butterfly" />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
    </mesh>
  );
};

useGLTF.preload('/fantasy_butterfly_animation.glb');

export default Butterfly;