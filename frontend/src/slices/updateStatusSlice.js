import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  updateStatus: null,
  loading: false,
  error: null,
};

export const fetchUpdateStatus = createAsyncThunk(
  "updateStatus/fetchUpdateStatus",
  async (id) => {
    const response = await axiosUser.put(`/updatestatuslike/${id}`);
    return response.data;
  }
);

export const statusUpdateSlice = createSlice({
  name: "updateStatus",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchUpdateStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchUpdateStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.updateStatus = action.payload;
      })
      // call lỗi
      .addCase(fetchUpdateStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default statusUpdateSlice.reducer;
