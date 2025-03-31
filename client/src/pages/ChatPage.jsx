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
  
  // Create a ref to track if we need to sync with backend
  const pendingSyncRef = useRef(false);
  // Create a queue for messages that need to be saved to backend
  const pendingMessagesRef = useRef([]);

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
    
    // Set up an interval to sync pending messages with backend
    const syncInterval = setInterval(syncPendingMessages, 5000);
    
    // Add event listener for beforeunload to save messages before closing
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up interval and event listener on component unmount
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Sync any pending messages before unmounting
      if (pendingMessagesRef.current.length > 0) {
        syncPendingMessagesSync();
      }
    };
  }, []);

  useEffect(() => {
    if (activeSession) {
      fetchMessages();
    }
  }, [activeSession]);
  
  // Handle before unload event to save messages before closing
  const handleBeforeUnload = (event) => {
    if (pendingMessagesRef.current.length > 0) {
      // Sync messages synchronously before closing
      syncPendingMessagesSync();
      
      // Modern browsers require returnValue to be set
      event.preventDefault();
      event.returnValue = '';
    }
  };
  
  // Synchronous version of syncPendingMessages for beforeunload event
  const syncPendingMessagesSync = () => {
    if (pendingMessagesRef.current.length === 0 || !activeSession) return;
  
    const token = localStorage.getItem("token");
    if (!token) return;
  
    const messagesToSync = [...pendingMessagesRef.current];
    pendingMessagesRef.current = []; // Clear the queue
  
    try {
      // Iterate over each message and send it synchronously
      messagesToSync.forEach((msg) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `https://emot-chtabot-1.onrender.com/api/chat/sessions/${activeSession}/messages`,
          false // Synchronous request
        );
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  
        xhr.send(JSON.stringify(msg));
  
        if (xhr.status !== 200) {
          throw new Error(`Failed to sync message: ${xhr.statusText}`);
        }
      });
  
      console.log("Successfully synced messages before closing");
    } catch (error) {
      console.error("Failed to sync messages before closing", error);
  
      // Put unsynced messages back in the queue
      pendingMessagesRef.current = [...pendingMessagesRef.current, ...messagesToSync];
    }
  };
  
  // Function to sync pending messages with backend
  const syncPendingMessages = async () => {
    if (pendingMessagesRef.current.length === 0 || !activeSession) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;
    
    const messagesToSync = [...pendingMessagesRef.current];
    pendingMessagesRef.current = []; // Clear the queue
    
    try {
      // Use batch endpoint if available
      
        // Otherwise use individual message endpoint
        const savePromises = messagesToSync.map(msg => 
          axios.post(
            `https://emot-chtabot-1.onrender.com/api/chat/sessions/${activeSession}/messages`,
            msg,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );
        
        await Promise.all(savePromises);
      
      console.log("Successfully synced pending messages with backend");
    } catch (error) {
      console.error("Failed to sync messages with backend:", error);
      // Put messages back in the queue to try again later
      pendingMessagesRef.current = [...pendingMessagesRef.current, ...messagesToSync];
      pendingSyncRef.current = true;
    }
  };
  
  // Add function to force sync messages (can be called when needed)
  const forceSyncMessages = () => {
    if (pendingMessagesRef.current.length > 0) {
      return syncPendingMessages();
    }
    return Promise.resolve();
  };
  
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://emot-chtabot-1.onrender.com/api/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Store complete user details for API calls
      setUserDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };
  
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://emot-chtabot-1.onrender.com/api/auth/details",
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
        "https://emot-chtabot-1.onrender.com/api/chat/sessions",
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
          "https://emot-chtabot-1.onrender.com/api/chat/sessions",
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
        `https://emot-chtabot-1.onrender.com/api/chat/sessions/${activeSession}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  // Modify handleNewSession to call the model service directly
  const handleNewSession = async () => {
    // First, force sync any pending messages from the current session
    await forceSyncMessages();
    
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "https://emot-chtabot-1.onrender.com/api/chat/sessions",
        { sessionName: `Session ${chatSessions.length + 1}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

      // Clear pending messages queue when switching sessions
      pendingMessagesRef.current = [];

      // Persist active session
      localStorage.setItem("activeSession", sessionId);
      
      // Use the stored userDetails to get initial greeting
      if (userDetails) {
        try {
          // Call the model service directly
          const initialGreetingResponse = await fetch("https://emot-chtabot.onrender.com/init-conversation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              user_details: userDetails
            }),
          });
          
          if (!initialGreetingResponse.ok) {
            throw new Error(
              `Model service responded with status: ${initialGreetingResponse.status}`
            );
          }
          
          const greetingData = await initialGreetingResponse.json();
          
          if (greetingData.message) {
            const botGreeting = { 
              sender: "bot", 
              text: greetingData.message 
            };
            
            // Add to UI
            setMessages([botGreeting]);
            setAudioUrl(greetingData.audio_url);
            
            // Add to pending messages queue
            pendingMessagesRef.current.push(botGreeting);
            
            // Try to sync this message immediately
            syncPendingMessages();
          }
        } catch (greetingError) {
          console.error("Failed to get initial greeting:", greetingError);
          // Continue without a greeting if there's an error
        }
      }
      else {
        try {
          // Call the model service directly
          const initialGreetingResponse = await fetch("https://emot-chtabot.onrender.com/init-conversation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              user_details: {}
            }),
          });
          
          if (!initialGreetingResponse.ok) {
            throw new Error(
              `Model service responded with status: ${initialGreetingResponse.status}`
            );
          }
          
          const greetingData = await initialGreetingResponse.json();
          
          if (greetingData.message) {
            const botGreeting = { 
              sender: "bot", 
              text: greetingData.message 
            };
            
            // Add to UI
            setMessages([botGreeting]);
            setAudioUrl(greetingData.audio_url);
            
            // Add to pending messages queue
            pendingMessagesRef.current.push(botGreeting);
            
            // Try to sync this message immediately
            syncPendingMessages();
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

    // Optimistically update UI
    const userMessage = { sender: "user", text: trimmedInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput(""); // Clear input immediately for better UX
    setLoading(true);

    try {
      // Use local state for conversation history instead of fetching from backend
      const lastFiveMessages = messages.slice(-5);

      // Add new user message to pending messages queue
      pendingMessagesRef.current.push(userMessage);

      // Step 2: Get AI response with severity assessment
      const aiResponse = await fetch("https://emot-chtabot.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedInput,
          session_id: activeSession,
          conversation_history: lastFiveMessages,
          user_details: userDetails,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI service responded with status: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();

      // Validate bot response
      if (!aiData.response || typeof aiData.distress_score === "undefined") {
        throw new Error("Invalid response from AI service");
      }

      const botMessage = { sender: "bot", text: aiData.response };
      console.log(aiData.distress_score);
      
      // Check severity score
      if (aiData.distress_score >= 7) {
        // Force sync messages before redirecting
        await forceSyncMessages();
        
        notification.warning({
          message: "Urgent Help Suggested",
          description: "We recommend seeking professional support. Redirecting to the helpline...",
          duration: 5,
        });
        navigate("/helpline"); // Redirect to helpline page
        return; // Exit early since we're redirecting
      }

      // Update UI with bot response
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setAudioUrl(aiData.audio_url);
      
      // Add bot message to pending messages queue
      pendingMessagesRef.current.push(botMessage);
      
    } catch (error) {
      console.error("Error in message exchange:", error);

      // Add error message to UI
      const errorMessage = { 
        sender: "bot", 
        text: "Sorry, I couldn't process your message. Please try again." 
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      
      // Add error message to pending messages queue
      pendingMessagesRef.current.push(errorMessage);

      notification.error({
        message: "Communication Error",
        description: "Failed to get or save response. Please try again.",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle session change
  const handleSessionChange = async (sessionId) => {
    // Force sync any pending messages before changing session
    await forceSyncMessages();
    
    setActiveSession(sessionId);
    localStorage.setItem("activeSession", sessionId);
  };

  // Clean up function to be called when user navigates away or logs out
  const cleanUp = async () => {
    // Force sync any pending messages
    await forceSyncMessages();
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
    return text
      .replace(/[*•-]/g, "") // Remove *, •, and -
      .replace(/^\d+[\.\)]\s*/gm, "") // Remove numbered bullets like "1.", "2)", etc.
      .replace(/(\r\n|\n|\r)/g, "<br />"); // Replace line breaks with <br />
  };

  const handleCallUser = async () => {
    if (!phoneNumber.trim()) {
      antdMessage.error("Please enter a valid phone number.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/make_call", {
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
      </Sider>

      <Layout>
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
