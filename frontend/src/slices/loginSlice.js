import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  loginInitial: null,
  loading: false,
  error: null,
};

///CALL API LOGIN
export const fetchLogin = createAsyncThunk(
  "login/fetchLogin",
  async (data, thunkAPI) => {
    try {
      const response = await axiosUser.post("/login", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.loginInitial = action.payload;
      })
      // call lỗi
      .addCase(fetchLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default loginSlice.reducer;
