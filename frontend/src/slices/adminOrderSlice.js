import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

// Fetch danh sách đơn hàng (kèm completedOrders)
export const fetchAdminOrders = createAsyncThunk(
  "adminOrder/fetchAdminOrders",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosAdmin.get(`/admin/orders?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allOrders = response.data.orders || [];
      const completedOrders = allOrders.filter(
  (order) => order.status?.toLowerCase().trim() === "hoàn thành"
);


      return {
        orders: allOrders,
        completedOrders,
        pagination: response.data.pagination || {},
      };
      
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
      const response = await axiosAdmin.put(
        `/admin/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data && response.data.order) {
        return response.data.order;
      } else {
        return rejectWithValue("Không nhận được dữ liệu đơn hàng từ server");
      }
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
      const res = await axiosAdmin.get(`/admin/orders/${orderId}`, {
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

// Lấy danh sách đơn hoàn hàng
export const fetchReturnOrders = createAsyncThunk(
  "adminOrder/fetchReturnOrders",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosAdmin.get(`/admin/return-orders?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách đơn hoàn hàng"
      );
    }
  }
);

// Huỷ đơn hàng
export const cancelOrder = createAsyncThunk(
  "adminOrder/cancelOrder",
  async ({ orderId, cancel_reason }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosAdmin.post(
        `/admin/orders/${orderId}/cancel`,
        { cancel_reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data && response.data.order) {
        return response.data.order;
      } else {
        return rejectWithValue("Không nhận được dữ liệu đơn hàng từ server");
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi huỷ đơn hàng"
      );
    }
  }
);

// Slice
const adminOrderSlice = createSlice({
  name: "adminOrder",
  initialState: {
    orders: [],
    completedOrders: [],
    order: null,
    returnOrders: [],
    returnOrdersPagination: {},
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
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.completedOrders = action.payload.completedOrders || [];
        state.pagination = action.payload.pagination || {};
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

        state.orders = state.orders.map(order =>
          order?.order_id === updatedOrder.order_id
            ? { ...order, ...updatedOrder }
            : order
        );

        // Cập nhật lại completedOrders
        state.completedOrders = state.orders.filter(
          (order) => order.status?.toLowerCase() === "completed"
        );

        if (state.order && state.order.order_id === updatedOrder.order_id) {
          state.order = { ...state.order, ...updatedOrder };
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi cập nhật trạng thái đơn hàng";
        console.error('Lỗi khi cập nhật trạng thái:', action.payload);
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

        if (!orderDetails || !orderDetails.order_id) return;

        const index = state.orders.findIndex(o => o?.order_id === orderDetails.order_id);
        if (index !== -1) {
          state.orders[index] = orderDetails;
        } else {
          state.orders.push(orderDetails);
        }

        // Cập nhật lại completedOrders
        state.completedOrders = state.orders.filter(
          (order) => order.status?.toLowerCase() === "hoàn thành"
        );

        state.order = orderDetails;
      })
      .addCase(fetchorderdetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi lấy chi tiết đơn hàng";
        state.order = null;
      })

      // Đơn hoàn hàng
      .addCase(fetchReturnOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturnOrders.fulfilled, (state, action) => {
        state.returnOrders = action.payload.orders || [];
        state.returnOrdersPagination = action.payload.pagination || {};
        state.loading = false;
      })
      .addCase(fetchReturnOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi lấy danh sách đơn hoàn hàng";
      })

      // Huỷ đơn hàng
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        state.orders = state.orders.map(order =>
          order?.order_id === updatedOrder.order_id
            ? { ...order, ...updatedOrder }
            : order
        );
        // Cập nhật lại completedOrders
        state.completedOrders = state.orders.filter(
          (order) => order.status?.toLowerCase() === "completed"
        );
        if (state.order && state.order.order_id === updatedOrder.order_id) {
          state.order = { ...state.order, ...updatedOrder };
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi huỷ đơn hàng";
      });
  },
});

export default adminOrderSlice.reducer;
