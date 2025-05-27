import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  accounts: [],
  loading: false,
  error: null,
};

export const fetchAdminAccounts = createAsyncThunk(
  "adminAccount/fetchAdminAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosConfig.get("/getuser", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("🔥 Dữ liệu server trả về:", res.data);

      if (!res.data || !res.data.data) {
        return rejectWithValue("Server không gửi dữ liệu accounts");
      }

      return res.data.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
    }
  }
);


// Xoá tài khoản admin
export const deleteAdminAccount = createAsyncThunk(
  "adminAccount/deleteAdminAccount",
  async (accountId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosConfig.delete(`/accounts/${accountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return accountId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xoá tài khoản");
    }
  }
);

export const addAdminAccount = createAsyncThunk(
  "adminAccount/addAdminAccount",
  async (newAccount, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }
      const res = await axiosConfig.post("/accounts", newAccount, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi thêm tài khoản");
    }
  }
);

export const updateAdminAccount = createAsyncThunk(
  "adminAccount/updateAdminAccount",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }
      const res = await axiosConfig.post(`/accounts/${id}?_method=PUT`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật tài khoản");
    }
  }
);

const adminAccountSlice = createSlice({
  name: "adminAccount",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAdminAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteAdminAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter(
          (acc) => acc.user_id !== action.payload
        );
      })
      .addCase(deleteAdminAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addAdminAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
      })

      .addCase(updateAdminAccount.fulfilled, (state, action) => {
        const updatedAccount = action.payload;
        const index = state.accounts.findIndex(acc => acc.user_id === updatedAccount.user_id);
        if (index !== -1) {
          state.accounts[index] = updatedAccount;
        }
      });
  },
});

export default adminAccountSlice.reducer;
