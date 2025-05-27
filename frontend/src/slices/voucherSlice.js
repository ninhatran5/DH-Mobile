import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  vouchers: [],
  loading: false,
  error: null,
};

export const fetchVouhcer = createAsyncThunk(
  "vouhcer/fetchVouhcer",
  async () => {
    const response = await axiosConfig.get("/vorchers");
    return response.data;
  }
);

export const vouhcerSlice = createSlice({
  name: "vouhcer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchVouhcer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchVouhcer.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
      })
      // call lỗi
      .addCase(fetchVouhcer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default vouhcerSlice.reducer;
