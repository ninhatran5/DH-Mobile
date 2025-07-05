import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  ranks: {},
  loading: false,
  error: null,
};

// CALL API GET PROFILE
export const fetchRank = createAsyncThunk(
  "rank/fetchRank",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosUser.get("/loyalty-summary");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const rankSlice = createSlice({
  name: "rank",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRank.fulfilled, (state, action) => {
        state.loading = false;
        state.ranks = action.payload;
      })
      .addCase(fetchRank.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Đã có lỗi xảy ra";
      });
  },
});

export default rankSlice.reducer;
