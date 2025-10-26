import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  productVariationDetails: [],
  loading: false,
  error: null,
};

///CALL API BANNER
export const fetchProductVariationDetail = createAsyncThunk(
  "productVariationDetail/fetchProductDetail",
  async (id, thunkAPI) => {
    try {
      const response = await axiosUser.get(`/productvariants/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Không tìm thấy biến thể sản phẩm"
      );
    }
  }
);

export const productVariationDetailSlice = createSlice({
  name: "productVariationDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchProductVariationDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchProductVariationDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.productVariationDetails = action.payload;
      })
      // call lỗi
      .addCase(fetchProductVariationDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default productVariationDetailSlice.reducer;
