import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosConfig } from "../../utils/axiosConfig";

const initialState = {
  users: [],
  loading: false,
  error: null,
};


export const fetchUsers = createAsyncThunk(
  "adminuser/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const res = await axiosConfig.get("/getuser", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetch users res.data:", res.data); 
      return res.data.user; 
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi gọi API lấy danh sách user"
      );
    }
  }
);


// Xóa user
export const deleteUser = createAsyncThunk(
  "adminuser/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      await axiosConfig.delete(`/getuser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return userId; // Trả về id để filter
    } catch (err) {
      console.error("Lỗi khi xóa user:", err);
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi xóa user"
      );
    }
  }
);

// Thêm user
export const addUser = createAsyncThunk(
  "adminuser/addUser",
  async (newUserData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const res = await axiosConfig.post("/getuser", newUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newUser = res.data.data;
      console.log("User mới:", newUser);
      return newUser;
    } catch (err) {
      console.error("Lỗi khi thêm user:", err);
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi thêm user"
      );
    }
  }
);

// Sửa user
export const updateUser = createAsyncThunk(
  "adminuser/updateUser",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const res = await axiosConfig.post(
        `/getuser/${id}?_method=PUT`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = res.data.data;
      console.log("User đã cập nhật:", updatedUser);
      return updatedUser;
    } catch (err) {
      console.error("Lỗi khi cập nhật user:", err);
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi cập nhật user"
      );
    }
  }
);

const adminuserSlice = createSlice({
  name: "adminuser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || []; // đảm bảo luôn là mảng
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (user) => user.user_id !== action.payload
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add user
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload;
        const index = state.users.findIndex(
          (user) => user.user_id === updatedUser.user_id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminuserSlice.reducer;
