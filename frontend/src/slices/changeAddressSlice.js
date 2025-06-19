import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  changeAddressNew: [],
  loading: false,
  error: null,
};

// CALL API GET PROFILE
export const fetchAddressNew = createAsyncThunk(
  "changeAddress/fetchAddressNew",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosConfig.get("/user-addresses");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

/// call api edit profile
export const addAddresNew = createAsyncThunk(
  "changeAddress/addAddresNew",
  async (data, thunkAPI) => {
    try {
      const response = await axiosConfig.post("/user-addresses", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const updateAddresNew = createAsyncThunk(
  "changeAddress/updateAddresNew",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axiosConfig.post(`/user-addresses/${id}`, {
        ...data,
        _method: "PUT",
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const deleteAddressNew = createAsyncThunk(
  "changeAddress/deleteAddressNew",
  async (id, thunkAPI) => {
    try {
      const response = await axiosConfig.delete(`/user-addresses/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const changeAddressSlice = createSlice({
  name: "changeAddress",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddressNew.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddressNew.fulfilled, (state, action) => {
        state.loading = false;
        state.changeAddressNew = action.payload;
      })
      .addCase(fetchAddressNew.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Đã có lỗi xảy ra";
      })

      .addCase(addAddresNew.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAddresNew.fulfilled, (state, action) => {
        state.loading = false;
        state.changeAddressNew = action.payload;
      })
      .addCase(addAddresNew.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Đã có lỗi xảy ra";
      })

      .addCase(deleteAddressNew.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddressNew.fulfilled, (state, action) => {
        state.loading = false;
        state.changeAddressNew = action.payload;
      })
      .addCase(deleteAddressNew.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Đã có lỗi xảy ra";
      })

      .addCase(updateAddresNew.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddresNew.fulfilled, (state, action) => {
        state.loading = false;
        state.changeAddressNew = action.payload;
      })
      .addCase(updateAddresNew.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Đã có lỗi xảy ra";
      });
  },
});

export default changeAddressSlice.reducer;
