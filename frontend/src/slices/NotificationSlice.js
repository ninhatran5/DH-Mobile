/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosAdmin } from '../../utils/axiosConfig';

// FETCH THÔNG BÁO CHUNG
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosAdmin.get('/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const notifications = (response.data.data || []).map(notification => ({
        ...notification,
        order_id: notification.order_id || notification.data?.order_id,
        title: notification.title || notification.data?.message,
        message: notification.message || notification.data?.message,
        type: 'normal'
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
      const response = await axiosAdmin.post('/admin/notifications/readAll', {}, {
        headers: { Authorization: `Bearer ${token}` },
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
      const response = await axiosAdmin.post(`/admin/notifications/read/${notification_id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.notification || response.data; // fallback
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đọc thông báo');
    }
  }
);

// FETCH THÔNG BÁO HOÀN HÀNG
export const fetchRefundNotifications = createAsyncThunk(
  'notifications/fetchRefundNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosAdmin.get('/return-notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // API trả trực tiếp mảng thông báo
      const rawNotifications = Array.isArray(response.data) ? response.data : [];

      const refundNotifications = rawNotifications.map(notification => ({
        return_notification_id: notification.return_notification_id,  // Sử dụng return_notification_id thay vì return_request_id
        order_id: notification.order_id,
        title: notification.message,
        message: notification.message,
        is_read: notification.is_read,
        created_at: notification.created_at,
        updated_at: notification.updated_at,
        type: 'refund',
        return_request: notification.return_request,
        order: notification.order,
      }));

      return refundNotifications;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông báo hoàn hàng');
    }
  }
);

// ĐÁNH DẤU ĐÃ ĐỌC HOÀN HÀNG
export const markRefundNotificationRead = createAsyncThunk(
  'notifications/markRefundNotificationRead',
  async (return_notification_id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      // đổi sang call API với return_request_id
      const response = await axiosAdmin.post(`/return-notifications/read/${return_notification_id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.notification || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đọc thông báo hoàn hàng');
    }
  }
);

// SLICE
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
      // ==== NOTIFICATIONS ====
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
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification =>
          notification.notification_id === action.payload.notification_id
            ? { ...notification, ...action.payload }
            : notification
        );
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==== REFUND NOTIFICATIONS ====
      .addCase(fetchRefundNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRefundNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const refundNotifications = Array.isArray(action.payload) ? action.payload : [];

        // Xóa các thông báo refund cũ để tránh trùng lặp
        const regularNotifications = state.notifications.filter(n => n.type !== 'refund');

        // Gộp và sort theo created_at desc
        state.notifications = [...regularNotifications, ...refundNotifications]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      })
      .addCase(fetchRefundNotifications.rejected, (state, action) => {
        state.loading = false;
        if (action.error?.message?.includes('404')) {
          console.log('Refund notifications API not implemented yet');
        } else {
          state.error = action.payload;
        }
      })
      .addCase(markRefundNotificationRead.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification =>
          notification.return_notification_id === action.payload.return_notification_id ||
          notification.return_notification_id === action.meta.arg  // Sử dụng arg từ meta để match
            ? { ...notification, is_read: 1, ...action.payload }
            : notification
        );
      })
      .addCase(markRefundNotificationRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
