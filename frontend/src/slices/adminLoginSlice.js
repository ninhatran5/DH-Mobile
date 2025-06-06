import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  adminLoginInitial: null,
  loading: false,
  error: null,
};

export const fetchAdminLogin = createAsyncThunk(
  "adminLogin/fetchAdminLogin",
  async (data, thunkAPI) => {
    try {
      const response = await axiosConfig.post("/login", data);
      if (response.data?.token) {
        localStorage.setItem('adminToken', response.data.token);
      }
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
      localStorage.removeItem('adminToken');
      window.location.href = '/Adminlogin';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminLoginInitial = action.payload;
      })
      .addCase(fetchAdminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export const { logout: logoutAction } = adminLoginSlice.actions;
export default adminLoginSlice.reducer; 