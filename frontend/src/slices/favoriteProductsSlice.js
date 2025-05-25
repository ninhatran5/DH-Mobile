import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

// Initial state
const initialState = {
  favoriteProducts: [],
  listFavorite: [],
  loading: false,
  error: null,
};

export const fetchFavoriteProduct = createAsyncThunk(
  "favoriteProduct/fetchFavoriteProduct",
  async (productId, thunkAPI) => {
    try {
      const response = await axiosConfig.post(`/productlike/${productId}`);
      if (response.data?.message === "Sản phẩm không tồn tại") {
        return thunkAPI.rejectWithValue("Sản phẩm không tồn tại");
      }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const fetchListFavorite = createAsyncThunk(
  "favoriteProduct/fetchListFavorite",
  async (_, thunkAPI) => {
    try {
      const response = await axiosConfig.get("/listproductlike");
      console.log("🚀 ~ response:", response);
      return { data: response.data.data || [] };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const deleteFavoriteProduct = createAsyncThunk(
  "favoriteProduct/deleteFavoriteProduct",
  async (productId, thunkAPI) => {
    try {
      const response = await axiosConfig.delete(`/productlike/${productId}`);
      if (response.data?.message === "Sản phẩm không tồn tại") {
        return thunkAPI.rejectWithValue("Sản phẩm không tồn tại");
      }
      return productId;
    } catch (error) {
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
      // Like product
      .addCase(fetchFavoriteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.favoriteProducts = action.payload;
      })
      .addCase(fetchFavoriteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })

      // List favorite products
      .addCase(fetchListFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.listFavorite = action.payload; // action.payload là { data: [...] }
      })
      .addCase(fetchListFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })

      // Delete favorite product
      .addCase(deleteFavoriteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFavoriteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Loại bỏ sản phẩm đã xoá khỏi danh sách
        state.favoriteProducts = state.favoriteProducts.filter(
          (product) => product.product_id !== action.payload
        );
        state.listFavorite = state.listFavorite.filter(
          (product) => product.product_id !== action.payload
        );
      })
      .addCase(deleteFavoriteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default favoriteProductSlice.reducer;
