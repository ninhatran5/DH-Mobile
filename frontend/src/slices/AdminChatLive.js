import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

// ✅ Initial State
const initialState = {
  chatUsers: [],
  chatUsersLoading: false,
  chatUsersError: null,
  replyLoading: false,
  replyError: null,
  chatHistory: {},
  chatHistoryLoading: false,
  chatHistoryError: null,
};

// ✅ Utility Functions
const normalizeImageData = (attachmentData) => {
  if (!attachmentData) return null;
  
  if (typeof attachmentData === 'object' && attachmentData.file_url) {
    return {
      id: attachmentData.attachment_id || Date.now() + Math.random(),
      attachment_id: attachmentData.attachment_id,
      chat_id: attachmentData.chat_id,
      file_url: attachmentData.file_url,
      url: attachmentData.file_url,
      file_type: attachmentData.file_type || 'image',
      type: attachmentData.file_type || 'image',
      uploaded_at: attachmentData.uploaded_at,
      ...attachmentData
    };
  }
  
  if (typeof attachmentData === 'string') {
    return { 
      id: Date.now() + Math.random(),
      file_url: attachmentData, 
      url: attachmentData,
      type: 'image',
      file_type: 'image'
    };
  }
  
  return null;
};

const getImageUrl = (imageData) => {
  if (!imageData) return null;
  if (typeof imageData === 'string') return imageData;
  if (typeof imageData === 'object') {
    return imageData.file_url || imageData.url || imageData.src || null;
  }
  return null;
};

const normalizeCustomerId = (customerId) => {
  if (typeof customerId === 'string') {
    const parsed = parseInt(customerId, 10);
    return isNaN(parsed) ? customerId : parsed;
  }
  return customerId;
};

const normalizeIsRead = (isRead) => {
  if (typeof isRead === 'boolean') return isRead;
  if (typeof isRead === 'number') return isRead === 1;
  if (isRead === "0" || isRead === 0) return false;
  if (isRead === "1" || isRead === 1) return true;
  return false;
};

const safeDestructure = (payload, defaults = {}) => {
  if (!payload || typeof payload !== 'object') {
    console.warn('⚠️ Invalid payload received:', payload);
    return defaults;
  }
  return { ...defaults, ...payload };
};

export const replyToChat = createAsyncThunk(
  "adminchatLive/replyToChat",
  async (requestPayload, { rejectWithValue }) => {
    try {
      let customer_id = null;
      let message = "";
      let files = [];

      if (requestPayload instanceof FormData) {
        
        // Extract customer_id từ FormData
        customer_id = requestPayload.get('customer_id');
        message = requestPayload.get('message') || "";
        
        // Extract files từ FormData
        const formDataFiles = [];
        for (const [key, value] of requestPayload.entries()) {
          if (key.startsWith('files[') && value instanceof File) {
            formDataFiles.push(value);
          }
        }
        files = formDataFiles;

        console.log("📋 FormData extracted:", {
          customer_id: customer_id,
          customer_id_type: typeof customer_id,
          message: message,
          filesCount: files.length
        });
      } 
      else if (typeof requestPayload === 'object') {
        const payload = safeDestructure(requestPayload);
        customer_id = payload.customer_id;
        message = payload.message || "";
        files = payload.files || [];
      } 
      else {
        console.error("❌ Invalid payload type:", typeof requestPayload);
        return rejectWithValue({ message: "Format dữ liệu không hợp lệ" });
      }

      // ✅ FIXED: Enhanced customer_id validation
      if (!customer_id) {
        console.error("❌ Missing customer_id");
        return rejectWithValue({ message: "ID khách hàng không hợp lệ" });
      }

      const customerIdStr = String(customer_id).trim();
      if (!customerIdStr || customerIdStr === 'null' || customerIdStr === 'undefined') {
        console.error("❌ Invalid customer_id:", customerIdStr);
        return rejectWithValue({ message: "ID khách hàng không hợp lệ" });
      }

      const customerIdNum = parseInt(customerIdStr, 10);
      if (isNaN(customerIdNum) || customerIdNum <= 0) {
        return rejectWithValue({ message: "ID khách hàng phải là số hợp lệ" });
      }

      const cleanMessage = (message || "").trim();
      const hasMessage = cleanMessage.length > 0;
      const hasFiles = files && files.length > 0;
      
      if (!hasMessage && !hasFiles) {
        console.error("❌ No content provided");
      }

      const apiFormData = new FormData();
      apiFormData.append('customer_id', customerIdNum.toString());
      apiFormData.append('message', cleanMessage);

      if (hasFiles) {
        files.forEach((file) => {
          apiFormData.append('attachments[]', file);
        });
      }

      

      // ✅ FIXED: Loại bỏ explicit Content-Type header để browser tự set boundary
      const res = await axiosAdmin.post("/support-chats/reply", apiFormData);
      
      const responseData = res.data?.chat || res.data;
      
      return responseData;

    } catch (err) {
      console.error("❌ SEND ERROR:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data,
        message: err.message
      });
      
      return rejectWithValue({ 
        message: err.response?.data?.message || err.message || "Không thể gửi tin nhắn",
        statusCode: err.response?.status,
        fullError: err.response?.data
      });
    }
  }
);

