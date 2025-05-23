// src/slices/categorySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosConfig.get("/categories");
      return res.data.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosConfig.delete(`/categories/${categoryId}`, {
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

      const res = await axiosConfig.post("/categories", newCategory, {
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

      const response = await axiosConfig.post(`/categories/${id}?_method=PUT`, updatedData, {
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

      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
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


  },
});


export default categorySlice.reducer;
