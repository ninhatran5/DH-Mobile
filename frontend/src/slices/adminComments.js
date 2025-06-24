import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  comments: [],
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
  loading: false,
  error: null,
  deleteLoading: false,
  deleteError: null
};

// Fetch all comments
export const fetchAdminComments = createAsyncThunk(
  "adminComments/fetchAdminComments",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosConfig.get(`/admin/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi lấy danh sách bình luận");
    }
  }
);

// Delete a comment
export const deleteComment = createAsyncThunk(
  "adminComments/deleteComment",
  async (commentId, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosConfig.delete(`/admin/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh comments list after deletion
      dispatch(fetchAdminComments());
      
      return { commentId, response: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi xóa bình luận");
    }
  }
);

const adminCommentsSlice = createSlice({
  name: "adminComments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.deleteError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments cases
      .addCase(fetchAdminComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminComments.fulfilled, (state, action) => {
        state.comments = action.payload.data;
        state.pagination = {
          current_page: action.payload.current_page || 1,
          total: action.payload.total || 0,
          per_page: action.payload.per_page || 10,
          last_page: action.payload.last_page || 1,
        };
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAdminComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete comment cases
      .addCase(deleteComment.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteComment.fulfilled, (state) => {
        state.deleteLoading = false;
        state.deleteError = null;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearError } = adminCommentsSlice.actions;
export default adminCommentsSlice.reducer;
