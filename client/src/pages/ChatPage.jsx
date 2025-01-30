import React, { useEffect, useState } from "react";
import { Layout, Menu, Input, Button } from "antd";
import { motion } from "framer-motion";
import { MessageOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import "./ChatPage.css";
import axios from "axios";

const { Header, Sider, Content } = Layout;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatSessions, setChatSessions] = useState(["Session 1"]);
  const [activeSession, setActiveSession] = useState("Session 1");

  
  useEffect(() => {
    fetchSessions();
  }, []);

  //Fetch all chat sessions


  const fetchSessions=async()=>{
    try {
      const token=localStorage.getItem('token');
      console.log("Token being sent:", token); 
      const response= await axios.get('http://localhost:4000/api/chat/sessions',{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      setChatSessions(response.data);
      if(response.data.length>0){
        setActiveSession(response.data[0]);
        fetchMessages(response.data[0]);
      }
    } catch (error) {
      console.log('Fetch sessions error:',error);
    }
  };
  const handleSessionClick = (sessionId) => {
    setActiveSession(sessionId);
    fetchMessages(sessionId);
};
  const fetchMessages=async(sessionId)=>{
    try {
      const token=localStorage.getItem('token');
      const response= await axios.get(`http://localhost:4000/api/chat/sessions/${sessionId}`,{
        headers:{Authorization:`Bearer ${token}`},
      });
      setMessages(response.data.messages);  
    } catch (error) {
      console.log('Fetch messages error:',error);
    }
  }

  const handleNewSession = async () => {
    try {
      const token=localStorage.getItem('token');
      const newSession = `Session ${chatSessions.length + 1}`;
      const response= await axios.post('http://localhost:4000/api/chat/sessions',{sessionName:newSession},{
        headers:{Authorization:`Bearer ${token}`}});
      setChatSessions([...chatSessions, newSession]);
      setActiveSession(response.data._id);
      setMessages([]);
    } catch (error) {
      console.error('New session error:',error);
    }
  }
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };

    setMessages((prev) => [...prev, userMessage]);

    try {
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: input }),
        });

        if (!response.ok) throw new Error("Failed to fetch response");

        const data = await response.json();
        const botMessage = { sender: "bot", text: data.response };

        setMessages((prev) => [...prev, botMessage]);

        // Store messages in MongoDB
        await axios.post(`http://localhost:4000/api/chat/sessions/${activeSession}/messages`, 
            { sender: "user", text: input },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        await axios.post(`http://localhost:4000/api/chat/sessions/${activeSession}/messages`, 
            { sender: "bot", text: data.response },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

    } catch (error) {
        console.error("Error fetching bot response:", error);
        setMessages((prev) => [...prev, { sender: "bot", text: "Error: Unable to get response" }]);
    }

    setInput(""); // Clear input field
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
          onClick={({ key }) => handleSessionClick(key)}
          items={chatSessions.map((session) => ({
            key: session._id,
            icon: <MessageOutlined />,
            label: session.sessionName,
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
      <Layout style={{ flex: 1 }}>
        <Header className="chat-header">AI Virtual Counselor</Header>
        <Content className="chat-content">
          {/* Chat Messages Container */}
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

          {/* Input Area */}
          <div className="chat-input-container">
            <Input
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={handleSendMessage}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default ChatPage;
