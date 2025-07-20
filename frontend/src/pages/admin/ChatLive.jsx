/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlinePaperClip } from "react-icons/hi";
import { LuSend } from "react-icons/lu";
import {
  fetchChatUserList,
  replyToChat,
  fetchChatHistory,
  receiveMessageRealtime,
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
import { AiOutlineSearch, AiOutlineInfoCircle, AiFillInfoCircle } from "react-icons/ai";


const ChatLiveAdmin = () => {
  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { chatUsers, chatUsersLoading, chatHistory, chatHistoryLoading } =
    useSelector((state) => state.adminchatLive);
  const [activeUser, setActiveUser] = useState(null);
  const [message, setMessage] = useState("");
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [sending, setSending] = useState(false);
  const messageEndRef = useRef(null);
 const [showSearch, setShowSearch] = useState(false);



  useEffect(() => {
    const fetchData = async () => {
      const res = await dispatch(fetchChatUserList());
      console.log("Danh sách user từ API:", res.payload);
    };
    fetchData();
  }, [dispatch]);


  useEffect(() => {
    if (activeUser?.customer_id) {
      dispatch(fetchChatHistory(activeUser.customer_id));
    }
  }, [activeUser?.customer_id, dispatch]);


  const chatMessages = useMemo(() => {
    if (!activeUser) return [];
    return chatHistory?.[activeUser.customer_id] || [];
  }, [chatHistory, activeUser]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const [searchMessageTerm, setSearchMessageTerm] = useState("");
  const filteredMessages = useMemo(() => {
    if (!searchMessageTerm.trim()) return chatMessages;

    const normalizedTerm = removeVietnameseTones(searchMessageTerm.toLowerCase());

    return chatMessages.filter((msg) =>
      removeVietnameseTones(msg.message.toLowerCase()).includes(normalizedTerm)
    );
  }, [chatMessages, searchMessageTerm]);

  const handleSend = async () => {
    if (sending || !message.trim() || !activeUser) return;
    setSending(true);

    const payload = {
      customer_id: activeUser.customer_id,
      message,
      images_base64: [],
    };

    try {
      await dispatch(replyToChat(payload)).unwrap();
      setMessage("");
    } catch (err) {
      console.error("Gửi lỗi:", err);
    }

    setSending(false);
  };
  const { adminProfile } = useSelector((state) => state.adminProfile);

  const navigate = useNavigate();

  const handleLogout = async () => {
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
  };

  useEffect(() => {
    dispatch(fetchProfileAdmin());
  }, [dispatch]);

  const activeUserRef = useRef(null);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);


  const audioRef = useRef(null);

  useEffect(() => {
    if (!adminProfile?.user?.id) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(sound);
    }

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
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

    const channel = pusher.subscribe("private-chat.admin");

    const handleChat = (data) => {
      if (data.chat.sender_id === adminProfile?.user?.id) {
        return;
      }
      const customerId = data.chat?.customer_id;
      const sender = data.chat?.sender;

      if (
        activeUserRef.current &&
        customerId === activeUserRef.current.customer_id
      ) {
        dispatch(receiveMessageRealtime(data.chat));
        dispatch({
  type: "adminchatLive/reorderChatUsers",
  payload: {
    customer_id: customerId,
    last_message: {
      sender: data.chat.sender,
      content: data.chat.message,
    },
    last_message_time: new Date().toISOString(),
  },
});

      }

      if (sender !== "admin" && audioRef.current) {
        try {
          audioRef.current.play().catch((e) => {
            console.warn("Không thể phát âm thanh:", e);
          });
        } catch (err) {
          console.error("Lỗi âm thanh:", err);
        }
      }
    };

    channel.bind("SupportChatSent", handleChat);
    dayjs.extend(utc);
    return () => {
      channel.unbind("SupportChatSent", handleChat);
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [adminProfile?.user?.id]);



  return (
    <div className="chat-live-admin-manage-app-wrapper">
      <main className="chat-live-admin-manage-main-content">
        <div
          className={`chat-live-admin-manage-chat-layout${showDetailPanel ? " chat-live-admin-manage-has-detail-panel" : ""
            }`}
        >
          <div className="chat-live-admin-manage-chat-list">
            <header className="chat-live-admin-manage-header">
              <div className="chat-live-admin-manage-header-title chat-live-admin-manage-pointer">
                <div style={{ position: "relative", display: "inline-block" }}>
                  <span
                    className="fw-bold mb-2"
                    style={{ color: "#1e1e1e", cursor: "pointer" }}
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    {adminProfile?.user?.username}
                  </span>
                  <IoIosArrowDown
                    className="chat-live-admin-manage-arrow-icon"
                    onClick={() => setShowDropdown((prev) => !prev)}
                  />
                  {showDropdown && (
                    <div
                      className="chat-admin-dropdown-menu"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        minWidth: 140,
                        background: "#fff",
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        zIndex: 100,
                        padding: "8px 0",
                      }}
                    >
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
              {chatUsersLoading && (
                <div className="text-center p-3">Đang tải danh sách...</div>
              )}
              {chatUsers
                .filter((user) =>
                  removeVietnameseTones(
                    user.customer_name.toLowerCase()
                  ).includes(removeVietnameseTones(searchTerm.toLowerCase()))
                )
                .map((user) => (
                  <div
                    key={user.customer_id}
                    className={`chat-live-admin-manage-chat-item${activeUser?.customer_id === user.customer_id
                        ? " active"
                        : ""
                      }`}
                    onClick={() => setActiveUser(user)}
                  >
               <div className="chat-live-admin-manage-chat-item-inner">
  <img src={user.avatar_url || "/default-avatar.png"} alt="avatar" />
  <div>
    <div className="chat-live-admin-manage-chat-list-name">
      {user.customer_name}
    </div>

    <div className="chat-live-admin-manage-chat-list-status">
      <div className="chat-last-message-preview" style={{ color: "#555" }}>
       { user.last_message}
      </div>
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
          {/* Chat Box */}
         <div className="chat-live-admin-manage-chat-box">
  {activeUser ? (
    <>
      <div className="chat-live-admin-manage-chat-box-header">
        <img src={activeUser.avatar_url} alt="avatar" />
        <div>
          <div className="chat-live-admin-manage-chat-box-name">
            {activeUser.customer_name}
          </div>
          <div className="chat-live-admin-manage-chat-box-status">
            @{activeUser.customer_name}
          </div>
        </div>

        {/* Nút action bên phải */}
        <div className="chat-live-admin-manage-chat-box-actions ms-auto d-flex align-items-center gap-2">
          {/* Nút tìm kiếm */}
          <div
            className="chat-live-admin-manage-pointer"
            onClick={() => setShowSearch((prev) => !prev)}
          >
            <AiOutlineSearch size={20} />
          </div>

          {/* Nút chi tiết người dùng */}
          <div
            className="chat-live-admin-manage-pointer"
            onClick={() => setShowDetailPanel((prev) => !prev)}
          >
            {showDetailPanel ? <AiFillInfoCircle /> : <AiOutlineInfoCircle />}
          </div>
        </div>
      </div>

      {/* Form tìm kiếm chỉ hiện khi showSearch = true */}
      {showSearch && (
        <div
          className="chat-live-admin-manage-chat-search-messages"
          style={{ padding: "0 12px", marginTop: "8px" }}
        >
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

      {/* Danh sách tin nhắn */}
      <div className="chat-live-admin-manage-chat-messages">
        {chatHistoryLoading ? (
          <p className="text-muted text-center">Đang tải tin nhắn...</p>
        ) : filteredMessages.length === 0 ? (
          <p className="text-center text-muted">Chưa có tin nhắn nào.</p>
        ) : (
          filteredMessages.map((msg, idx) =>
            msg.sender !== "admin" ? (
              <div className="chat-live-admin-manage-message-group" key={idx}>
                <img
                  src={activeUser.avatar_url}
                  alt="avatar"
                  className="chat-live-admin-manage-message-avatar"
                />
                <div className="chat-live-admin-manage-message-group-inner">
                  <div className="chat-live-admin-manage-message left">
                    {msg.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="chat-live-admin-manage-message-group" key={idx}>
                <div
                  className="chat-live-admin-manage-message-group-inner"
                  style={{ alignItems: "flex-end", width: "100%" }}
                >
                  <div className="chat-live-admin-manage-message right">
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          )
        )}
        <div ref={messageEndRef}></div>
      </div>

      {/* Ô nhập tin nhắn */}
      <div className="chat-live-admin-manage-chat-input">
        <input
          type="text"
          placeholder="Nhắn tin..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <label
          htmlFor="file-upload"
          className="chat-live-admin-manage-pointer chat-live-admin-manage-no-margin-bottom"
        >
          <HiOutlinePaperClip className="chat-live-admin-manage-clip-icon" />
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".jpg,.jpeg,.png"
          style={{ display: "none" }}
        />
        <button onClick={handleSend} disabled={sending}>
          {sending ? (
            <span
              className="chat_spinner"
              style={{
                width: 20,
                height: 20,
                display: "inline-block",
              }}
            />
          ) : (
            <LuSend className="chat-send-icon" />
          )}
        </button>
      </div>
    </>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(87vh)",
        width: "100%",
        padding: "24px 10px",
        boxSizing: "border-box",
      }}
    >
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
      <h5
        style={{
          fontWeight: 600,
          fontSize: "clamp(16px,2vw,20px)",
          marginBottom: 8,
          color: "#333",
          textAlign: "center",
          wordBreak: "break-word",
        }}
      >
        Chọn một người dùng để bắt đầu trò chuyện
      </h5>
    </div>
  )}
</div>


          {/* Detail Panel */}
          {showDetailPanel && activeUser && (
            <div className="chat-live-admin-manage-detail-panel">
              <button
                className="chat-live-admin-manage-detail-close-btn"
                onClick={() => setShowDetailPanel(false)}
                aria-label="Đóng"
              ></button>
              <div className="chat-live-admin-manage-detail-header">
                <img
                  src={activeUser.avatar_url}
                  alt="avatar"
                  className="chat-live-admin-manage-detail-avatar"
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
                <button className="chat-live-admin-manage-detail-block-btn">
                  Chặn
                </button>
                <button className="chat-live-admin-manage-detail-delete-btn">
                  Xóa đoạn chat
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChatLiveAdmin;
