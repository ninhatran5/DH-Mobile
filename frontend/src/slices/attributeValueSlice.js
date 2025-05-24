import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  attributeValues: [],
  loading: false,
  error: null,
};

export const fetchAttributeValues = createAsyncThunk(
  "attributeValue/fetchAttributeValues",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosConfig.get("/attributevalue");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
    }
  }
);

export const addAttributeValue = createAsyncThunk(
  "attributeValue/addAttributeValue",
  async (newValue, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosConfig.post("/attributevalue", newValue, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi thêm Attribute Value");
    }
  }
);

export const updateAttributeValue = createAsyncThunk(
  "attributeValue/updateAttributeValue",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosConfig.post(`/attributevalue/${id}?_method=PUT`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật Attribute Value");
    }
  }
);

export const deleteAttributeValue = createAsyncThunk(
  "attributeValue/deleteAttributeValue",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosConfig.delete(`/attributevalue/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xoá Attribute Value");
    }
  }
);

const attributeValueSlice = createSlice({
  name: "attributeValue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAttributeValues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributeValues.fulfilled, (state, action) => {
        state.loading = false;
        state.attributeValues = action.payload;
      })
      .addCase(fetchAttributeValues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addAttributeValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAttributeValue.fulfilled, (state, action) => {
        state.loading = false;
        state.attributeValues.push(action.payload);
      })
      .addCase(addAttributeValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateAttributeValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttributeValue.fulfilled, (state, action) => {
        state.loading = false;
        const updatedValue = action.payload;
        const index = state.attributeValues.findIndex(
          (v) => v.attribute_value_id === updatedValue.attribute_value_id
        );
        if (index !== -1) {
          state.attributeValues[index] = updatedValue;
        }
      })
      .addCase(updateAttributeValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteAttributeValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttributeValue.fulfilled, (state, action) => {
        state.loading = false;
        state.attributeValues = state.attributeValues.filter(
          (v) => v.attribute_value_id !== action.payload
        );
      })
      .addCase(deleteAttributeValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default attributeValueSlice.reducer;
