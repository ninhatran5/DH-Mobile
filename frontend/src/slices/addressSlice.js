// src/features/address/addressSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfigAddress } from "../../utils/axiosConfig";

// Fetch tỉnh + huyện
export const fetchAddress = createAsyncThunk(
  "address/fetchAddress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosConfigAddress.get("/", {
        params: { depth: 3 },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi gọi API địa chỉ");
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default addressSlice.reducer;
