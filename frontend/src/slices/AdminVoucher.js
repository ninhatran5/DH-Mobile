import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  vouchers: [],
  trashedVouchers: [],
  loading: false,
  error: null,
  trashedCount: 0, // Thêm field để đếm số voucher đã xóa
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  }
};

// Các async thunks giữ nguyên...
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

export const fetchTrashedVouchers = createAsyncThunk(
  "AdminVoucher/fetchTrashedVouchers",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      // Debug logs
      console.log("🔍 Fetching trashed vouchers...");
      console.log("📄 Page:", page);
      console.log("🔑 Token exists:", !!token);
      console.log("🌐 API URL:", `/voucher/trashed?page=${page}`);
      
      if (!token) {
        throw new Error("Token không tồn tại");
      }

      const res = await axiosAdmin.get(`/voucher/trashed?page=${page}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      console.log("✅ API Response:", res.data);
      console.log("📊 Meta data:", res.data.meta);
      console.log("📝 Data:", res.data.data);

      // Validate response structure
      if (!res.data) {
        throw new Error("Response data is empty");
      }

      return {
        vouchers: res.data.data || [],
        pagination: res.data.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0
        },
        trashedCount: res.data.meta?.total || 0
      };
    } catch (err) {
      console.error("❌ Fetch trashed vouchers error:", err);
      console.error("📋 Error details:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });

      // Handle specific error cases
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken'); // Clear invalid token
        return rejectWithValue("Token hết hạn. Vui lòng đăng nhập lại.");
      }
      
      if (err.response?.status === 404) {
        return rejectWithValue("API endpoint không tồn tại. Kiểm tra server.");
      }
      
      if (err.response?.status === 500) {
        return rejectWithValue("Lỗi server. Vui lòng thử lại sau.");
      }

      return rejectWithValue(
        err.response?.data?.message || 
        err.message ||
        "Lỗi khi lấy danh sách voucher đã xoá"
      );
    }
  }
);


// Các async thunks khác giữ nguyên...
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
      // Fetch vouchers
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

      // Fetch trashed vouchers - Cập nhật để đếm số voucher đã xóa
      .addCase(fetchTrashedVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrashedVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.trashedVouchers = action.payload.vouchers;
        state.pagination = action.payload.pagination;
        state.trashedCount = action.payload.trashedCount; // Cập nhật số lượng voucher đã xóa
      })
      .addCase(fetchTrashedVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete voucher - Tăng trashedCount khi xóa voucher
      .addCase(deleteAdminVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = state.vouchers.filter(
          (voucher) => voucher.voucher_id !== action.payload
        );
        state.trashedCount += 1; // Tăng số lượng voucher đã xóa
      })
      .addCase(deleteAdminVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Force delete voucher - Giảm trashedCount khi xóa vĩnh viễn
      .addCase(forceDeleteAdminVoucher.fulfilled, (state, action) => {
        state.trashedVouchers = state.trashedVouchers.filter(
          (voucher) => voucher.voucher_id !== action.payload
        );
        state.trashedCount -= 1; // Giảm số lượng voucher đã xóa vì đã xóa vĩnh viễn
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
        state.trashedCount -= 1; 
      })
      .addCase(restoreAdminVoucher.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default adminVoucherSlice.reducer;
