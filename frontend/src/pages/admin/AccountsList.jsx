import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, updateUser } from "../../slices/adminuserSlice";
import "../../assets/admin/account.css";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/images/adminacccount.jpg";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Swal from 'sweetalert2';
const ListUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users = [], loading, error } = useSelector((state) => state.adminuser);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const usersPerPage = 10;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleAddUser = () => {
    navigate("/admin/addaccount");
  };

 const handleChangeRole = async (user, newRole) => {
  console.log("User được chọn:", user);
  if (!user || !user.user_id) {
    Swal.fire("Lỗi", "Không tìm thấy ID của người dùng.", "error");
    return;
  }

  if (user.role !== "sale") {
    Swal.fire("Thông báo", "Chỉ được cập nhật vai trò nếu user hiện tại là 'sale'.", "info");
    return;
  }

  if (newRole === user.role) return;

  const result = await Swal.fire({
    title: "Xác nhận thay đổi vai trò",
    html: `Bạn có chắc muốn đổi vai trò của <strong>${user.username}</strong> từ <strong>${user.role}</strong> thành <strong>${newRole}</strong>?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed) {
    try {
      const formData = new FormData();
      formData.append("role", newRole);

      await dispatch(
        updateUser({
          id: user.user_id,
          updatedData: formData,
        })
      ).unwrap();

      dispatch(fetchUsers());

      await Swal.fire({
        title: "Thành công",
        text: "Cập nhật vai trò thành công!",
        icon: "success",
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật role:", err);
      await Swal.fire({
        title: "Thất bại",
        text: "Cập nhật vai trò thất bại!",
        icon: "error",
      });
    }
  }
};


  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="adminuser-container">
      <div className="adminuser-header">
        <h1 className="adminuser-title">Danh sách User</h1>
        <button className="adminuser-add-button" onClick={handleAddUser}>
          + Thêm tài khoản
        </button>
      </div>

      <div className="adminuser-filters">
        <div className="adminuser-search">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đăng nhập"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="adminuser-role-dropdown">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Chọn vai trò</option>
            <option value="customer">Khách hàng</option>
            <option value="admin">Quản trị viên</option>
            <option value="sale">Nhân viên bán hàng</option>
           
          </select>
        </div>
      </div>

      {loading && <div className="adminuser-loading"><p>Đang tải dữ liệu...</p></div>}
      {error && <div className="adminuser-error"><p>Lỗi: {error}</p></div>}

      {!loading && !error && (
        <>
          <div className="adminuser-table-wrapper">
            <table className="adminuser-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Hình ảnh</th>
                  <th>Username</th>
                  <th>Tên đầy đủ</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.user_id} className="adminuser-row">
                      <td className="adminuser-text-center">{user.user_id}</td>
                      <td className="adminuser-text-center">
                        <img
                          src={
                            user.image_url && user.image_url.trim() !== ""
                              ? user.image_url
                              : defaultAvatar
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                          }}
                          alt={user.full_name || "User"}
                          className="adminuser-avatar"
                        />
                      </td>
                      <td>{user.username}</td>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td className="adminuser-text-center">
  {user.role === "sale" ? (
    <select
      value={user.role}
      onChange={(e) => handleChangeRole(user, e.target.value)}
      className="adminuser-role-select"
    >
      <option value="admin">admin</option>
      <option value="sale">sale</option>
    </select>
  ) : (
    <span>{user.role}</span>
  )}
</td>

                      <td className="adminuser-text-center">
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                      <td className="adminuser-text-center adminuser-actions">
                        <FaEye
                          className="adminuser-icon adminuser-icon-view"
                          onClick={() => navigate(`/admin/detailaccount/${user.user_id}`)}
                          title="Xem chi tiết user"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="adminuser-no-data">
                      Không có user nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="adminuser-pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &laquo; Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sau &raquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ListUser;
