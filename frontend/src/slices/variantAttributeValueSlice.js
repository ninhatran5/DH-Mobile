import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  variantAttributeValues: [],
  loading: false,
  error: null,
};

// Lấy danh sách variant attribute values
export const fetchVariantAttributeValues = createAsyncThunk(
  "variantAttributeValue/fetchVariantAttributeValues",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosConfig.get("/variantattributevalues");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
    }
  }
);

// Thêm variant attribute value
export const addVariantAttributeValue = createAsyncThunk(
  "variantAttributeValue/addVariantAttributeValue",
  async (newValue, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosConfig.post("/variantattributevalues", newValue, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi thêm giá trị"
      );
    }
  }
);

// Cập nhật variant attribute value
export const updateVariantAttributeValue = createAsyncThunk(
  "variantAttributeValue/updateVariantAttributeValue",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      const formattedData = {
        sku: updatedData.sku || "",
        price: parseFloat(updatedData.price) || 0,
        price_original: parseFloat(updatedData.price_original) || 0,
        stock: parseInt(updatedData.stock) || 0,
        is_active: updatedData.is_active ? 1 : 0,
        image_url: updatedData.image_url || "",
        attributes: Array.isArray(updatedData.attributes) 
          ? updatedData.attributes.map(attr => ({
              value_id: parseInt(attr.value_id),
              name: attr.name || "",
              value: attr.value || ""
            }))
          : []
      };

      console.log('Sending update request with data:', formattedData);

      const res = await axiosConfig.post( 
        `/variantattributevalues/${id}`,
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000 // Add timeout
        }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi cập nhật giá trị"
      );
    }
  }
);

// Xóa variant attribute value
export const deleteVariantAttributeValue = createAsyncThunk(
  "variantAttributeValue/deleteVariantAttributeValue",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosConfig.delete(`/variantattributevalues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi xóa giá trị"
      );
    }
  }
);

const variantAttributeValueSlice = createSlice({
  name: "variantAttributeValue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchVariantAttributeValues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVariantAttributeValues.fulfilled, (state, action) => {
        state.loading = false;
        state.variantAttributeValues = action.payload;
      })
      .addCase(fetchVariantAttributeValues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addVariantAttributeValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVariantAttributeValue.fulfilled, (state, action) => {
        state.loading = false;
        state.variantAttributeValues.push(action.payload);
      })
      .addCase(addVariantAttributeValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateVariantAttributeValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVariantAttributeValue.fulfilled, (state, action) => {
        state.loading = false;
        const updatedValue = action.payload;
        const index = state.variantAttributeValues.findIndex(
          (val) => val.variant_attribute_value_id === updatedValue.variant_attribute_value_id
        );
        if (index !== -1) {
          state.variantAttributeValues[index] = updatedValue;
        }
      })
      .addCase(updateVariantAttributeValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteVariantAttributeValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVariantAttributeValue.fulfilled, (state, action) => {
        state.loading = false;
        state.variantAttributeValues = state.variantAttributeValues.filter(
          (val) => val.variant_attribute_value_id !== action.payload
        );
      })
      .addCase(deleteVariantAttributeValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default variantAttributeValueSlice.reducer;
