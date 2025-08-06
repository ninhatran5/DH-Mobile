import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, updateUser } from "../../slices/adminuserSlice";
import "../../assets/admin/account.css";
import { FaEye, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/images/adminacccount.jpg";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Swal from "sweetalert2";

const ListUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    users = [],
    loading,
    error,
  } = useSelector((state) => state.adminuser);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const usersPerPage = 10;

  const displayData = (value) => {
    return value && value.trim() !== "" ? value : "Chưa cập nhật";
  };

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleAddUser = () => {
    navigate("/admin/addaccount");
  };

  const handleChangeRole = async (user, newRole) => {
    if (!user || !user.user_id) {
      Swal.fire("Lỗi", "Không tìm thấy ID của người dùng.", "error");
      return;
    }

    if (user.role !== "sale") {
      Swal.fire(
        "Thông báo",
        "Chỉ được cập nhật vai trò nếu user hiện tại là 'sale'.",
        "info"
      );
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
    const matchesSearch = (user.username || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Pagination logic for mobile
  const getPaginationRange = () => {
    const range = [];
    const showPages = 3; // Show 3 pages on mobile
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="adminuser-container">
      {/* Header */}
      <div className="adminuser-header">
        <div className="adminuser-header-content">
          <h1 className="adminuser-title">Danh sách User</h1>
          <button className="adminuser-add-button" onClick={handleAddUser}>
            <span className="adminuser-add-icon">+</span>
            <span className="adminuser-add-text">Thêm tài khoản</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="adminuser-filters">
        <div className="adminuser-filters-desktop">
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
              style={{ height: "55px" }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Chọn vai trò</option>
              <option value="admin">admin</option>
              <option value="sale">sale</option>
              <option value="customer">customer</option>
            </select>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <div className="adminuser-mobile-filter-toggle">
          <button
            className="mobile-filter-btn"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            {showMobileFilters ? <FaTimes /> : <FaBars />}
            <span>Bộ lọc</span>
          </button>
        </div>

        {/* Mobile filters */}
        <div
          className={`adminuser-filters-mobile ${
            showMobileFilters ? "show" : ""
          }`}
        >
          <div className="adminuser-search-mobile">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên đăng nhập"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="adminuser-role-dropdown-mobile">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Chọn vai trò</option>
              <option value="admin">admin</option>
              <option value="sale">sale</option>
              <option value="customer">customer</option>
            </select>
          </div>
        </div>
      </div>

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
        <>
          <div className="adminuser-table-wrapper desktop-table">
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
                  currentUsers.map((user, index) => (
                    <tr key={user.user_id} className="adminuser-row">
                      <td className="adminuser-text-center">
                        {(currentPage - 1) * usersPerPage + index + 1}
                      </td>
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
                          alt={displayData(user.full_name)}
                          className="adminuser-avatar"
                        />
                      </td>
                      <td>{displayData(user.username)}</td>
                      <td>{displayData(user.full_name)}</td>
                      <td>{displayData(user.email)}</td>
                      <td>{displayData(user.phone)}</td>
                      <td className="adminuser-text-center">
                        {user.role === "sale" ? (
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleChangeRole(user, e.target.value)
                            }
                            className="adminuser-role-select"
                          >
                            <option value="admin">admin</option>
                            <option value="sale">sale</option>
                            <option value="customer">customer</option>
                          </select>
                        ) : (
                          <span>{displayData(user.role)}</span>
                        )}
                      </td>
                      <td className="adminuser-text-center">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Chưa cập nhật"}
                      </td>
                      <td className="adminuser-text-center adminuser-actions">
                        <div className="background-btn">
                          <FaEye
                            style={{ color: "#fff", cursor: "pointer" }}
                            className="adminuser-icon adminuser-icon-view"
                            onClick={() =>
                              navigate(`/admin/detailaccount/${user.user_id}`)
                            }
                          />
                        </div>
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

          <div className="adminuser-mobile-cards">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <div key={user.user_id} className="adminuser-mobile-card">
                  <div className="mobile-card-header">
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
                      alt={displayData(user.full_name)}
                      className="mobile-avatar"
                    />
                    <div className="mobile-user-info">
                      <h3>{displayData(user.username)}</h3>
                      <p>{displayData(user.full_name)}</p>
                    </div>
                    <div className="mobile-actions">
                      <FaEye
                        className="mobile-action-icon"
                        onClick={() =>
                          navigate(`/admin/detailaccount/${user.user_id}`)
                        }
                        title="Xem chi tiết user"
                      />
                    </div>
                  </div>
                  <div className="mobile-card-content">
                    <div className="mobile-info-row">
                      <span className="mobile-label">Email:</span>
                      <span className="mobile-value">
                        {displayData(user.email)}
                      </span>
                    </div>
                    <div className="mobile-info-row">
                      <span className="mobile-label">SĐT:</span>
                      <span className="mobile-value">
                        {displayData(user.phone)}
                      </span>
                    </div>
                    <div className="mobile-info-row">
                      <span className="mobile-label">Vai trò:</span>
                      <span className="mobile-value">
                        {user.role === "sale" ? (
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleChangeRole(user, e.target.value)
                            }
                            className="mobile-role-select"
                          >
                            <option value="admin">admin</option>
                            <option value="sale">sale</option>
                            <option value="customer">customer</option>
                          </select>
                        ) : (
                          <span>{displayData(user.role)}</span>
                        )}
                      </span>
                    </div>
                    <div className="mobile-info-row">
                      <span className="mobile-label">Ngày tạo:</span>
                      <span className="mobile-value">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="adminuser-no-data-mobile">Không có user nào.</div>
            )}
          </div>

          <div className="adminuser-pagination">
            <div className="pagination-desktop">
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
                  className={`pagination-btn ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Sau &raquo;
              </button>
            </div>

            <div className="pagination-mobile">
              <button
                className="pagination-btn-mobile"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {getPaginationRange().map((page) => (
                <button
                  key={page}
                  className={`pagination-btn-mobile ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-btn-mobile"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>

            <div className="pagination-info">
              Trang {currentPage} / {totalPages} - Hiển thị{" "}
              {currentUsers.length} / {filteredUsers.length} user
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ListUser;
