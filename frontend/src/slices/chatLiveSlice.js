import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";
import dataURLtoFile from "../../utils/dataURLtoFile";

const initialState = {
  messages: [],
  loading: false,
  error: null,
  response: null,
  isConnected: false,
};

export const sendChatMessage = createAsyncThunk(
  "chatLive/sendMessage",
  async ({ customer_id, message, sender, attachments }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("customer_id", customer_id);
      formData.append("message", message);
      formData.append("sender", sender);
      attachments.forEach((imgBase64, i) => {
        const file = dataURLtoFile(imgBase64, `attachment-${i}.png`);
        formData.append("attachments[]", file);
      });

      const response = await axiosUser.post("/support-chats/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);


export const fetchChatMessage = createAsyncThunk(
  "chatLive/fetchChatMessage",
  async (customer_id, thunkAPI) => {
    try {
      const response = await axiosUser.get(
        `/support-chats/history/${customer_id}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  "chatLive/markMessageAsRead",
  async ({ customer_id }, thunkAPI) => {
    try {
      const response = await axiosUser.post("/support-chats/mark-as-read", {
        customer_id,
      });
      return response.data;
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
      .addCase(fetchChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload?.data || [];
      })
      .addCase(fetchChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      // Mark as read cases
      .addCase(markMessageAsRead.pending, (state) => {
        state.error = null;
      })
      // eslint-disable-next-line no-unused-vars
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        // Có thể cập nhật trạng thái messages nếu cần
      })
      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default chatLiveSlice.reducer;
