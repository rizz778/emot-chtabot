import React, { useState, useEffect } from "react";
import { Layout, Menu, Input, Button, message as antdMessage } from "antd";
import { motion } from "framer-motion";
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

const { Header, Sider, Content } = Layout;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const { transcript,listening ,resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    }
  }, [transcript]);

  useEffect(() => {
    fetchSessions();
  }, []);

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
      if (response.data.length > 0) {
        setActiveSession(response.data[0]._id);
        fetchMessages(response.data[0]._id);
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
      setChatSessions([...chatSessions, response.data]);
      setActiveSession(response.data._id);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prevMessages) => [...prevMessages, { sender: "user", text: input }]);

    try {
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: input }),
        });

        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: data.response }]);
        await axios.post(`http://localhost:4000/api/chat/sessions/${activeSession}/messages`, 
          { sender: "user", text: input },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
  
      await axios.post(`http://localhost:4000/api/chat/sessions/${activeSession}/messages`, 
          { sender: "bot", text: data.response },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

        // Play received audio response
        if (data.audio_url) {
            const audio = new Audio(data.audio_url);
            audio.play();
        }
    } catch (error) {
        console.error("Error fetching bot response:", error);
        setMessages([...messages, { sender: "bot", text: "Error: Unable to get response" }]);
    }

    setInput("");  // Clear input field
};


  return (
    <Layout>
      <Sider width={250} className="chat-sidebar">
        <div className="sidebar-header">Chats</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeSession]}
          onClick={({ key }) => {
            setActiveSession(key);
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
        >
          New Chat
        </Button>
      </Sider>
      <Layout>
        <Header className="chat-header">AI Virtual Counselor</Header>
        <Content className="chat-content">
          <motion.div className="chat-messages">
            {messages.map((msg, index) => (
              <motion.div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </motion.div>
            ))}
          </motion.div>
          <div className="chat-input-container">
            <Input value={input} onChange={(e) => setInput(e.target.value)} />
            <Button
              icon={<AudioOutlined />}
              onClick={() => {
                listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening();
              }}
            />
            <Button icon={<SendOutlined />} onClick={handleSendMessage} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChatPage;
