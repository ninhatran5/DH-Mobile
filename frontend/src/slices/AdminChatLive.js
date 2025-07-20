import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

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

// Gửi tin nhắn từ admin
export const replyToChat = createAsyncThunk(
  "adminchatLive/replyToChat",
  async ({ customer_id, message, images_base64 = [] }, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.post("/support-chats/reply", {
        customer_id,
        message,
        images_base64,
      });

      return {
        customer_id,
        message: res.data.message,
        images: res.data.images || [],
        created_at: res.data.created_at,
        sender: "admin",
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Gửi tin nhắn thất bại." });
    }
  }
);

// Lấy danh sách người dùng đang chat
export const fetchChatUserList = createAsyncThunk(
  "chatLive/fetchChatUserList",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosAdmin.get("/support-chats/chat-user-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.customers;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách người dùng"
      );
    }
  }
);

// Lấy lịch sử trò chuyện
export const fetchChatHistory = createAsyncThunk(
  "adminchatLive/fetchChatHistory",
  async (customerId, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.get(`/support-chats/history/${customerId}`);
      return {
        customerId,
        messages: res.data.chats,
        sender: "admin",
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi lấy lịch sử chat");
    }
  }
);

const chatLiveSlice = createSlice({
  name: "chatLive",
  initialState,
  reducers: {
    clearChatLiveError: (state) => {
      state.chatUsersError = null;
      state.replyError = null;
      state.chatHistoryError = null;
    },

   receiveMessageRealtime: (state, action) => {
  const { customer_id, message, sender, created_at, attachments = [] } = action.payload;
  if (!message?.trim()) return;

  const msg = { message, sender, created_at, attachments };

  // Khởi tạo lịch sử nếu chưa có
  if (!state.chatHistory[customer_id]) {
    state.chatHistory[customer_id] = [];
  }

  // Kiểm tra trùng tin nhắn
  const isDuplicate = state.chatHistory[customer_id].some(
    (m) =>
      m.message === msg.message &&
      m.created_at === msg.created_at &&
      m.sender === msg.sender
  );

  // Thêm tin nhắn nếu không trùng
  if (!isDuplicate) {
    state.chatHistory[customer_id].push(msg);
  }

  // Tìm user trong danh sách chatUsers
  const userIndex = state.chatUsers.findIndex((u) => u.customer_id === customer_id);

  if (userIndex !== -1) {
    const user = state.chatUsers[userIndex];

    // Cập nhật tin nhắn cuối
    user.last_message = {
      sender,
      content: message,
      created_at,
    };

    // Tăng số lượng chưa đọc nếu không phải admin gửi
    if (sender !== "admin") {
      user.unread_count = user.unread_count ? user.unread_count + 1 : 1;
    }

    // Đưa user lên đầu danh sách
    state.chatUsers.splice(userIndex, 1); 
    state.chatUsers.unshift(user);       
  } else {
    state.chatUsers.unshift({
      customer_id,
      customer_name: `Khách ${customer_id}`,
      avatar_url: "",
      last_message: {
        sender,
        content: message,
        created_at,
      },
      unread_count: sender !== "admin" ? 1 : 0,
    });
  }
},

  },

  extraReducers: (builder) => {
    builder
      // Lấy danh sách người dùng
      .addCase(fetchChatUserList.pending, (state) => {
        state.chatUsersLoading = true;
      })
      .addCase(fetchChatUserList.fulfilled, (state, action) => {
        state.chatUsersLoading = false;
        state.chatUsers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchChatUserList.rejected, (state, action) => {
        state.chatUsersLoading = false;
        state.chatUsersError = action.payload;
      })

      // Lấy lịch sử chat
      .addCase(fetchChatHistory.pending, (state) => {
        state.chatHistoryLoading = true;
        state.chatHistoryError = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        const { customerId, messages } = action.payload;
        const filteredMessages = messages.filter((msg) => msg.message?.trim());
        state.chatHistoryLoading = false;
        state.chatHistory = {
          ...state.chatHistory,
          [customerId]: filteredMessages,
        };
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.chatHistoryLoading = false;
        state.chatHistoryError = action.payload;
      })

      // Gửi tin nhắn từ admin
      .addCase(replyToChat.pending, (state) => {
        state.replyLoading = true;
      })
   .addCase(replyToChat.fulfilled, (state, action) => {
  state.replyLoading = false;

  const {
    customer_id,
    message,
    created_at,
    images = [],
  } = action.payload;

  // Cập nhật lịch sử
  chatLiveSlice.caseReducers.receiveMessageRealtime(state, {
    payload: {
      customer_id,
      message,
      created_at,
      attachments: images,
      sender: "admin",
    },
    type: "chatLive/receiveMessageRealtime",
  });


  
})




      .addCase(replyToChat.rejected, (state, action) => {
        state.replyLoading = false;
        state.replyError = action.payload;
      });
  },
});

export const { clearChatLiveError, receiveMessageRealtime } = chatLiveSlice.actions;
export default chatLiveSlice.reducer;
