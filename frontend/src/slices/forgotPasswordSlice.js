import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  forgotPasswordInitial: null,
  loading: false,
  error: null,
};

///CALL API FORGOT PASSWORD
export const fetchForgotPassword = createAsyncThunk(
  "login/fetchLogin",
  async (data, thunkAPI) => {
    try {
      const response = await axiosConfig.post("/forgot-password", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchForgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchForgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.loginInitial = action.payload;
      })
      // call lỗi
      .addCase(fetchForgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default forgotPasswordSlice.reducer;
