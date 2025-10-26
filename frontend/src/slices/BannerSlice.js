import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

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
      const res = await axiosAdmin.get("/getbanners");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi lấy danh sách banner");
    }
  }
);

export const fetchBannerById = createAsyncThunk(
  "banner/fetchBannerById",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosAdmin.get("/getbanners", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const banner = res.data.find(b => b.banner_id.toString() === id.toString());
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

      const res = await axiosAdmin.post(`/updatebanners/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật banner");
    }
  }
);

const bannerSlice = createSlice({
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
      // Fetch list
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
        state.error = action.payload;
      })

      // Fetch by ID
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
        state.error = action.payload;
      })

      // Update banner
      .addCase(updateBanner.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;

        const updated = action.payload;
        const index = state.banners.findIndex(b => b.banner_id === updated.banner_id);
        if (index !== -1) {
          state.banners[index] = updated;
        }

        if (state.selectedBanner?.banner_id === updated.banner_id) {
          state.selectedBanner = updated;
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { resetUpdateState } = bannerSlice.actions;
export default bannerSlice.reducer;
