import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  vouchers: [],
  loading: false,
  error: null,
};

export const fetchVouhcer = createAsyncThunk(
  "vouhcer/fetchVouhcer",
  async () => {
    const response = await axiosConfig.get("/voucher");
    return response.data;
  }
);
export const saveVoucher = createAsyncThunk(
  "vouhcer/saveVoucher",
  async (id, thunkAPI) => {
    try {
      const response = await axiosConfig.post(`/save-voucher/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const fetchVoucerForUser = createAsyncThunk(
  "vouhcer/fetchVoucerForUser",
  async (_, thunkAPI) => {
    try {
      const response = await axiosConfig.get(`/list-save-voucher`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const vouhcerSlice = createSlice({
  name: "vouhcer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchVouhcer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchVouhcer.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
      })
      // call lỗi
      .addCase(fetchVouhcer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(saveVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = Array.isArray(state.vouchers)
          ? [...state.vouchers, action.payload]
          : [action.payload];
      })
      .addCase(saveVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(fetchVoucerForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchVoucerForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload;
      })
      // call lỗi
      .addCase(fetchVoucerForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default vouhcerSlice.reducer;
