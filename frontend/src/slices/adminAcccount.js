// src/slices/accountSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  accounts: [],
  loading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk(
  "account/fetchAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "/getuser",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data; // trả về mảng accounts
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách tài khoản"
      );
    }
  }
);

const accountSlice = createSlice({
  name: "account",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload || [];
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default accountSlice.reducer;
