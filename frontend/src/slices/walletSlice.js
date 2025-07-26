import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  wallets: [],
  balanceFluctuation: [],
  loading: false,
  error: null,
};

export const fetchWallet = createAsyncThunk(
  "wallet/fetchWallet",
  async (_, thunkAPI) => {
    try {
      const response = await axiosUser.get(`/wallet`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const fetchBalanceFluctuation = createAsyncThunk(
  "wallet/fetchBalanceFluctuation",
  async (id, thunkAPI) => {
    try {
      const response = await axiosUser.get(`/wallet/history/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(fetchBalanceFluctuation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalanceFluctuation.fulfilled, (state, action) => {
        state.loading = false;
        // Nếu payload là mảng thì giữ nguyên, nếu là object thì chuyển thành mảng
        if (Array.isArray(action.payload)) {
          state.balanceFluctuation = action.payload;
        } else if (action.payload && typeof action.payload === "object") {
          state.balanceFluctuation = [action.payload];
        } else {
          state.balanceFluctuation = [];
        }
      })
      .addCase(fetchBalanceFluctuation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default walletSlice.reducer;
