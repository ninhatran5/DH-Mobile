import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosUser } from "../../utils/axiosConfig";

const initialState = {
  profile: {},
  loading: false,
  error: null,
};

// CALL API GET PROFILE
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosUser.get("/profile");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Đã có lỗi xảy ra";
      });
  },
});

export default profileSlice.reducer;
