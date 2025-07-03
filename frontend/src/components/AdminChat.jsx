import { useEffect, useState, useRef } from "react";
import "../assets/css/chatbot.css";
import { FaPaperPlane } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { marked } from "marked";
import { sendChatMessage } from "../slices/chatLiveSlice";

export default function AdminChat() {
  const { profile } = useSelector((state) => state.profile);
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const dispatch = useDispatch();

  const messagesEndRef = useRef(null);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    setSending(true);

    const userMsg = {
      sender: "user",
      message,
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      await dispatch(
        sendChatMessage({
          customer_id: profile?.user?.id,
          message,
          sender: "customer",
        })
      ).unwrap();

      // Giả lập phản hồi admin
      setTimeout(() => {
        const adminMsg = {
          sender: "admin",
          message: t("chatBot.adminResponse"),
        };
        setMessages((prev) => [...prev, adminMsg]);
        setSending(false);
      }, 1000);
    } catch (error) {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto scroll đến cuối khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }, 0);
    }
  }, [messages]);

  return (
    <>
      <div className="messages">
        {messages.length === 0 && (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#666",
              fontStyle: "italic",
            }}
          >
            <p>{t("chatBot.adminWelcome")}</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            className={`message ${msg.sender}`}
            key={index}
            style={{
              display: "flex",
              flexDirection: msg.sender === "user" ? "row-reverse" : "row",
              alignItems: "flex-end",
              marginBottom: 10,
            }}
          >
            <div className="avatar_chat">
              <img
                src={
                  msg.sender === "user"
                    ? profile?.user?.image_url ||
                      "https://bootdey.com/img/Content/avatar/avatar1.png"
                    : "https://img.freepik.com/free-vector/customer-support-flat-design-illustration_23-2148887720.jpg"
                }
                alt="avatar"
                className="avatar"
              />
            </div>

            <div
              className="bubble"
              style={{
                backgroundColor: msg.sender === "user" ? "#54b4d3" : "#28a745",
                textAlign: "left",
                color: "white",
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: marked.parse(msg.message || ""),
                }}
              />
              <div
                className="timestamp"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {dayjs(msg.created_at).format("HH:mm")}
              </div>
            </div>
          </div>
        ))}

        {sending && (
          <div
            className="message admin"
            style={{
              opacity: 0.7,
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              marginBottom: 10,
            }}
          >
            <div className="avatar_chat">
              <img
                src="https://img.freepik.com/free-vector/customer-support-flat-design-illustration_23-2148887720.jpg"
                alt="avatar"
                className="avatar"
              />
            </div>

            <div
              className="bubble"
              style={{
                background: "#28a745",
                fontStyle: "italic",
                color: "white",
              }}
            >
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder={t("chatBot.adminPlaceholder")}
          value={message}
          onKeyDown={handleKeyDown}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
        />
        <button
          className="btn_message"
          onClick={handleSendMessage}
          disabled={sending}
        >
          {sending ? <span className="chat_spinner" /> : <FaPaperPlane />}
        </button>
      </div>
    </>
  );
}
