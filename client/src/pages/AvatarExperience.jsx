import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "../components/Experience.jsx";
import { UI } from "../components/UI.jsx";
import './AvatarExperience.css'
function AvatarExperience() {
  return (
    <>
      <Loader />
      <Leva hidden />
      <UI />
      <Canvas 
  shadows 
  camera={{ position: [0, 0, 1], fov: 28 }} 
  style={{ width: '100vw', height: '100vh' }} // Full-screen canvas
>
  <Experience />
</Canvas>

    </>
  );
}

export default AvatarExperience;
