import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  favoriteProducts: null,
  loading: false,
  error: null,
};

export const fetchFavoriteProduct = createAsyncThunk(
  "favoriteProduct/fetchFavoriteProduct",
  async (productId, thunkAPI) => {
    try {
      const response = await axiosConfig.post(`/productlike/${productId}`);
      console.log("API like product response:", response.data); // debug
      // Kiểm tra nếu backend trả lỗi trong data nhưng status vẫn 200
      if (response.data?.message === "Sản phẩm không tồn tại") {
        return thunkAPI.rejectWithValue("Sản phẩm không tồn tại");
      }
      return response.data;
    } catch (error) {
      console.error("API like product error:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const favoriteProductSlice = createSlice({
  name: "favoriteProduct",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchFavoriteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchFavoriteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.favoriteProducts = action.payload;
      })
      // call lỗi
      .addCase(fetchFavoriteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default favoriteProductSlice.reducer;
