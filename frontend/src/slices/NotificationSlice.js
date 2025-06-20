import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosConfig } from "../../utils/axiosConfig";

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosConfig.get('/admin/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông báo');
    }
  }
);

export const markNotificationsRead = createAsyncThunk(
  'notifications/markNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosConfig.post('/admin/notifications/read', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đọc thông báo');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      if (!Array.isArray(state.notifications)) state.notifications = [];
      state.notifications.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, is_read: 1 }));
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
