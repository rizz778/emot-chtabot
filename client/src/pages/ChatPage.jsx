import React, { useState, useEffect } from "react";
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
import { DollarOutlined, PhoneOutlined } from "@ant-design/icons";
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

const ChatPage = () => {
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

  // Call form states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (transcript) {
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    }
  }, [transcript]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserDetails();
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeSession) {
      fetchMessages();
    }
  }, [activeSession]);
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/api/profile", {
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
        "http://localhost:4000/api/auth/details",
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
        "http://localhost:4000/api/chat/sessions",
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
          "http://localhost:4000/api/chat/sessions",
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
        `http://localhost:4000/api/chat/sessions/${activeSession}`,
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
        "http://localhost:4000/api/chat/sessions",
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
            "http://localhost:5000/init-conversation",
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
            };

            // Add to UI
            setMessages([botGreeting]);
            setAudioUrl(greetingData.audio_url);

            // Save to backend
            await axios.post(
              `http://localhost:4000/api/chat/sessions/${sessionId}/messages`,
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
            "http://localhost:5000/init-conversation",
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
              `http://localhost:4000/api/chat/sessions/${sessionId}/messages`,
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
      emotion: detectedEmotion||"nuetral",
      text: trimmedInput,
      timestamp: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);
   

    try {
      const lastFiveMessages = messages.slice(-3);

      const aiResponse = await fetch("http://localhost:5000/chat", {
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
        `http://localhost:4000/api/chat/sessions/${activeSession}/messages`,
        userMessage,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      axios.post(
        `http://localhost:4000/api/chat/sessions/${activeSession}/messages`,
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
      const response = await axios.post("http://localhost:5000/make_call", {
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

  const handleCapture = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/capture");
      const data = await response.json();

      console.log(data.emotion);
      return data.emotion;
    } catch (error) {
      console.error("Error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
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
          hoverable="true"
        >
          {!collapsed && <span>New Chat</span>}
        </Button>

        {/* Call button */}
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
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask what you want..."
            />
            <Button
              icon={<AudioOutlined />}
              onClick={() => {
                listening
                  ? SpeechRecognition.stopListening()
                  : SpeechRecognition.startListening();
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
  );
};

export default ChatPage;
