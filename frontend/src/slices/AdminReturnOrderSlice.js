import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

// Lấy danh sách đơn hoàn hàng
export const fetchReturnOrders = createAsyncThunk(
  "adminReturnOrder/fetchReturnOrders",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosAdmin.get(`/admin/return-requests`, {
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


// Lấy chi tiết đơn hoàn hàng theo ID
export const fetchReturnOrderById = createAsyncThunk(
  "adminReturnOrder/fetchReturnOrderById",
  async (returnId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosAdmin.get(`/admin/orders/return-orders/${returnId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      

      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy chi tiết đơn hoàn hàng"
      );
    }
  }
);

export const updateReturnOrderStatus = createAsyncThunk(
  "adminReturnOrder/updateReturnOrderStatus",
  async ({ returnId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");
      const response = await axiosAdmin.put(
        `/admin/orders/${returnId}/handle-return`,
        { status }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái đơn hoàn hàng"
      );
    }
  }
);

const initialState = {
  returnOrders: [],
  currentReturnOrder: null,
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 10,
    total_pages: 0,
  },
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null
};

const adminReturnOrderSlice = createSlice({
  name: "adminReturnOrder",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch return orders list
      .addCase(fetchReturnOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturnOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.returnOrders = action.payload.return_requests || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchReturnOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      

      // Fetch return order by ID
      .addCase(fetchReturnOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(fetchReturnOrderById.fulfilled, (state, action) => {
  state.loading = false;
  state.currentReturnOrder = action.payload; // Chính xác vì bạn return response.data.order
})


      // Update return order status
      .addCase(updateReturnOrderStatus.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateReturnOrderStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const returnRequestId = action.payload.return_request_id;
        const newStatus = action.payload.return_request_status;
        const refundAmount = action.payload.refund_amount;
        
        // Update nested currentReturnOrder -> order.return_requests if present
        if (state.currentReturnOrder) {
          const orderObj = state.currentReturnOrder.order || state.currentReturnOrder;
          if (Array.isArray(orderObj.return_requests)) {
            const idx = orderObj.return_requests.findIndex(r => r.return_id === returnRequestId);
            if (idx !== -1) {
              orderObj.return_requests[idx] = {
                ...orderObj.return_requests[idx],
                status: newStatus,
                refund_amount: refundAmount || orderObj.return_requests[idx].refund_amount,
              };
            }
          }
        }
        
        // Update flat list of return orders (if present in this slice)
        state.returnOrders = state.returnOrders.map(order =>
          order.return_id === returnRequestId
            ? {
                ...order,
                status: newStatus,
                refund_amount: refundAmount || order.refund_amount
              }
            : order
        );
      })
      
      .addCase(updateReturnOrderStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { clearErrors } = adminReturnOrderSlice.actions;
export default adminReturnOrderSlice.reducer;