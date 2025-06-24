import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  response: [],
  loading: false,
  error: null,
};

export const chatBotPost = createAsyncThunk(
  "chatbot/postMessage",
  async ({ user_id, message }, thunkAPI) => {
    try {
      const response = await axiosConfig.post("/public/chatbot", {
        user_id,
        message,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const fetchChatBot = createAsyncThunk(
  "chatbot/fetchChatBot",
  async (_, thunkAPI) => {
    try {
      const response = await axiosConfig.get("/public/chatbot/conversation");
      return response.data.conversation;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const chatBotSlice = createSlice({
  name: "chatBot",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(chatBotPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(chatBotPost.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(chatBotPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(fetchChatBot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatBot.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(fetchChatBot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default chatBotSlice.reducer;
