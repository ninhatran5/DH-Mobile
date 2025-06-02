import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  vouchers: [],
  loading: false,
  error: null,
};

export const fetchAdminVouchers = createAsyncThunk(
  "AdminVoucher/fetchAdminVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await axiosConfig.get("/vorchers", {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
    }
  }
);


// Delete voucher
export const deleteAdminVoucher = createAsyncThunk(
  "AdminVoucher/deleteAdminVoucher",
  async (voucherId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosConfig.delete(`/vorchers/${voucherId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return voucherId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xóa voucher");
    }
  }
);

// Add voucher
export const addAdminVoucher = createAsyncThunk(
  "AdminVoucher/addAdminVoucher",
  async (newVoucher, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }

      const res = await axiosConfig.post("/vorchers", newVoucher, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi thêm voucher");
    }
  }
);

// Update voucher
export const updateAdminVoucher = createAsyncThunk(
  "AdminVoucher/updateAdminVoucher",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }

      const response = await axiosConfig.post(`/vorchers/${id}?_method=PUT`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật voucher");
    }
  }
);

const adminVoucherSlice = createSlice({
  name: "AdminVoucher",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAdminVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload;
      })
      .addCase(fetchAdminVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteAdminVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = state.vouchers.filter(
          (voucher) => voucher.vorcher_id !== action.payload
        );
      })
      .addCase(deleteAdminVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addAdminVoucher.fulfilled, (state, action) => {
        state.vouchers.push(action.payload);
      })

      // Update
      .addCase(updateAdminVoucher.fulfilled, (state, action) => {
        const updatedVoucher = action.payload;
        const index = state.vouchers.findIndex(
          (voucher) => voucher.vorcher_id === updatedVoucher.vorcher_id
        );
        if (index !== -1) {
          state.vouchers[index] = updatedVoucher;
        }
      });
  },
});

export default adminVoucherSlice.reducer;