// ✅ Other async thunks (unchanged)
export const fetchChatUserList = createAsyncThunk(
  "adminchatLive/fetchChatUserList",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosAdmin.get("/support-chats/chat-user-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const customers = (response.data?.customers || []).map(user => ({
        ...user,
        customer_id: normalizeCustomerId(user.customer_id)
      }));
      
      return customers;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách người dùng"
      );
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  "adminchatLive/fetchChatHistory",
  async (customerId, { rejectWithValue }) => {
    try {
      if (!customerId) {
        return rejectWithValue("ID khách hàng không hợp lệ");
      }

      const normalizedCustomerId = normalizeCustomerId(customerId);
      const res = await axiosAdmin.get(`/support-chats/history/${normalizedCustomerId}`);
      
      return {
        customerId: normalizedCustomerId,
        messages: res.data?.chats || [],
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi lấy lịch sử chat");
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  "adminchatLive/getUnreadCount",
  async (customer_id, { rejectWithValue }) => {
    try {
      if (!customer_id) {
        return rejectWithValue("ID khách hàng không hợp lệ");
      }

      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const normalizedCustomerId = normalizeCustomerId(customer_id);
      const response = await axiosAdmin.get(`/support-chats/unread-count/${normalizedCustomerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        customer_id: normalizedCustomerId,
        unread_count: response.data?.unread_count || 0,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi lấy số lượng chưa đọc"
      );
    }
  }
);

// ✅ SLICE DEFINITION
const chatLiveSlice = createSlice({
  name: "adminchatLive",
  initialState,
  reducers: {
    clearChatLiveError: (state) => {
      state.chatUsersError = null;
      state.replyError = null;
      state.chatHistoryError = null;
    },

    reorderChatUsers: (state, action) => {
      const { 
        customer_id = null, 
        last_message = {}, 
        last_message_time = null, 
        last_message_image = null,
        attachments = []
      } = safeDestructure(action.payload, {
        customer_id: null,
        last_message: {},
        last_message_time: null,
        last_message_image: null,
        attachments: []
      });
      
      if (!customer_id) {
        console.warn("⚠️ reorderChatUsers: Missing customer_id");
        return;
      }

      const normalizedCustomerId = normalizeCustomerId(customer_id);
      const userIndex = state.chatUsers.findIndex(
        (user) => normalizeCustomerId(user.customer_id) === normalizedCustomerId
      );
      
      if (userIndex !== -1) {
        const user = state.chatUsers[userIndex];
        
        let displayMessage = last_message.content || "";
        
        if (!displayMessage.trim()) {
          if (last_message_image || last_message.image || attachments.length > 0) {
            displayMessage = "Đã gửi một hình ảnh";
          }
        }
        
        user.last_message = last_message.sender === "admin" 
          ? `Bạn: ${displayMessage}` 
          : displayMessage;
        
        user.last_message_image = last_message_image || 
                                  last_message.image || 
                                  getImageUrl(attachments[0]) || 
                                  null;
        
        if (last_message_time) {
          user.last_message_time = last_message_time;
        }
        
        if (last_message.sender !== "admin") {
          user.unread_count = (user.unread_count || 0) + 1;
        }
        
        state.chatUsers.splice(userIndex, 1);
        state.chatUsers.unshift(user);
      }
    },

    receiveMessageRealtime: (state, action) => {
      const { 
        customer_id = null, 
        message = "", 
        sender = "", 
        created_at = null,
        sent_at = null,
        attachments = [], 
        chat_id = null,
        staff_id = null,
        is_read = false
      } = safeDestructure(action.payload, {
        customer_id: null,
        message: "",
        sender: "",
        created_at: null,
        sent_at: null,
        attachments: [],
        chat_id: null,
        staff_id: null,
        is_read: false
      });
      
      if (!customer_id) {
        console.warn("⚠️ receiveMessageRealtime: Missing customer_id");
        return;
      }

      const normalizedCustomerId = normalizeCustomerId(customer_id);
      
      let imageList = [];
      if (attachments && attachments.length > 0) {
        imageList = attachments.map(normalizeImageData).filter(Boolean);
      }
      
      const cleanMessage = message?.trim() || "";
      const hasText = cleanMessage.length > 0;
      const hasImages = imageList.length > 0;
      
      if (!hasText && !hasImages) {
        console.warn("⚠️ Ignoring message with no content:", action.payload);
        return;
      }

      const newMessage = { 
        id: chat_id || `msg_${Date.now()}_${Math.random()}`,
        chat_id: chat_id,
        customer_id: normalizedCustomerId,
        staff_id: staff_id,
        message: cleanMessage, 
        sender, 
        created_at: created_at || sent_at || new Date().toISOString(),
        sent_at: sent_at || created_at || new Date().toISOString(),
        is_read: normalizeIsRead(is_read),
        attachments: imageList,
        image_url: getImageUrl(imageList[0]) || null
      };

      if (!state.chatHistory[normalizedCustomerId]) {
        state.chatHistory[normalizedCustomerId] = [];
      }

      const existingIndex = state.chatHistory[normalizedCustomerId].findIndex(
        msg => msg.chat_id === newMessage.chat_id
      );
      
      if (existingIndex === -1) {
        state.chatHistory[normalizedCustomerId].push(newMessage);
      }
    },

    clearUnreadCount: (state, action) => {
      const { customer_id = null } = safeDestructure(action.payload, { customer_id: null });
      
      if (!customer_id) {
        console.warn("⚠️ clearUnreadCount: Missing customer_id");
        return;
      }

      const normalizedCustomerId = normalizeCustomerId(customer_id);
      const userIndex = state.chatUsers.findIndex((u) => 
        normalizeCustomerId(u.customer_id) === normalizedCustomerId
      );
      if (userIndex !== -1) {
        state.chatUsers[userIndex].unread_count = 0;
      }
    },

    updateLastMessageImage: (state, action) => {
      const { 
        customer_id = null, 
        image_url = null 
      } = safeDestructure(action.payload, { 
        customer_id: null, 
        image_url: null 
      });
      
      if (!customer_id) {
        console.warn("⚠️ updateLastMessageImage: Missing customer_id");
        return;
      }

      const normalizedCustomerId = normalizeCustomerId(customer_id);
      const userIndex = state.chatUsers.findIndex((u) => 
        normalizeCustomerId(u.customer_id) === normalizedCustomerId
      );
      if (userIndex !== -1) {
        state.chatUsers[userIndex].last_message_image = image_url;
      }
    },
  },

  // ✅ Extra Reducers
  extraReducers: (builder) => {
    builder
      // fetchChatUserList
      .addCase(fetchChatUserList.pending, (state) => {
        state.chatUsersLoading = true;
        state.chatUsersError = null;
      })
      .addCase(fetchChatUserList.fulfilled, (state, action) => {
        state.chatUsersLoading = false;
        const payload = action.payload || [];
        state.chatUsers = Array.isArray(payload) ? payload.map(user => ({
          ...user,
          customer_id: normalizeCustomerId(user.customer_id),
          last_message_image: user.last_message_image || null,
        })) : [];
      })
      .addCase(fetchChatUserList.rejected, (state, action) => {
        state.chatUsersLoading = false;
        state.chatUsersError = action.payload || "Lỗi không xác định";
      })

      // fetchChatHistory
      .addCase(fetchChatHistory.pending, (state) => {
        state.chatHistoryLoading = true;
        state.chatHistoryError = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        const { 
          customerId = null, 
          messages = [] 
        } = safeDestructure(action.payload, { 
          customerId: null, 
          messages: [] 
        });
        
        if (!customerId) {
          console.warn("⚠️ fetchChatHistory.fulfilled: Missing customerId");
          state.chatHistoryLoading = false;
          return;
        }
        
        const normalizedMessages = messages.filter((msg) => {
          const hasText = msg.message?.trim();
          const hasImages = (msg.attachments && msg.attachments.length > 0);
          return hasText || hasImages;
        }).map((msg) => {
          const attachments = (msg.attachments || []).map(normalizeImageData).filter(Boolean);
          
          return {
            ...msg,
            id: msg.chat_id || `msg_${Date.now()}_${Math.random()}`,
            customer_id: normalizeCustomerId(msg.customer_id),
            staff_id: msg.staff_id,
            sender: msg.sender,
            message: msg.message,
            sent_at: msg.sent_at,
            created_at: msg.sent_at || msg.created_at,
            is_read: normalizeIsRead(msg.is_read),
            attachments: attachments,
            image_url: getImageUrl(attachments[0]) || null,
          };
        });
        
        state.chatHistoryLoading = false;
        state.chatHistory = {
          ...state.chatHistory,
          [normalizeCustomerId(customerId)]: normalizedMessages,
        };
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.chatHistoryLoading = false;
        state.chatHistoryError = action.payload || "Lỗi không xác định";
      })

      // ✅ FIXED: replyToChat reducers
      .addCase(replyToChat.pending, (state) => {
        state.replyLoading = true;
        state.replyError = null;
      })
      .addCase(replyToChat.fulfilled, (state, action) => {
        state.replyLoading = false;
        state.replyError = null;
        console.log("✅ Message sent successfully:", action.payload);
      })
      .addCase(replyToChat.rejected, (state, action) => {
        state.replyLoading = false;
        state.replyError = action.payload || "Lỗi không xác định";
        console.error("❌ Failed to send message:", action.payload);
      })

      // getUnreadCount
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        const { 
          customer_id = null, 
          unread_count = 0 
        } = safeDestructure(action.payload, { 
          customer_id: null, 
          unread_count: 0 
        });

        if (!customer_id) return;

        const normalizedCustomerId = normalizeCustomerId(customer_id);
        const userIndex = state.chatUsers.findIndex((u) => 
          normalizeCustomerId(u.customer_id) === normalizedCustomerId
        );
        if (userIndex !== -1) {
          state.chatUsers[userIndex].unread_count = unread_count;
        }
      });
  },
});

export const {
  clearChatLiveError,
  reorderChatUsers,
  receiveMessageRealtime,
  clearUnreadCount,
  updateLastMessageImage,
} = chatLiveSlice.actions;

export default chatLiveSlice.reducer;
