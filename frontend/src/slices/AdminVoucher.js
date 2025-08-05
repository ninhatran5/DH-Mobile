import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  vouchers: [],
  trashedVouchers: [],
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  }
};

export const fetchAdminVouchers = createAsyncThunk(
  "AdminVoucher/fetchAdminVouchers",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosAdmin.get(`/voucher?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return {
        vouchers: res.data.data,
        pagination: res.data.meta
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
    }
  }
);

// Các action khác giữ nguyên...
export const fetchTrashedVouchers = createAsyncThunk(
  "AdminVoucher/fetchTrashedVouchers",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosAdmin.get(`/voucher/trashed?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return {
        vouchers: res.data.data,
        pagination: res.data.meta
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy danh sách voucher đã xoá");
    }
  }
);

// Các thunk khác giữ nguyên...
export const deleteAdminVoucher = createAsyncThunk(
  "AdminVoucher/deleteAdminVoucher",
  async (voucherId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosAdmin.delete(`/voucher/${voucherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return voucherId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xoá voucher");
    }
  }
);

export const forceDeleteAdminVoucher = createAsyncThunk(
  "AdminVoucher/forceDeleteAdminVoucher",
  async (voucherId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosAdmin.delete(`/voucher/force-delete/${voucherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return voucherId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xoá vĩnh viễn voucher");
    }
  }
);

export const addAdminVoucher = createAsyncThunk(
  "AdminVoucher/addAdminVoucher",
  async (newVoucher, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosAdmin.post("/voucher", newVoucher, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi thêm voucher");
    }
  }
);

export const addVoucherPercent = createAsyncThunk(
  "AdminVoucher/addVoucherPercent",
  async (voucherData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const data = {
        ...voucherData,
        discount_type: "percent",
      };
      const res = await axiosAdmin.post("/voucher-percent", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi thêm voucher phần trăm");
    }
  }
);

export const updateAdminVoucher = createAsyncThunk(
  "AdminVoucher/updateAdminVoucher",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosAdmin.post(`/voucher/${id}?_method=PUT`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật voucher");
    }
  }
);

export const restoreAdminVoucher = createAsyncThunk(
  "AdminVoucher/restoreAdminVoucher",
  async (voucherId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosAdmin.put(`/voucher/restore/${voucherId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi khôi phục voucher");
    }
  }
);

const adminVoucherSlice = createSlice({
  name: "AdminVoucher",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch vouchers - Cập nhật để handle pagination
      .addCase(fetchAdminVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload.vouchers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch trashed vouchers - Cập nhật để handle pagination
      .addCase(fetchTrashedVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrashedVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.trashedVouchers = action.payload.vouchers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTrashedVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete voucher
      .addCase(deleteAdminVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = state.vouchers.filter(
          (voucher) => voucher.voucher_id !== action.payload
        );
      })
      .addCase(deleteAdminVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Các case khác giữ nguyên...
      .addCase(forceDeleteAdminVoucher.fulfilled, (state, action) => {
        state.trashedVouchers = state.trashedVouchers.filter(
          (voucher) => voucher.voucher_id !== action.payload
        );
      })
      .addCase(forceDeleteAdminVoucher.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(addAdminVoucher.fulfilled, (state, action) => {
        state.vouchers.push(action.payload);
      })

      .addCase(addVoucherPercent.fulfilled, (state, action) => {
        state.vouchers.push(action.payload);
      })
      .addCase(addVoucherPercent.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateAdminVoucher.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.vouchers.findIndex(
          (v) => v.voucher_id === updated.voucher_id
        );
        if (index !== -1) {
          state.vouchers[index] = updated;
        }
      })

      .addCase(restoreAdminVoucher.fulfilled, (state, action) => {
        const restored = action.payload;
        state.trashedVouchers = state.trashedVouchers.filter(
          (v) => v.voucher_id !== restored.voucher_id
        );
        state.vouchers.push(restored);
      })
      .addCase(restoreAdminVoucher.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default adminVoucherSlice.reducer;
