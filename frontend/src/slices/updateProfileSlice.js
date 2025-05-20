import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  profile: {},
  loading: false,
  error: null,
};

// CALL API GET PROFILE
export const fetchProfile = createAsyncThunk(
  "editProfile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosConfig.get("/profile");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

/// call api edit profile
export const fetchEditProfile = createAsyncThunk(
  "editProfile/fetchEditProfile",
  async (data, thunkAPI) => {
    try {
      const response = await axiosConfig.post("/update-profile", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Đã có lỗi xảy ra"
      );
    }
  }
);

export const editProfileSlice = createSlice({
  name: "editProfile",
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
      })

      //Updtae
      .addCase(fetchEditProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEditProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchEditProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Đã có lỗi xảy ra";
      });
  },
});

export default editProfileSlice.reducer;
