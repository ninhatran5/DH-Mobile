import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  carts: [],
  loading: false,
  error: null,
};

///CALL API REGISTER
export const fetchAddToCart = createAsyncThunk(
  "cart/fetchAddToCart",
  async (data, thunkAPI) => {
    try {
      const response = await axiosConfig.post(
        `/cart/add/${data.variant_id}`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (thunkAPI) => {
    try {
      const response = await axiosConfig.get(`/getCart`);
      return response.data.cart_items;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);
export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchAddToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchAddToCart.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.carts)) {
          state.carts.push(action.payload);
        } else {
          state.carts = [action.payload];
        }
      })
      // call lỗi
      .addCase(fetchAddToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })

      // pending(đang call)
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.carts = action.payload;
      })
      // call lỗi
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default cartSlice.reducer;
