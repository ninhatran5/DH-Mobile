import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  productVariants: [],
  loading: false,
  error: null,
};

export const fetchAdminProductVariants = createAsyncThunk(
  "adminProductVariants/fetchAdminProductVariants",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.get("/productvariants");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
    }
  }
);

export const addAdminProductVariant = createAsyncThunk(
  "adminProductVariants/addAdminProductVariant",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }

      const res = await axiosAdmin.post("/productvariants", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": formData instanceof FormData ? "multipart/form-data" : "application/json",
        },
      });
      console.log("Submitting variant data:", formData);
      console.log("DATA GỬI LÊN:", formData);

      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi thêm biến thể");
    }
  }
);

// Cập nhật productVariant
export const updateAdminProductVariant = createAsyncThunk(
  "adminProductVariants/updateAdminProductVariant",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }

      let payload;
      let contentType;

      if (updatedData instanceof FormData) {
        // Validate FormData fields
        if (!updatedData.get('product_id') || !updatedData.get('sku') || !updatedData.get('price')) {
          return rejectWithValue("Thiếu thông tin bắt buộc (product_id, sku, price)");
        }
        payload = updatedData;
        contentType = "multipart/form-data";
      } else {
        // Validate regular object fields
        if (!updatedData.product_id || !updatedData.sku || !updatedData.price) {
          return rejectWithValue("Thiếu thông tin bắt buộc (product_id, sku, price)");
        }
        // If not FormData, convert numeric fields
        payload = {
          ...updatedData,
          product_id: parseInt(updatedData.product_id),
          price: parseFloat(updatedData.price),
          price_original: updatedData.price_original ? parseFloat(updatedData.price_original) : null,
          stock: parseInt(updatedData.stock || 0),
          is_active: updatedData.is_active ? 1 : 0
        };
        contentType = "application/json";
      }

      const res = await axiosAdmin.post(
        `/productvariants/${id}?_method=PUT`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": contentType
          }
        }
      );

      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật");
    }
  }
);

// Thêm action xóa variant
export const deleteAdminProductVariant = createAsyncThunk(
  "adminProductVariants/deleteAdminProductVariant",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosAdmin.delete(`/productvariants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xóa biến thể");
    }
  }
);

const adminProductVariantsSlice = createSlice({
  name: "adminProductVariants",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProductVariants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProductVariants.fulfilled, (state, action) => {
        state.loading = false;
        state.productVariants = action.payload;
      })
      .addCase(fetchAdminProductVariants.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.payload;
      })
      .addCase(addAdminProductVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdminProductVariant.fulfilled, (state, action) => {
        state.loading = false;
        state.productVariants.push(action.payload);
      })
      .addCase(addAdminProductVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminProductVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminProductVariant.fulfilled, (state, action) => {
        state.loading = false;
        const updatedVariant = action.payload;
        const index = state.productVariants.findIndex(
          (variant) => variant.variant_id === updatedVariant.variant_id
        );
        if (index !== -1) {
          state.productVariants[index] = updatedVariant;
        }
      })
      .addCase(updateAdminProductVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete cases
      .addCase(deleteAdminProductVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminProductVariant.fulfilled, (state, action) => {
        state.loading = false;
        state.productVariants = state.productVariants.filter(
          (variant) => variant.variant_id !== action.payload
        );
      })
      .addCase(deleteAdminProductVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminProductVariantsSlice.reducer;
