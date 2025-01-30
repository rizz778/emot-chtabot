import React, { useState } from "react";
import { Layout, Menu, Input, Button } from "antd";
import { motion } from "framer-motion";
import {
  MessageOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import "./ChatPage.css";

const { Header, Sider, Content } = Layout;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatSessions, setChatSessions] = useState(["Session 1"]);
  const [activeSession, setActiveSession] = useState("Session 1");

  const handleSendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "This is a bot response!", sender: "bot" },
        ]);
      }, 1000);
    }
  };

  const handleNewSession = () => {
    const newSession = `Session ${chatSessions.length + 1}`;
    setChatSessions([...chatSessions, newSession]);
    setActiveSession(newSession);
    setMessages([]);
  };

  return (
    <Layout className="chat-layout">
  {/* Sidebar (Chats List) */}
  <Sider width={250} className="chat-sidebar">
    <div className="sidebar-header">Chats</div>
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[activeSession]}
      onClick={({ key }) => setActiveSession(key)}
      items={chatSessions.map((session) => ({
        key: session,
        icon: <MessageOutlined />,
        label: session,
      }))}
    />
    <Button
      type="primary"
      icon={<PlusOutlined />}
      className="new-session-button"
      onClick={handleNewSession}
    >
      New Chat
    </Button>
  </Sider>

  {/* Main Chat Section */}
  <Layout style={{ flex: 1 }}> {/* Ensure it takes up the remaining space */}
    <Header className="chat-header">AI Virtual Counselor</Header>
    <Content className="chat-content">
      <motion.div className="chat-messages">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`chat-message ${msg.sender}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {msg.text}
          </motion.div>
        ))}
      </motion.div>
      <div className="chat-input-container">
        <Input
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSendMessage}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} />
      </div>
    </Content>
  </Layout>
</Layout>

  );
};

export default ChatPage;
