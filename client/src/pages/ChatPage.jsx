import React, { useState, useEffect } from "react";
import { Layout, Menu, Input, Button } from "antd";
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

const { Header, Sider, Content } = Layout;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatSessions, setChatSessions] = useState(["Session 1"]);
  const [activeSession, setActiveSession] = useState("Session 1");
  const { transcript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSendMessage = async () => {
    if (input.trim() !== "") {
      const userMessage = { text: input, sender: "user" };
      setMessages([...messages, userMessage]);
      setInput("");

      try {
        const response = await fetch("http://127.0.0.1:5000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response");
        }

        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { text: data.response, sender: "bot" },
        ]);

        // Play received audio response
        if (data.audio) {
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
          audio.play();
        }
      } catch (error) {
        console.error("Error fetching bot response:", error);
        setMessages((prev) => [
          ...prev,
          { text: "Error: Unable to get response", sender: "bot" },
        ]);
      }
    }
  };

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: false, language: "en-US" });
  };

  const handleNewSession = () => {
    const newSession = `Session ${chatSessions.length + 1}`;
    setChatSessions([...chatSessions, newSession]);
    setActiveSession(newSession);
    setMessages([]);
  };

  return (
    <Layout className="chat-layout">
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
          onClick={handleNewSession}
        >
          New Chat
        </Button>
      </Sider>

      <Layout style={{ flex: 1 }}>
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
            <Button icon={<AudioOutlined />} onClick={startListening} />
            <Button icon={<SendOutlined />} onClick={handleSendMessage} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChatPage;

// import React, { useState, useEffect } from "react";
// import { Layout, Menu, Input, Button } from "antd";
// import { motion } from "framer-motion";
// import {
//   MessageOutlined,
//   PlusOutlined,
//   SendOutlined,
//   AudioOutlined,
// } from "@ant-design/icons";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";

// const { Header, Sider, Content } = Layout;

// const ChatPage = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [chatSessions, setChatSessions] = useState(["Session 1"]);
//   const [activeSession, setActiveSession] = useState("Session 1");
//   const { transcript, resetTranscript } = useSpeechRecognition();

//   useEffect(() => {
//     if (transcript) {
//       setInput(transcript);
//     }
//   }, [transcript]);

//   const handleSendMessage = async () => {
//     if (input.trim() !== "") {
//       const userMessage = { text: input, sender: "user" };
//       setMessages([...messages, userMessage]);
//       setInput("");

//       try {
//         const response = await fetch("http://127.0.0.1:5000/chat", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ message: input }),
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch response");
//         }

//         const data = await response.json();
//         setMessages((prev) => [
//           ...prev,
//           { text: data.response, sender: "bot" },
//         ]);

//         // Play received audio response
//         if (data.audio) {
//           const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
//           audio.play();
//         }
//       } catch (error) {
//         console.error("Error fetching bot response:", error);
//         setMessages((prev) => [
//           ...prev,
//           { text: "Error: Unable to get response", sender: "bot" },
//         ]);
//       }
//     }
//   };

//   const startListening = () => {
//     SpeechRecognition.startListening({ continuous: false, language: "en-US" });
//   };

//   const handleNewSession = () => {
//     const newSession = `Session ${chatSessions.length + 1}`;
//     setChatSessions([...chatSessions, newSession]);
//     setActiveSession(newSession);
//     setMessages([]);
//   };

//   return (
//     <Layout className="chat-layout">
//       <Sider width={250} className="chat-sidebar">
//         <div className="sidebar-header">Chats</div>
//         <Menu
//           theme="dark"
//           mode="inline"
//           selectedKeys={[activeSession]}
//           onClick={({ key }) => setActiveSession(key)}
//           items={chatSessions.map((session) => ({
//             key: session,
//             icon: <MessageOutlined />,
//             label: session,
//           }))}
//         />
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           onClick={handleNewSession}
//         >
//           New Chat
//         </Button>
//       </Sider>

//       <Layout style={{ flex: 1 }}>
//         <Header className="chat-header">AI Virtual Counselor</Header>
//         <Content className="chat-content">
//           <motion.div className="chat-messages">
//             {messages.map((msg, index) => (
//               <motion.div key={index} className={`chat-message ${msg.sender}`}>
//                 {msg.text}
//               </motion.div>
//             ))}
//           </motion.div>

//           <div className="chat-input-container">
//             <Input value={input} onChange={(e) => setInput(e.target.value)} />
//             <Button icon={<AudioOutlined />} onClick={startListening} />
//             <Button icon={<SendOutlined />} onClick={handleSendMessage} />
//           </div>
//         </Content>
//       </Layout>
//     </Layout>
//   );
// };

// export default ChatPage;
