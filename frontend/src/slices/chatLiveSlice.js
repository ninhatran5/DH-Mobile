import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  messages: [],
  loading: false,
  error: null,
  response: null,
  isConnected: false,
};

export const sendChatMessage = createAsyncThunk(
  "chatLive/sendMessage",
  async ({ customer_id, message, sender }, thunkAPI) => {
    try {
      const response = await axiosUser.post("/support-chat/send", {
        customer_id,
        message,
        sender,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  "chatLive/fetchHistory",
  async (_, thunkAPI) => {
    try {
      const response = await axiosUser.get("/public/chatbot/conversation");
      return response.data.conversation;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const chatLiveSlice = createSlice({
  name: "chatLive",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      // Fetch history cases
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload || [];
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default chatLiveSlice.reducer;
