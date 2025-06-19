import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

export const fetchAdminOrders = createAsyncThunk(
  "adminOrder/fetchAdminOrders",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosConfig.get(`/admin/orders?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách đơn hàng"
      );
    }
  }
);

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = createAsyncThunk(
  "adminOrder/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosConfig.put(
        `/admin/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi cập nhật trạng thái đơn hàng"
      );
    }
  }
);

// Lấy chi tiết đơn hàng
export const fetchorderdetails = createAsyncThunk(
  "adminOrder/fetchorderdetails",
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosConfig.get(`/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.data?.order) throw new Error("Không có dữ liệu đơn hàng");

      return res.data.order;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Không thể lấy chi tiết đơn hàng"
      );
    }
  }
);


// Slice
const adminOrderSlice = createSlice({
  name: "adminOrder",
  initialState: {
    orders: [],
    order: null, 
    pagination: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Lấy danh sách đơn hàng
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.orders = action.payload.orders || [];
        state.pagination = action.payload.pagination || {};
        state.loading = false;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      // Cập nhật trạng thái đơn hàng
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        if (!updatedOrder || !updatedOrder.order_id) return;

        const index = state.orders.findIndex(o => o?.order_id === updatedOrder.order_id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi cập nhật trạng thái đơn hàng";
      })

      // Lấy chi tiết đơn hàng
      .addCase(fetchorderdetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.order = null;
      })
      .addCase(fetchorderdetails.fulfilled, (state, action) => {
        state.loading = false;
        const orderDetails = action.payload;

        if (!orderDetails || !orderDetails.order_id) {
          console.warn("Dữ liệu đơn hàng không hợp lệ:", orderDetails);
          return;
        }

        const index = state.orders.findIndex(o => o?.order_id === orderDetails.order_id);
        if (index !== -1) {
          state.orders[index] = orderDetails;
        } else {
          state.orders.push(orderDetails); // Nếu chưa có thì thêm vào
        }

        state.order = orderDetails; // Gán vào state.order cho trang chi tiết
      })
      .addCase(fetchorderdetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi lấy chi tiết đơn hàng";
        state.order = null;
      });
  },
});

export default adminOrderSlice.reducer;
