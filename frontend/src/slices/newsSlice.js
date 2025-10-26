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
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi gọi API news"
      );
    }
  }
);

export const getDeletePost = createAsyncThunk(
  "AdminNews/getDeletePost",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.get("/news/trashed");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi gọi API news"
      );
    }
  }
);

export const restoreNews = createAsyncThunk(
  "AdminNews/restoreNews",
  async (newsId, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.put(`/news/restore/${newsId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi tải chi tiết news"
      );
    }
  }
);

export const deletePermanently = createAsyncThunk(
  "AdminNews/deletePermanently",
  async (newsId, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.delete(`/news/forceDelete/${newsId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi tải chi tiết news"
      );
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
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi tải chi tiết news"
      );
    }
  }
);

export const updateNews = createAsyncThunk(
  "AdminNews/updateNews",
  async ({ newsId, title, content, image_url }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image_url) {
        formData.append("image_url", image_url);
      }
      formData.append("_method", "PUT");
      const res = await axiosAdmin.post(`/news/${newsId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi cập nhật news"
      );
    }
  }
);

export const putInTheTrash = createAsyncThunk(
  "AdminNews/putInTheTrash",
  async (newsId, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.delete(`/news/${newsId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi thêm vào thùng rác"
      );
    }
  }
);

const newsSlice = createSlice({
  name: "AdminNews",
  initialState,
  reducers: {
    clearCurrentNews(state) {
      state.current = null;
    },
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
      })

      .addCase(updateNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(putInTheTrash.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(putInTheTrash.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(putInTheTrash.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDeletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.newsList = action.payload;
      })
      .addCase(getDeletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(restoreNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreNews.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(restoreNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deletePermanently.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePermanently.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(deletePermanently.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentNews } = newsSlice.actions;
export default newsSlice.reducer;
