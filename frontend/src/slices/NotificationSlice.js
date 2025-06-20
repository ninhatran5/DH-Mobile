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
      // Transform the response to ensure we have order_id
      const notifications = (response.data.data || []).map(notification => ({
        ...notification,
        order_id: notification.order_id || notification.data?.order_id,
        title: notification.title || notification.data?.message,
        message: notification.message || notification.data?.message
      }));
      return notifications;
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
      const response = await axiosConfig.post('/admin/notifications/readAll', {}, {
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

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notification_id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosConfig.post(`/admin/notifications/read/${notification_id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        return {
          id: notification_id,
          is_read: 1,
          ...response.data
        };
      } else {
        return rejectWithValue('Không thể đánh dấu đã đọc thông báo');
      }
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
      })
      .addCase(markNotificationRead.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, is_read: 1 }
            : notification
        );
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
