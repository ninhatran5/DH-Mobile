import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

// Lấy danh sách đơn hoàn hàng
export const fetchReturnOrders = createAsyncThunk(
  "adminReturnOrder/fetchReturnOrders",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosConfig.get(`/admin/return-requests`, {
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

// Lấy chi tiết đơn hoàn hàng
export const fetchReturnOrderDetails = createAsyncThunk(
  "adminReturnOrder/fetchReturnOrderDetails",
  async (returnId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosConfig.get(`/admin/return-requests/${returnId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy chi tiết đơn hoàn hàng"
      );
    }
  }
);

// Cập nhật trạng thái đơn hoàn hàng
export const updateReturnOrderStatus = createAsyncThunk(
  "adminReturnOrder/updateReturnOrderStatus",
  async ({ orderId, status }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      let isApproved;
      if (typeof status === 'boolean') {
        isApproved = status;
      } else {
        isApproved = status === 'Đã chấp thuận';
      }

      const response = await axiosConfig.put(
        `/admin/orders/${orderId}/handle-return`,
        { status: isApproved },
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
    total_pages: 0
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

      // Fetch return order details
      .addCase(fetchReturnOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturnOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReturnOrder = action.payload.return_request;
        
        // Update in list if exists
        const index = state.returnOrders.findIndex(
          order => order.return_id === action.payload.return_request.return_id
        );
        if (index !== -1) {
          state.returnOrders[index] = action.payload.return_request;
        }
      })
      .addCase(fetchReturnOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        
        // Update current return order if matches
        if (state.currentReturnOrder?.return_id === returnRequestId) {
          state.currentReturnOrder = {
            ...state.currentReturnOrder,
            status: newStatus,
            refund_amount: refundAmount || state.currentReturnOrder.refund_amount
          };
        }
        
        // Update in list if exists
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