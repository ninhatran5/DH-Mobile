import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosAdmin } from "../../utils/axiosConfig";

export const fetchAdminLoyaltyTiers = createAsyncThunk(
  'adminMembership/fetchAdminLoyaltyTiers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosAdmin.get('/loyalty-tiers');
      console.log('Server trả về loyalty tiers:', response.data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const adminMembershipSlice = createSlice({
  name: 'adminMembership',
  initialState: {
    loyaltyTiers: [],
    loading: false,
    error: null,
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminLoyaltyTiers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminLoyaltyTiers.fulfilled, (state, action) => {
        state.loading = false;
        state.loyaltyTiers = Array.isArray(action.payload.data) ? action.payload.data : [];
      })
      .addCase(fetchAdminLoyaltyTiers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminMembershipSlice.reducer;
