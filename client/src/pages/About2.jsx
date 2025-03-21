import React from 'react';
import { useState } from 'react';
import { Canvas } from "@react-three/fiber";
import DarkForest from "../models/DarkForest.jsx";
import Footer from "../components/Footer.jsx";


const AboutUsPage = () => {
    const [currentStage, setCurrentStage] = useState(1);
      const [isRotating, setIsRotating] = useState(false);
      const [isPlayingMusic, setIsPlayingMusic] = useState(false);
    
      const adjustBiplaneForScreenSize = () => {
        let screenScale, screenPosition;
    
        if (window.innerWidth < 768) {
          screenScale = [1.5, 1.5, 1.5];
          screenPosition = [0, -1.5, 0];
        } else {
          screenScale = [3, 3, 3];
          screenPosition = [0, -4, -4];
        }
    
        return [screenScale, screenPosition];
      };
    
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
    
      const [biplaneScale, biplanePosition] = adjustBiplaneForScreenSize();
      const [islandScale, islandPosition] = adjustIslandForScreenSize();
  return (
    <>
    
    <div className="max-w-4xl mx-auto px-4 py-12 gap-14">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">About Us</h1>
        <div className="w-20 h-1 bg-blue-500 mx-auto mb-8"></div>
      </div>
        <div className= "flex flex-col md:flex-row items-center">
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Story</h2>
        <p className="text-gray-700 mb-4">
          Sentio was founded in 2025 by a team of hackathon enthusiasts and technology experts who recognized the need for more accessible mental healthcare. We saw how technology could bridge gaps in traditional mental health services and set out to create a platform that combines clinical expertise with innovative digital solutions.
        </p>
        <p className="text-gray-700">
          Today, we're proud to serve users worldwide, providing support through our comprehensive mental health platform that makes quality care available to everyone, anywhere, anytime.
        </p>
      </div>
      <Canvas
            className={`w-1/2 h-[1000px] bg-transparent ${
              isRotating ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ height: "50vh", width : "100vw"}}
            camera={{ near: 0.1, far: 1000 }}
          >
            <DarkForest
              isRotating={isRotating}
              setIsRotating={setIsRotating}
              setCurrentStage={setCurrentStage}
              position={islandPosition}
              rotation={[0.1, 4.7077, 0]}
              scale={islandScale}
            />
          </Canvas></div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Mission</h2>
        <p className="text-gray-700">
          At Sentio, we believe mental wellness should be accessible to everyone. Our mission is to break down barriers to mental healthcare by leveraging technology to provide personalized, effective, and affordable support when you need it most.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">What We Offer</h2>
        <p className="text-gray-700 mb-6">
          Our platform combines several innovative features to support your mental health journey:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>AI-powered chat support</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Interactive 3D avatar companion</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Mental health resources</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Crisis helplines</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Self-assessment tools</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Blockchain-secured appointment booking</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Community forum</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Relaxation and mindfulness tools</span>
          </li>
        </ul>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Plans</h2>
        <p className="text-gray-700 mb-4">
          We offer flexible options to meet different needs:
        </p>
        <ul className="space-y-3 text-gray-700">
          <li className="font-medium">Basic (Free): Includes 5 free sessions and access to essential resources</li>
          <li className="font-medium">Pro: Unlocks unlimited sessions and premium features</li>
          <li className="font-medium">Enterprise: Custom solutions for organizations and healthcare providers</li>
        </ul>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Team</h2>
        <p className="text-gray-700">
          Sentio brings together experts from various fields including software development, AI research, and user experience design. Our diverse team is united by a shared commitment to improving mental health outcomes through technology and compassion.
        </p>
      </div>

      <div className="text-center mt-10">
        <p className="text-gray-700 italic">
          "We envision a world where everyone has the tools and support they need for their mental wellbeing."
        </p>
      </div>
    </div></>
  );
};

export default AboutUsPage;