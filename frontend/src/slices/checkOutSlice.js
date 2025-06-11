import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  vnpayUrl: null,
  loading: false,
  error: null,
};

// Gọi API thanh toán VNPAY
export const fetchVnpayCheckout = createAsyncThunk(
  "payment/fetchVnpayCheckout",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosConfig.post("/vnpay/checkout", payload);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra trong quá trình thanh toán"
      );
    }
  }
);

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVnpayCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.vnpayUrl = null;
      })
      .addCase(fetchVnpayCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.vnpayUrl = action.payload_url;
      })
      .addCase(fetchVnpayCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.vnpayUrl = null;
      });
  },
});

export default paymentSlice.reducer;
