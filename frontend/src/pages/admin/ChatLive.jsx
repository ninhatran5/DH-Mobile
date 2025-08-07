/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlinePaperClip } from "react-icons/hi";
import { LuSend } from "react-icons/lu";
import { FaTimes } from "react-icons/fa";
import {
  fetchChatUserList,
  replyToChat,
  fetchChatHistory,
  receiveMessageRealtime,
  getUnreadCount,
  reorderChatUsers,
} from "../../slices/AdminChatLive";
import "../../assets/admin/ChatLiveAdmin.css";
import { fetchProfileAdmin } from "../../slices/adminProfile";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Pusher from "pusher-js";
import sound from "../../assets/sound/anhthanhtinnhanadmin.mp3";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  AiOutlineSearch,
  AiOutlineInfoCircle,
  AiFillInfoCircle,
} from "react-icons/ai";
import Loading from "../../components/Loading";
import Avatar from "../../assets/images/adminacccount.jpg";

const ChatLiveAdmin = () => {
  // ✅ Helper function để remove Vietnamese tones
  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // ✅ Component States
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMessageTerm, setSearchMessageTerm] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [message, setMessage] = useState("");
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // ✅ Refs
  const fileInputRef = useRef(null);
  const messageEndRef = useRef(null);
  const activeUserRef = useRef(null);
  const audioRef = useRef(null);

  // ✅ Redux Selectors
  const { 
    chatUsers, 
    chatUsersLoading, 
    chatHistory, 
    chatHistoryLoading, 
    replyLoading 
  } = useSelector((state) => state.adminchatLive);
  const { adminProfile } = useSelector((state) => state.adminProfile);

  // ✅ Initialize data khi component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      const res = await dispatch(fetchChatUserList());
      if (res.payload && Array.isArray(res.payload)) {
        res.payload.forEach((user) => {
          dispatch(getUnreadCount(user.customer_id));
        });
      }
    };
    
    dispatch(fetchProfileAdmin());
    fetchInitialData();
  }, [dispatch]);

  // ✅ Fetch chat history khi active user thay đổi
  useEffect(() => {
    if (activeUser?.customer_id) {
      dispatch(fetchChatHistory(activeUser.customer_id));
    }
  }, [activeUser?.customer_id, dispatch]);

  // ✅ Update active user ref
  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  // ✅ Get chat messages với memoization
  const chatMessages = useMemo(() => {
    if (!activeUser) return [];
    return chatHistory?.[activeUser.customer_id] || [];
  }, [chatHistory, activeUser]);

  // ✅ Filter messages theo search term
  const filteredMessages = useMemo(() => {
    if (!searchMessageTerm.trim()) return chatMessages;
    const normalizedTerm = removeVietnameseTones(searchMessageTerm.toLowerCase());
    return chatMessages.filter((msg) =>
      removeVietnameseTones((msg.message || "").toLowerCase()).includes(normalizedTerm)
    );
  }, [chatMessages, searchMessageTerm]);

  // ✅ Auto scroll to bottom
  useEffect(() => {
    if (chatMessages.length > 0) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // ✅ Enhanced file validation
  const validateFiles = useCallback((files) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxCount = 5;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (files.length > maxCount) {
      return { valid: false, error: `Tối đa ${maxCount} ảnh mỗi lần!` };
    }

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxSize * maxCount) {
      return { valid: false, error: "Tổng kích thước ảnh quá lớn!" };
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)" };
      }
      if (file.size > maxSize) {
        return { valid: false, error: `File ${file.name} vượt quá 5MB` };
      }
    }
    
    return { valid: true };
  }, []);

  // ✅ Handle file selection
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validation = validateFiles(files);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const fileObjects = files.map((file, index) => ({
      id: `${Date.now()}_${index}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));

    setSelectedFiles(fileObjects);
  }, [validateFiles]);

  // ✅ Remove selected file
  const removeFile = useCallback((fileId) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  // ✅ Cleanup preview URLs
  useEffect(() => {
    return () => {
      selectedFiles.forEach(fileObj => {
        if (fileObj.preview && fileObj.preview.startsWith('blob:')) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });
    };
  }, [selectedFiles]);

  // ✅ Handle message input change với typing indicator
  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    }
  }, [isTyping]);

  // ✅ FIXED: Send message handler - Đã sửa hoàn toàn lỗi customer_id
  const handleSend = useCallback(async () => {
    if (replyLoading) return;
    
    const trimmedMessage = message.trim();
    const hasText = trimmedMessage.length > 0;
    const hasFiles = selectedFiles.length > 0;
    
    if (!hasText && !hasFiles) {
      toast.warning("Vui lòng nhập tin nhắn hoặc chọn ảnh để gửi!");
      return;
    }
    
    // ✅ FIXED: Simplified customer_id validation
    if (!activeUser?.customer_id) {
      toast.error("Vui lòng chọn người dùng để gửi tin nhắn!");
      return;
    }

    try {
      // ✅ FIXED: Tạo FormData với customer_id được xử lý đúng
      const formData = new FormData();
      
      // Đảm bảo customer_id được gửi dưới dạng string
      formData.append('customer_id', String(activeUser.customer_id));
      formData.append('message', trimmedMessage || "");
      
      // ✅ Append files với naming convention đúng
      selectedFiles.forEach((fileObj, index) => {
        formData.append(`files[${index}]`, fileObj.file);
      });

      // ✅ Debug log
      console.log("📤 Sending message:", {
        customer_id: activeUser.customer_id,
        customer_id_in_formdata: formData.get('customer_id'),
        messageLength: trimmedMessage.length,
        filesCount: selectedFiles.length
      });

      // ✅ Dispatch message
      await dispatch(replyToChat(formData)).unwrap();
      
      console.log("✅ Message sent successfully");
      
      // ✅ Reset form state
      setMessage("");
      
      // ✅ Cleanup files
      selectedFiles.forEach(fileObj => {
        if (fileObj.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });
      setSelectedFiles([]);
      
      // ✅ Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (err) {
      console.error("❌ Send error:", err);
      
      const errorMessage = err?.message || 
                          err?.error?.message || 
                          "Không thể gửi tin nhắn. Vui lòng thử lại!";
      
      toast.error(errorMessage);
    }
  }, [activeUser, message, selectedFiles, replyLoading, dispatch]);

  // ✅ Handle logout
  const handleLogout = useCallback(async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn đăng xuất không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminID");
        toast.success("Đăng xuất thành công");
        navigate("/AdminLogin", { replace: true });
      } catch (error) {
        toast.error("Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
      }
    }
  }, [navigate]);

  // ✅ Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // ✅ Format message display helper
  const formatMessageDisplay = useCallback((msg) => {
    const hasText = msg.message && msg.message.trim();
    const hasAttachments = msg.attachments && msg.attachments.length > 0;
    
    return {
      text: hasText ? msg.message.trim() : "",
      images: hasAttachments ? msg.attachments : []
    };
  }, []);

  // ✅ Pusher real-time setup với improved error handling
  useEffect(() => {
    if (!adminProfile?.user?.id) return;

    let pusher;
    let channel;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(sound);
      }

      pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        authEndpoint: `${import.meta.env.VITE_BASE_URL_REAL_TIME}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
        forceTLS: true,
        withCredentials: true,
      });

      channel = pusher.subscribe("private-chat.admin");

      const handleChat = (data) => {
        try {
          if (data.chat.sender_id === adminProfile?.user?.id) return;
          
          const customerId = data.chat?.customer_id;
          const sender = data.chat?.sender;
          const attachments = data.chat?.attachments || [];
          const firstAttachmentUrl = attachments.length > 0 ? attachments[0].file_url : null;

          // Update chat user list
          dispatch(reorderChatUsers({
            customer_id: customerId,
            last_message: {
              sender: sender,
              content: data.chat.message || "",
            },
            last_message_time: data.chat.created_at || new Date().toISOString(),
            last_message_image: firstAttachmentUrl,
            attachments: attachments,
          }));

          // Add to active chat history
          if (activeUserRef.current && customerId === activeUserRef.current.customer_id) {
            dispatch(receiveMessageRealtime({
              ...data.chat,
              attachments: attachments
            }));
          }

          // Play notification sound
          if (sender !== "admin" && sender !== "sale" && audioRef.current) {
            audioRef.current.play().catch((e) => {
              console.warn("Không thể phát âm thanh:", e);
            });
          }
        } catch (error) {
          console.error("Error handling chat message:", error);
        }
      };

      channel.bind("SupportChatSent", handleChat);
      dayjs.extend(utc);
      
      return () => {
        if (channel) {
          channel.unbind("SupportChatSent", handleChat);
          channel.unsubscribe();
        }
        if (pusher) {
          pusher.disconnect();
        }
      };
    } catch (error) {
      console.error("Error setting up Pusher:", error);
      return () => {}; // Return empty cleanup function
    }
  }, [adminProfile?.user?.id, dispatch]);

  return (
    <div className="chat-live-admin-manage-app-wrapper">
      <main className="chat-live-admin-manage-main-content">
        <div className={`chat-live-admin-manage-chat-layout${showDetailPanel ? " chat-live-admin-manage-has-detail-panel" : ""}`}>
          
          {/* ✅ Chat User List */}
          <div className="chat-live-admin-manage-chat-list">
            <header className="chat-live-admin-manage-header">
              <div className="chat-live-admin-manage-header-title chat-live-admin-manage-pointer">
                <div style={{ position: "relative", display: "inline-block" }}>
                  <span
                    className="fw-bold mb-2"
                    style={{ color: "#1e1e1e", cursor: "pointer" }}
                    onClick={() => setShowDropdown(prev => !prev)}
                  >
                    {adminProfile?.user?.username}
                  </span>
                  <IoIosArrowDown
                    className="chat-live-admin-manage-arrow-icon"
                    onClick={() => setShowDropdown(prev => !prev)}
                  />
                  {showDropdown && (
                    <div className="chat-admin-dropdown-menu" style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: 0,
                      minWidth: 140,
                      background: "#fff",
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      zIndex: 100,
                      padding: "8px 0",
                    }}>
                      <button
                        className="chat-admin-dropdown-item"
                        style={{
                          background: "none",
                          border: "none",
                          padding: "10px 20px",
                          textAlign: "left",
                          fontSize: 15,
                          color: "#222",
                          cursor: "pointer",
                          width: "100%",
                        }}
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div className="chat-live-admin-manage-box-search">
              <IoSearchOutline />
              <input
                className="chat-live-admin-manage-search-input"
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="chat-live-admin-manage-chat-list-title mb-1">
              Tin nhắn
            </div>

            <div className="chat-live-admin-manage-chat-list-items">
              {chatUsersLoading && <Loading />}
              {chatUsers
                .filter((user) =>
                  removeVietnameseTones(user.customer_name.toLowerCase())
                    .includes(removeVietnameseTones(searchTerm.toLowerCase()))
                )
                .map((user) => (
                  <div
                    key={user.customer_id}
                    className={`chat-live-admin-manage-chat-item${
                      activeUser?.customer_id === user.customer_id ? " active" : ""
                    }`}
                    onClick={() => setActiveUser(user)}
                  >
                    <div className="chat-live-admin-manage-chat-item-inner">
                      <img
                        src={user.avatar_url || Avatar}
                        alt="avatar"
                        onError={(e) => { e.target.src = Avatar; }}
                      />
                      <div>
                        <div className="chat-live-admin-manage-chat-list-name">
                          {user.customer_name}
                        </div>
                        <div className="chat-live-admin-manage-chat-list-status">
                          {user.last_message_image ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                             
                              <span style={{ color: "#555", fontSize: "13px" }}>
                                {user.last_message || "Đã gửi một hình ảnh"}
                              </span>
                            </div>
                          ) : (
                            <div className="chat-last-message-preview" style={{ color: "#555" }}>
                              {user.last_message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {user.unread_count > 0 && (
                      <span className="chat-live-admin-manage-unread-badge">
                        {user.unread_count > 99 ? "99+" : user.unread_count}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* ✅ Chat Box */}
          <div className="chat-live-admin-manage-chat-box">
            {activeUser ? (
              <>
                <div className="chat-live-admin-manage-chat-box-header">
                  <img 
                    src={activeUser.avatar_url || Avatar} 
                    alt="avatar" 
                    onError={(e) => { e.target.src = Avatar; }}
                  />
                  <div>
                    <div className="chat-live-admin-manage-chat-box-name">
                      {activeUser.customer_name}
                    </div>
                    <div className="chat-live-admin-manage-chat-box-status">
                      @{activeUser.customer_name}
                      {isTyping && <span style={{ marginLeft: "8px", color: "#007bff" }}>đang gõ...</span>}
                    </div>
                  </div>
                  <div className="chat-live-admin-manage-chat-box-actions ms-auto d-flex align-items-center gap-2">
                    <div className="chat-live-admin-manage-pointer" onClick={() => setShowSearch(prev => !prev)}>
                      <AiOutlineSearch size={20} />
                    </div>
                    <div className="chat-live-admin-manage-pointer" onClick={() => setShowDetailPanel(prev => !prev)}>
                      {showDetailPanel ? <AiFillInfoCircle /> : <AiOutlineInfoCircle />}
                    </div>
                  </div>
                </div>

                {showSearch && (
                  <div className="chat-live-admin-manage-chat-search-messages" style={{ padding: "0 12px", marginTop: "8px" }}>
                    <input
                      type="text"
                      placeholder="Tìm trong tin nhắn..."
                      value={searchMessageTerm}
                      onChange={(e) => setSearchMessageTerm(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "12px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                )}

                {/* ✅ Messages */}
                <div className="chat-live-admin-manage-chat-messages">
                  {chatHistoryLoading ? (
                    <p className="text-muted text-center">Đang tải tin nhắn...</p>
                  ) : filteredMessages.length === 0 ? (
                    <p className="text-center text-muted">Chưa có tin nhắn nào.</p>
                  ) : (
                    filteredMessages.map((msg, idx) => {
                      const { text, images } = formatMessageDisplay(msg);
                      if (!text && images.length === 0) return null;

                      const isAdmin = msg.sender === "admin" || msg.sender === "sale";
                      const messageKey = `${msg.chat_id || idx}_${msg.sent_at}`;

                      return (
                        <div className="chat-live-admin-manage-message-group" key={messageKey}>
                          {!isAdmin && (
                            <img
                              src={activeUser.avatar_url || Avatar}
                              alt="avatar"
                              className="chat-live-admin-manage-message-avatar"
                              onError={(e) => { e.target.src = Avatar; }}
                            />
                          )}
                          <div className="chat-live-admin-manage-message-group-inner" style={isAdmin ? { alignItems: "flex-end", width: "100%" } : {}}>
                            <div className={`chat-live-admin-manage-message ${isAdmin ? "right" : "left"}`}>
                              {text && (
                                <div style={{ marginBottom: images.length > 0 ? "8px" : "0" }}>
                                  {text}
                                </div>
                              )}
                              {images.length > 0 && (
                                <div className="chat-message-images" style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                  {images.map((attachment, imgIdx) => (
                                    <img
                                      key={`${attachment.attachment_id || imgIdx}_${attachment.file_url}`}
                                      src={attachment.file_url}
                                      alt="attachment"
                                      style={{
                                        maxWidth: "200px",
                                        maxHeight: "150px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        objectFit: "cover",
                                        border: "1px solid #eee"
                                      }}
                                      onClick={() => window.open(attachment.file_url, '_blank')}
                                      onError={(e) => { e.target.style.display = "none"; }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messageEndRef}></div>
                </div>

                {/* ✅ File preview */}
                {selectedFiles.length > 0 && (
                  <div style={{
                    padding: "8px 12px",
                    borderTop: "1px solid #eee",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    backgroundColor: "#f8f9fa"
                  }}>
                    <div style={{ width: "100%", fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                      {selectedFiles.length} ảnh đã chọn
                    </div>
                    {selectedFiles.map((fileObj) => (
                      <div key={fileObj.id} style={{ position: "relative" }}>
                        <img
                          src={fileObj.preview}
                          alt={fileObj.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #ddd"
                          }}
                        />
                        <button
                          onClick={() => removeFile(fileObj.id)}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            background: "#ff4444",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                         x <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ Message Input */}
                <div className="chat-live-admin-manage-chat-input">
                  <input
                    type="text"
                    placeholder="Nhắn tin..."
                    value={message}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyDown}
                    disabled={replyLoading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="chat-live-admin-manage-pointer chat-live-admin-manage-no-margin-bottom"
                    style={{ 
                      opacity: replyLoading ? 0.5 : 1,
                      pointerEvents: replyLoading ? "none" : "auto"
                    }}
                  >
                    <HiOutlinePaperClip className="chat-live-admin-manage-clip-icon" />
                  </label>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                    disabled={replyLoading}
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={replyLoading}
                    style={{
                      opacity: replyLoading ? 0.6 : 1,
                      cursor: replyLoading ? "not-allowed" : "pointer"
                    }}
                  >
                    {replyLoading ? (
                      <span className="chat_spinner" style={{ width: 20, height: 20, display: "inline-block" }} />
                    ) : (
                      <LuSend className="chat-send-icon" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "calc(87vh)",
                width: "100%",
                padding: "24px 10px",
                boxSizing: "border-box",
              }}>
                <svg
                  style={{
                    marginBottom: "25px",
                    color: "#333",
                    width: "80px",
                    height: "80px",
                    maxWidth: "100%",
                  }}
                  width={80}
                  height={80}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path d="M256.6 8C116.5 8 8 110.3 8 248.6c0 72.3 29.7 134.8 78.1 177.9 8.4 7.5 6.6 11.9 8.1 58.2A19.9 19.9 0 0 0 122 502.3c52.9-23.3 53.6-25.1 62.6-22.7C337.9 521.8 504 423.7 504 248.6 504 110.3 396.6 8 256.6 8zm149.2 185.1l-73 115.6a37.4 37.4 0 0 1 -53.9 9.9l-58.1-43.5a15 15 0 0 0 -18 0l-78.4 59.4c-10.5 7.9-24.2-4.6-17.1-15.7l73-115.6a37.4 37.4 0 0 1 53.9-9.9l58.1 43.5a15 15 0 0 0 18 0l78.4-59.4c10.4-8 24.1 4.5 17.1 15.6z" />
                </svg>
                <h5 style={{
                  fontWeight: 600,
                  fontSize: "clamp(16px,2vw,20px)",
                  marginBottom: 8,
                  color: "#333",
                  textAlign: "center",
                  wordBreak: "break-word",
                }}>
                  Chọn một người dùng để bắt đầu trò chuyện
                </h5>
              </div>
            )}
          </div>

          {showDetailPanel && activeUser && (
            <div className="chat-live-admin-manage-detail-panel">
              <button
                className="chat-live-admin-manage-detail-close-btn"
                onClick={() => setShowDetailPanel(false)}
                aria-label="Đóng"
              />
              <div className="chat-live-admin-manage-detail-header">
                <img
                  src={activeUser.avatar_url || Avatar}
                  alt="avatar"
                  className="chat-live-admin-manage-detail-avatar"
                  onError={(e) => { e.target.src = Avatar; }}
                />
                <div className="chat-live-admin-manage-detail-name">
                  {activeUser.customer_name}
                </div>
                <div className="chat-live-admin-manage-detail-username">
                  @{activeUser.customer_name}
                </div>
              </div>
              <hr className="chat-live-admin-manage-detail-divider" />
              <div className="chat-live-admin-manage-detail-actions">
                <button className="chat-live-admin-manage-detail-block-btn">Chặn</button>
                <button className="chat-live-admin-manage-detail-delete-btn">Xóa đoạn chat</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChatLiveAdmin;
