import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  viewProducts: [],
  listViewProduct: [],
  loading: false,
  error: null,
};

export const addViewProducts = createAsyncThunk(
  "viewProduct/addViewProducts",
  async ({ productId, userId }, thunkAPI) => {
    try {
      const response = await axiosConfig.post(`/productsviews`, {
        product_id: productId,
        user_id: userId,
      });
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
  "viewProduct/fetchListFavorite",
  async (_, thunkAPI) => {
    try {
      const response = await axiosConfig.get("/listproductlike");
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
  "viewProduct/deleteFavoriteProduct",
  async (productId, thunkAPI) => {
    try {
      const response = await axiosConfig.delete(`/productunlike/${productId}`);
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

export const viewProductSlice = createSlice({
  name: "viewProduct",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Like product
      .addCase(addViewProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addViewProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.viewProducts = action.payload;
      })
      .addCase(addViewProducts.rejected, (state, action) => {
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
          (product) => product.id !== action.payload
        );
      })

      .addCase(deleteFavoriteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default viewProductSlice.reducer;
