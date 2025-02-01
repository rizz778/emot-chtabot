import React from 'react';
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import DarkForest from '../models/DarkForest';
import Forest from '../models/Forest';

const Home2 = () => {
    const [currentStage, setCurrentStage] = useState(1);
    const [isRotating, setIsRotating] = useState(false);
    const adjustIslandForScreenSize = () => {
        let screenScale, screenPosition;
    
        if (window.innerWidth < 768) {
          screenScale = [0.9, 0.9, 0.9];
          screenPosition = [0, -6.5, -43.4];
        } else {
          screenScale = [1, 1, 1];
          screenPosition = [0, -6.5, -43.4];
        }
    
        return [screenScale, screenPosition];
      };
      const [islandScale, islandPosition] = adjustIslandForScreenSize();
  return (
    
    <Canvas
        className={`w-full h-screen bg-transparent ${
          isRotating ? "cursor-grabbing" : "cursor-grab"
        }`}
        camera={{ near: 0.1, far: 1000 }}
      >
        
      <Forest
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
            position={islandPosition}
            rotation={[0.1, 4.7077, 0]}
            scale={islandScale}
          />
    </Canvas>
  );
};

export default Home2;