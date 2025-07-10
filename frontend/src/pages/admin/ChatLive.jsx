import React, { useEffect, useState, useRef, useMemo } from 'react';
import '../../assets/admin/ChatLiveAdmin.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchChatUserList,
  replyToChat,
  fetchChatHistory,
} from '../../slices/AdminChatLive';

const ChatBotAdmin = () => {
  const dispatch = useDispatch();

  const {
    chatUsers,
    chatUsersLoading,
    chatHistory,
    chatHistoryLoading,
  } = useSelector((state) => state.adminchatLive);

  const [activeUser, setActiveUser] = useState(null);
  const [message, setMessage] = useState('');
  const messageEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChatUserList());
  }, [dispatch]);

  // 👉 Gọi fetchChatHistory khi activeUser thay đổi
  useEffect(() => {
    if (activeUser) {
      console.log('🟢 Chọn user:', activeUser.customer_id);
      dispatch(fetchChatHistory(activeUser.customer_id));
    }
  }, [activeUser, dispatch]);

  // 👉 Scroll to bottom khi có tin nhắn
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeUser]);

  const handleSelectUser = (user) => {
    setActiveUser(user); // không fetch ở đây nữa
  };

  const handleSend = async () => {
    if (!message.trim() || !activeUser) return;

    const payload = {
      customer_id: activeUser.customer_id,
      message,
      images_base64: [],
    };

    try {
      await dispatch(replyToChat(payload)).unwrap();
      setMessage('');
    } catch (err) {
      console.error('Gửi lỗi:', err);
    }
  };

  const chatMessages = useMemo(() => {
    if (!activeUser) return [];
    const messages = chatHistory?.[activeUser.customer_id] || [];
    console.log('💬 Chat messages:', messages);
    return messages;
  }, [chatHistory, activeUser]);

  return (
    <section className="admin_chatbot-container">
      <div className="container py-5">
        <div className="row">
          {/* Danh sách người dùng */}
          <div className="col-md-6 col-lg-5 col-xl-4 mb-4 mb-md-0">
            <div className="admin_chatbot-search-container">
              <div className="admin_chatbot-search-input">
                <i className="bi bi-search" style={{ color: '#0071e3' }}></i>
                <input type="text" placeholder="Tìm kiếm liên hệ..." className="admin_chatbot-search" disabled />
              </div>
            </div>

            <div className="admin_chatbot-contacts">
              {chatUsersLoading && <p className="text-muted">Đang tải...</p>}
              {chatUsers?.map((user) => (
                <div
                  key={user.customer_id}
                  className={`admin_chatbot-contact-item ${activeUser?.customer_id === user.customer_id ? 'active' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="d-flex flex-row">
                    <div className="admin_chatbot-avatar-container">
                      <img
                        src={user.avatar_url}
                        alt="avatar"
                        className="admin_chatbot-avatar me-3"
                      />
                    </div>
                    <div className="admin_chatbot-contact-info">
                      <p className="admin_chatbot-contact-name">{user.customer_name}</p>
                      <p className="admin_chatbot-contact-preview">{user.last_message || '...'}</p>
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="admin_chatbot-timestamp">
                      {new Date(user.last_message_time).toLocaleTimeString()}
                    </p>
                    {user.unread_count > 0 && (
                      <span className="admin_chatbot-badge">{user.unread_count}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Khung chat */}
          <div className="col-md-6 col-lg-7 col-xl-8">
            {activeUser ? (
              <>
                <div className="admin_chatbot-header-info d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="admin_chatbot-avatar-container">
                      <img
                        src={activeUser.avatar_url || `https://ui-avatars.com/api/?name=${activeUser.customer_name}`}
                        alt="avatar"
                        className="admin_chatbot-avatar me-3"
                      />
                    </div>
                    <div>
                      <h5 className="admin_chatbot-active-name mb-0">{activeUser.customer_name}</h5>
                    </div>
                  </div>
                </div>

                <div className="admin_chatbot-messages">
                  {chatHistoryLoading ? (
                    <p className="text-muted text-center">Đang tải tin nhắn...</p>
                  ) : chatMessages.length === 0 ? (
                    <p className="text-center text-muted">Chưa có tin nhắn nào.</p>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`admin_chatbot-message-item ${
                          msg.sender === 'admin'
                            ? 'admin_chatbot-message-sent'
                            : 'admin_chatbot-message-received'
                        }`}
                      >
                        {msg.sender !== 'admin' && (
                          <img
                            src={activeUser.avatar_url}
                            alt="avatar"
                            className="admin_chatbot-avatar me-3"
                          />
                        )}
                        <div className="admin_chatbot-message-bubble">
                          <div className="admin_chatbot-message-header">
                            <p className="admin_chatbot-message-sender">{msg.sender}</p>
                            <p className="admin_chatbot-message-time">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="admin_chatbot-message-body">
                            <p className="admin_chatbot-message-text">{msg.message}</p>
                            {msg.attachments?.length > 0 &&
                              msg.attachments.map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`attachment-${i}`}
                                  className="chat-attachment"
                                />
                              ))}
                          </div>
                        </div>
                        {msg.sender === 'admin' && (
                          <img
                            src="/admin-avatar.png"
                            alt="avatar"
                            className="admin_chatbot-avatar ms-3"
                          />
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messageEndRef}></div>
                </div>

                <div className="admin_chatbot-input-container">
                  <textarea
                    className="admin_chatbot-textarea"
                    rows={1}
                    placeholder="Nhập tin nhắn của bạn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button type="button" className="admin_chatbot-send-btn" onClick={handleSend}>
                    <i className="bi bi-send-fill" style={{ color: '#ffffff' }}></i>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center pt-5">
                <h5>Chọn một người dùng để bắt đầu trò chuyện</h5>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatBotAdmin;
