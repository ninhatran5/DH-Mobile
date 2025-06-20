import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrder = createAsyncThunk(
  "order/fetchOrder",
  async (thunkAPI) => {
    try {
      const response = await axiosConfig.get(`/getOrder`);
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
      const response = await axiosConfig.get(`/getDetailOrder/${id}`);
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
      const response = await axiosConfig.post(`/orders/${id}/cancel`, {
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

export const ordersSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      // call lỗi
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      // call lỗi
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      // call lỗi
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default ordersSlice.reducer;
