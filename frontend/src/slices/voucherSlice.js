import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  vouchers: [],
  appliedVoucher: null,
  loading: false,
  error: null,
};

export const fetchVoucher = createAsyncThunk(
  "voucher/fetchVoucher",
  async () => {
    const response = await axiosUser.get("/voucher");
    return response.data;
  }
);
export const saveVoucher = createAsyncThunk(
  "voucher/saveVoucher",
  async (id, thunkAPI) => {
    try {
      const response = await axiosUser.post(`/save-voucher/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const fetchVoucherForUser = createAsyncThunk(
  "voucher/fetchVoucherForUser",
  async (_, thunkAPI) => {
    try {
      const response = await axiosUser.get(`/list-save-voucher`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const applyVoucher = createAsyncThunk(
  "voucher/applyVoucher",
  async (voucherData, thunkAPI) => {
    try {
      const response = await axiosUser.post(`/voucher/apply`, voucherData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const voucherSlice = createSlice({
  name: "voucher",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
      })
      // call lỗi
      .addCase(fetchVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(saveVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveVoucher.fulfilled, (state, action) => {
        state.loading = false;
        // Chỉ thêm nếu payload là object hợp lệ và có voucher_id
        if (action.payload && action.payload.voucher_id) {
          state.vouchers = Array.isArray(state.vouchers)
            ? [...state.vouchers, action.payload]
            : [action.payload];
        }
      })
      .addCase(saveVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(fetchVoucherForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchVoucherForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload;
      })
      // call lỗi
      .addCase(fetchVoucherForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(applyVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedVoucher = action.payload;
      })
      .addCase(applyVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default voucherSlice.reducer;
