import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  attributeValues: {},  
  loading: false,
  error: null,
};

export const fetchAttributeValues = createAsyncThunk(
  "attributeValue/fetchAttributeValues",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosConfig.get("/attributevalues");
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
      const res = await axiosConfig.post("/attributevalues", newValue, {
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
      const res = await axiosConfig.post(`/attributevalues/${id}?_method=PUT`, updatedData, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
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
      await axiosConfig.delete(`/attributevalues/${id}`, {
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

        // Nhóm attributeValues theo attribute_id
        const grouped = action.payload.reduce((acc, value) => {
          const key = value.attribute_id;
          if (!acc[key]) acc[key] = [];
          acc[key].push(value);
          return acc;
        }, {});

        state.attributeValues = grouped;
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
        const value = action.payload;
        if (!state.attributeValues[value.attribute_id]) {
          state.attributeValues[value.attribute_id] = [];
        }
        state.attributeValues[value.attribute_id].push(value);
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

  Object.values(state.attributeValues).forEach(arr => {
    if (Array.isArray(arr)) {
      const index = arr.findIndex(v => v.value_id === updatedValue.value_id);
      if (index !== -1) {
        arr[index] = updatedValue;
      }
    }
  });
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
        const deletedId = action.payload;
        Object.keys(state.attributeValues).forEach(attrId => {
          state.attributeValues[attrId] = state.attributeValues[attrId].filter(
            v => v.value_id !== deletedId
          );
        });
      })
      .addCase(deleteAttributeValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default attributeValueSlice.reducer;
