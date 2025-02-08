import React, { useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Howl } from "howler";
import { motion, AnimatePresence } from "framer-motion";
import './GuidedMeditation.css'
const GuidedMeditation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState("/meditation-track-1.mp3");
  const [selectedSoundscape, setSelectedSoundscape] = useState(null);
  const [meditationDuration, setMeditationDuration] = useState(300); // 5 minutes
  const [affirmation, setAffirmation] = useState("You are calm and focused.");

  // Soundscapes using Howler.js
  const soundscapes = {
    rain: new Howl({ src: ["/sounds/rain.mp3"], loop: true }),
    ocean: new Howl({ src: ["/sounds/ocean.mp3"], loop: true }),
    forest: new Howl({ src: ["/sounds/forest.mp3"], loop: true }),
  };

  const handleSoundscapeChange = (soundscape) => {
    if (selectedSoundscape) {
      selectedSoundscape.stop();
    }
    setSelectedSoundscape(soundscapes[soundscape]);
    soundscapes[soundscape].play();
  };

  // Stop all soundscapes
  const stopSoundscapes = () => {
    if (selectedSoundscape) {
      selectedSoundscape.stop();
      setSelectedSoundscape(null);
    }
  };

  // Stop meditation
  const stopMeditation = () => {
    setIsPlaying(false);
    stopSoundscapes();
  };

  // Affirmations
  const affirmations = [
    "You are calm and focused.",
    "You are in control of your thoughts.",
    "You are at peace with yourself.",
    "You are grateful for this moment.",
  ];

  const changeAffirmation = () => {
    const randomAffirmation =
      affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(randomAffirmation);
  };

  return (
    <div className="guided-meditation">
      {/* Calming Visuals */}
      <div className="visuals">
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ width: "100%", maxWidth: "400px", borderRadius: "10px" }}
        >
          <source src="/Meditation.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Meditation Audio Tracks */}
      <div className="audio-player">
        <ReactAudioPlayer
          src={selectedTrack}
          autoPlay={false}
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <div className="track-selection">
          <button onClick={() => setSelectedTrack("/meditation-track-1.mp3")}>
            Track 1
          </button>
          <button onClick={() => setSelectedTrack("/meditation-track-2.mp3")}>
            Track 2
          </button>
        </div>
      </div>

      {/* Meditation Timer */}
      <div className="timer">
        <CountdownCircleTimer
          isPlaying={isPlaying}
          duration={meditationDuration}
          colors={[
            ["#ffffff", 0.33],
            ["#8a0000", 0.33],
            ["#8a0000", 0.33],
          ]}
          onComplete={() => {
            alert("Meditation session complete!");
            setIsPlaying(false);
          }}
        >
          {({ remainingTime }) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="timer-text"
            >
              {remainingTime}
            </motion.div>
          )}
        </CountdownCircleTimer>
        <div className="duration-selection">
          <button onClick={() => setMeditationDuration(300)}>5 Min</button>
          <button onClick={() => setMeditationDuration(600)}>10 Min</button>
          <button onClick={() => setMeditationDuration(900)}>15 Min</button>
        </div>
      </div>

      {/* Soundscapes */}
      <div className="soundscapes">
        <h3>Soundscapes</h3>
        <button onClick={() => handleSoundscapeChange("rain")}>Rain</button>
        <button onClick={() => handleSoundscapeChange("ocean")}>Ocean</button>
        <button onClick={() => handleSoundscapeChange("forest")}>Forest</button>
        <button onClick={stopSoundscapes}>Stop Sound</button>
      </div>

      {/* Stop Meditation Button */}
      <div className="stop-meditation">
        <button onClick={stopMeditation}>Stop Meditation</button>
      </div>

      {/* On-Screen Guided Instructions & Affirmations */}
      <div className="affirmations">
        <AnimatePresence mode="wait">
          <motion.div
            key={affirmation}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p>{affirmation}</p>
          </motion.div>
        </AnimatePresence>
        <button onClick={changeAffirmation}>New Affirmation</button>
      </div>
    </div>
  );
};

export default GuidedMeditation;