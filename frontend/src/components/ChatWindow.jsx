/* eslint-disable no-unused-vars */
import { useState } from "react";
import "../assets/css/chatbot.css";
import chatbotLogo2 from "../assets/images/logochat.png";
import { FaTimes } from "react-icons/fa";
import { ImEnlarge2 } from "react-icons/im";
import { MdOutlineZoomInMap } from "react-icons/md";
import { useTranslation } from "react-i18next";
import BotChat from "./BotChat";
import AdminChat from "./AdminChat";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function ChatWindow() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chatMode, setChatMode] = useState(null);

  const handleChatModeChange = (mode) => {
    setChatMode(mode);
    if (mode === "bot") {
      localStorage.removeItem("chatbot-messages");
    } else if (mode === "admin") {
      localStorage.removeItem("admin-chat-messages");
    }
  };

  const handleBackToModeSelector = () => {
    setChatMode(null);
  };

  return (
    <div className="chatbot-container-fluid">
      {!visible && (
        <div className="chat-icon" onClick={() => setVisible(true)}>
          <img src={chatbotLogo2} width={55} alt="Chat Icon" />
        </div>
      )}

      {visible && (
        <div className={`chat-window${isFullScreen ? " fullscreen" : ""}`}>
          <div className="chat-header">
            <h2>
              {chatMode === null
                ? t("chatBot.chat")
                : chatMode === "bot"
                ? t("chatBot.chatWithBot")
                : t("chatBot.chatWithAdmin")}
            </h2>
            <div className="chat-header-actions">
              {chatMode !== null && (
                <button
                  className="back-btn-chat"
                  onClick={handleBackToModeSelector}
                >
                  <IoMdArrowRoundBack />
                </button>
              )}
              <button
                className="expand-btn"
                onClick={() => setIsFullScreen((v) => !v)}
              >
                {isFullScreen ? (
                  <MdOutlineZoomInMap className="icon-zoomout" />
                ) : (
                  <ImEnlarge2 className="icon-enlarge" />
                )}
              </button>
              <button
                className="close-button"
                onClick={() => setVisible(false)}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {chatMode === null ? (
            <div
              className="chat-mode-selector"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h5
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  color: "#333",
                }}
              >
                {t("chatBot.whoToChat")}
              </h5>

              <button
                onClick={() => handleChatModeChange("bot")}
                style={{
                  padding: "15px 25px",
                  border: "2px solid #007bff",
                  borderRadius: "10px",
                  background: "#007bff",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  width: "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#0056b3";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "#007bff";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                🤖 {t("chatBot.chatWithBot")}
              </button>

              <button
                onClick={() => handleChatModeChange("admin")}
                style={{
                  padding: "15px 25px",
                  border: "2px solid #28a745",
                  borderRadius: "10px",
                  background: "#28a745",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  width: "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#1e7e34";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "#28a745";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                👨‍💼 {t("chatBot.chatWithAdmin")}
              </button>

              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontSize: "14px",
                  marginTop: "15px",
                  lineHeight: "1.4",
                }}
              >
                {t("chatBot.botDescription")}
                <br />
                {t("chatBot.adminDescription")}
              </p>
            </div>
          ) : chatMode === "bot" ? (
            <BotChat />
          ) : (
            <AdminChat />
          )}
        </div>
      )}
    </div>
  );
}
