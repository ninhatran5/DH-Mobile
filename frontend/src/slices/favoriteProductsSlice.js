import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

// Initial state
const initialState = {
  favoriteProducts: [],
  listFavorite: [], 
  loading: false,
  error: null,
};

// Thêm sản phẩm yêu thích
export const fetchFavoriteProduct = createAsyncThunk(
  "favoriteProduct/fetchFavoriteProduct",
  async (productId, thunkAPI) => {
    try {
      const response = await axiosUser.post(`/productlike/${productId}`);
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

// Lấy danh sách yêu thích
export const fetchListFavorite = createAsyncThunk(
  "favoriteProduct/fetchListFavorite",
  async (_, thunkAPI) => {
    try {
      const response = await axiosUser.get("/listproductlike");
      return response.data.data || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

// Xoá sản phẩm yêu thích
export const deleteFavoriteProduct = createAsyncThunk(
  "favoriteProduct/deleteFavoriteProduct",
  async (productId, thunkAPI) => {
    try {
      const response = await axiosUser.delete(`/productunlike/${productId}`);
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
        state.listFavorite = action.payload;
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
        state.listFavorite = state.listFavorite.filter(
          (product) =>
            product.id !== action.payload &&
            product.product_id !== action.payload &&
            product.product?.product_id !== action.payload
        );
      })

      .addCase(deleteFavoriteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default favoriteProductSlice.reducer;
