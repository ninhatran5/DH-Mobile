import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosAdmin } from "../../utils/axiosConfig";

const initialState = {
  users: [],
  loading: false,
  error: null,
  selectedUser: null, 
};

// Lấy danh sách user
export const fetchUsers = createAsyncThunk(
  "adminuser/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const res = await axiosAdmin.get("/getuser", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data.user || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi gọi API lấy danh sách user"
      );
    }
  }
);

// Mở/khoá tài khoản
export const toggleBlockUser = createAsyncThunk(
  "adminuser/toggleBlockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const res = await axiosAdmin.patch(
        `/toggle-block/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return res.data.user; // Trả về user đã cập nhật trạng thái block
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi mở/khoá tài khoản"
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

      await axiosAdmin.delete(`/getuser/${userId}`, {
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

      const res = await axiosAdmin.post("/createuser", newUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let user = res.data.user; 
      if (Array.isArray(user)) {
        user = user[0];
      }
      if (!user || !user.user_id) {
        return rejectWithValue("Dữ liệu trả về không hợp lệ khi thêm user");
      }
      return user;
    } catch (err) {
      console.error("Lỗi khi thêm user:", err.response?.data);

      if (err.response?.data?.errors) {
        return rejectWithValue(err.response.data.errors);
      }

      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định khi thêm user"
      );
    }
  }
);


// Cập nhật user
export const updateUser = createAsyncThunk(
  "adminuser/updateUser",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const res = await axiosAdmin.post(
        `/updateuser/${id}?_method=PUT`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
     return res.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi cập nhật user"
      );
    }
  }
);

// Lấy thông tin chi tiết 1 user
export const fetchUserById = createAsyncThunk(
  "adminuser/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return rejectWithValue("Token không tồn tại hoặc hết hạn");

      const res = await axiosAdmin.get(`/getuser/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi khi lấy chi tiết người dùng"
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
        state.users = action.payload || [];
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
        // Chỉ push nếu payload hợp lệ
        if (action.payload && action.payload.user_id) {
          state.users.push(action.payload);
        }
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

        if (!updatedUser || !updatedUser.user_id) {
          console.warn("Payload cập nhật không hợp lệ hoặc thiếu user_id");
          return;
        }

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
      })
      // Fetch one user
.addCase(fetchUserById.pending, (state) => {
  state.loading = true;
  state.error = null;
  state.selectedUser = null;
})
.addCase(fetchUserById.fulfilled, (state, action) => {
  state.loading = false;
  state.selectedUser = action.payload;
})
.addCase(fetchUserById.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.selectedUser = null;
})
.addCase(toggleBlockUser.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(toggleBlockUser.fulfilled, (state, action) => {
  state.loading = false;
  const updatedUser = action.payload;
  const index = state.users.findIndex(
    (user) => user.user_id === updatedUser.user_id
  );
  if (index !== -1) {
    state.users[index] = updatedUser;
  }
  // Nếu đang xem chi tiết user đó thì cũng cập nhật luôn
  if (state.selectedUser?.user_id === updatedUser.user_id) {
    state.selectedUser = updatedUser;
  }
})
.addCase(toggleBlockUser.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
});




  },
});

export default adminuserSlice.reducer;
