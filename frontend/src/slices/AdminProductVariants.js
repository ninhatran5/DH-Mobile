import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  productVariants: [],
  loading: false,
  error: null,
};

export const fetchAdminProductVariants = createAsyncThunk(
  "adminProductVariants/fetchAdminProductVariants",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosConfig.get("/productvariants");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
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
      // Bắt buộc có product_id trong updatedData
      if (!updatedData.product_id) {
        return rejectWithValue("Trường product_id là bắt buộc");
      }
      const res = await axiosConfig.post(
        `/productvariants/${id}?_method=PUT`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật");
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
      });
  },
});

export default adminProductVariantsSlice.reducer;
