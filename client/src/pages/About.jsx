import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import sakura from "../assets/sakura.mp3";
import HomeInfo from "../components/HomeInfo";
import Loader from "../components/Loader";
import { soundoff, soundon } from "../assets/icons";
// import Butterfly from "../models/Butterfly.jsx";
import DarkForest from "../models/DarkForest.jsx";
import EnchantedForest from "../models/EnchantedForest";
import Forest from "../models/Forest";
import Testimonials from "../components/Testimonials.jsx";
import pinkBg from "../assets/images/pink-bg.jpg";
import Benefits from "../components/Benefits.jsx";
import Faq from "../components/Faq.jsx";
import BuyToken from "./BuyToken.jsx";
import Footer from "../components/Footer.jsx";
import "./About.css"
import AboutInfo from "../components/Aboutinfo.jsx"
const About = () => {
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
    <section className="w-full h-screen relative bg-night-sky">
       
      <Canvas
        className={`w-full h-screen bg-transparent ${
          isRotating ? "cursor-grabbing" : "cursor-grab"
        }`}
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
      <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center'>
        <AboutInfo />
      </div>
      <Footer />
    </section>
  );
};

export default About;
