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
    console.log("✉️ Gửi tin nhắn tới:", customer_id);
    try {
      const res = await axiosAdmin.post("/support-chats/reply", {
        customer_id,
        message,
        images_base64,
      });

      console.log("Tin nhắn gửi thành công:", res.data);

      return {
        customer_id,
        message: res.data.message,
        images: res.data.images || [],
        created_at: res.data.created_at, 
        sender: "admin",
      };
    } catch (err) {
      console.error(" Lỗi khi gửi tin nhắn:", err.response?.data || err.message);
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

// Lấy lịch sử trò chuyện của một user
export const fetchChatHistory = createAsyncThunk(
  "adminchatLive/fetchChatHistory",
  async (customerId, { rejectWithValue }) => {
console.log("📦 Gọi API lấy lịch sử chat của:", customerId);
    try {
      const res = await axiosAdmin.get(`/support-chats/history/${customerId}`);
      console.log("🧾 Nội dung response:", res.data.chats);
      return {
        customerId,
        messages: res.data.chats,
        sender: "admin",
      };
    } catch (err) {
      return rejectWithValue(err.response.data);
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

    if (!state.chatHistory[customer_id]) {
      state.chatHistory[customer_id] = [];
    }

    const isDuplicate = state.chatHistory[customer_id].some(
      (m) =>
        m.message === msg.message &&
        m.created_at === msg.created_at &&
        m.sender === msg.sender
    );

    if (!isDuplicate) {
      state.chatHistory[customer_id].push(msg);
    }
    const userIndex = state.chatUsers.findIndex(u => u.customer_id === customer_id);
  if (userIndex !== -1) {
    state.chatUsers[userIndex].last_message = {
  sender,
  content: message,
  created_at,
};

  }
  }
  
}
,
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



      // 🔵 Reply Chat
      .addCase(replyToChat.pending, (state) => {
        state.replyLoading = true;
      })
   .addCase(replyToChat.fulfilled, (state, action) => {
  state.replyLoading = false;

  // Dùng lại reducer để tránh lặp code
  chatLiveSlice.caseReducers.receiveMessageRealtime(state, {
    payload: {
      customer_id: action.payload.customer_id,
      message: action.payload.message,
      created_at: action.payload.created_at,
      attachments: action.payload.images || [],
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
