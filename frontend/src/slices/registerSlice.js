import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  registerInitial: null,
  loading: false,
  error: null,
};

///CALL API REGISTER
export const fetchRegister = createAsyncThunk(
  "register/fetchRegister",
  async (data, thunkAPI) => {
    try {
      const response = await axiosUser.post("/register", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.registerInitial = action.payload;
      })
      // call lỗi
      .addCase(fetchRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default registerSlice.reducer;
