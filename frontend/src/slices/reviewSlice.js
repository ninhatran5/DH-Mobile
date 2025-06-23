import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  reviews: null,
  loading: false,
  error: null,
};

export const commentsPost = createAsyncThunk(
  "review/commentsPost",
  async ({ product_id, rating, content }, thunkAPI) => {
    try {
      const response = await axiosConfig.post("/comments", {
        product_id,
        rating,
        content,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(commentsPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(commentsPost.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(commentsPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default reviewSlice.reducer;
