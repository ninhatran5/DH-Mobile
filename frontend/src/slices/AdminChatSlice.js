import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  chatbots: [],
  loading: false,
  error: null,
  toggleLoading: false,
  toggleError: null
};

// Fetch all chatbots
export const fetchChatbots = createAsyncThunk(
  "chat/fetchChatbots",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosAdmin.get("/admin/chatbots", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi lấy danh sách chatbot");
    }
  }
);

export const toggleChatbot = createAsyncThunk(
  "chat/toggleChatbot",
  async (chatbotId, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosAdmin.post(`/admin/chatbots/toggle/${chatbotId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(fetchChatbots());
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi thay đổi trạng thái chatbot");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.toggleError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch chatbots
      .addCase(fetchChatbots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatbots.fulfilled, (state, action) => {
        state.loading = false;
        state.chatbots = action.payload.chatbots;
        state.error = null;
      })
      .addCase(fetchChatbots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleChatbot.pending, (state) => {
        state.toggleLoading = true;
        state.toggleError = null;
      })
      .addCase(toggleChatbot.fulfilled, (state) => {
        state.toggleLoading = false;
        state.toggleError = null;
      })
      .addCase(toggleChatbot.rejected, (state, action) => {
        state.toggleLoading = false;
        state.toggleError = action.payload;
      });
  },
});

export const { clearError } = chatSlice.actions;
export default chatSlice.reducer;
