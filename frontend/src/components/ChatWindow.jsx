/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import "../assets/css/chatbot.css";
import chatbotLogo2 from "../assets/images/logochat.png";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { ImEnlarge2 } from "react-icons/im";
import { MdOutlineZoomInMap } from "react-icons/md";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchProfile } from "../slices/profileSlice";
import { chatBotPost, fetchChatBot } from "../slices/chatBotSlice";
import dayjs from "dayjs";
import { marked } from "marked";

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.profile);
  const { response } = useSelector((state) => state.chatBot);
  const [show, setShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);
  const [visible, setVisible] = useState(true);
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  // Tối ưu: lưu trữ toàn bộ messages trong state, không clear pending khi fetch lại
  const [messages, setMessages] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Ref để scroll đến cuối khi có tin nhắn mới
  const messagesEndRef = useRef(null);

  // Khi fetch lịch sử chat thành công, chỉ cập nhật nếu API trả về nhiều hoặc bằng số lượng tin nhắn hiện tại
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

  // Polling để lấy phản hồi bot sau khi gửi tin nhắn
  const pollingRef = useRef();

  // Thêm trạng thái loadingBot để hiển thị "Bot đang trả lời..."
  const [loadingBot, setLoadingBot] = useState(false);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;
    setSending(true);
    setLoadingBot(true);
    const userMsg = {
      sender: "user",
      message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    const result = await dispatch(
      chatBotPost({
        user_id: profile?.user?.id,
        message,
      })
    );
    if (result?.payload && result.payload.response) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message: result.payload.response,
          created_at: new Date().toISOString(),
        },
      ]);
      setSending(false);
      setLoadingBot(false);
      return;
    }
    // Nếu chưa có response ngay, bắt đầu polling
    let pollCount = 0;
    let lastBotMsg = null;
    pollingRef.current = setInterval(async () => {
      pollCount++;
      const fetchResult = await dispatch(fetchChatBot());
      if (Array.isArray(fetchResult.payload)) {
        const flat = [];
        fetchResult.payload.forEach((item) => {
          flat.push({ sender: "user", message: item.message, created_at: item.created_at });
          flat.push({ sender: "bot", message: item.response, created_at: item.created_at });
        });
        // Tìm tin nhắn bot cuối cùng trong dữ liệu mới
        const newBotMsg = flat.slice().reverse().find((msg) => msg.sender === "bot" && msg.message);
        setMessages((prev) => {
          // Nếu tin nhắn cuối cùng của bạn chưa có trong API, giữ lại
          if (
            prev.length > flat.length &&
            prev[prev.length - 1].sender === "user" &&
            (!flat.length || prev[prev.length - 1].message !== flat[flat.length - 1].message)
          ) {
            return [...flat, prev[prev.length - 1]];
          }
          return flat;
        });
        // Nếu có tin nhắn bot mới (khác với lần trước), dừng polling
        if (newBotMsg && newBotMsg.message !== lastBotMsg) {
          clearInterval(pollingRef.current);
          setSending(false);
          setLoadingBot(false);
        }
        lastBotMsg = newBotMsg ? newBotMsg.message : lastBotMsg;
      }
      // Tăng số lần polling lên 30 lần (~30s)
      if (pollCount > 30) {
        clearInterval(pollingRef.current);
        setSending(false);
        setLoadingBot(false);
      }
    }, 1500); // 1.5s/lần
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // allMessages giờ là messages (không cần pendingMessages)
  const allMessages = messages;

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchChatBot());
  }, [dispatch]);

  // Auto scroll đến cuối khi có tin nhắn mới hoặc bot đang trả lời, hoặc khi mở chat box
  useEffect(() => {
    if (visible && messages.length > 0 && messagesEndRef.current) {
      // Đảm bảo scroll sau khi render xong
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }, 0);
    }
  }, [messages, loadingBot, visible]);

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
            <h2>{t("chatBot.chat")}</h2>
            <div className="chat-header-actions">
              <button
                className="expand-btn"
                onClick={() => setIsFullScreen((v) => !v)}
                title={isFullScreen ? t("chatBot.shrink") : t("chatBot.expand")}
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

          <div className="messages">
            {allMessages.map((msg, index) => (
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
                {/* Avatar */}
                <div className="avatar_chat">
                  <img
                    src={
                      msg.sender === "user"
                        ? profile?.user?.image_url ||
                          "https://bootdey.com/img/Content/avatar/avatar1.png"
                        : "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg"
                    }
                    alt="avatar"
                    className="avatar"
                  />
                </div>

                {/* Bubble + Time */}
                <div
                  className="bubble"
                  style={{
                    backgroundColor:
                      msg.sender === "user" ? "#54b4d3" : "#f1f0f0",
                    textAlign: msg.sender === "user" ? "left" : "left",
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(msg.message || ""),
                    }}
                  />
                  <div className="timestamp">
                    {dayjs(msg.created_at).format("HH:mm")}
                  </div>
                </div>
              </div>
            ))}
            {loadingBot && (
              <div className="message bot" style={{ opacity: 0.7 }}>
                <div className="bubble" style={{ background: '#f1f0f0', fontStyle: 'italic' }}>
                  <span>Bot đang trả lời...</span>
                </div>
              </div>
            )}
            {/* Auto scroll đến cuối */}
            <div ref={messagesEndRef} />
          </div>

          {/* Modal preview ảnh */}
          <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Body style={{ padding: 0, position: "relative" }}>
              <button
                onClick={handleClose}
                style={{
                  position: "absolute",
                  top: -19,
                  right: -15,
                  background: "none",
                  color: "white",
                  border: "none",
                  fontSize: 37,
                  cursor: "pointer",
                  zIndex: 10,
                }}
                aria-label="Đóng"
              >
                &times;
              </button>

              <img
                src={selectedImage}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "90vh",
                  objectFit: "contain",
                  display: "block",
                }}
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
        </div>
      )}
    </div>
  );
}
