import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  products: [],
  loading: false,
  error: null,
};

///CALL API BANNER
export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async () => {
    const response = await axiosConfig.get("/products");
    return response.data.data;
  }
);

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      // call lỗi
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default productSlice.reducer;
