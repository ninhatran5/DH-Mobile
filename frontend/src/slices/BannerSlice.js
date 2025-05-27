import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  banners: [],
  selectedBanner: null,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
};

export const fetchBanners = createAsyncThunk(
  "banner/fetchBanners",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://dhmobile-website-production.up.railway.app/api/getbanners");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi không xác định");
    }
  }
);

export const fetchBannerById = createAsyncThunk(
  "banner/fetchBannerById",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `https://dhmobile-website-production.up.railway.app/api/getbanners`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const banner = response.data.find(b => b.banner_id.toString() === id.toString());
      if (!banner) {
        return rejectWithValue("Không tìm thấy banner với ID này");
      }
      return banner;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy banner theo ID");
    }
  }
);


export const updateBanner = createAsyncThunk(
  "banner/updateBanner",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return rejectWithValue("Token không tồn tại hoặc hết hạn");
      }

      const response = await axios.request({
        url: `https://dhmobile-website-production.up.railway.app/api/updatebanners/${id}`,
        method: "POST",
        data: data, 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi không xác định khi cập nhật banner");
    }
  }
);



export const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    resetUpdateState: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(fetchBannerById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedBanner = null;
      })
      .addCase(fetchBannerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBanner = action.payload;
      })
      .addCase(fetchBannerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(updateBanner.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        const updatedBanner = action.payload;

        const index = state.banners.findIndex(b => b.banner_id === updatedBanner.banner_id);
        if (index !== -1) {
          state.banners[index] = updatedBanner;
        }

        if (state.selectedBanner?.banner_id === updatedBanner.banner_id) {
          state.selectedBanner = updatedBanner;
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || action.error?.message;
      });
  },
});

export const { resetUpdateState } = bannerSlice.actions;
export default bannerSlice.reducer;
