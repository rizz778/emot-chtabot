import React, { useState, useEffect } from "react";
import { Collapse, Input, Button, Row, Col, Typography, Space} from "antd";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import "./BreathingExercise.css"; // Optional for custom styling

const { Panel } = Collapse;
const { Title, Text } = Typography;

const exercises = [
  {
    name: "4-7-8 Breathing",
    description: "Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.",
    inhale: 4,
    hold: 7,
    exhale: 8,
  },
  {
    name: "Box Breathing",
    description: "Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds.",
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfterExhale: 4,
  },
  {
    name: "Deep Breathing",
    description: "Inhale for 5 seconds, exhale for 5 seconds.",
    inhale: 5,
    exhale: 5,
  },
];

const BreathingExercise = () => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [inhaleDuration, setInhaleDuration] = useState(4);
  const [exhaleDuration, setExhaleDuration] = useState(7);
  const [holdDuration, setHoldDuration] = useState(8);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState("inhale");
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Function to speak text using the Web Speech API
  const speakInstruction = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1; // Speed of speech
      utterance.pitch = 1; // Pitch of speech
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Web Speech API is not supported in this browser.");
    }
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setInhaleDuration(exercise.inhale);
    setExhaleDuration(exercise.exhale);
    setHoldDuration(exercise.hold || 0);
  };

  const startExercise = () => {
    setIsRunning(true);
    setCurrentStep("inhale");
    setSecondsRemaining(inhaleDuration);
    speakInstruction("Inhale"); // Speak the instruction
  };

  const stopExercise = () => {
    setIsRunning(false);
    setSecondsRemaining(0);
    setCurrentStep("inhale");
    speakInstruction("Exercise stopped."); // Speak the instruction
  };

  const handleTimerEnd = () => {
    if (currentStep === "inhale") {
      setCurrentStep("hold");
      setSecondsRemaining(holdDuration);
      speakInstruction("Hold your breath"); // Speak the instruction
    } else if (currentStep === "hold") {
      setCurrentStep("exhale");
      setSecondsRemaining(exhaleDuration);
      speakInstruction("Exhale"); // Speak the instruction
    } else if (currentStep === "exhale") {
      setCurrentStep("inhale");
      setSecondsRemaining(inhaleDuration);
      speakInstruction("Inhale"); // Speak the instruction
    }
  };

  useEffect(() => {
    if (isRunning && secondsRemaining > 0) {
      const timer = setTimeout(() => {
        setSecondsRemaining(secondsRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isRunning && secondsRemaining === 0) {
      handleTimerEnd();
    }
  }, [isRunning, secondsRemaining]);

  return (
    <div
      className="breathing-exercises-page"
      style={{
        padding: "24px",
        background: "linear-gradient(12deg,rgb(140, 231, 252) 0%,rgb(255, 149, 204) 100%)",
        minHeight: "100vh",
      }}
    >
      <Title level={2} style={{ textAlign: "center", marginBottom: "24px", color: "#ffffff" }}>
        Breathing Exercises
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Collapse
            bordered={false}
            defaultActiveKey={["1"]}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            style={{ background: "transparent" }}
          >
            <Panel
              header="Select Exercise"
              key="1"
              style={{ background: "rgba(212, 197, 255, 0.8)", borderRadius: "8px", width:"400px", marginRight:"800px" }}
            >
              {exercises.map((exercise, index) => (
                <div key={index} style={{ marginBottom: "16px" }}>
                  <h3>{exercise.name}</h3>
                  <p>{exercise.description}</p>
                  <Button onClick={() => handleExerciseSelect(exercise)}>Select</Button>
                </div>
              ))}
              {selectedExercise && (
                <div>
                  <h3>Customize Durations</h3>
                  <label>Inhale (seconds): </label>
                  <Input
                    type="number"
                    value={inhaleDuration}
                    onChange={(e) => setInhaleDuration(parseInt(e.target.value))}
                  />
                  <label>Exhale (seconds): </label>
                  <Input
                    type="number"
                    value={exhaleDuration}
                    onChange={(e) => setExhaleDuration(parseInt(e.target.value))}
                  />
                  <label>Hold (seconds): </label>
                  <Input
                    type="number"
                    value={holdDuration}
                    onChange={(e) => setHoldDuration(parseInt(e.target.value))}
                  />
                </div>
              )}
              <Space>
                <Button type="primary" onClick={startExercise} disabled={!selectedExercise}>
                  Start Exercise
                </Button>
                <Button icon={<PauseOutlined />} onClick={stopExercise} disabled={!isRunning}>
                  Stop Exercise
                </Button>
              </Space>
            </Panel>
          </Collapse>
        </Col>
        <Col xs={24} md={16}>
          <div
            className="exercise-instructions"
            style={{ background: "rgba(255, 255, 255, 0.8)", padding: "16px", borderRadius: "8px" }}
          >
            {selectedExercise && (
              <>
                <Title level={3}>{selectedExercise.name}</Title>
                <Text>{selectedExercise.description}</Text>
                <div className="circular-timer">
                  <div className="timer-text">{secondsRemaining}</div>
                </div>
                <Text strong>Current Step: {currentStep}</Text>
              </>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BreathingExercise;