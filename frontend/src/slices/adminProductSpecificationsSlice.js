import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  productSpecifications: [],
  loading: false,
  error: null,
};

// Lấy danh sách
export const fetchAdminProductSpecifications = createAsyncThunk(
  "adminProductSpecifications/fetchAdminProductSpecifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosConfig.get("/productspecifications");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
    }
  }
);

// Thêm mới specification
export const addAdminProductSpecification = createAsyncThunk(
  "adminProductSpecifications/addAdminProductSpecification",
  async (newSpecData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }

      const res = await axiosConfig.post("/productspecifications", newSpecData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi thêm mới");
    }
  }
);

// Cập nhật specification
export const updateAdminProductSpecification = createAsyncThunk(
  "adminProductSpecifications/updateAdminProductSpecification",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }
      if (!updatedData.product_id) {
        return rejectWithValue("Trường product_id là bắt buộc");
      }
      const res = await axiosConfig.post(
        `/productspecifications/${id}?_method=PUT`,
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

// Thêm hàm xóa specification
export const deleteAdminProductSpecification = createAsyncThunk(
  "adminProductSpecifications/deleteAdminProductSpecification",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }

      const res = await axiosConfig.delete(`/productspecifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { id, data: res.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xóa");
    }
  }
);

const adminProductSpecificationsSlice = createSlice({
  name: "adminProductSpecifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProductSpecifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProductSpecifications.fulfilled, (state, action) => {
        state.loading = false;
        state.productSpecifications = action.payload;
      })
      .addCase(fetchAdminProductSpecifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAdminProductSpecification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdminProductSpecification.fulfilled, (state, action) => {
        state.loading = false;
        state.productSpecifications.push(action.payload);
      })
      .addCase(addAdminProductSpecification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminProductSpecification.fulfilled, (state, action) => {
        const updatedSpec = action.payload;
        const index = state.productSpecifications.findIndex(
          (spec) => spec.spec_id === updatedSpec.spec_id
        );
        if (index !== -1) {
          state.productSpecifications[index] = updatedSpec;
        }
      })
      .addCase(updateAdminProductSpecification.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteAdminProductSpecification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminProductSpecification.fulfilled, (state, action) => {
        state.loading = false;
        state.productSpecifications = state.productSpecifications.filter(
          (spec) => spec.spec_id !== action.payload.id
        );
      })
      .addCase(deleteAdminProductSpecification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminProductSpecificationsSlice.reducer;
