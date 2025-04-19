import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import './UI.css'

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default language is English
  const [isListening, setIsListening] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message) {
      chat(text, selectedLanguage); // Pass the selected language to the chat function
      input.current.value = "";
    }
  };
   
  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Detected Emotion:", data.emotion);
    } catch (error) {
      console.error("Error capturing emotion:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleVoiceInput = () => {
    // Toggle listening state
    setIsListening(!isListening);
    
    // Only proceed if browser supports SpeechRecognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = selectedLanguage === 'en' ? 'en-US' : 
                         selectedLanguage === 'it' ? 'it-IT' : 
                         selectedLanguage === 'fr' ? 'fr-FR' : 
                         selectedLanguage === 'de' ? 'de-DE' : 
                         selectedLanguage === 'zh' ? 'zh-CN' : 
                         selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
      
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.current.value = transcript;
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } else {
      alert('Speech recognition is not supported by your browser');
      setIsListening(false);
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-20 left-10 right-0 bottom-10 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-80 p-4 rounded-lg hidden sm:block">
          <h1 className="font-black text-xl">Sentio</h1>
          <p>Your Virtual Counselor</p>
        </div>
        <div className="w-full flex flex-col items-end justify-center gap-4">
          {/* Commented out buttons section */}
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            onClick={handleVoiceInput}
            className={`p-4 rounded-md ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-pink-500 hover:bg-pink-600'} text-white`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
          </button>
          {/* <button
            onClick={handleCapture}
            disabled={isCapturing}
            className={`p-4 rounded-md bg-pink-500 hover:bg-pink-600 text-white ${
              isCapturing ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
          </button> */}
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="p-4 rounded-md bg-pink-500 hover:bg-pink-600 text-white cursor-pointer"
          >
            <option value="en">English</option>
            <option value="it">Italian</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="hi">Hindi</option>
          </select>
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};