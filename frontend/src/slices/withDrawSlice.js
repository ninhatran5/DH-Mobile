import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  withDraws: null,
  bankAccount: null,
  detailBank: null,
  loading: false,
  error: null,
};

export const addBankAccount = createAsyncThunk(
  "withDraw/addBankAccount",
  async (data, thunkAPI) => {
    try {
      const response = await axiosUser.post("/wallet/add-bank", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const getListBankAccount = createAsyncThunk(
  "withDraw/getListBankAccount",
  async (_, thunkAPI) => {
    try {
      const response = await axiosUser.get("/wallet/get-bank");
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const getDetailBankAccount = createAsyncThunk(
  "withDraw/getDetailBankAccount",
  async (id, thunkAPI) => {
    try {
      const response = await axiosUser.get(`/wallet/getDetailbank/${id}`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const deleteBankAccount = createAsyncThunk(
  "withDraw/deleteBankAccount",
  async (id, thunkAPI) => {
    try {
      const response = await axiosUser.delete(`/withdraw/deleteBank/${id}`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const withdrawMoney = createAsyncThunk(
  "withDraw/withdrawMoney",
  async ({ withdraw_id, amount }, thunkAPI) => {
    try {
      const response = await axiosUser.post("withdraw/request", {
        withdraw_id,
        amount,
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const withDrawSlice = createSlice({
  name: "withDraw",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.withDraws = action.payload;
      })
      .addCase(addBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })

      .addCase(getListBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getListBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.bankAccount = action.payload;
      })
      .addCase(getListBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(deleteBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.bankAccount = action.payload;
      })
      .addCase(deleteBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(getDetailBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDetailBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.detailBank = action.payload;
      })
      .addCase(getDetailBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(withdrawMoney.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(withdrawMoney.fulfilled, (state, action) => {
        state.loading = false;
        state.detailBank = action.payload;
      })
      .addCase(withdrawMoney.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đã có lỗi xảy ra";
      });
  },
});

export default withDrawSlice.reducer;
