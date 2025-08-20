import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  adminproducts: [],
  trashedProducts: [],
  loading: false,
  error: null,
  totalPages: 1,
  variantsByProductId: {},
  trashedProductsCount: 0, // Thêm state đếm số sản phẩm trong thùng rác
  loadingTrashedCount: false, // Thêm loading state cho count
};

export const fetchAdminProducts = createAsyncThunk(
  "adminproduct/fetchAdminProducts",
  async (_, { rejectWithValue }) => {
    try {
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

// Xóa vĩnh viễn sản phẩm
export const deleteAdminProduct = createAsyncThunk(
  "adminproduct/deleteAdminProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosAdmin.delete(`/products/forceDelete/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  }
);

// Xóa mềm sản phẩm (chuyển vào thùng rác)
export const softdeleteAdminProduct = createAsyncThunk(
  "adminproduct/softdeleteAdminProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosAdmin.post(`/products/${productId}?_method=DELETE`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  }
);

export const fetchTrashedAdminProducts = createAsyncThunk(
  "adminproduct/fetchTrashedAdminProducts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosAdmin.get("/products/trashed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const trashedProducts = response.data.data || [];
      return {
        trashedProducts,
        count: trashedProducts.length
      };
    } catch (err) {
      if (err.response?.status === 404) {
        // Thùng rác trống
        return {
          trashedProducts: [],
          count: 0
        };
      }
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi lấy sản phẩm đã xóa"
      );
    }
  }
);


// Khôi phục sản phẩm đã xóa
export const restoreAdminProduct = createAsyncThunk(
  "adminproduct/restoreAdminProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axiosAdmin.post(`/products/restore/${productId}?_method=PUT`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return productId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi khôi phục sản phẩm"
      );
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

export const fetchProductVariants = createAsyncThunk(
  "adminproduct/fetchProductVariants",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axiosAdmin.get(`/productvariants/${productId}`);

      // 👇 log dữ liệu trả về từ server
      console.log("✅ fetchProductVariants response:", res.data);

      return {
        productId,
        variants: res.data.data || [],
      };
    } catch (err) {
      console.error("❌ fetchProductVariants error:", err.response || err);

      if (err.response?.status === 404) {
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
      // fetchAdminProducts
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

      // deleteAdminProduct (xóa vĩnh viễn)
      .addCase(deleteAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Xóa khỏi danh sách chính
        state.adminproducts = state.adminproducts.filter(
          (prod) => prod.product_id !== action.payload
        );
        // Xóa khỏi thùng rác
        state.trashedProducts = state.trashedProducts.filter(
          (prod) => prod.product_id !== action.payload
        );
        // Giảm count khi xóa vĩnh viễn
        if (state.trashedProductsCount > 0) {
          state.trashedProductsCount -= 1;
        }
        state.error = null;
      })
      .addCase(deleteAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // softdeleteAdminProduct (xóa mềm)
      .addCase(softdeleteAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(softdeleteAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Xóa sản phẩm khỏi danh sách chính
        state.adminproducts = state.adminproducts.filter(
          (prod) => prod.product_id !== action.payload
        );
        // Tăng count khi chuyển vào thùng rác
        state.trashedProductsCount += 1;
        state.error = null;
      })
      .addCase(softdeleteAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchTrashedAdminProducts với count
      .addCase(fetchTrashedAdminProducts.pending, (state) => {
        state.loading = true;
        state.loadingTrashedCount = true;
        state.error = null;
      })
      .addCase(fetchTrashedAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingTrashedCount = false;
        // Cập nhật cả danh sách và count
        state.trashedProducts = action.payload.trashedProducts;
        state.trashedProductsCount = action.payload.count;
        state.error = null;
      })
      .addCase(fetchTrashedAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.loadingTrashedCount = false;
        state.error = action.payload;
      })

      // restoreAdminProduct
      .addCase(restoreAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreAdminProduct.fulfilled, (state, action) => {
        state.loading = false;
        const restoredId = action.payload;
        // Xóa khỏi danh sách thùng rác
        state.trashedProducts = state.trashedProducts.filter(
          (prod) => prod.product_id !== restoredId
        );
        // Giảm count khi khôi phục
        if (state.trashedProductsCount > 0) {
          state.trashedProductsCount -= 1;
        }
        state.error = null;
      })
      .addCase(restoreAdminProduct.rejected, (state, action) => {
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

      // fetchProductVariants
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
