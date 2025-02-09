import React, { useState } from 'react';
import { Tabs, Card, Typography, Row, Col, Button } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepBackwardOutlined, StepForwardOutlined, CloseOutlined } from '@ant-design/icons';
import './RelaxationToolsPage.css'; // Custom CSS for styling
import BreathingExercise from '../components/BreathingExercise.jsx'
import GuidedMeditation from '../components/GuidedMeditation.jsx'

const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Relaxation sounds with images
const sounds = [
  { id: 1, name: "Rainfall", src: "/sounds/rain.mp3", image: "/images/rainfall.jpg" },
  { id: 2, name: "Ocean Waves", src: "/sounds/ocean.mp3", image: "/images/ocean.jpg" },
  { id: 3, name: "Piano", src: "/sounds/piano.mp3", image: "/images/piano.jpg" },
  { id: 4, name: "Forest Birds", src: "/sounds/forest.mp3", image: "/images/forest.jpg" },
  { id: 5, name: "Campfire", src: "/sounds/campfire.mp3", image: "/images/campfire.jpg" },
  { id: 6, name: "Wind Chimes", src: "/sounds/windchimes.mp3", image: "/images/windchimes.jpg" },
  { id: 7, name: "Waterfall", src: "/sounds/waterfall.mp3", image: "/images/waterfall.jpg" },
  { id: 8, name: "Soft Guitar", src: "/sounds/guitar.mp3", image: "/images/guitar.jpg" }
];

const RelaxationToolsPage = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);

  const playSound = (index) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(sounds[index].src);
    newAudio.loop = true;
    newAudio.play();
    setAudio(newAudio);
    setCurrentTrack(sounds[index]);
    setIsPlaying(true);
    setTrackIndex(index);
    setShowPlayer(true); // Show music player
  };

  const togglePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Play next track
  const playNext = () => {
    const nextIndex = (trackIndex + 1) % sounds.length;
    playSound(nextIndex);
  };

  const playPrev = () => {
    const prevIndex = (trackIndex - 1 + sounds.length) % sounds.length;
    playSound(prevIndex);
  };

  // Stop and hide music player
  const closePlayer = () => {
    if (audio) {
      audio.pause();
    }
    setAudio(null);
    setCurrentTrack(null);
    setIsPlaying(false);
    setShowPlayer(false); // Hide player
  };

  return (
    <div className="relaxation-page">
      <Title level={2} className="relaxation-title">Relaxation Tools</Title>

      <Tabs defaultActiveKey="1" centered>
        {/* Guided Meditation */}
       

        {/* Breathing Exercises */}
       
        {/* Relaxation Music */}
        <TabPane tab="Relaxation Music" key="1">
          <Title level={4} className="relaxation-title">Relaxation Music & Nature Sounds</Title>
          <Row gutter={[16, 16]} justify="center">
            {sounds.map((sound, index) => (
              <Col key={sound.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  className="music-card"
                  cover={<img alt={sound.name} src={sound.image} className="music-image" />}
                >
                  <Title level={5}>{sound.name}</Title>
                  <Button type="primary" onClick={() => playSound(index)}>
                    Play
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Music Player */}
          {showPlayer && currentTrack && (
            <div className="music-player">
              <img src={currentTrack.image} alt="Playing" className="player-image" />
              <div className="player-info">
                <Title level={5} className="player-title">{currentTrack.name}</Title>
                <div className="player-controls">
                  <StepBackwardOutlined onClick={playPrev} className="player-icon" />
                  {isPlaying ? (
                    <PauseCircleOutlined onClick={togglePlayPause} className="player-icon" />
                  ) : (
                    <PlayCircleOutlined onClick={togglePlayPause} className="player-icon" />
                  )}
                  <StepForwardOutlined onClick={playNext} className="player-icon" />
                </div>
              </div>
              <CloseOutlined onClick={closePlayer} className="close-icon" />
            </div>
          )}
        </TabPane>
        <TabPane tab="Breathing Exercises" key="2">
          <Card className="relaxation-card">
            <BreathingExercise />
          </Card>
        </TabPane>
        <TabPane tab="Guided Meditation" key="3">
          <Card className="relaxation-card">
            <GuidedMeditation/>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RelaxationToolsPage;
