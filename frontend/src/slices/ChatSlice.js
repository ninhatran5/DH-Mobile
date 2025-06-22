import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  chatbots: [],
  loading: false,
  error: null
};

// Fetch all chatbots
export const fetchChatbots = createAsyncThunk(
  "chat/fetchChatbots",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosConfig.get("/admin/chatbots", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi lấy danh sách chatbot");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
        // Lấy mảng chatbots từ response data
        state.chatbots = action.payload.chatbots;
        state.error = null;
      })
      .addCase(fetchChatbots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = chatSlice.actions;
export default chatSlice.reducer;
