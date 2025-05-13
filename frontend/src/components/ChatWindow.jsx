import React, { useState } from "react";
import "../assets/css/chatbot.css";
import chatbotLogo2 from "../assets/images/logochat.png";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { GoPaperclip } from "react-icons/go";

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
    image: "https://picsum.photos/200",
    time: "10:05 AM",
  },
  {
    sender: "bot",
    image: "https://picsum.photos/201",
    time: "10:15 AM",
  },
];

export default function ChatWindow() {
  const [visible, setVisible] = useState(true);
  const [imageModal, setImageModal] = useState(null); // Modal state

  const openImageModal = (image) => {
    console.log("Click ảnh:", image);
    setImageModal(image);
  };

  const closeImageModal = () => {
    setImageModal(null);
  };

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
            <h2>Trò chuyện</h2>
            <button className="close-button" onClick={() => setVisible(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="messages">
            {messagesData.map((msg, index) => (
              <div className={`message ${msg.sender}`} key={index}>
                <img
                  src={
                    msg.sender === "user"
                      ? "https://static-cse.canva.com/blob/2008403/1600w-vkBvE1d_xYA.jpg"
                      : "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg"
                  }
                  alt="avatar"
                  className="avatar"
                />
                <div className="bubble">
                  {msg.text && <div>{msg.text}</div>}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="message"
                      className="message-image"
                      onClick={() => openImageModal(msg.image)}
                    />
                  )}
                  <div className="timestamp">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          {imageModal && (
            <div className="modal" onClick={closeImageModal}>
              <img src={imageModal} alt="Phóng to" className="modal-image" />
            </div>
          )}

          <div className="input-container">
            <input type="text" placeholder="Gõ tin nhắn của bạn..." />
            <input
              type="file"
              id="file-input"
              className="file-input"
              onChange={(e) => console.log(e.target.files)}
            />
            <label
              htmlFor="file-input"
              className="btn_message2"
              style={{ cursor: "pointer", marginTop: 9, marginLefts: 5 }}
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
