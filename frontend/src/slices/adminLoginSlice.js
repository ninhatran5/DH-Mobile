import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  adminLoginInitial: null,
  loading: false,
  error: null,
};

const logout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/Adminlogin';
};

axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

export const fetchAdminLogin = createAsyncThunk(
  "adminLogin/fetchAdminLogin",
  async (data, thunkAPI) => {
    try {
      const response = await axiosConfig.post("/login", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const adminLoginSlice = createSlice({
  name: "adminLogin",
  initialState,
  reducers: {
    logout: (state) => {
      state.adminLoginInitial = null;
      state.loading = false;
      state.error = null;
      logout();
    }
  },
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchAdminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchAdminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminLoginInitial = action.payload;
      })
      // call lỗi
      .addCase(fetchAdminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export const { logout: logoutAction } = adminLoginSlice.actions;
export default adminLoginSlice.reducer; 