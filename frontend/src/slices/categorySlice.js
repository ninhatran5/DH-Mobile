import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  categorys: [],
  loading: false,
  error: null,
};

export const fetchCategory = createAsyncThunk(
  "product/fetchCategory",
  async () => {
    const response = await axiosUser.get("/categories");
    return response.data.data;
  }
);

export const categorysSlice = createSlice({
  name: "categorys",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categorys = action.payload;
      })
      // call lỗi
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default categorysSlice.reducer;
