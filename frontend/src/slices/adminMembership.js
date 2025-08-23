import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

// Fetch all loyalty tiers
export const fetchAdminLoyaltyTiers = createAsyncThunk(
  "adminMembership/fetchAdminLoyaltyTiers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosAdmin.get("/loyalty-tiers");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update one tier
export const updateAdminLoyaltyTier = createAsyncThunk(
  "adminMembership/updateAdminLoyaltyTier",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosAdmin.put(`/loyalty-tiers/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const resetAllLoyaltyPoints = createAsyncThunk(
  "adminMembership/resetAllLoyaltyPoints",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosAdmin.post("/loyalty-points/reset-all");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const adminMembershipSlice = createSlice({
  name: "adminMembership",
  initialState: {
    loyaltyTiers: [],
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
    resetLoading: false,
    resetError: null,
    resetSuccess: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAdminLoyaltyTiers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminLoyaltyTiers.fulfilled, (state, action) => {
        state.loading = false;
        state.loyaltyTiers = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
      })
      .addCase(fetchAdminLoyaltyTiers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update
      .addCase(updateAdminLoyaltyTier.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAdminLoyaltyTier.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedTier = action.payload.data;
        if (updatedTier) {
          const idx = state.loyaltyTiers.findIndex(
            (tier) =>
              tier.id === updatedTier.id || tier.tier_id === updatedTier.tier_id
          );
          if (idx !== -1) {
            state.loyaltyTiers[idx] = {
              ...state.loyaltyTiers[idx],
              ...updatedTier,
            };
          }
        }
      })
      .addCase(updateAdminLoyaltyTier.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      // reset all points
      .addCase(resetAllLoyaltyPoints.pending, (state) => {
        state.resetLoading = true;
        state.resetError = null;
        state.resetSuccess = false;
      })
      .addCase(resetAllLoyaltyPoints.fulfilled, (state, action) => {
        state.resetLoading = false;
        state.resetSuccess = true;
      })
      .addCase(resetAllLoyaltyPoints.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload;
      });
  },
});

export default adminMembershipSlice.reducer;
