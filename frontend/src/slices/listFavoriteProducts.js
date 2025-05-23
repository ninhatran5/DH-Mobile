import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  listFavorite: [],
  loading: false,
  error: null,
};

///CALL API BANNER
export const fetchListFavorite = createAsyncThunk(
  "listFavoriteProducts/fetchListFavorite",
  async () => {
    const response = await axiosConfig.get("/listproductlike");
    return response.data;
  }
);

export const listFavoriteProductsSlice = createSlice({
  name: "listFavoriteProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchListFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchListFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.listFavorite = action.payload;
      })
      // call lỗi
      .addCase(fetchListFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default listFavoriteProductsSlice.reducer;
