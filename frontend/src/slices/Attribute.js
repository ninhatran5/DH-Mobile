// src/slices/attributeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  attributes: [],
  loading: false,
  error: null,
};

export const fetchAttributes = createAsyncThunk(
  "attribute/fetchAttributes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosConfig.get("/attributes");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API");
    }
  }
);

export const addAttribute = createAsyncThunk(
  "attribute/addAttribute",
  async (newAttribute, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosConfig.post("/attributes", newAttribute, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi thêm thuộc tính");
    }
  }
);

export const updateAttribute = createAsyncThunk(
  "attribute/updateAttribute",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axiosConfig.post(`/attributes/${id}?_method=PUT`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật thuộc tính");
    }
  }
);

export const deleteAttribute = createAsyncThunk(
  "attribute/deleteAttribute",
  async (attributeId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosConfig.delete(`/attributes/${attributeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return attributeId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xóa thuộc tính");
    }
  }
);

const attributeSlice = createSlice({
  name: "attribute",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.loading = false;
        state.attributes = action.payload;
      })
      .addCase(fetchAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addAttribute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAttribute.fulfilled, (state, action) => {
        state.loading = false;
        state.attributes.push(action.payload);
      })
      .addCase(addAttribute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateAttribute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttribute.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAttr = action.payload;
        const index = state.attributes.findIndex(attr => attr.attribute_id === updatedAttr.attribute_id);
        if (index !== -1) {
          state.attributes[index] = updatedAttr;
        }
      })
      .addCase(updateAttribute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteAttribute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttribute.fulfilled, (state, action) => {
        state.loading = false;
        state.attributes = state.attributes.filter(attr => attr.attribute_id !== action.payload);
      })
      .addCase(deleteAttribute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default attributeSlice.reducer;
