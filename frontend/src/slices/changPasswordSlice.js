import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  changePassword: null,
  loading: false,
  error: null,
};

export const fetchChangPassword = createAsyncThunk(
  "changePassword/fetchRegister",
  async (data, thunkAPI) => {
    try {
      const response = await axiosConfig.post("/resetpassword", {
        ...data,
        _method: "PUT",
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchChangPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchChangPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.changePassword = action.payload;
      })
      // call lỗi
      .addCase(fetchChangPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default changePasswordSlice.reducer;
