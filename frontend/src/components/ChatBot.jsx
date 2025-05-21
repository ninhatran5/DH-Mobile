import React, { useState } from "react";
import chatbotLogo2 from "../assets/images/logochat.png";
import "../assets/css/chatbot.css";
import ChatWindow from "./ChatWindow";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="chatbot-container">
      {!isOpen && (
        <div className="chat-icon" onClick={toggleChat}>
          <img src={chatbotLogo2} width={55} alt="Chat Icon" />
        </div>
      )}
      {isOpen && <ChatWindow />}
    </div>
  );
};

export default ChatBot;
