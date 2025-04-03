import { useState } from "react";
import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "../components/Experience.jsx";
import { UI } from "../components/UI.jsx";
import "./AvatarExperience.css";

function AvatarExperience() {
  const [loading, setLoading] = useState(false);

  //------------------------------
  const handleCapture = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Detected Emotion:", data.emotion);
    } catch (error) {
      console.error("Error capturing emotion:", error);
    }
    setLoading(false);
  };
//---------------------------------------

  return (
    <>
      <Loader />
      <Leva hidden />
      <UI />
      <Canvas
        shadows
        camera={{ position: [0, 0, 1], fov: 28 }}
        style={{ width: "100vw", height: "100vh" }}
      >
        <Experience />
      </Canvas>

      {/* Button container positioned at the bottom-center */}
      <div className="capture-button-container">
        <button onClick={handleCapture} disabled={loading}>
          {loading ? "Detecting..." : "Capture Emotion"}
        </button>
      </div>
    </>
  );
}

export default AvatarExperience;
