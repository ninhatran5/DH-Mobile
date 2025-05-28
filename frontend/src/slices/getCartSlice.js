import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  news: [],
  loading: false,
  error: null,
};

export const fetchBlogs = createAsyncThunk("blog/fetchBlogs", async () => {
  const response = await axiosConfig.get("/news");
  return response.data;
});

export const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.news = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
      })
      // call lỗi
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default blogSlice.reducer;
