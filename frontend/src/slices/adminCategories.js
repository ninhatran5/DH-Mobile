import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  categories: [],
  trashedCategories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.get("/categories");
      return res.data.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
    }
  }
);

export const fetchTrashedCategories = createAsyncThunk(
  "category/fetchTrashedCategories",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosAdmin.get("/categories/trashed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy danh mục đã xóa");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosAdmin.post(`/categories/${categoryId}?_method=DELETE`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return categoryId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xóa danh mục");
    }
  }
);

export const addCategory = createAsyncThunk(
  "category/addCategory",
  async (newCategory, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }

      const res = await axiosAdmin.post("/categories", newCategory, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi thêm danh mục");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }

      const response = await axiosAdmin.post(`/categories/${id}?_method=PUT`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật danh mục");
    }
  }
);

export const restoreCategory = createAsyncThunk(
  "category/restoreCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");

      await axiosAdmin.put(
        `/categories/restore/${categoryId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return categoryId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi khôi phục danh mục"
      );
    }
  }
);

export const forceDeleteCategory = createAsyncThunk(
  "category/forceDeleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosAdmin.delete(`/categories/forceDelete/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return categoryId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi xóa vĩnh viễn danh mục"
      );
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrashedCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrashedCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.trashedCategories = action.payload;
      })
      .addCase(fetchTrashedCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        const deletedCategory = state.categories.find(
          (cat) => cat.category_id === action.payload
        );
        if (deletedCategory) {
          state.trashedCategories.push(deletedCategory);
        }
        state.categories = state.categories.filter(
          (cat) => cat.category_id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const updatedCategory = action.payload;
        const index = state.categories.findIndex(cat => cat.category_id === updatedCategory.category_id);
        if (index !== -1) {
          state.categories[index] = updatedCategory;
        }
      })
      .addCase(restoreCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.trashedCategories = state.trashedCategories.filter(
          (cat) => cat.category_id !== action.payload
        );
      })
      .addCase(restoreCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(forceDeleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forceDeleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.trashedCategories = state.trashedCategories.filter(
          (cat) => cat.category_id !== action.payload
        );
      })
      .addCase(forceDeleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
