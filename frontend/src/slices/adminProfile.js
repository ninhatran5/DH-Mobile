import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  adminProfile: {},
  loading: false,
  error: null,
};

// CALL API GET PROFILE
export const fetchProfileAdmin = createAsyncThunk(
  "profile/fetchProfileAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosAdmin.get("/profile");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const adminProfileSlice = createSlice({
  name: "adminProfile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminProfile = action.payload;
      })
      .addCase(fetchProfileAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Đã có lỗi xảy ra";
      });
  },
});

export default adminProfileSlice.reducer;
