import { useEffect, useState, useRef } from "react";
const notificationAudio =
  typeof window !== "undefined"
    ? new Audio("/happy-message-ping-351298.mp3")
    : null;
import "../assets/css/chatbot.css";
import "../assets/css/chat-with.css";
import { FaPaperPlane } from "react-icons/fa";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchProfile } from "../slices/profileSlice";
import { chatBotPost, fetchChatBot } from "../slices/chatBotSlice";
import dayjs from "dayjs";
import { marked } from "marked";
import { toast } from "react-toastify";
import avatarChatBot from "../assets/images/avtchatbot.jpg";

export default function BotChat() {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.profile);
  const { response } = useSelector((state) => state.chatBot);
  const [show, setShow] = useState(false);
  const [selectedImage, _setSelectedImage] = useState("");
  const handleClose = () => setShow(false);
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingBot, setLoadingBot] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef();

  useEffect(() => {
    if (Array.isArray(response)) {
      const flat = [];
      response.forEach((item) => {
        flat.push({
          sender: "user",
          message: item.message,
          created_at: item.created_at,
        });
        flat.push({
          sender: "bot",
          message: item.response,
          created_at: item.created_at,
        });
      });
      setMessages((prev) => {
        if (flat.length >= prev.length) return flat;
        return prev;
      });
    }
  }, [response]);

  const prevBotMsgCount = useRef(0);
  useEffect(() => {
    const botMsgs = messages.filter((m) => m.sender === "bot");
    if (botMsgs.length > prevBotMsgCount.current) {
      if (document.hidden && notificationAudio) {
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(() => {});
      }
    }
    prevBotMsgCount.current = botMsgs.length;
  }, [messages]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "chatbot-messages") {
        try {
          const data = JSON.parse(e.newValue);
          if (Array.isArray(data)) setMessages(data);
        } catch {
          toast.error("Invalid data in localStorage for chatbot-messages");
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatbot-messages", JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;
    setSending(true);
    setLoadingBot(true);
    const userMsg = {
      sender: "user",
      message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => {
      const next = [...prev, userMsg];
      localStorage.setItem("chatbot-messages", JSON.stringify(next));
      return next;
    });
    setMessage("");
    const _result = await dispatch(
      chatBotPost({
        user_id: profile?.user?.id,
        message,
      })
    );
    let prevMsgCount = messages.length;
    let prevLastBotMsg =
      messages.filter((m) => m.sender === "bot").slice(-1)[0]?.message || null;
    pollingRef.current = setInterval(async () => {
      const fetchResult = await dispatch(fetchChatBot());
      if (Array.isArray(fetchResult.payload)) {
        const flat = [];
        fetchResult.payload.forEach((item) => {
          flat.push({
            sender: "user",
            message: item.message,
            created_at: item.created_at,
          });
          flat.push({
            sender: "bot",
            message: item.response,
            created_at: item.created_at,
          });
        });
        setMessages((prev) => {
          let next;
          if (
            prev.length > flat.length &&
            prev[prev.length - 1].sender === "user" &&
            (!flat.length ||
              prev[prev.length - 1].message !== flat[flat.length - 1].message)
          ) {
            next = [...flat, prev[prev.length - 1]];
          } else {
            next = flat;
          }
          localStorage.setItem("chatbot-messages", JSON.stringify(next));
          return next;
        });
        const lastBotMsg =
          flat.filter((m) => m.sender === "bot").slice(-1)[0]?.message || null;
        if (
          flat.length > prevMsgCount ||
          (lastBotMsg && lastBotMsg !== prevLastBotMsg)
        ) {
          clearInterval(pollingRef.current);
          setSending(false);
          setLoadingBot(false);
        }
        prevMsgCount = flat.length;
        prevLastBotMsg = lastBotMsg;
      }
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchChatBot());
  }, [dispatch]);

  // Auto scroll đến cuối khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }, 0);
    }
  }, [messages, loadingBot]);

  return (
    <>
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            className={`message ${msg.sender} chat-with-message ${msg.sender}`}
            key={index}
          >
            <div className="avatar_chat">
              <img
                src={
                  msg.sender === "user"
                    ? profile?.user?.image_url ||
                      "https://bootdey.com/img/Content/avatar/avatar1.png"
                    : avatarChatBot
                }
                alt="avatar"
                className="avatar"
              />
            </div>

            <div className={`bubble chat-with-bubble ${msg.sender}`}>
              <div
                dangerouslySetInnerHTML={{
                  __html: marked.parse(msg.message || ""),
                }}
              />
              <div className={`timestamp chat-with-timestamp ${msg.sender}`}>
                {dayjs(msg.created_at).format("HH:mm")}
              </div>
            </div>
          </div>
        ))}
        {loadingBot && (
          <div className="message bot chat-with-message bot chat-with-loading">
            <div className="avatar_chat">
              <img src={avatarChatBot} alt="avatar" className="avatar" />
            </div>

            <div className="bubble chat-with-bubble bot">
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

      {/* Modal preview ảnh */}
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Body className="chat-with-modal-body">
          <button
            onClick={handleClose}
            className="chat-with-modal-close"
            aria-label={t("chatBot.closeModal")}
          >
            &times;
          </button>

          <img
            src={selectedImage}
            alt="Preview"
            className="chat-with-modal-image"
          />
        </Modal.Body>
      </Modal>

      <div className="input-container">
        <input
          type="text"
          placeholder={t("chatBot.message")}
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
