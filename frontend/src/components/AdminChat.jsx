/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import "../assets/css/chatbot.css";
import { FaPaperPlane } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { marked } from "marked";
import { Modal } from "react-bootstrap";
import { sendChatMessage } from "../slices/chatLiveSlice";
import { GoPaperclip } from "react-icons/go";
import { FaSearchPlus, FaSearchMinus } from "react-icons/fa"; // Thêm ở đầu file

export default function AdminChat() {
  const { profile } = useSelector((state) => state.profile);
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [pastedImages, setPastedImages] = useState([]); // array base64
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  const handleSendMessage = async () => {
    if (message.trim() === "" && pastedImages.length === 0) return;

    setSending(true);

    const userMsg = {
      sender: "user",
      message,
      images: pastedImages,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setPastedImages([]);

    try {
      await dispatch(
        sendChatMessage({
          customer_id: profile?.user?.id,
          message,
          sender: "customer",
          images_base64: pastedImages,
        })
      ).unwrap();

      setTimeout(() => {
        const adminMsg = {
          sender: "admin",
          message: t("chatBot.adminResponse"),
          created_at: new Date().toISOString(),
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

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter((item) =>
      item.type.includes("image")
    );
    imageItems.forEach((item) => {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (event) => {
        setPastedImages((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(blob);
    });

    if (imageItems.length > 0) e.preventDefault();
  };

  const handlePreviewClick = (img) => {
    setSelectedImage(img);
    setZoom(1);
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPastedImages((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input value để có thể chọn cùng file lần sau
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setPastedImages((prev) => prev.filter((_, i) => i !== index));
  };

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
              {msg.message && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(msg.message || ""),
                  }}
                />
              )}

              {Array.isArray(msg.images) &&
                msg.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="chat"
                    onClick={() => handlePreviewClick(img)}
                    style={{
                      maxWidth: 160,
                      maxHeight: 160,
                      borderRadius: 8,
                      marginTop: 8,
                      marginRight: 5,
                      cursor: "pointer",
                      border: "1px solid white",
                    }}
                  />
                ))}

              <div
                className="timestamp"
                style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}
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

      {pastedImages.length > 0 && (
        <div className="pasted-preview">
          {pastedImages.map((img, index) => (
            <div className="preview-container" key={index}>
              <img
                src={img}
                alt="preview"
                onClick={() => handlePreviewClick(img)}
              />
              <button onClick={() => handleRemoveImage(index)}>×</button>
            </div>
          ))}
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          placeholder={t("chatBot.adminPlaceholder")}
          value={message}
          onKeyDown={handleKeyDown}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={handlePaste}
          disabled={sending}
        />
        <input
          type="file"
          id="file-input"
          className="file-input"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
        />
        <label
          htmlFor="file-input"
          className="btn_message2"
          style={{ cursor: "pointer" }}
        >
          <GoPaperclip />
        </label>
        <button
          className="btn_message"
          onClick={handleSendMessage}
          disabled={sending}
        >
          {sending ? <span className="chat_spinner" /> : <FaPaperPlane />}
        </button>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Body
          style={{ padding: 0, position: "relative", textAlign: "center" }}
        >
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 32,
              zIndex: 10,
              display: "flex",
              gap: 12,
            }}
          >
            <button
              onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
              style={{
                border: "none",
                background: "#222",
                borderRadius: "50%",
                width: 20,
                height: 50,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                transition: "background 0.2s, box-shadow 0.2s",
                color: "#fff",
              }}
              disabled={zoom <= 1}
              className="zoom-btn"
            >
              -
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
              style={{
                border: "none",
                background: "#222",
                borderRadius: "50%",
                width: 20,
                height: 50,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                transition: "background 0.2s, box-shadow 0.2s",
                color: "#fff",
              }}
              className="zoom-btn"
            >
              +
            </button>
          </div>
          <div style={{ overflow: "auto" }}>
            <img
              src={selectedImage}
              alt="Large preview"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "70vh",
                transform: `scale(${zoom})`,
                transition: "transform 0.2s",
                display: "inline-block",
                boxShadow: "0 4px 32px #0002",
                borderRadius: 8,
              }}
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
