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
    
    // Function to handle PDF download (you'll need to replace with actual PDF path)
    const handleDownloadPDF = () => {
        // Replace '/path-to-your-pdf/sentio-user-guide.pdf' with the actual path to your PDF file
        const pdfUrl = 'Sentio  AI With Empathy (1).pdf';
        
        // Create an anchor element and set properties
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'Sentio-User-Guide.pdf';
        
        // Append to body, click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <>
            <div className="w-full px-4 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-blue-600 mb-4">About Us</h1>
                    <div className="w-20 h-1 bg-blue-500 mx-auto mb-8"></div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-2/3 mb-12 md:pr-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Story</h2>
                        <p className="text-gray-700 mb-4">
                            Sentio was founded in 2025 by a team of hackathon enthusiasts and technology experts who recognized the need for more accessible mental healthcare. We saw how technology could bridge gaps in traditional mental health services and set out to create a platform that combines clinical expertise with innovative digital solutions.
                        </p>
                        <p className="text-gray-700">
                            Today, we're proud to serve users worldwide, providing support through our comprehensive mental health platform that makes quality care available to everyone, anywhere, anytime.
                        </p>
                    </div>
                    
                    <div className="w-full md:w-1/3">
                        <Canvas
                            className={`bg-transparent ${isRotating ? "cursor-grabbing" : "cursor-grab"}`}
                            style={{ height: "50vh", width: "100%" }}
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
                        </Canvas>
                    </div>
                </div>

                <div className="w-full mb-12">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Mission</h2>
                    <p className="text-gray-700">
                        At Sentio, we believe mental wellness should be accessible to everyone. Our mission is to break down barriers to mental healthcare by leveraging technology to provide personalized, effective, and affordable support when you need it most.
                    </p>
                </div>

                <div className="w-full mb-12">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">What We Offer</h2>
                    <p className="text-gray-700 mb-6">
                        Our platform combines several innovative features to support your mental health journey:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-gray-700">
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
                    
                    {/* User Guide Download Section */}
                    <div className="mt-8 p-6 bg-red-50 rounded-lg shadow-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-blue-700 mb-2">Need help getting started?</h3>
                                <p className="text-gray-700">Download our comprehensive user guide to explore all features and get the most out of Sentio.</p>
                            </div>
                            <button 
                                onClick={handleDownloadPDF}
                                className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full transition-colors duration-300 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Download User Guide
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full mb-12">
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

                <div className="w-full mb-12">
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
            </div>
        </>
    );
};

export default AboutUsPage;