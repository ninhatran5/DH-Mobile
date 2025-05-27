import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  productsVariants: [],
  loading: false,
  error: null,
};

export const fetchProductVariants = createAsyncThunk(
  "product/fetchProductVariants",
  async () => {
    const response = await axiosConfig.get("/productvariants");
    return response.data.data;
  }
);

export const productsVariantSlice = createSlice({
  name: "productsVariant",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchProductVariants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchProductVariants.fulfilled, (state, action) => {
        state.loading = false;
        state.productsVariants = action.payload;
      })
      // call lỗi
      .addCase(fetchProductVariants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default productsVariantSlice.reducer;
