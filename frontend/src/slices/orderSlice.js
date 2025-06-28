import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  orders: [],
  orderDetail: null,
  loading: false,
  error: null,
};

export const fetchOrder = createAsyncThunk(
  "order/fetchOrder",
  async (thunkAPI) => {
    try {
      const response = await axiosUser.get(`/getOrder`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const fetchOrderDetail = createAsyncThunk(
  "order/fetchOrderDetail",
  async (id, thunkAPI) => {
    try {
      const response = await axiosUser.get(`/getDetailOrder/${id}`);
      return response.data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async ({ id, reason }, thunkAPI) => {
    try {
      const response = await axiosUser.post(`/orders/${id}/cancel`, {
        cancel_reason: reason,
      });
      return response.data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const refundOrder = createAsyncThunk(
  "order/refundOrder",
  async ({ id, reason, reasonOther }, thunkAPI) => {
    try {
      const response = await axiosUser.post(`/orders/${id}/request-return`, {
        return_reason: reason,
        return_reason_other: reasonOther,
      });
      return response.data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const receivedOrder = createAsyncThunk(
  "order/receivedOrder",
  async ({ id }, thunkAPI) => {
    try {
      const response = await axiosUser.post(`/orders/${id}/confirm-received`);
      return response.data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const ordersSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetail = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(refundOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundOrder.fulfilled, (state) => {
        state.loading = false;
        state.refundSuccess = true;
      })
      .addCase(refundOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(receivedOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receivedOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(receivedOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default ordersSlice.reducer;
