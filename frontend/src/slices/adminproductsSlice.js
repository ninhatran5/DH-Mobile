import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  adminproducts: [],
  loading: false,
  error: null,
  totalPages: 1,
  variantsByProductId: {},
};

export const fetchAdminProducts = createAsyncThunk(
  "adminproduct/fetchAdminProducts",
  async (_, { rejectWithValue }) => {
    try {
      // Lấy trang đầu tiên để biết tổng số trang
      const firstPageRes = await axiosAdmin.get(`/products?page=1`);
      const firstPageData = firstPageRes.data.data || [];
      const totalPages = firstPageRes.data.totalPage || 1;
      const allProducts = [...firstPageData];
      const pageRequests = [];
      for (let page = 2; page <= totalPages; page++) {
        pageRequests.push(axiosAdmin.get(`/products?page=${page}`));
      }
      const remainingPages = await Promise.all(pageRequests);
      remainingPages.forEach((res) => {
        allProducts.push(...(res.data.data || []));
      });
      return {
        products: allProducts,
        totalPages,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi gọi API sản phẩm");
    }
  }
);


// Xóa sản phẩm
export const deleteAdminProduct = createAsyncThunk(
  "adminproduct/deleteAdminProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosAdmin.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  }
);

// Thêm sản phẩm
export const addAdminProduct = createAsyncThunk(
  "adminproduct/addAdminProduct",
  async (newProduct, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const res = await axiosAdmin.post("/products", newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi thêm sản phẩm");
    }
  }
);

export const updateAdminProduct = createAsyncThunk(
  "adminproduct/updateAdminProduct",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const response = await axiosAdmin.post(`/products/${id}?_method=PUT`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi cập nhật sản phẩm");
    }
  }
);

// Lấy danh sách variant của một sản phẩm
export const fetchProductVariants = createAsyncThunk(
  "adminproduct/fetchProductVariants",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.get(`/productvariants/${productId}`);
      return {
        productId,
        variants: res.data.data || [],
      };
    } catch (err) {
      if (err.response?.status === 404) {
        // Trường hợp không có biến thể, coi như trả về mảng rỗng
        return {
          productId,
          variants: [],
        };
      }
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi lấy biến thể sản phẩm"
      );
    }
  }
);



const adminProductSlice = createSlice({
  name: "adminproduct",
  initialState,
  reducers: {
    resetAdminProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.adminproducts = action.payload.products || [];
        state.totalPages = action.payload.totalPages || 1;
        state.error = null;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteAdminProduct
      .addCase(deleteAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.adminproducts = state.adminproducts.filter(
          (prod) => prod.product_id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addAdminProduct
      .addCase(addAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.adminproducts.push(action.payload);
        state.error = null;
      })
      .addCase(addAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateAdminProduct
      .addCase(updateAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload;
        const index = state.adminproducts.findIndex(
          (prod) => prod.product_id === updatedProduct.product_id
        );
        if (index !== -1) {
          state.adminproducts[index] = updatedProduct;
        }
        state.error = null;
      })
      .addCase(updateAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProductVariants.fulfilled, (state, action) => {
        const { productId, variants } = action.payload;
        state.variantsByProductId[productId] = variants;
      })
      .addCase(fetchProductVariants.rejected, (state, action) => {
        state.error = action.payload;
      });

  },
});

export const { resetAdminProductError } = adminProductSlice.actions;
export default adminProductSlice.reducer;
