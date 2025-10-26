import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  vnpayUrl: null,
  cod: null,
  wallet: null,
  loading: false,
  error: null,
};

export const fetchVnpayCheckout = createAsyncThunk(
  "payment/fetchVnpayCheckout",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosUser.post("/vnpay/checkout", payload);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra trong quá trình thanh toán"
      );
    }
  }
);

export const fetchCODCheckout = createAsyncThunk(
  "payment/fetchCODCheckout",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosUser.post("/codpay/checkout", payload);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra trong quá trình thanh toán"
      );
    }
  }
);

export const fetchWalletCheckout = createAsyncThunk(
  "payment/fetchWalletCheckout",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosUser.post("/wallet/pay", payload);
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
      })
      .addCase(fetchCODCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCODCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.cod = action.payload;
      })
      .addCase(fetchCODCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(fetchWalletCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchWalletCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default paymentSlice.reducer;
