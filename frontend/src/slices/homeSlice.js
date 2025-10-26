import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";
const initialState = {
  banners: [],
  loading: false,
  error: null,
};

///CALL API BANNER
export const fetchBanners = createAsyncThunk("home/fetchBanners", async () => {
  const response = await axiosUser.get("/getbanners");
  return response.data;
});

export const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      // call lỗi
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default homeSlice.reducer;
