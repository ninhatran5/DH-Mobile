import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  newsList: [],
  current: null,
  loading: false,
  error: null,
};

export const fetchNews = createAsyncThunk(
  "AdminNews/fetchNews",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.get("/news");
      return res.data.data;  
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API news");
    }
  }
);

export const fetchNewsById = createAsyncThunk(
  "AdminNews/fetchNewsById",
  async (newsId, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.get(`/news/${newsId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi tải chi tiết news");
    }
  }
);

const newsSlice = createSlice({
  name: "AdminNews",
  initialState,
  reducers: {
    clearCurrentNews(state) {
      state.current = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.newsList = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchNewsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentNews } = newsSlice.actions;
export default newsSlice.reducer;
