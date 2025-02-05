import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import animationData1 from "../assets/gif/Animation - 1738677605207.json"; // Import Lottie animation as JSON
import animationData2 from "../assets/gif/Animation - 1738680461708.json";
import animationData3 from "../assets/gif/file4.json";
// import animationData4 from "../assets/gif/Animation - 1738680562262.json";

const Loader = () => {
  const gifs = [animationData1, animationData2, animationData3]; // Array of imported Lottie JSON data

  const [currentGif, setCurrentGif] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGif((prev) => (prev + 1) % gifs.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval); // Cleanup
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true, // Loop animation
    animationData: gifs[currentGif], // Use the current Lottie animation data
  };

  return (
    <div className="loader-container">
      <Lottie options={defaultOptions} height={400} width={400} />
    </div>
  );
};

export default Loader;
