import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  news: [],
  loading: false,
  error: null,
};

export const fetchBlogs = createAsyncThunk("blog/fetchBlogs", async () => {
  const response = await axiosUser.get("/news");
  return response.data;
});

export const addBlog = createAsyncThunk(
  "news",
  async ({ title, image_url, content }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("image", image_url);

      const response = await axiosUser.post(`/news`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

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
      })
      .addCase(addBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(addBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.carts = action.payload;
      })
      // call lỗi
      .addCase(addBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default blogSlice.reducer;
