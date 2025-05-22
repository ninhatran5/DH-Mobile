import { useEffect, useState } from "react";
import "../assets/css/chatbot.css";
import chatbotLogo2 from "../assets/images/logochat.png";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { GoPaperclip } from "react-icons/go";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchProfile } from "../slices/profileSlice";

const messagesData = [
  { sender: "user", text: "Xin chào", time: "10:00 AM" },
  { sender: "user", text: "Bạn khỏe không ?", time: "10:01 AM" },
  { sender: "user", text: "Hmmmmm", time: "10:02 AM" },
  {
    sender: "user",
    text: "Bạn còn tiền không? cho tôi vay 5 triệu?",
    time: "10:02 AM",
  },
  { sender: "bot", text: "Xin chào, tôi khỏe.", time: "10:03 AM" },
  { sender: "bot", text: "Cút mẹ m đi", time: "10:04 AM" },
  {
    sender: "user",
    text: "Đây là một hình ảnh tôi muốn chia sẻ:",
    time: "10:05 AM",
  },
  {
    sender: "user",
    image:
      "https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg",
    time: "10:05 AM",
  },
  {
    sender: "bot",
    image: "https://picsum.photos/201",
    time: "10:15 AM",
  },
];

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.profile);
  const [show, setShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [visible, setVisible] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <div className="chatbot-container">
      {!visible && (
        <div className="chat-icon" onClick={() => setVisible(true)}>
          <img src={chatbotLogo2} width={55} alt="Chat Icon" />
        </div>
      )}

      {visible && (
        <div className="chat-window">
          <div className="chat-header">
            <h2>{t("chatBot.chat")}</h2>
            <button className="close-button" onClick={() => setVisible(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="messages">
            {messagesData.map((msg, index) => (
              <div className={`message ${msg.sender}`} key={index}>
                <div className="avatar_chat">
                  <img
                    src={
                      msg.sender === "user"
                        ? profile.user.image_url ||
                          "https://bootdey.com/img/Content/avatar/avatar1.png"
                        : "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg"
                    }
                    alt="avatar"
                    className="avatar"
                  />
                </div>
                <div className="bubble">
                  {msg.text && <div>{msg.text}</div>}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="message"
                      className="message-image"
                      onClick={() => {
                        setSelectedImage(msg.image);
                        handleShow();
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  <div className="timestamp">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

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
            <input type="text" placeholder={t("chatBot.message")} />
            <input
              type="file"
              id="file-input"
              className="file-input"
              onChange={(e) => console.log(e.target.files)}
            />
            <label
              htmlFor="file-input"
              className="btn_message2"
              style={{ cursor: "pointer", marginTop: 9 }}
            >
              <GoPaperclip />
            </label>
            <button className="btn_message">
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
