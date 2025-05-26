import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  blogDetails: [],
  loading: false,
  error: null,
};

///CALL API BANNER
export const fetchBlogDetail = createAsyncThunk(
  "blogDetail/fetchProductDetail",
  async (id) => {
    const response = await axiosConfig.get(`/news/${id}`);
    return response.data.data;
  }
);

export const blogDetailSlice = createSlice({
  name: "blogDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchBlogDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchBlogDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.blogDetails = action.payload;
      })
      // call lỗi
      .addCase(fetchBlogDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default blogDetailSlice.reducer;
