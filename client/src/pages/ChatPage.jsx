import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Input,
  Button,
  message as antdMessage,
  Spin,
  notification,
} from "antd";
import { motion } from "framer-motion";
import { DollarOutlined } from "@ant-design/icons";
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
import "./ChatPage.css"; // Add custom styles if needed
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null); // State to store audio URL
  const [tokenBalance, setTokenBalance] = useState(0);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const navigate = useNavigate();
  useEffect(() => {
    if (transcript) {
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    }
  }, [transcript]);

  useEffect(() => {
    fetchUserDetails();
    fetchSessions();
  }, []);
  useEffect(() => {
    if (activeSession) {
      fetchMessages(activeSession);
    }
  }, [activeSession]);
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

  const fetchMessages = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:4000/api/chat/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleNewSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:4000/api/chat/sessions",
        { sessionName: `Session ${chatSessions.length + 1}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTokenBalance(response.data.tokens);
      notification.success({
        message: "Tokens Deducted",
        description: "-2 tokens deducted from your account.",
        duration: 2,
      });

      setChatSessions([...chatSessions, response.data]);
      setActiveSession(response.data._id);
      localStorage.setItem("activeSession", response.data._id);
      setMessages([]);
    } catch (error) {
      if (error.response.status === 403) {
        navigate("/token");
      }
      console.error("Failed to create session:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: input },
    ]);

    setInput(""); // Clear input field immediately after sending
    setLoading(true); // Show "Model is typing..."

    try {
      // Retrieve last 5 messages from the backend
      const chatHistoryResponse = await axios.get(
        `http://localhost:4000/api/chat/sessions/${activeSession}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const lastFiveMessages = chatHistoryResponse.data.messages.slice(-5); // Get the last 5 messages

      // Send message to AI model, including session ID and conversation history
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          session_id: activeSession, // Include session ID
          conversation_history: lastFiveMessages, // Include last 5 messages
        }),
      });

      const data = await response.json();

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: data.response },
      ]);

      setAudioUrl(data.audio_url); // Store the audio URL in state
      setLoading(false); // Hide "Model is typing..."

      // Save user message to backend
      await axios.post(
        `http://localhost:4000/api/chat/sessions/${activeSession}/messages`,
        { sender: "user", text: input },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Save bot response to backend
      await axios.post(
        `http://localhost:4000/api/chat/sessions/${activeSession}/messages`,
        { sender: "bot", text: data.response },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Error: Unable to get response" },
      ]);
      setLoading(false); // Hide "Model is typing..."
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
    // Replace line breaks with <br /> and add paragraph spacing
    return text.replace(/(\r\n|\n|\r)/g, "<br />");
  };

  return (
    <Layout>
      <Sider style={{ padding: "16px", background: "#001529", color: "#fff" }}>
        {/* Sidebar with tokens and sessions */}
      </Sider>
      <Layout>
        <Header className="chat-header">AI Virtual Counselor</Header>
        <Content className="chat-content">
          <motion.div className="chat-messages">
            {messages.map((msg, index) => (
              <motion.div key={index} className={`chat-message ${msg.sender}`}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatText(msg.text), // Format text before displaying
                  }}
                />
              </motion.div>
            ))}
            {loading && (
              <motion.div className="chat-message bot">
                <Spin size="small" />
                <span>Model is typing...</span>
              </motion.div>
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
    </Layout>
  );
};

export default ChatPage;
