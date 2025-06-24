/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
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
  const [pendingMessages, setPendingMessages] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;
    setSending(true);
    setPendingMessages((prev) => [
      ...prev,
      {
        sender: "user",
        message,
        created_at: new Date().toISOString(),
      },
    ]);
    setMessage("");
    await dispatch(
      chatBotPost({
        user_id: profile?.user?.id,
        message,
      })
    );
    await dispatch(fetchChatBot());
    setPendingMessages([]); // clear khi đã fetch xong
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const flatMessages = [];
  if (Array.isArray(response)) {
    response.forEach((item) => {
      flatMessages.push({
        sender: "user",
        message: item.message,
        created_at: item.created_at,
      });
      flatMessages.push({
        sender: "bot",
        message: item.response,
        created_at: item.created_at,
      });
    });
  }

  const allMessages = [...flatMessages, ...pendingMessages];

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchChatBot());
  }, [dispatch]);

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
                    textAlign: msg.sender === "user" ? "right" : "left",
                  }}
                >
                  <div>{msg.message}</div>
                  <div className="timestamp">
                    {dayjs(msg.created_at).format("HH:mm")}
                  </div>
                </div>
              </div>
            ))}
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
