import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  chatUsers: [],
  chatUsersLoading: false,
  chatUsersError: null,
  replyLoading: false,
  replyError: null,

  chatHistory: {}, // { customer_id: [messages] }
  chatHistoryLoading: false,
  chatHistoryError: null,
};

// Gửi tin nhắn từ admin
export const replyToChat = createAsyncThunk(
  "chatLive/replyToChat",
  async (
    { customer_id, message, images_base64 = [], socket },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      // eslint-disable-next-line no-unused-vars
      const response = await axiosAdmin.post(
        "/support-chats/reply",
        { customer_id, message, images_base64 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (socket?.emit) {
        socket.emit("chat message", {
          roomId: customer_id.toString(),
          sender: "admin",
          message,
          images: images_base64,
          timestamp: Date.now(),
        });
      }

      return { customer_id, message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi gửi tin nhắn"
      );
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

// Lấy lịch sử trò chuyện của một user
export const fetchChatHistory = createAsyncThunk(
  "chatLive/fetchChatHistory",
  async (customerId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc đã hết hạn");

      const response = await axiosAdmin.get(
        `/support-chats/history/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📥 Server trả về lịch sử chat:", response.data);

      const rawChats = response.data?.chats || [];
      const messages = rawChats.map((msg) => ({
        chat_id: msg.chat_id,
        sender: msg.sender,
        message: msg.message,
        timestamp: new Date(msg.sent_at).getTime(),
        is_read: msg.is_read,
        attachments: msg.attachments || [],
      }));

      return {
        customerId,
        messages,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy lịch sử tin nhắn"
      );
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
  },
  extraReducers: (builder) => {
    builder
      // 🟡 Fetch Chat Users
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

      // 🟢 Fetch Chat History
      .addCase(fetchChatHistory.pending, (state) => {
        state.chatHistoryLoading = true;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        const { customerId, messages } = action.payload;
        state.chatHistoryLoading = false;
        state.chatHistory[customerId] = messages;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.chatHistoryLoading = false;
        state.chatHistoryError = action.payload;
      })

      // 🔵 Reply Chat
      .addCase(replyToChat.pending, (state) => {
        state.replyLoading = true;
      })
      .addCase(replyToChat.fulfilled, (state, action) => {
        state.replyLoading = false;
        const { customer_id, message } = action.payload;
        const newMsg = {
          sender: "admin",
          message,
          timestamp: Date.now(),
          attachments: [],
          is_read: 1,
        };

        if (!state.chatHistory[customer_id]) {
          state.chatHistory[customer_id] = [];
        }

        state.chatHistory[customer_id].push(newMsg);
      })
      .addCase(replyToChat.rejected, (state, action) => {
        state.replyLoading = false;
        state.replyError = action.payload;
      });
  },
});

export const { clearChatLiveError } = chatLiveSlice.actions;
export default chatLiveSlice.reducer;
