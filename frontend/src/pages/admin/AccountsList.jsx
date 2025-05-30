import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "../../slices/adminuserSlice";
import "../../assets/admin/account.css";

// Import icon
import { FaEdit, FaTrash } from "react-icons/fa";

const ListUser = () => {
  const dispatch = useDispatch();
  const { users = [], loading, error } = useSelector((state) => state.adminuser);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa user này?")) {
      dispatch(deleteUser(userId))
        .unwrap()
        .then(() => alert("Xóa user thành công!"))
        .catch((err) => alert(err || "Lỗi khi xóa user"));
    }
  };

  return (
    <div className="adminuser-container">
      <h1 className="adminuser-title">Danh sách User</h1>

      {loading && (
        <div className="adminuser-loading">
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="adminuser-error">
          <p>Lỗi: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="adminuser-table-wrapper">
          <table className="adminuser-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Username</th>
                <th>Tên đầy đủ</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Địa chỉ</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.user_id} className="adminuser-row">
                    <td className="adminuser-text-center">{user.user_id}</td>
                    <td className="adminuser-text-center">
                      <img
                        src={user.image_url || "https://via.placeholder.com/150"}
                        alt={user.full_name}
                        className="adminuser-avatar"
                      />
                    </td>
                    <td className="adminuser-username">{user.username}</td>
                    <td className="adminuser-full_name">{user.full_name}</td>
                    <td className="adminuser-email">{user.email}</td>
                    <td className="adminuser-phone">{user.phone}</td>
                    <td className="adminuser-Address">
                  {user.address}
                  {user.ward && `, ${user.ward}`}
                  {user.district && `, ${user.district}`}
                  {user.city && `, ${user.city}`}
                    </td>

                    <td className="adminuser-text-center">{user.role}</td>
                    <td className="adminuser-text-center">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                    <td className="adminuser-text-center adminuser-actions">
                      <FaEdit
                        className="adminuser-icon adminuser-icon-edit"
                        onClick={() => console.log("Sửa", user)}
                        title="Sửa user"
                      />
                      <FaTrash
                        className="adminuser-icon adminuser-icon-delete"
                        onClick={() => handleDelete(user.user_id)}
                        title="Xóa user"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="adminuser-no-data">
                    Không có user nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListUser;
