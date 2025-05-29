import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  specifications: [],
  loading: false,
  error: null,
};

///CALL API BANNER
export const fetchSpecification = createAsyncThunk(
  "specification/fetchSpecification",
  async (id) => {
    const response = await axiosConfig.get(`/productspecifications/${id}`);
    return response.data.data;
  }
);

export const specificationSlice = createSlice({
  name: "specification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending(đang call)
      .addCase(fetchSpecification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // call thành công
      .addCase(fetchSpecification.fulfilled, (state, action) => {
        state.loading = false;
        state.specifications = Array.isArray(action.payload)
          ? action.payload
          : [action.payload]; // ép thành mảng nếu không phải mảng
      })

      // call lỗi
      .addCase(fetchSpecification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default specificationSlice.reducer;
