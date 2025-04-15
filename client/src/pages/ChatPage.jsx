import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Menu,
  Input,
  Button,
  message as antdMessage,
  Spin,
  notification,
  Modal,
} from "antd";

import { motion } from "framer-motion";
import {
  DollarOutlined,
  PhoneOutlined,
  CameraOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  MessageOutlined,
  PlusOutlined,
  SendOutlined,
  AudioOutlined,
} from "@ant-design/icons";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import "./ChatPage.css";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
const { Header, Sider, Content } = Layout;

// Component for testing camera
const CameraTest = ({ isVisible, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  
  useEffect(() => {
    if (isVisible) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isVisible]);
  
  const startCamera = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      
      setStream(videoStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
    } catch (error) {
      console.error("Camera error:", error);
      notification.error({
        message: "Camera Access Failed",
        description: "Please check your browser settings and allow camera access.",
        duration: 5
      });
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  
  return (
    <Modal
      title="Camera Test"
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <div style={{ textAlign: 'center' }}>
        <p>If you can see yourself, your camera is working properly.</p>
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }}
        />
      </div>
    </Modal>
  );
};

const ChatPage = () => {
  // API URL configuration - replace with environment variables in production
  const API_URL = "https://emot-chtabot.onrender.com";
  const BACKEND_URL ="https://emot-chtabot-1.onrender.com";

  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const videoRef = useRef(null);
  const [isCameraTestVisible, setCameraTestVisible] = useState(false);
  const [webcamMode, setWebcamMode] = useState('client'); // 'client' or 'server'
  const [hasPermission, setHasPermission] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);

  // Call form states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (transcript) {
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    }
  }, [transcript]);

  useEffect(() => {
    // Once speech ends, send message automatically
    if (!listening && transcript.trim()) {
      handleVoiceMessage(transcript.trim());
    }
  }, [listening]);

  useEffect(() => {
    if (listening) {
      setInput(""); // wipe input as soon as listening starts
    }
  }, [listening]);

  useEffect(() => {
    checkWebcamSupport();
    fetchUserProfile();
    fetchUserDetails();
    fetchSessions();
    requestCameraPermission(); // Request camera access when page loads
  }, []);

  useEffect(() => {
    if (activeSession) {
      fetchMessages();
    }
  }, [activeSession]);

  // Check which webcam mode to use (client or server)
  const checkWebcamSupport = async () => {
    try {
      const response = await fetch(`${API_URL}/check-webcam-support`);
      const data = await response.json();
      setWebcamMode(data.mode);
      console.log(`Using ${data.mode}-side webcam capture`);
    } catch (error) {
      console.error("Could not determine webcam mode:", error);
      setWebcamMode('client'); // Default to client-side
    }
  };

  // Request camera permissions
  const requestCameraPermission = async () => {
    try {
      // This will trigger the browser permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      // If we got here, permission was granted
      setHasPermission(true);
      setWebcamStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      } else {
        // We don't need the stream right now - close it
        stream.getTracks().forEach(track => track.stop());
      }
      
      return true;
    } catch (error) {
      console.error("Camera permission error:", error);
      setHasPermission(false);
      
      // Show notification after a short delay to ensure it's seen
      setTimeout(() => {
        notification.warning({
          message: "Camera Access Required",
          description: "Camera access is needed for emotion detection. Click 'Test Camera' to enable access.",
          duration: 10,
          icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />
        });
      }, 1000);
      
      return false;
    }
  };

  // Client-side webcam capture
  const captureFromClientWebcam = async () => {
    if (!hasPermission) {
      const permitted = await requestCameraPermission();
      if (!permitted) {
        console.log("No camera permission, returning neutral");
        return "neutral";
      }
    }
    
    return new Promise(async (resolve, reject) => {
      try {
        // Get a new stream every time to ensure fresh capture
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          
          // Create video element to capture frame
          const video = document.createElement('video');
          video.srcObject = stream;
          
          // Wait for video to be ready
          video.onloadedmetadata = () => {
            video.play();
            
            // Give the camera a moment to adjust
            setTimeout(() => {
              try {
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Draw video frame on canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                
                // Get image data
                const imageData = canvas.toDataURL('image/jpeg', 0.9);
                
                // Release resources
                video.pause();
                video.srcObject = null;
                stream.getTracks().forEach(track => track.stop());
                
                // Send image to server for emotion detection
                fetch(`${API_URL}/webcam-capture`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ image: imageData })
                })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                  }
                  return response.json();
                })
                .then(data => {
                  if (data.error) {
                    console.error("Emotion detection error:", data.error);
                    resolve("neutral");
                  } else {
                    console.log("Detected emotion:", data.emotion);
                    resolve(data.emotion || "neutral");
                  }
                })
                .catch(err => {
                  console.error("Error sending image or parsing response:", err);
                  resolve("neutral");
                });
              } catch (canvasError) {
                console.error("Canvas error:", canvasError);
                resolve("neutral");
              }
            }, 500); // Give camera 500ms to adjust
          };
        } catch (streamError) {
          console.error("Stream error:", streamError);
          resolve("neutral");
        }
      } catch (error) {
        console.error("Client webcam capture error:", error);
        resolve("neutral");
      }
    });
  };
  // Server-side webcam capture
  const captureFromServerWebcam = async () => {
    try {
      const response = await fetch(`${API_URL}/capture`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error("Server capture error:", data.error);
        return "neutral";
      }
      
      console.log("Server detected emotion:", data.emotion);
      return data.emotion;
    } catch (error) {
      console.error("Server webcam error:", error);
      return "neutral";
    }
  };

  // General capture function that decides which method to use
  const handleCapture = async () => {
    setLoading(true);
    try {
      let emotion;
      
      if (webcamMode === 'client') {
        emotion = await captureFromClientWebcam();
      } else {
        emotion = await captureFromServerWebcam();
      }
      
      console.log("Detected emotion:", emotion);
      return emotion || "neutral";
    } catch (error) {
      console.error("Capture error:", error);
      return "neutral";
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceMessage = async (voiceInput) => {
    resetTranscript();
    setInput(""); // Just in case

    if (!voiceInput) return;

    const token = localStorage.getItem("token");
    if (!token || !activeSession) {
      notification.error({
        message: "Authentication Error",
        description: "Please log in again to continue.",
        duration: 3,
      });
      navigate("/login");
      return;
    }

    // ✅ Step 1: Add user's voice message to chat
    const userMessage = {
      sender: "user",
      text: voiceInput,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const detectedEmotion = await handleCapture();

    setLoading(true);
    resetTranscript(); // clear previous speech input

    try {
      const lastFiveMessages = [...messages.slice(-3), userMessage]; // Include the latest message

      const aiResponse = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: voiceInput,
          session_id: activeSession,
          conversation_history: lastFiveMessages,
          user_details: userDetails,
          detected_emotion: detectedEmotion,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI service error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      if (!aiData.response || typeof aiData.distress_score === "undefined") {
        throw new Error("Invalid AI response");
      }

      let botText = aiData.response;
      let jsx = null;

      if (aiData.distress_score >= 7) {
        notification.info({
          message: "Support Resources Available",
          description: "We've provided some resources that might help.",
          duration: 5,
        });

        jsx = (
          <div>
            <p>{botText}</p>
            <p>
              I notice you might be going through a difficult time. Here are
              some resources:
            </p>
            <ul>
              <li>
                <span
                  onClick={() => navigate("/therapists")}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  Talk to a therapist
                </span>
              </li>
              <li>
                <span
                  onClick={() => navigate("/helpline")}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  24/7 Crisis Helpline
                </span>
              </li>
              <li>
                <span
                  onClick={() => navigate("/resources")}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  Self-care resources
                </span>
              </li>
            </ul>
          </div>
        );
      }

      const botMessage = {
        sender: "bot",
        text: botText,
        jsx,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Store both user and bot messages to backend
      await axios.post(
        `${BACKEND_URL}/api/chat/sessions/${activeSession}/messages`,
        userMessage,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        `${BACKEND_URL}/api/chat/sessions/${activeSession}/messages`,
        { ...botMessage, jsx: undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Voice send error:", err);
      notification.error({
        message: "Communication Error",
        description: "Something went wrong with voice input.",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Exclude the profilePicture field from the fetched user details
      const { profilePicture, ...userDetailsWithoutProfilePicture } =
        response.data;

      // Store the user details without the profilePicture field
      setUserDetails(userDetailsWithoutProfilePicture);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/auth/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTokenBalance(response.data.tokens);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/chat/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChatSessions(response.data);
      const savedSession = localStorage.getItem("activeSession");
      const validSession = response.data.find(
        (session) => session._id === savedSession
      );

      if (validSession) {
        setActiveSession(savedSession);
      } else if (response.data.length > 0) {
        setActiveSession(response.data[0]._id);
        localStorage.setItem("activeSession", response.data[0]._id);
      } else {
        const newSession = await axios.post(
          `${BACKEND_URL}/api/chat/sessions`,
          { sessionName: "Session 1" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChatSessions([newSession.data]);
        setActiveSession(newSession.data._id);
        localStorage.setItem("activeSession", newSession.data._id);
      }
    } catch (error) {
      antdMessage.error("Failed to fetch chat sessions.");
      console.error("Failed to fetch sessions:", error);
    }
  };

  const fetchMessages = async () => {
    if (!activeSession) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/chat/sessions/${activeSession}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Sort messages by timestamp before setting state
      const sortedMessages = response.data.messages.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      setMessages(sortedMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  // Modify handleNewSession to call the model service directly
  const handleNewSession = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/chat/sessions`,
        { sessionName: `Session ${chatSessions.length + 1}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const detectedEmotion = await handleCapture(); // Get detected emotion
      // Extract session ID
      const { sessionId, sessionName, tokens } = response.data;

      // Update state with new session information
      setTokenBalance(tokens);
      setChatSessions((prevSessions) => [
        ...prevSessions,
        { _id: sessionId, sessionName },
      ]);
      setActiveSession(sessionId);
      setMessages([]);

      // Persist active session
      localStorage.setItem("activeSession", sessionId);

      // Use the stored userDetails to get initial greeting
      // Call the model service directly from the frontend
      if (userDetails) {
        try {
          // Call the model service directly
          const initialGreetingResponse = await fetch(
            `${API_URL}/init-conversation`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: sessionId,
                user_details: userDetails,
                detected_emotion: detectedEmotion,
              }),
            }
          );

          if (!initialGreetingResponse.ok) {
            throw new Error(
              `Model service responded with status: ${initialGreetingResponse.status}`
            );
          }

          const greetingData = await initialGreetingResponse.json();

          if (greetingData.message) {
            const botGreeting = {
              sender: "bot",
              text: greetingData.message,
              timestamp: new Date().toISOString(),
            };

            // Add to UI
            setMessages([botGreeting]);
            setAudioUrl(greetingData.audio_url);

            // Save to backend
            await axios.post(
              `${BACKEND_URL}/api/chat/sessions/${sessionId}/messages`,
              botGreeting,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch (greetingError) {
          console.error("Failed to get initial greeting:", greetingError);
          // Continue without a greeting if there's an error
        }
      } else {
        try {
          // Call the model service directly
          const initialGreetingResponse = await fetch(
            `${API_URL}/init-conversation`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: sessionId,
                user_details: {},
                detected_emotion: detectedEmotion,
              }),
            }
          );

          if (!initialGreetingResponse.ok) {
            throw new Error(
              `Model service responded with status: ${initialGreetingResponse.status}`
            );
          }

          const greetingData = await initialGreetingResponse.json();

          if (greetingData.message) {
            const botGreeting = {
              sender: "bot",
              text: greetingData.message,
              timestamp: new Date().toISOString(),
            };

            // Add to UI
            setMessages([botGreeting]);
            setAudioUrl(greetingData.audio_url);

            // Save to backend
            await axios.post(
              `${BACKEND_URL}/api/chat/sessions/${sessionId}/messages`,
              botGreeting,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch (greetingError) {
          console.error("Failed to get initial greeting:", greetingError);
          // Continue without a greeting if there's an error
        }
      }
      notification.success({
        message: "Session Created",
        description: "-2 tokens deducted from your account.",
        duration: 2,
      });
    } catch (error) {
      console.error("Failed to create session:", error);

      if (error.response?.status === 403) {
        notification.error({
          message: "Insufficient Tokens",
          description: "Please purchase more tokens to continue.",
          duration: 3,
        });
        navigate("/token");
      } else {
        notification.error({
          message: "Session Creation Failed",
          description: "Could not create a new chat session. Please try again.",
          duration: 3,
        });
      }
    }
  };

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const token = localStorage.getItem("token");
    if (!token || !activeSession) {
      notification.error({
        message: "Authentication Error",
        description: "Please log in again to continue.",
        duration: 3,
      });
      navigate("/login");
      return;
    }

    const detectedEmotion = await handleCapture();
    const userMessage = {
      sender: "user",
      emotion: detectedEmotion || "neutral",
      text: trimmedInput,
      timestamp: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);
   

    try {
      const lastFiveMessages = messages.slice(-3);

      const aiResponse = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedInput,
          session_id: activeSession,
          conversation_history: lastFiveMessages,
          user_details: userDetails,
          detected_emotion: detectedEmotion,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(
          `AI service responded with status: ${aiResponse.status}`
        );
      }

      const aiData = await aiResponse.json();

      if (!aiData.response || typeof aiData.distress_score === "undefined") {
        throw new Error("Invalid response from AI service");
      }

      let botText = aiData.response;
      let displayText = botText;
      let jsx = null;

      if (aiData.distress_score >= 7) {
        notification.info({
          message: "Support Resources Available",
          description:
            "We've provided some resources that might help you right now.",
          duration: 5,
        });

        jsx = (
          <div>
            <p>{botText}</p>
            <p>
              I notice you might be going through a difficult time. Here are
              some resources that could help:
            </p>
            <ul>
              <li>
                <span
                  onClick={() => navigate("/therapists")}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  Speak with one of our expert therapists
                </span>
              </li>
              <li>
                <span
                  onClick={() => navigate("/helpline")}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  24/7 Crisis Helpline Support
                </span>
              </li>
              <li>
                <span
                  onClick={() => navigate("/resources")}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  Self-care resources
                </span>
              </li>
            </ul>
          </div>
        );
      }
      userMessage.distressScore = aiData.distress_score;
      const botMessage = {
        sender: "bot",
        text: botText, // for backend
        jsx: jsx || null, // only if distress score >= 7
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Save both user and bot message
      axios.post(
        `${BACKEND_URL}/api/chat/sessions/${activeSession}/messages`,
        userMessage,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      axios.post(
        `${BACKEND_URL}/api/chat/sessions/${activeSession}/messages`,
        { ...botMessage, jsx: undefined }, // remove JSX before sending to backend
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error in message exchange:", error);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "bot",
          text: "Sorry, I couldn't process your message. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);

      notification.error({
        message: "Communication Error",
        description: "Failed to get or save response. Please try again.",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const formatText = (text) => {
    if (typeof text !== "string") return text; // JSX safe

    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  const handleCallUser = async () => {
    if (!phoneNumber.trim()) {
      antdMessage.error("Please enter a valid phone number.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/make_call`, {
        phone: phoneNumber,
        message: userMessage,
      });

      if (
        response.status === 200 &&
        response.data.message === "Call initiated"
      ) {
        notification.success({
          message: "Call Initiated",
          description: `You will receive a call at ${phoneNumber} shortly.`,
        });
        setIsModalVisible(false);
      } else {
        antdMessage.error("Failed to initiate call. Try again.");
      }
    } catch (error) {
      console.error("Error making call:", error);
      antdMessage.error("Error making call.");
    }
  };
  return (
    <>
    <Layout>
      <Sider
  width={250}
  collapsible
  collapsedWidth={50}
  onCollapse={(collapsed) => setCollapsed(collapsed)}
  style={{
    height: "90vh",
    background: "#f9a8d4",
    color: "#fff",
    overflow: "hidden",
  }}
>
  <div
    style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "bold" }}
  ></div>
  <Menu
    theme="light"
    mode="inline"
    selectedKeys={[activeSession]}
    onClick={({ key }) => {
      setActiveSession(key);
      localStorage.setItem("activeSession", key);
      fetchMessages(key);
    }}
    items={chatSessions.map((session) => ({
      key: session._id,
      icon: <MessageOutlined />,
      label: session.sessionName,
    }))}
  />
  <Button
    type="primary"
    icon={<PlusOutlined />}
    onClick={handleNewSession}
    style={{
      backgroundColor: "#ff4caf",
      borderColor: "#d9363e",
      color: "white",
      fontWeight: "bold",
      borderRadius: "8px",
      padding: "10px 16px",
      height: "2.5rem",
      marginBottom: "10px",
    }}
  >
    {!collapsed && <span>New Chat</span>}
  </Button>

  <Button
    type="primary"
    icon={<PhoneOutlined />}
    onClick={() => setIsModalVisible(true)}
    style={{
      backgroundColor: "#007AFF",
      borderColor: "#0056b3",
      color: "white",
      fontWeight: "bold",
      borderRadius: "8px",
      padding: "10px 16px",
      height: "2.5rem",
      width: "100%",
    }}
  >
    {!collapsed && <span>Make a Call</span>}
  </Button>

  <Button
    type="primary"
    icon={<CameraOutlined />}
    onClick={() => setCameraTestVisible(true)} // Open the CameraTest modal
    style={{
      backgroundColor: "#4CAF50",
      borderColor: "#388E3C",
      color: "white",
      fontWeight: "bold",
      borderRadius: "8px",
      padding: "10px 16px",
      height: "2.5rem",
      width: "100%",
      marginTop: "10px",
    }}
  >
    {!collapsed && <span>Test Camera</span>}
  </Button>

  <Button onClick={handleCapture} disabled={loading}>
    {loading ? "Detecting..." : "Capture Emotion"}
  </Button>
</Sider>
      <Layout>
        <Content className="chat-content">
          <motion.div className="chat-messages">
            {messages.map((msg, index) => (
              <motion.div key={index} className={`chat-message ${msg.sender}`}>
                {msg.jsx ? (
                  msg.jsx // Render JSX directly if present (for distress message)
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatText(msg.text), // Otherwise, format & render text
                    }}
                  />
                )}
              </motion.div>
            ))}
            {loading && (
              <div className="full-screen-loader">
                <Loader />
              </div>
            )}
          </motion.div>

          <div className="chat-input-container">
            {/* <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask what you want..."
            /> */}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask what you want..."
            />

            {/* <Button
              icon={<AudioOutlined />}
              onClick={() => {
                listening
                  ? SpeechRecognition.stopListening()
                  : SpeechRecognition.startListening();
              }}
            /> */}

            <Button
              icon={<AudioOutlined />}
              onClick={() => {
                if (listening) {
                  SpeechRecognition.stopListening();
                } else {
                  resetTranscript(); // reset before new listening
                  SpeechRecognition.startListening({ continuous: false });
                }
              }}
            />

            <Button icon={<SendOutlined />} onClick={handleSendMessage} />
          </div>
          {audioUrl && (
            <Button className="btn" onClick={handlePlayAudio}>
              Audio Response
            </Button>
          )}
        </Content>
      </Layout>
      {/* Call Form Modal */}

      <Modal
        title="Make a Call"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="call" type="primary" onClick={handleCallUser}>
            Call Now
          </Button>,
        ]}
      >
        <p>Enter your phone number and message to receive a call:</p>
        <Input
          type="tel"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Enter message"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          style={{ marginTop: "10px" }}
        />
      </Modal>
    </Layout>
    <CameraTest
    isVisible={isCameraTestVisible}
    onClose={() => setCameraTestVisible(false)} // Close the modal
  />
  </>
  );
};

export default ChatPage;
