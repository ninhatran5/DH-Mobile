import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  reviews: null,
  loading: false,
  error: null,
};

export const commentsPost = createAsyncThunk(
  "review/commentsPost",
  async ({ variant_id, rating, content, images }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("variant_id", variant_id);
      formData.append("rating", rating);
      formData.append("content", content);
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append("upload_url[]", image.file);
        });
      }
      const response = await axiosUser.post("/comments", formData, {
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

export const fetchComments = createAsyncThunk(
  "review/fetchComments",
  async (id, thunkAPI) => {
    try {
      const response = await axiosUser.get(`/comments/${id}`);
      return response.data.data;
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
      })
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default reviewSlice.reducer;
